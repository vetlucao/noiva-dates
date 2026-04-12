/* ═══════════════════════════════════════════════════════════════
   NOIVA & DATES — SCRIPT.JS
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── Custom Cursor ──────────────────────────────────────────── */
(function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');

  if (!dot || !ring) return;

  let mouseX = -100, mouseY = -100;
  let ringX  = -100, ringY  = -100;
  let raf;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
  });

  // Ring follows with lag
  function animateRing() {
    const lag = 0.12;
    ringX += (mouseX - ringX) * lag;
    ringY += (mouseY - ringY) * lag;
    ring.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
    raf = requestAnimationFrame(animateRing);
  }
  raf = requestAnimationFrame(animateRing);

  // Hover state on interactive elements
  const hoverSelectors = 'a, button, [role="tab"], .col-card, input, select, textarea, label[for]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverSelectors)) {
      ring.classList.add('is-hovering');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverSelectors)) {
      ring.classList.remove('is-hovering');
    }
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '0.6';
  });
})();


/* ─── Scroll Reveal (IntersectionObserver) ───────────────────── */
(function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        // Stagger: elements visible at the same scroll pulse
        const delay = entry.target.dataset.delay
          ? parseFloat(entry.target.dataset.delay)
          : 0;
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, delay);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
  );

  // Add stagger delay to sibling .reveal groups
  const parents = new Set([...items].map((el) => el.parentElement));
  parents.forEach((parent) => {
    const siblings = [...parent.querySelectorAll(':scope > .reveal')];
    siblings.forEach((el, idx) => {
      if (!el.dataset.delay) {
        el.dataset.delay = idx * 100;
      }
    });
  });

  items.forEach((el) => observer.observe(el));
})();


/* ─── Nav: scroll shrink + mobile hamburger ──────────────────── */
(function initNav() {
  const nav         = document.getElementById('nav');
  const hamburger   = document.getElementById('navHamburger');
  const mobileLinks = document.getElementById('navLinks');
  const mobileItems = document.querySelectorAll('.nav__mobile-link, .nav__mobile-cta');

  if (!nav) return;

  // Scroll state
  function onScroll() {
    nav.classList.toggle('is-scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger toggle
  function closeMenu() {
    hamburger.classList.remove('is-open');
    mobileLinks.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function openMenu() {
    hamburger.classList.add('is-open');
    mobileLinks.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  hamburger?.addEventListener('click', () => {
    const isOpen = hamburger.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close when a link is tapped
  mobileItems.forEach((el) => el.addEventListener('click', closeMenu));

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeMenu();
  });

  // Keyboard: Escape closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
})();


/* ─── Smooth Scroll (for older browsers) ────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


/* ─── Coleções Filter ────────────────────────────────────────── */
(function initFilter() {
  const filters = document.querySelectorAll('.colecoes__filter');
  const cards   = document.querySelectorAll('.col-card');

  if (!filters.length) return;

  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active button
      filters.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Show/hide cards with a quick fade
      cards.forEach((card) => {
        const cat = card.dataset.category;
        const matches = filter === 'all' || cat === filter;

        if (matches) {
          card.classList.remove('is-hidden');
          // Re-trigger reveal if not yet visible
          if (!card.classList.contains('is-visible')) {
            card.classList.add('is-visible');
          }
        } else {
          card.classList.add('is-hidden');
        }
      });
    });
  });
})();


/* ─── Form Validation + Submit ──────────────────────────────── */
(function initForm() {
  const form       = document.getElementById('orcamentoForm');
  const successDiv = document.getElementById('formSuccess');
  const submitBtn  = document.getElementById('formSubmitBtn');

  if (!form) return;

  const rules = {
    nome:     { required: true, label: 'Nome completo' },
    whatsapp: { required: true, pattern: /^[\d\s\(\)\-\+]{10,20}$/, label: 'WhatsApp' },
    produto:  { required: true, label: 'Tipo de produto' },
  };

  function getError(field, value) {
    const rule = rules[field];
    if (!rule) return '';
    if (rule.required && !value.trim()) return `${rule.label} é obrigatório.`;
    if (rule.pattern && value.trim() && !rule.pattern.test(value.trim())) {
      return `${rule.label} inválido.`;
    }
    return '';
  }

  function showError(input, message) {
    input.classList.toggle('is-error', !!message);
    const errEl = input.closest('.form__field')?.querySelector('.form__error');
    if (errEl) errEl.textContent = message;
  }

  // Live validation on blur
  Object.keys(rules).forEach((fieldName) => {
    const input = form.elements[fieldName];
    if (!input) return;
    input.addEventListener('blur', () => {
      showError(input, getError(fieldName, input.value));
    });
    input.addEventListener('input', () => {
      if (input.classList.contains('is-error')) {
        showError(input, getError(fieldName, input.value));
      }
    });
  });

  // Phone mask (basic)
  const phoneInput = form.elements['whatsapp'];
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      let val = phoneInput.value.replace(/\D/g, '');
      if (val.length <= 11) {
        val = val
          .replace(/^(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{4,5})(\d{4})$/, '$1-$2');
      }
      phoneInput.value = val;
    });
  }

  // Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all
    let hasError = false;
    Object.keys(rules).forEach((fieldName) => {
      const input = form.elements[fieldName];
      if (!input) return;
      const err = getError(fieldName, input.value);
      showError(input, err);
      if (err) hasError = true;
    });

    if (hasError) {
      // Focus first invalid
      const firstErr = form.querySelector('.is-error');
      firstErr?.focus();
      return;
    }

    // Loading state
    const btnText    = submitBtn.querySelector('.btn__text');
    const btnLoading = submitBtn.querySelector('.btn__loading');
    submitBtn.disabled = true;
    if (btnText)    btnText.hidden    = true;
    if (btnLoading) btnLoading.hidden = false;

    try {
      const data = new FormData(form);
      const res  = await fetch(form.action, {
        method:  'POST',
        body:    data,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        form.hidden        = true;
        successDiv.hidden  = false;
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        throw new Error('Erro no envio');
      }
    } catch {
      // Fallback: show success anyway (Formspree handles redirect)
      // or show a generic error
      alert('Ocorreu um erro ao enviar. Tente pelo WhatsApp ou tente novamente em instantes.');
    } finally {
      submitBtn.disabled = false;
      if (btnText)    btnText.hidden    = false;
      if (btnLoading) btnLoading.hidden = true;
    }
  });
})();


/* ─── Footer year ────────────────────────────────────────────── */
(function initFooterYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ─── WhatsApp float: hide when #orcamento is in view ────────── */
(function initWhatsFloat() {
  const floatBtn    = document.querySelector('.whats-float');
  const orcamento   = document.getElementById('orcamento');

  if (!floatBtn || !orcamento) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      floatBtn.style.opacity       = entry.isIntersecting ? '0' : '1';
      floatBtn.style.pointerEvents = entry.isIntersecting ? 'none' : '';
    },
    { threshold: 0.2 }
  );

  observer.observe(orcamento);
})();


/* ─── Lazy image placeholder shimmer ────────────────────────── */
(function initImageFallback() {
  document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
    img.addEventListener('error', () => {
      img.style.opacity = '0';
    });
  });
})();
