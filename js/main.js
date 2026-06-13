/* ============================================================
   VISUS AV — main.js
   Handles: nav scroll state, mobile menu, hero slideshow,
   scroll animations, footer year, the contact form validation
   stub, and the portfolio comparison lightbox.
   No dependencies. Runs after DOM is ready (script at end of body).
   ============================================================ */

(function () {
  'use strict';

  // Shared throughout: honor the user's reduced-motion preference
  // (used by the hero slideshow and the comparison hint animation).
  var prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ----------------------------------------------------------
     1. NAV — Scroll state
     Adds .is-scrolled to <header> once the page scrolls past
     a small threshold, activating the frosted-glass background.
     ---------------------------------------------------------- */
  var header = document.getElementById('site-header');

  function onScroll() {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run once on load (in case the page opens mid-scroll)


  /* ----------------------------------------------------------
     2. NAV — Mobile menu toggle
     Toggles .is-open on the nav list and keeps aria-expanded
     in sync. Locks body scroll while the drawer is open.
     ---------------------------------------------------------- */
  var navToggle = document.getElementById('nav-toggle');
  var navLinks  = document.getElementById('nav-links');

  function closeMenu() {
    if (!navLinks || !navToggle) return;
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function openMenu() {
    if (!navLinks || !navToggle) return;
    navLinks.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  if (navToggle && navLinks) {

    navToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.contains('is-open');
      if (isOpen) { closeMenu(); } else { openMenu(); }
    });

    // Close when any nav link is clicked (navigating closes the drawer)
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape key, return focus to toggle
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
        closeMenu();
        navToggle.focus();
      }
    });
  }


  /* ----------------------------------------------------------
     3. HERO — Background slideshow
     Cross-fades through every .hero__slide in the markup. To add
     or remove images, edit the slides in index.html — this code
     adapts to however many exist (no JS changes needed).

     The fade itself is CSS (opacity transition on .is-active);
     this just moves the .is-active class along on a timer.
     ---------------------------------------------------------- */
  var heroSlides = document.querySelectorAll('.hero__slide');

  // Need at least two slides, and respect reduced-motion (then the
  // first slide simply stays put — no auto-advancing).
  if (heroSlides.length > 1 && !prefersReducedMotion) {

    var HERO_INTERVAL = 6000; // ms each slide stays before fading — tweak to taste
    var heroIndex = 0;
    var heroTimer = null;

    function advanceHero() {
      heroSlides[heroIndex].classList.remove('is-active');
      heroIndex = (heroIndex + 1) % heroSlides.length;
      heroSlides[heroIndex].classList.add('is-active');
    }

    function startHero() {
      if (heroTimer === null) {
        heroTimer = setInterval(advanceHero, HERO_INTERVAL);
      }
    }

    function stopHero() {
      clearInterval(heroTimer);
      heroTimer = null;
    }

    // Pause while the tab is hidden so slides don't pile up off-screen
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { stopHero(); } else { startHero(); }
    });

    startHero();
  }


  /* ----------------------------------------------------------
     4. SCROLL ANIMATIONS — IntersectionObserver
     When an element with .animate-on-scroll enters the viewport,
     .is-visible is added, triggering the CSS fade+slide-up.
     Each element animates only once (unobserved after firing).
     ---------------------------------------------------------- */
  var animatedEls = document.querySelectorAll('.animate-on-scroll');

  if ('IntersectionObserver' in window && animatedEls.length) {

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.10,          // Fire when 10% of the element is in view
        rootMargin: '0px 0px -48px 0px', // Slight bottom offset for a natural feel
      }
    );

    animatedEls.forEach(function (el) {
      observer.observe(el);
    });

  } else {
    // Fallback: make everything visible immediately for older browsers
    animatedEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }


  /* ----------------------------------------------------------
     5. FOOTER YEAR — auto-updates the copyright year
     ---------------------------------------------------------- */
  var yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }


  /* ----------------------------------------------------------
     6. CONTACT FORM — Validation + submission stub

     Current behavior: validates all required fields client-side,
     shows a placeholder success state after 1 second delay.

     TODO: Replace the stub setTimeout block with your real
     submission logic. See the HTML comment in the <form> for
     four integration options (Netlify, Formspree, EmailJS, custom).

     The validation, button state, and feedback UI work as-is
     for all options — only the inner setTimeout block changes.
     ---------------------------------------------------------- */
  var contactForm   = document.getElementById('contact-form');
  var contactSubmit = document.getElementById('contact-submit');
  var formFeedback  = document.getElementById('form-feedback');

  function setFeedback(message, type) {
    if (!formFeedback) return;
    formFeedback.textContent = message;
    formFeedback.className   = 'form-feedback form-feedback--' + type;
  }

  function clearFeedback() {
    if (!formFeedback) return;
    formFeedback.textContent = '';
    formFeedback.className   = 'form-feedback';
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateForm(form) {
    var name    = (form.elements['name']        || {}).value || '';
    var email   = (form.elements['email']       || {}).value || '';
    var project = (form.elements['projectType'] || {}).value || '';
    var message = (form.elements['message']     || {}).value || '';

    if (!name.trim())               return 'Please enter your name.';
    if (!isValidEmail(email.trim())) return 'Please enter a valid email address.';
    if (!project)                   return 'Please select a project type.';
    if (!message.trim())            return 'Please tell us a bit about your project.';
    return null; // All good
  }

  function setSubmitState(isLoading) {
    if (!contactSubmit) return;
    contactSubmit.disabled     = isLoading;
    contactSubmit.textContent  = isLoading ? 'Sending…' : 'Send Message';
  }

  function handleContactSubmit(e) {
    e.preventDefault();
    clearFeedback();

    var error = validateForm(contactForm);
    if (error) {
      setFeedback(error, 'error');
      return;
    }

    setSubmitState(true);

    /* --------------------------------------------------------
       TODO: Replace this entire setTimeout block with your
       chosen submission method. Keep setSubmitState() calls
       and the setFeedback() calls — they give the user clear
       loading and result feedback regardless of method.
       -------------------------------------------------------- */
    setTimeout(function () {
      // STUB: simulates a successful server response
      setFeedback(
        'Thank you — we’ll be in touch within one business day.',
        'success'
      );
      contactForm.reset();
      setSubmitState(false);
    }, 950);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', handleContactSubmit);
  }


  /* ----------------------------------------------------------
     7. PORTFOLIO — Before/After comparison sliders
     ----------------------------------------------------------
     HOW TO ADD A NEW PROJECT
     1. In index.html, duplicate one complete <figure
        class="portfolio-item"> block inside .portfolio-grid.
     2. Point its data-before attribute at the "Art Mode" photo
        (wall off / displaying art) and data-after at the
        "In Use" photo (wall on). Update data-alt-before /
        data-alt-after and the <figcaption> text.
     3. Done. The grid preview (static photo + "Click to Compare"
        badge) and the lightbox slider are both built automatically
        from those attributes — nothing else to wire up.

     INTERACTION MODEL:
     - Grid tiles are static previews of the "In Use" photo; the
       badge signals that a comparison exists. Clicking a tile
       opens the lightbox.
     - The lightbox holds the actual slider: press/drag anywhere
       on the photo wipes the divider, a press/tap jumps it
       straight to the pointer, and a one-time hint sway plays on
       first open so users realize it's draggable.
     ---------------------------------------------------------- */

  /**
   * ComparisonSlider — builds and drives one before/after element.
   *
   * @param {HTMLElement} root  A .comparison element carrying
   *                            data-before / data-after (image paths)
   *                            and data-alt-before / data-alt-after.
   */
  function ComparisonSlider(root) {
    this.root = root;
    this.position = 50;        // divider position in %, clamped 0–100
    this.dragging = false;
    this.pendingFrame = null;  // rAF id for coalesced position updates
    this.hintFrame = null;     // rAF id for the one-time hint animation
    this.hasInteracted = false;

    this.build();
    this.bind();
  }

  /* Build the layers from the root's data attributes */
  ComparisonSlider.prototype.build = function () {
    var data = this.root.dataset;

    // Base layer: "In Use" photo, revealed RIGHT of the divider
    this.afterImg = document.createElement('img');
    this.afterImg.className = 'comparison__img';
    this.afterImg.src = data.after;
    this.afterImg.alt = data.altAfter || '';
    this.afterImg.loading = 'lazy';
    this.afterImg.draggable = false;

    // Top layer: "Art Mode" photo, clipped to the LEFT of the divider
    this.beforeImg = document.createElement('img');
    this.beforeImg.className = 'comparison__img';
    this.beforeImg.src = data.before;
    this.beforeImg.alt = data.altBefore || '';
    this.beforeImg.loading = 'lazy';
    this.beforeImg.draggable = false;

    var clip = document.createElement('div');
    clip.className = 'comparison__clip';
    clip.appendChild(this.beforeImg);

    // Corner label pills
    var pillBefore = document.createElement('span');
    pillBefore.className = 'comparison__pill comparison__pill--before';
    pillBefore.textContent = 'Art Mode';

    var pillAfter = document.createElement('span');
    pillAfter.className = 'comparison__pill comparison__pill--after';
    pillAfter.textContent = 'In Use';

    // Divider line + circular grab handle (keyboard-operable slider)
    this.handle = document.createElement('div');
    this.handle.className = 'comparison__handle';
    this.handle.setAttribute('role', 'slider');
    this.handle.setAttribute('tabindex', '0');
    this.handle.setAttribute('aria-label', 'Reveal Art Mode versus In Use');
    this.handle.setAttribute('aria-valuemin', '0');
    this.handle.setAttribute('aria-valuemax', '100');
    this.handle.setAttribute('aria-valuenow', '50');
    this.handle.setAttribute('aria-orientation', 'horizontal');
    // Double-arrow grip icon, drawn inline — no icon library
    this.handle.innerHTML =
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">' +
      '<path d="M9 7L4 12L9 17"  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M15 7L20 12L15 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';

    var divider = document.createElement('div');
    divider.className = 'comparison__divider';
    divider.appendChild(this.handle);

    this.root.appendChild(this.afterImg);
    this.root.appendChild(clip);
    this.root.appendChild(pillBefore);
    this.root.appendChild(pillAfter);
    this.root.appendChild(divider);
  };

  /* Wire up pointer + keyboard interaction */
  ComparisonSlider.prototype.bind = function () {
    var self = this;

    // Pointer Events cover mouse, touch, and pen identically.
    this.root.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return; // primary button only
      self.dragging = true;
      self.userInteracted();
      // Capture so the drag keeps working even when the pointer
      // leaves the element mid-drag.
      if (self.root.setPointerCapture) {
        self.root.setPointerCapture(e.pointerId);
      }
      // A press/tap jumps the divider straight to the pointer
      self.setFromClientX(e.clientX);
    });

    this.root.addEventListener('pointermove', function (e) {
      if (!self.dragging) return;
      self.setFromClientX(e.clientX);
    });

    this.root.addEventListener('pointerup', function () {
      self.dragging = false;
    });

    // e.g. the browser took over for vertical scrolling on touch
    this.root.addEventListener('pointercancel', function () {
      self.dragging = false;
    });

    // Keyboard: arrows nudge the divider, Home/End jump to the ends
    this.handle.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowLeft')       next = self.position - 5;
      else if (e.key === 'ArrowRight') next = self.position + 5;
      else if (e.key === 'Home')       next = 0;
      else if (e.key === 'End')        next = 100;
      if (next === null) return;
      e.preventDefault();
      self.userInteracted();
      self.setPosition(next);
    });
  };

  /* Convert a pointer x-coordinate to a 0–100 position */
  ComparisonSlider.prototype.setFromClientX = function (clientX) {
    var rect = this.root.getBoundingClientRect();
    this.setPosition(((clientX - rect.left) / rect.width) * 100);
  };

  /* Clamp, then apply on the next animation frame (coalesces the
     many pointermove events per frame into a single style write). */
  ComparisonSlider.prototype.setPosition = function (pos) {
    this.position = Math.max(0, Math.min(100, pos));
    if (this.pendingFrame) return;
    var self = this;
    this.pendingFrame = requestAnimationFrame(function () {
      self.pendingFrame = null;
      self.root.style.setProperty('--pos', self.position + '%');
      self.handle.setAttribute('aria-valuenow', String(Math.round(self.position)));
    });
  };

  /* Swap in a different project's photos (used by the shared lightbox) */
  ComparisonSlider.prototype.setImages = function (data) {
    this.beforeImg.src = data.before;
    this.beforeImg.alt = data.altBefore || '';
    this.afterImg.src = data.after;
    this.afterImg.alt = data.altAfter || '';
    this.setPosition(50); // reset the divider for each new project
  };

  /* One-time "this is draggable" hint: the divider eases a few
     percent left, then right, then settles back at center.
     A single smooth sine sway with a soft envelope — no bounce. */
  ComparisonSlider.prototype.playHint = function () {
    if (this.hasInteracted || prefersReducedMotion || this.hintFrame) return;
    var self = this;
    var start = null;
    var DURATION = 1500; // ms
    var AMPLITUDE = 6;   // max % the divider strays from center

    function frame(timestamp) {
      if (self.hasInteracted) { self.hintFrame = null; return; }
      if (start === null) start = timestamp;
      var t = (timestamp - start) / DURATION;
      if (t >= 1) {
        self.setPosition(50);
        self.hintFrame = null;
        return;
      }
      // sin(2πt) sways left then right; sin(πt) fades it in and out
      var sway = Math.sin(t * Math.PI * 2) * Math.sin(t * Math.PI) * AMPLITUDE;
      self.setPosition(50 - sway);
      self.hintFrame = requestAnimationFrame(frame);
    }
    this.hintFrame = requestAnimationFrame(frame);
  };

  /* Any real interaction cancels the hint permanently */
  ComparisonSlider.prototype.userInteracted = function () {
    this.hasInteracted = true;
    if (this.hintFrame) {
      cancelAnimationFrame(this.hintFrame);
      this.hintFrame = null;
    }
  };


  /* ----------------------------------------------------------
     8. PORTFOLIO — Shared lightbox (one dialog for all items)
     Opens on tile click/tap (or Enter/Space on a focused tile),
     closes via the X button, the backdrop, or Escape. Focus is
     trapped while open and restored to the tile on close.
     ---------------------------------------------------------- */
  var lightbox           = document.getElementById('lightbox');
  var lightboxComparison = document.getElementById('lightbox-comparison');
  var lightboxCaption    = document.getElementById('lightbox-caption');
  var lightboxClose      = document.getElementById('lightbox-close');
  var lightboxBackdrop   = document.getElementById('lightbox-backdrop');

  var lightboxSlider = null;  // created lazily on first open, then reused
  var lightboxTrigger = null; // the tile to restore focus to on close

  function openLightbox(previewEl, figureEl) {
    if (!lightbox) return;

    // Build the enlarged slider once; afterwards just swap its photos
    if (!lightboxSlider) {
      lightboxComparison.dataset.before    = previewEl.dataset.before;
      lightboxComparison.dataset.after     = previewEl.dataset.after;
      lightboxComparison.dataset.altBefore = previewEl.dataset.altBefore || '';
      lightboxComparison.dataset.altAfter  = previewEl.dataset.altAfter || '';
      lightboxSlider = new ComparisonSlider(lightboxComparison);
    } else {
      lightboxSlider.setImages(previewEl.dataset);
    }

    // Copy the tile's caption (project name + detail) under the slider
    var caption = figureEl.querySelector('.portfolio-item__caption');
    lightboxCaption.innerHTML = caption ? caption.innerHTML : '';

    lightboxTrigger = previewEl;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden'; // lock page scroll
    lightboxClose.focus();

    // Subtle "this is draggable" sway — plays until the user has
    // dragged the divider once, then never again (see playHint).
    lightboxSlider.playHint();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lightboxTrigger) {
      lightboxTrigger.focus(); // restore focus to the triggering tile
      lightboxTrigger = null;
    }
  }

  if (lightbox) {
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxBackdrop.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;

      if (e.key === 'Escape') {
        closeLightbox();
        return;
      }

      // Focus trap: keep Tab / Shift+Tab cycling inside the dialog
      if (e.key === 'Tab') {
        var focusables = lightbox.querySelectorAll('button, [tabindex="0"]');
        if (!focusables.length) return;
        var first = focusables[0];
        var last  = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }


  /* ----------------------------------------------------------
     9. PORTFOLIO — Initialize every grid tile
     Each .comparison-preview stacks both photos and auto
     cross-fades between Art Mode and In Use (the fade itself is
     CSS — see .comparison-preview__img--art). The whole tile is a
     button that opens the lightbox, where the draggable slider lives.
     ---------------------------------------------------------- */
  var gridPreviews = document.querySelectorAll('.portfolio-grid .comparison-preview');

  gridPreviews.forEach(function (previewEl, i) {
    var figureEl = previewEl.closest('.portfolio-item');
    var label = figureEl && figureEl.querySelector('.portfolio-item__label');
    var data = previewEl.dataset;

    // Base layer: the "In Use" photo (revealed when the top layer fades out)
    var afterImg = document.createElement('img');
    afterImg.className = 'comparison-preview__img';
    afterImg.src = data.after;
    afterImg.alt = data.altAfter || '';
    afterImg.loading = 'lazy';
    afterImg.draggable = false;

    // Top layer: the "Art Mode" photo — CSS fades it in and out
    var beforeImg = document.createElement('img');
    beforeImg.className = 'comparison-preview__img comparison-preview__img--art';
    beforeImg.src = data.before;
    beforeImg.alt = data.altBefore || '';
    beforeImg.loading = 'lazy';
    beforeImg.draggable = false;
    // Negative delay staggers the tiles so they don't all flip in unison
    beforeImg.style.animationDelay = (i * -1.7) + 's';

    previewEl.appendChild(afterImg);
    previewEl.appendChild(beforeImg);

    // The whole tile is one button: click, or Enter/Space when focused
    previewEl.setAttribute('tabindex', '0');
    previewEl.setAttribute('role', 'button');
    previewEl.setAttribute(
      'aria-label',
      'Compare Art Mode versus In Use' + (label ? ': ' + label.textContent : '')
    );
    previewEl.addEventListener('click', function () {
      openLightbox(previewEl, figureEl);
    });
    previewEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(previewEl, figureEl);
      }
    });
  });


})();
