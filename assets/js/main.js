/*!
 * CR Recursos Humanos — main.js
 * JavaScript puro, sem dependencias. Todos os modulos sao opcionais:
 * se o elemento nao existir na pagina, o modulo simplesmente nao roda.
 */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- utils */
  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var prefersReduced = function () { return reduceMotion.matches; };

  function on(el, evt, fn, opts) { if (el) el.addEventListener(evt, fn, opts || false); }

  // Agenda leitura/escrita no proximo frame, evitando layout thrashing.
  function raf(fn) {
    var ticking = false;
    return function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { fn(); ticking = false; });
    };
  }

  function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

  /* --------------------------------------------------- 01. ano no rodape */
  function initYear() {
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ---------------------------------------- 02. header: sticky + auto-hide */
  function initHeader() {
    var header = $('.site-header');
    if (!header) return;

    var lastY = window.scrollY;
    var STUCK_AT = 40;

    var update = raf(function () {
      var y = window.scrollY;
      header.classList.toggle('is-stuck', y > STUCK_AT);

      // Esconde ao descer, revela ao subir — so depois de sair do topo.
      var goingDown = y > lastY && y > 320;
      var menuOpen = document.body.classList.contains('nav-open');
      header.classList.toggle('is-hidden', goingDown && !menuOpen);

      lastY = y;
    });

    on(window, 'scroll', update, { passive: true });
    update();
  }

  /* ------------------------------------------- 03. barra de progresso */
  function initProgress() {
    var bar = $('.progress-bar');
    if (!bar) return;

    var update = raf(function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var pct = max > 0 ? doc.scrollTop / max : 0;
      bar.style.transform = 'scaleX(' + clamp(pct, 0, 1) + ')';
    });

    on(window, 'scroll', update, { passive: true });
    on(window, 'resize', update, { passive: true });
    update();
  }

  /* ------------------------------------------------ 04. menu mobile */
  function initMobileNav() {
    var toggle = $('.nav-toggle');
    var panel  = $('.mobile-nav');
    if (!toggle || !panel) return;

    // Indice para o atraso em cascata dos itens.
    $$('.mobile-nav__list li', panel).forEach(function (li, i) {
      li.style.setProperty('--i', i);
    });

    var lastFocused = null;

    function focusables() {
      return $$('a[href], button:not([disabled])', panel)
        .filter(function (el) { return el.offsetParent !== null; });
    }

    function open() {
      lastFocused = document.activeElement;
      panel.classList.add('is-open');
      document.body.classList.add('nav-open');
      toggle.setAttribute('aria-expanded', 'true');
      panel.removeAttribute('aria-hidden');
      var first = focusables()[0];
      if (first) window.setTimeout(function () { first.focus(); }, 260);
    }

    function close() {
      panel.classList.remove('is-open');
      document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
      if (lastFocused) lastFocused.focus();
    }

    on(toggle, 'click', function () {
      toggle.getAttribute('aria-expanded') === 'true' ? close() : open();
    });

    // Fecha ao clicar num link do menu.
    $$('a', panel).forEach(function (a) { on(a, 'click', close); });

    // Esc fecha; Tab fica preso dentro do painel enquanto aberto.
    on(document, 'keydown', function (e) {
      if (!panel.classList.contains('is-open')) return;

      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;

      var items = focusables();
      if (!items.length) return;
      var first = items[0];
      var last  = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    // Ao voltar para desktop, garante estado limpo.
    on(window, 'resize', function () {
      if (window.innerWidth > 1080 && panel.classList.contains('is-open')) close();
    }, { passive: true });
  }

  /* ------------------------------------- 05. revelacao ao rolar a pagina */
  function initReveal() {
    var targets = $$('[data-reveal], [data-stagger], .reveal-lines');
    if (!targets.length) return;

    // Sem IntersectionObserver (ou com movimento reduzido): mostra tudo.
    if (!('IntersectionObserver' in window) || prefersReduced()) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = el.getAttribute('data-delay');
        if (delay) el.style.setProperty('--delay', delay + 'ms');
        el.classList.add('is-visible');
        io.unobserve(el); // anima uma unica vez
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    targets.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------ 06. titulo revelado linha a linha */
  function initLineReveal() {
    $$('.reveal-lines').forEach(function (block) {
      $$('.reveal-line', block).forEach(function (line, i) {
        line.style.setProperty('--line-delay', (i * 110) + 'ms');
      });
    });
  }

  /* ------------------------------------------- 07. contadores animados */
  function initCounters() {
    var counters = $$('[data-count]');
    if (!counters.length) return;

    function run(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var prefix = el.getAttribute('data-prefix') || '';
      var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);

      if (prefersReduced()) {
        el.textContent = prefix + target.toFixed(decimals) + suffix;
        return;
      }

      var duration = 1600;
      var start = null;

      function step(ts) {
        if (start === null) start = ts;
        var p = clamp((ts - start) / duration, 0, 1);
        var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
        if (p < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) { counters.forEach(run); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) {
      // Zera apenas quando a animacao vai realmente acontecer.
      if (!prefersReduced()) {
        el.textContent = (el.getAttribute('data-prefix') || '') + '0' + (el.getAttribute('data-suffix') || '');
      }
      io.observe(el);
    });
  }

  /* ------------------------------------------ 08. palavras rotativas */
  function initRotator() {
    var rotator = $('.rotator');
    if (!rotator) return;

    var items = $$('.rotator__item', rotator);
    if (items.length < 2) return;

    // Trava a largura no maior termo para o texto ao redor nao "pular".
    function sizeIt() {
      rotator.style.minWidth = '';
      var max = 0;
      items.forEach(function (el) { max = Math.max(max, el.offsetWidth); });
      rotator.style.minWidth = max + 'px';
    }
    sizeIt();
    on(window, 'resize', sizeIt, { passive: true });

    if (prefersReduced()) return;

    var i = 0;
    window.setInterval(function () {
      var current = items[i];
      i = (i + 1) % items.length;
      var next = items[i];

      current.classList.remove('is-active');
      current.classList.add('is-leaving');
      next.classList.add('is-active');

      window.setTimeout(function () { current.classList.remove('is-leaving'); }, 620);
    }, 2600);
  }

  /* --------------------------------------------------- 09. acordeao/FAQ */
  function initAccordion() {
    var groups = $$('.accordion');
    if (!groups.length) return;

    groups.forEach(function (group) {
      var single = group.hasAttribute('data-single'); // so um painel aberto
      var triggers = $$('.acc-trigger', group);

      triggers.forEach(function (trigger) {
        var panel = document.getElementById(trigger.getAttribute('aria-controls'));
        if (!panel) return;

        // Estado inicial coerente com o HTML.
        var expanded = trigger.getAttribute('aria-expanded') === 'true';
        panel.style.height = expanded ? 'auto' : '0px';

        on(trigger, 'click', function () {
          var isOpen = trigger.getAttribute('aria-expanded') === 'true';

          if (single && !isOpen) {
            triggers.forEach(function (other) {
              if (other !== trigger && other.getAttribute('aria-expanded') === 'true') {
                collapse(other, document.getElementById(other.getAttribute('aria-controls')));
              }
            });
          }
          isOpen ? collapse(trigger, panel) : expand(trigger, panel);
        });
      });
    });

    function expand(trigger, panel) {
      trigger.setAttribute('aria-expanded', 'true');
      var h = panel.firstElementChild.offsetHeight;
      panel.style.height = h + 'px';
      // Depois da transicao libera a altura, para conteudo que muda de tamanho.
      window.setTimeout(function () {
        if (trigger.getAttribute('aria-expanded') === 'true') panel.style.height = 'auto';
      }, 340);
    }

    function collapse(trigger, panel) {
      trigger.setAttribute('aria-expanded', 'false');
      panel.style.height = panel.firstElementChild.offsetHeight + 'px';
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () { panel.style.height = '0px'; });
      });
    }
  }

  /* ------------------------------- 10. brilho que segue o cursor (hero) */
  function initSpotlight() {
    if (prefersReduced()) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    $$('.hero, .card').forEach(function (el) {
      on(el, 'pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(2) + '%');
        el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(2) + '%');
      });
    });
  }

  /* ----------------------------------- 11. parallax dos orbes do hero */
  function initParallax() {
    var layers = $$('[data-parallax]');
    if (!layers.length || prefersReduced()) return;

    var update = raf(function () {
      var y = window.scrollY;
      layers.forEach(function (el) {
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.12;
        el.style.transform = 'translate3d(0,' + (y * speed).toFixed(1) + 'px,0)';
      });
    });

    on(window, 'scroll', update, { passive: true });
    update();
  }

  /* ------------------------------------------------- 12. tilt 3D leve */
  function initTilt() {
    if (prefersReduced()) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    $$('.tilt').forEach(function (el) {
      var MAX = 7; // graus

      on(el, 'pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform =
          'perspective(900px) rotateX(' + (-py * MAX).toFixed(2) + 'deg) rotateY(' + (px * MAX).toFixed(2) + 'deg)';
      });

      on(el, 'pointerleave', function () {
        el.style.transform = 'perspective(900px) rotateX(0) rotateY(0)';
      });
    });
  }

  /* ---------------------------------------- 13. marquee sem emenda */
  function initMarquee() {
    $$('.marquee').forEach(function (m) {
      var track = $('.marquee__track', m);
      if (!track || track.dataset.cloned) return;
      // Duplica o conteudo para o loop de -100% nao deixar espaco vazio.
      var clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.dataset.cloned = 'true';
      m.appendChild(clone);
    });
  }

  /* ------------------------------------------------ 14. voltar ao topo */
  function initBackToTop() {
    var btn = $('.fab--top');
    if (!btn) return;

    var update = raf(function () {
      btn.classList.toggle('is-visible', window.scrollY > 700);
    });
    on(window, 'scroll', update, { passive: true });
    update();

    on(btn, 'click', function () {
      window.scrollTo({ top: 0, behavior: prefersReduced() ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------- 15. mascara de telefone brasileiro */
  function initPhoneMask() {
    $$('input[data-mask="phone"]').forEach(function (input) {
      on(input, 'input', function () {
        var d = input.value.replace(/\D/g, '').slice(0, 11);
        var out = d;
        if (d.length > 2)  out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
        if (d.length > 6)  out = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length > 10 ? 7 : 6) + '-' + d.slice(d.length > 10 ? 7 : 6);
        input.value = out;
      });
    });
  }

  /* ------------------------------------------ 16. validacao de formulario */
  function initForms() {
    var forms = $$('form[data-form]');
    if (!forms.length) return;

    var MSG = {
      required: 'Preencha este campo para continuar.',
      email:    'Informe um e-mail valido, como nome@empresa.com.br.',
      tel:      'Informe um telefone com DDD, como (11) 91234-5678.',
      consent:  'Precisamos do seu aceite para seguir com o contato.'
    };

    function fieldOf(input) { return input.closest('.field') || input.closest('.check-field'); }

    function setError(input, msg) {
      var f = fieldOf(input);
      if (!f) return;
      f.classList.remove('is-valid');
      f.classList.add('is-invalid');
      var slot = $('.field__error', f);
      if (slot) slot.textContent = msg;
      input.setAttribute('aria-invalid', 'true');
    }

    function setOk(input) {
      var f = fieldOf(input);
      if (!f) return;
      f.classList.remove('is-invalid');
      if (input.value.trim()) f.classList.add('is-valid');
      input.removeAttribute('aria-invalid');
    }

    function validate(input) {
      var v = (input.value || '').trim();

      if (input.type === 'checkbox') {
        if (input.required && !input.checked) { setError(input, MSG.consent); return false; }
        setOk(input); return true;
      }
      if (input.required && !v) { setError(input, MSG.required); return false; }
      if (!v) { setOk(input); return true; }

      if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { setError(input, MSG.email); return false; }
      if (input.type === 'tel' && v.replace(/\D/g, '').length < 10) { setError(input, MSG.tel); return false; }

      setOk(input);
      return true;
    }

    forms.forEach(function (form) {
      var status = $('.form__status', form);
      var submit = $('[type="submit"]', form);
      var fields = $$('input, textarea, select', form).filter(function (el) { return el.type !== 'hidden'; });

      fields.forEach(function (input) {
        on(input, 'blur', function () { validate(input); });
        on(input, 'input', function () {
          var f = fieldOf(input);
          if (f && f.classList.contains('is-invalid')) validate(input);
        });
      });

      function say(state, text) {
        if (!status) return;
        status.setAttribute('data-state', state);
        status.textContent = text;
        status.classList.add('is-visible');
      }

      on(form, 'submit', function (e) {
        e.preventDefault();

        var firstBad = null;
        fields.forEach(function (input) {
          if (!validate(input) && !firstBad) firstBad = input;
        });

        if (firstBad) {
          say('error', 'Confira os campos destacados antes de enviar.');
          firstBad.focus();
          return;
        }

        var endpoint = form.getAttribute('action');
        var hasEndpoint = endpoint && endpoint.indexOf('COLOQUE') === -1 && endpoint.charAt(0) !== '#';

        if (submit) submit.classList.add('is-loading');

        if (hasEndpoint) {
          // Envio real por HTTP (Formspree, FormSubmit, API propria...).
          window.fetch(endpoint, {
            method: form.getAttribute('method') || 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' }
          })
            .then(function (res) {
              if (!res.ok) throw new Error('HTTP ' + res.status);
              form.reset();
              $$('.field, .check-field', form).forEach(function (f) { f.classList.remove('is-valid', 'is-invalid'); });
              say('success', form.getAttribute('data-success') || 'Mensagem enviada. Retornamos em ate 1 dia util.');
            })
            .catch(function () {
              say('error', 'Nao conseguimos enviar agora. Fale com a gente pelo WhatsApp ou tente novamente.');
            })
            .then(function () { if (submit) submit.classList.remove('is-loading'); });
          return;
        }

        // Sem endpoint configurado: abre o WhatsApp com a mensagem pronta.
        sendViaWhatsApp(form);
        say('success', 'Abrimos o WhatsApp com sua mensagem pronta. E so tocar em enviar.');
        if (submit) submit.classList.remove('is-loading');
      });
    });

    function sendViaWhatsApp(form) {
      var phone = form.getAttribute('data-whatsapp') || '5511942648699';
      var title = form.getAttribute('data-subject') || 'Contato pelo site';
      var lines = ['*' + title + '*', ''];

      $$('input, textarea, select', form).forEach(function (el) {
        if (el.type === 'hidden' || el.type === 'submit' || !el.name) return;
        if (el.type === 'checkbox') return;
        var label = form.querySelector('label[for="' + el.id + '"]');
        var name = label ? label.textContent.replace('*', '').trim() : el.name;
        var val = (el.value || '').trim();
        if (val) lines.push(name + ': ' + val);
      });

      var url = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(lines.join('\n'));
      window.open(url, '_blank', 'noopener');
    }
  }

  /* ------------------------------- 17. rolagem suave com offset do header */
  function initSmoothAnchors() {
    on(document, 'click', function (e) {
      var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!link) return;

      var id = link.getAttribute('href');
      if (!id || id === '#' || id.length < 2) return;

      var target = document.getElementById(id.slice(1));
      if (!target) return;

      e.preventDefault();
      var header = $('.site-header');
      var offset = (header ? header.offsetHeight : 0) + 16;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top: top, behavior: prefersReduced() ? 'auto' : 'smooth' });

      // Mantem o foco onde o usuario foi levado (acessibilidade).
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });

      if (history.replaceState) history.replaceState(null, '', id);
    });
  }

  /* ------------------------- 18. destaque do item de menu da secao ativa */
  function initScrollSpy() {
    var links = $$('.nav__link[href^="#"], .nav__link[href*="#"]').filter(function (a) {
      return a.getAttribute('href').indexOf('#') === 0;
    });
    if (!links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    var sections = [];

    links.forEach(function (a) {
      var sec = document.getElementById(a.getAttribute('href').slice(1));
      if (!sec) return;
      map[sec.id] = a;
      sections.push(sec);
    });
    if (!sections.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        var active = map[entry.target.id];
        if (active) active.setAttribute('aria-current', 'page');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { io.observe(s); });
  }

  /* ------------------------------------ 19. carregamento leve de imagens */
  function initImages() {
    $$('img:not([loading])').forEach(function (img) { img.loading = 'lazy'; });
    $$('img:not([decoding])').forEach(function (img) { img.decoding = 'async'; });
  }

  /* ------------------------------------------------------------ bootstrap */
  function init() {
    initYear();
    initHeader();
    initProgress();
    initMobileNav();
    initLineReveal();
    initReveal();
    initCounters();
    initRotator();
    initAccordion();
    initSpotlight();
    initParallax();
    initTilt();
    initMarquee();
    initBackToTop();
    initPhoneMask();
    initForms();
    initSmoothAnchors();
    initScrollSpy();
    initImages();

    document.documentElement.classList.add('js-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
