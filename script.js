/* =====================================================
   ELITE BARBER SHOP — script.js
   Funcionalidades: navbar scroll, menú hamburguesa,
   animaciones fade-in, validación de formulario.
===================================================== */

(function () {
  'use strict';

  /* ============================================
     1. NAVBAR: cambio de estilo al hacer scroll
  ============================================ */
  const navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // ejecutar al cargar por si la página comienza scrolleada

  /* ============================================
     2. MENÚ HAMBURGUESA (mobile)
  ============================================ */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  function toggleMenu() {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    // Bloquear scroll del body cuando el menú está abierto
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMenu() {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', toggleMenu);

  // Cerrar el menú al hacer clic en cualquier enlace
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Cerrar si se hace clic fuera del menú
  document.addEventListener('click', function (e) {
    if (
      navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMenu();
    }
  });

  /* ============================================
     3. SCROLL SUAVE para anclas
     (refuerzo para browsers que no soportan CSS scroll-behavior)
  ============================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navH = navbar ? navbar.offsetHeight : 0;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ============================================
     4. ANIMACIONES FADE-IN al hacer scroll
     Usa IntersectionObserver para mejor performance
  ============================================ */
  const fadeElements = document.querySelectorAll('.fade-in');

  // Escalonar las cards dentro de cada sección
  function staggerChildren(parent) {
    const children = parent.querySelectorAll(
      '.service-card, .testimonial-card, .gallery-item, .info-block'
    );
    children.forEach(function (child, i) {
      child.style.transitionDelay = (i * 0.1) + 's';
    });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            staggerChildren(entry.target.closest('section') || document.body);
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // animación solo una vez
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: mostrar todo si no hay soporte
    fadeElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ============================================
     5. VALIDACIÓN DEL FORMULARIO DE CONTACTO
  ============================================ */
  const form        = document.getElementById('contactForm');
  const successMsg  = document.getElementById('formSuccess');

  if (form) {

    // Helpers de validación
    function showError(fieldId, msg) {
      const field = document.getElementById(fieldId);
      const error = document.getElementById('error-' + fieldId);
      if (field)  field.classList.add('error');
      if (error)  error.textContent = msg;
    }

    function clearError(fieldId) {
      const field = document.getElementById(fieldId);
      const error = document.getElementById('error-' + fieldId);
      if (field)  field.classList.remove('error');
      if (error)  error.textContent = '';
    }

    function validateNombre(value) {
      if (!value.trim()) return 'El nombre es obligatorio.';
      if (value.trim().length < 3) return 'Ingresá al menos 3 caracteres.';
      return null;
    }

    function validateTelefono(value) {
      if (!value.trim()) return 'El teléfono es obligatorio.';
      // Acepta formatos: +54 11 1234-5678, 01112345678, etc.
      const clean = value.replace(/[\s\-()]/g, '');
      if (!/^\+?\d{7,15}$/.test(clean)) return 'Ingresá un número válido.';
      return null;
    }

    // Limpiar errores en tiempo real mientras escribe
    ['nombre', 'telefono'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', function () {
          clearError(id);
        });
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Limpiar mensajes previos
      clearError('nombre');
      clearError('telefono');
      if (successMsg) successMsg.style.display = 'none';

      const nombre   = document.getElementById('nombre').value;
      const telefono = document.getElementById('telefono').value;
      const servicio = document.getElementById('servicio').value;
      const mensaje  = document.getElementById('mensaje').value;

      const errNombre   = validateNombre(nombre);
      const errTelefono = validateTelefono(telefono);

      let hasError = false;

      if (errNombre) {
        showError('nombre', errNombre);
        hasError = true;
      }
      if (errTelefono) {
        showError('telefono', errTelefono);
        hasError = true;
      }

      if (hasError) {
        // Hacer scroll al primer error
        const firstError = form.querySelector('.error');
        if (firstError) firstError.focus();
        return;
      }

      // Simulación de envío (sin backend)
      // En producción: reemplazar por fetch a tu API o Formspree / EmailJS
      const submitBtn = form.querySelector('[type="submit"]');
      submitBtn.textContent = 'Enviando…';
      submitBtn.disabled = true;

      setTimeout(function () {
        // Redirigir al WhatsApp con los datos del formulario
        const textoWA = encodeURIComponent(
          'Hola! Quiero reservar un turno.\n' +
          'Nombre: ' + nombre.trim() + '\n' +
          (servicio ? 'Servicio: ' + servicio + '\n' : '') +
          (mensaje.trim() ? 'Mensaje: ' + mensaje.trim() : '')
        );

        // Mostrar mensaje de éxito
        if (successMsg) successMsg.style.display = 'block';
        form.reset();
        submitBtn.textContent = 'Enviar solicitud';
        submitBtn.disabled = false;

        // Abrir WhatsApp en nueva pestaña
        window.open('https://wa.me/5491123456789?text=' + textoWA, '_blank', 'noopener,noreferrer');
      }, 900);
    });
  }

  /* ============================================
     6. GALERÍA: efecto de hover accesible con teclado
  ============================================ */
  document.querySelectorAll('.gallery-item').forEach(function (item) {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // En producción: aquí abriría un lightbox
        console.info('Galería: item seleccionado –', item.dataset.label);
      }
    });
  });

  /* ============================================
     7. BOTÓN FLOTANTE WA: aparece después de 3s
     para no interrumpir la primera impresión
  ============================================ */
  const waFloat = document.querySelector('.whatsapp-float');
  if (waFloat) {
    waFloat.style.opacity = '0';
    waFloat.style.transform = 'scale(0.8)';
    waFloat.style.transition = 'opacity .5s ease, transform .5s ease';
    setTimeout(function () {
      waFloat.style.opacity = '1';
      waFloat.style.transform = 'scale(1)';
    }, 3000);
  }

  /* ============================================
     8. ACTIVE LINK en navbar según sección visible
  ============================================ */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  function setActiveLink() {
    let current = '';
    sections.forEach(function (sec) {
      const top = sec.getBoundingClientRect().top;
      if (top < window.innerHeight * 0.4) {
        current = '#' + sec.id;
      }
    });
    navAnchors.forEach(function (a) {
      a.style.color = a.getAttribute('href') === current
        ? 'var(--gold)'
        : '';
    });
  }

  window.addEventListener('scroll', setActiveLink, { passive: true });

})();