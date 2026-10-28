/* ==========================================================================
   Sahil Rasul Khan — Portfolio interactions
   Vanilla JS, no dependencies. Every effect respects reduced-motion and
   is limited to fine pointers where it relies on hover.
   ========================================================================== */
(() => {
  'use strict';

  /* ------------------------------------------------------------------
     Config — add real profile URLs here when they exist.
     Empty strings render as a subtle "coming soon" state (no fake links).
     ------------------------------------------------------------------ */
  const CONFIG = {
    social: {
      linkedin: '',
      github: '',
      instagram: '',
    },
    roles: ['Web Developer', 'UI Designer', 'Graphic Designer', 'Tech Enthusiast', 'Creative Problem Solver'],
  };

  /* ---------- helpers ---------- */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const body = document.body;

  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduceMotion = mqReduce.matches;
  const isFine = () => mqFine.matches && window.innerWidth > 900;
  const isMobile = () => window.innerWidth <= 768;

  let vw = window.innerWidth;
  let vh = window.innerHeight;

  /* ==================================================================
     1. Loader → page ready  (always < 1.5s)
     ================================================================== */
  const loadStart = performance.now();
  let loaded = false;
  function finishLoading() {
    if (loaded) return;
    loaded = true;
    const minTime = reduceMotion ? 150 : 1000;
    const wait = Math.max(0, minTime - (performance.now() - loadStart));
    setTimeout(() => {
      body.classList.add('is-loaded');
      body.classList.remove('is-loading');
      setTimeout(() => {
        body.classList.add('is-ready');
        startTyping();
      }, reduceMotion ? 0 : 200);
    }, wait);
  }
  if (document.readyState === 'complete') finishLoading();
  else window.addEventListener('load', finishLoading, { once: true });
  setTimeout(finishLoading, 1300); // hard cap — never make people wait

  /* ==================================================================
     2. Star field — box-shadow layers generated once (cheap, GPU drift)
     ================================================================== */
  function buildStars() {
    if (reduceMotion) return;
    const layers = $$('.stars');
    const counts = isMobile() ? [36, 18, 8] : [90, 45, 20];
    const w = window.innerWidth;
    const h = window.innerHeight;
    layers.forEach((layer, i) => {
      const parts = [];
      for (let n = 0; n < counts[i]; n++) {
        const x = Math.round(Math.random() * w);
        const y = Math.round(Math.random() * h);
        const a = (0.25 + Math.random() * 0.55).toFixed(2);
        // duplicate one viewport below so the vertical drift loops seamlessly
        parts.push(`${x}px ${y}px rgba(255,255,255,${a})`, `${x}px ${y + h}px rgba(255,255,255,${a})`);
      }
      layer.style.boxShadow = parts.join(',');
      layer.style.setProperty('--h', `${h}px`);
    });
  }
  buildStars();

  /* ==================================================================
     3. Custom cursor + ambient mouse glow + hero depth (one rAF loop)
     ================================================================== */
  const cursor = $('#cursor');
  const dot = $('.cursor__dot');
  const ring = $('.cursor__ring');
  const glow = $('#mouseGlow');
  const profile = $('#profile');
  const hero = $('#home');

  const pointer = { x: vw / 2, y: vh / 2, moved: false };
  const ringPos = { x: vw / 2, y: vh / 2 };
  const glowPos = { x: vw / 2, y: vh / 3 };
  const heroTilt = { x: 0, y: 0, tx: 0, ty: 0 };
  let magnetTarget = null;
  let magnetRect = null;
  let cursorEnabled = false;
  let loopRunning = false;

  function enableCursor() {
    cursorEnabled = isFine() && !reduceMotion;
    body.classList.toggle('has-cursor', cursorEnabled);
    if (cursorEnabled && !loopRunning) {
      loopRunning = true;
      requestAnimationFrame(tick);
    }
  }

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    if (!pointer.moved) {
      pointer.moved = true;
      ringPos.x = glowPos.x = e.clientX;
      ringPos.y = glowPos.y = e.clientY;
    }
    cursor.classList.remove('is-hidden');

    // hero depth target (-1 … 1)
    heroTilt.tx = clamp((e.clientX - vw * 0.72) / (vw * 0.4), -1, 1);
    heroTilt.ty = clamp((e.clientY - vh * 0.5) / (vh * 0.5), -1, 1);
  }, { passive: true });

  document.addEventListener('pointerleave', () => cursor.classList.add('is-hidden'));
  document.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
  document.addEventListener('pointerup', () => cursor.classList.remove('is-down'));

  // Cursor state via delegation
  document.addEventListener('pointerover', (e) => {
    if (!cursorEnabled) return;
    const t = e.target;
    cursor.classList.remove('is-hover', 'is-view', 'is-text');
    if (t.closest('input, textarea')) {
      cursor.classList.add('is-text');
    } else if (t.closest('a, button, label, .pill, .tag, .social, .chip__inner, .interest')) {
      cursor.classList.add('is-hover');
    } else if (t.closest('[data-cursor="view"]')) {
      cursor.classList.add('is-view');
    }
    const mag = t.closest('.magnetic');
    magnetTarget = mag;
    magnetRect = mag ? mag.getBoundingClientRect() : null;
  });

  function tick() {
    if (!cursorEnabled) { loopRunning = false; return; }

    // dot = exact, ring = smoothed, pulled toward magnetic elements
    let tx = pointer.x;
    let ty = pointer.y;
    if (magnetRect) {
      const cx = magnetRect.left + magnetRect.width / 2;
      const cy = magnetRect.top + magnetRect.height / 2;
      tx = lerp(pointer.x, cx, 0.35);
      ty = lerp(pointer.y, cy, 0.35);
    }
    ringPos.x = lerp(ringPos.x, tx, 0.18);
    ringPos.y = lerp(ringPos.y, ty, 0.18);
    glowPos.x = lerp(glowPos.x, pointer.x, 0.06);
    glowPos.y = lerp(glowPos.y, pointer.y, 0.06);

    dot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;
    ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
    glow.style.transform = `translate3d(${glowPos.x}px, ${glowPos.y}px, 0)`;

    // hero mouse parallax — only while the hero is on screen
    if (window.scrollY < vh) {
      heroTilt.x = lerp(heroTilt.x, heroTilt.tx, 0.06);
      heroTilt.y = lerp(heroTilt.y, heroTilt.ty, 0.06);
      profile.style.setProperty('--hx', heroTilt.x.toFixed(3));
      profile.style.setProperty('--hy', heroTilt.y.toFixed(3));
    }

    requestAnimationFrame(tick);
  }
  enableCursor();

  /* ==================================================================
     4. Magnetic buttons
     ================================================================== */
  $$('.magnetic').forEach((el) => {
    let rect = null;
    el.addEventListener('pointerenter', () => {
      if (!isFine() || reduceMotion) return;
      rect = el.getBoundingClientRect();
      el.classList.add('is-magnet');
    });
    el.addEventListener('pointermove', (e) => {
      if (!rect) return;
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      el.style.setProperty('--tx', `${(x * 0.3).toFixed(1)}px`);
      el.style.setProperty('--ty', `${(y * 0.4).toFixed(1)}px`);
    });
    el.addEventListener('pointerleave', () => {
      rect = null;
      el.classList.remove('is-magnet');
      el.style.setProperty('--tx', '0px');
      el.style.setProperty('--ty', '0px');
    });
  });

  /* ==================================================================
     5. 3D tilt cards with moving light reflection
     ================================================================== */
  $$('.tilt').forEach((el) => {
    const max = parseFloat(el.dataset.tilt || '6');
    let rect = null;
    el.addEventListener('pointerenter', () => {
      rect = el.getBoundingClientRect();
    });
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      if (!rect) rect = el.getBoundingClientRect();
      const px = clamp((e.clientX - rect.left) / rect.width, 0, 1);
      const py = clamp((e.clientY - rect.top) / rect.height, 0, 1);
      el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      if (!isFine() || reduceMotion) return;
      el.classList.add('is-tilting');
      el.style.setProperty('--rx', `${((0.5 - py) * max).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${((px - 0.5) * max).toFixed(2)}deg`);
    });
    el.addEventListener('pointerleave', () => {
      rect = null;
      el.classList.remove('is-tilting');
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });
  // rects go stale when the page scrolls under a hovered card
  window.addEventListener('scroll', () => {
    magnetRect = magnetTarget ? magnetTarget.getBoundingClientRect() : null;
  }, { passive: true });

  /* ==================================================================
     6. Scroll engine — nav state, ambient progress, parallax, timeline
     ================================================================== */
  const nav = $('#nav');
  const root = document.documentElement;
  const timeline = $('#timeline');
  const tlItems = $$('.tl-item', timeline);
  const tlTrack = $('.timeline__track', timeline);
  const parallaxEls = $$('[data-parallax]').map((el) => ({ el, speed: parseFloat(el.dataset.parallax), base: 0, h: 0, y: 0 }));

  let tlOffsets = [];
  let tlInView = false;
  let scrollQueued = false;

  function measure() {
    vw = window.innerWidth;
    vh = window.innerHeight;
    const sy = window.scrollY;
    parallaxEls.forEach((p) => {
      const r = p.el.getBoundingClientRect();
      p.base = r.top + sy - p.y;
      p.h = r.height;
    });
    tlOffsets = tlItems.map((item) => {
      const node = $('.tl-item__node', item);
      return item.offsetTop + node.offsetTop + node.offsetHeight / 2;
    });
  }

  function onScrollFrame() {
    scrollQueued = false;
    // ---- reads ----
    const sy = window.scrollY;
    const maxScroll = Math.max(1, root.scrollHeight - vh);
    const tRect = tlInView ? timeline.getBoundingClientRect() : null;

    // ---- writes ----
    nav.classList.toggle('is-scrolled', sy > 40);
    root.style.setProperty('--scroll-p', (sy / maxScroll).toFixed(4));
    if (!reduceMotion) {
      $('#bgGrid').style.setProperty('--grid-y', `${(-(sy * 0.06) % 80).toFixed(1)}px`);

      const factor = isMobile() ? 0.5 : 1;
      parallaxEls.forEach((p) => {
        if (p.base + p.h < sy - 300 || p.base > sy + vh + 300) return;
        p.y = (sy + vh / 2 - (p.base + p.h / 2)) * p.speed * factor;
        p.el.style.setProperty('--py', `${p.y.toFixed(1)}px`);
      });
    }

    if (tRect) {
      const travelled = vh * 0.62 - tRect.top;
      const progress = clamp(travelled / tRect.height, 0, 1);
      timeline.style.setProperty('--progress', progress.toFixed(4));
      timeline.style.setProperty('--head-y', `${(progress * tlTrack.offsetHeight).toFixed(1)}px`);
      timeline.style.setProperty('--head-o', progress > 0 && progress < 1 ? '1' : '0');
      tlItems.forEach((item, i) => item.classList.toggle('is-active', travelled >= tlOffsets[i]));
    }
  }

  function queueScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(onScrollFrame);
  }

  window.addEventListener('scroll', queueScroll, { passive: true });

  new IntersectionObserver((entries) => {
    entries.forEach((en) => { tlInView = en.isIntersecting; });
    queueScroll();
  }, { rootMargin: '20% 0px 20% 0px' }).observe(timeline);

  /* ==================================================================
     7. Reveal-on-scroll + cinematic section lines + count-up
     ================================================================== */
  const revealEls = $$('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealIO = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-visible');
        obs.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    revealEls.forEach((el) => revealIO.observe(el));
  }

  const sectionIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) en.target.classList.add('is-inview'); });
  }, { rootMargin: '0px 0px -20% 0px' });
  $$('.section').forEach((s) => sectionIO.observe(s));

  const countIO = new IntersectionObserver((entries, obs) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      obs.unobserve(en.target);
      const el = en.target;
      const target = parseInt(el.dataset.count, 10);
      const pad = parseInt(el.dataset.pad || '0', 10);
      if (reduceMotion) return;
      const t0 = performance.now();
      const dur = 1200;
      const step = (now) => {
        const p = clamp((now - t0) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(eased * target)).padStart(pad, '0');
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => countIO.observe(el));

  /* ==================================================================
     8. Navigation — active section indicator (+ hover preview)
     ================================================================== */
  const navLinks = $('#navLinks');
  const indicator = $('.nav__indicator', navLinks);
  const linkMap = new Map($$('.nav__link', navLinks).map((a) => [a.dataset.nav, a]));
  let activeLink = null;

  function moveIndicator(link) {
    if (!link) {
      navLinks.classList.remove('has-indicator');
      return;
    }
    indicator.style.setProperty('--x', `${link.offsetLeft}px`);
    indicator.style.setProperty('--w', `${link.offsetWidth}px`);
    navLinks.classList.add('has-indicator');
  }

  function setActive(id) {
    const key = id === 'toolkit' ? 'skills' : id;
    const link = linkMap.get(key) || null;
    if (link === activeLink) return;
    linkMap.forEach((a) => {
      a.classList.toggle('is-active', a === link);
      if (a === link) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    activeLink = link;
    if (!navLinks.matches(':hover')) moveIndicator(link);
  }

  const spyIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) setActive(en.target.id); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['home', 'about', 'education', 'skills', 'toolkit', 'work', 'contact'].forEach((id) => {
    const s = document.getElementById(id);
    if (s) spyIO.observe(s);
  });

  linkMap.forEach((a) => a.addEventListener('pointerenter', () => moveIndicator(a)));
  navLinks.addEventListener('pointerleave', () => moveIndicator(activeLink));

  /* ==================================================================
     9. Mobile menu
     ================================================================== */
  const burger = $('#burger');
  const menu = $('#mobileMenu');
  const main = $('#main');
  const footer = $('.footer');

  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
    body.style.overflow = open ? 'hidden' : '';
    [main, footer].forEach((el) => { el.inert = open; });
    if (open) setTimeout(() => $('.mobile-menu__link', menu).focus({ preventScroll: true }), 250);
  }
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      setMenu(false);
      burger.focus();
    }
  });

  /* ==================================================================
     10. Typing / morphing roles
     ================================================================== */
  const typedEl = $('#typed');
  let typingStarted = false;

  function startTyping() {
    if (typingStarted || !typedEl) return;
    typingStarted = true;
    const roles = CONFIG.roles;
    let i = 0;

    if (reduceMotion) {
      setInterval(() => {
        i = (i + 1) % roles.length;
        typedEl.textContent = roles[i];
      }, 3000);
      return;
    }

    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    (async function loop() {
      await wait(1800);
      for (;;) {
        const current = roles[i];
        for (let c = current.length; c >= 0; c--) {
          typedEl.textContent = current.slice(0, c);
          await wait(34);
        }
        await wait(260);
        i = (i + 1) % roles.length;
        const next = roles[i];
        for (let c = 1; c <= next.length; c++) {
          typedEl.textContent = next.slice(0, c);
          await wait(65 + Math.random() * 40);
        }
        await wait(1900);
      }
    })();
  }

  /* ==================================================================
     11. Skill ecosystem — orbit layout, connecting lines, details
     ================================================================== */
  const eco = $('#eco');
  const ecoSvg = $('#ecoLines');
  const ecoNodes = $$('.eco__node', eco);
  const ecoCat = $('#ecoCat');
  const ecoName = $('#ecoName');
  const ecoDesc = $('#ecoDesc');
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const RADIUS = 0.41;
  let links = [];

  ecoNodes.forEach((node, i) => {
    const angle = (-90 + (360 / ecoNodes.length) * i) * (Math.PI / 180);
    node.dataset.angle = angle;
    node.style.setProperty('--c', node.dataset.color);
    node.style.left = `${(50 + Math.cos(angle) * RADIUS * 100).toFixed(2)}%`;
    node.style.top = `${(50 + Math.sin(angle) * RADIUS * 100).toFixed(2)}%`;
    node.setAttribute('aria-label', `${$('.eco__node-label', node).textContent}: ${node.dataset.desc}`);
  });

  function buildEcoLines() {
    if (window.innerWidth <= 640) return;
    const W = eco.clientWidth;
    if (!W) return;
    const c = W / 2;
    const coreR = W * 0.19 + 6;
    const nodeR = (ecoNodes[0].querySelector('.eco__node-icon').offsetWidth || 64) / 2 + 8;
    ecoSvg.setAttribute('viewBox', `0 0 ${W} ${W}`);
    ecoSvg.innerHTML = '';
    links = ecoNodes.map((node) => {
      const a = parseFloat(node.dataset.angle);
      const R = W * RADIUS;
      const x1 = c + Math.cos(a) * coreR;
      const y1 = c + Math.sin(a) * coreR;
      const x2 = c + Math.cos(a) * (R - nodeR);
      const y2 = c + Math.sin(a) * (R - nodeR);
      const len = Math.hypot(x2 - x1, y2 - y1);
      const g = document.createElementNS(SVG_NS, 'g');
      g.setAttribute('class', 'eco__link');
      g.style.setProperty('--c', node.dataset.color);
      g.style.setProperty('--len', len.toFixed(1));
      ['eco__line', 'eco__pulse'].forEach((cls) => {
        const l = document.createElementNS(SVG_NS, 'line');
        l.setAttribute('class', cls);
        l.setAttribute('x1', x1.toFixed(1));
        l.setAttribute('y1', y1.toFixed(1));
        l.setAttribute('x2', x2.toFixed(1));
        l.setAttribute('y2', y2.toFixed(1));
        g.appendChild(l);
      });
      ecoSvg.appendChild(g);
      return g;
    });
  }

  function activateNode(i) {
    const node = ecoNodes[i];
    eco.classList.add('has-active');
    eco.style.setProperty('--active-c', node.dataset.color);
    ecoNodes.forEach((n, j) => n.classList.toggle('is-active', j === i));
    links.forEach((l, j) => l.classList.toggle('is-active', j === i));
    ecoCat.textContent = node.dataset.cat;
    ecoName.textContent = $('.eco__node-label', node).textContent;
    ecoDesc.textContent = node.dataset.desc;
  }
  function clearNodes() {
    eco.classList.remove('has-active');
    ecoNodes.forEach((n) => n.classList.remove('is-active'));
    links.forEach((l) => l.classList.remove('is-active'));
  }

  ecoNodes.forEach((node, i) => {
    node.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') activateNode(i); });
    node.addEventListener('focus', () => activateNode(i));
    node.addEventListener('click', () => {
      if (node.classList.contains('is-active') && !mqFine.matches) clearNodes();
      else activateNode(i);
    });
  });
  eco.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse' && !eco.contains(document.activeElement)) clearNodes();
  });
  eco.addEventListener('focusout', (e) => {
    if (!eco.contains(e.relatedTarget)) clearNodes();
  });

  if ('ResizeObserver' in window) new ResizeObserver(buildEcoLines).observe(eco);
  else buildEcoLines();

  /* ==================================================================
     12. Copy to clipboard + toast
     ================================================================== */
  const toast = $('#toast');
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      ta.remove();
      return ok;
    }
  }

  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const ok = await copyText(btn.dataset.copy);
      if (!ok) { showToast('Copy failed — please copy manually'); return; }
      btn.classList.add('is-done');
      showToast(btn.dataset.copy.includes('@') ? 'Email copied to clipboard' : 'Phone number copied');
      setTimeout(() => btn.classList.remove('is-done'), 1800);
    });
  });

  /* ==================================================================
     13. Contact form — frontend-only: validates, then opens the
         visitor's own email client with the message pre-filled.
     ================================================================== */
  const form = $('#contactForm');
  const submitBtn = $('#submitBtn');
  const successTitle = $('.form__success-title', form);
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const rules = {
    name: (v) => (v.trim().length >= 2 ? '' : 'Please enter your name.'),
    email: (v) => (EMAIL_RE.test(v.trim()) ? '' : 'Please enter a valid email address.'),
    message: (v) => (v.trim().length >= 10 ? '' : 'Your message should be at least 10 characters.'),
  };

  function validateField(input) {
    const rule = rules[input.name];
    if (!rule) return true;
    const msg = rule(input.value);
    const field = input.closest('.field');
    const err = $('.field__error', field);
    field.classList.remove('is-invalid');
    if (msg) {
      void field.offsetWidth; // restart shake animation
      field.classList.add('is-invalid');
    }
    err.textContent = msg;
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }

  $$('input, textarea', form).forEach((input) => {
    input.addEventListener('blur', () => { if (input.value) validateField(input); });
    input.addEventListener('input', () => {
      if (input.closest('.field').classList.contains('is-invalid')) validateField(input);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = ['name', 'email', 'message'].map((n) => form.elements[n]);
    const results = inputs.map(validateField);
    if (results.includes(false)) {
      inputs[results.indexOf(false)].focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    const subject = data.subject.trim() || `Hello from ${data.name.trim()}`;
    const bodyText = `${data.message.trim()}\n\n— ${data.name.trim()}\n${data.email.trim()}`;
    const href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;
    setTimeout(() => {
      window.location.href = href;
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
      form.classList.add('is-sent');
      setTimeout(() => successTitle.focus({ preventScroll: true }), 300);
    }, reduceMotion ? 0 : 900);
  });

  $('#formReset').addEventListener('click', () => {
    form.reset();
    $$('.field', form).forEach((f) => f.classList.remove('is-invalid'));
    form.classList.remove('is-sent');
    form.elements.name.focus();
  });

  /* ==================================================================
     14. Socials, project links, footer year
     ================================================================== */
  $$('[data-social]').forEach((span) => {
    const url = CONFIG.social[span.dataset.social];
    if (!url) return;
    const a = document.createElement('a');
    a.className = 'social';
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', span.dataset.label);
    a.innerHTML = span.innerHTML;
    span.replaceWith(a);
  });

  // Project buttons stay disabled until a real href is added in the HTML.
  $$('a[data-link]').forEach((a) => {
    if (a.getAttribute('href')) {
      a.removeAttribute('aria-disabled');
      a.removeAttribute('tabindex');
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
  });

  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ==================================================================
     15. Resize / init
     ================================================================== */
  let resizeTimer;
  let lastW = window.innerWidth;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      measure();
      enableCursor();
      if (Math.abs(window.innerWidth - lastW) > 120) {
        lastW = window.innerWidth;
        buildStars();
      }
      if (window.innerWidth > 900 && menu.classList.contains('is-open')) setMenu(false);
      moveIndicator(activeLink);
      queueScroll();
    }, 150);
  });
  mqFine.addEventListener?.('change', enableCursor);

  measure();
  queueScroll();
  window.addEventListener('load', () => { measure(); queueScroll(); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { measure(); moveIndicator(activeLink); queueScroll(); });
  }
})();
