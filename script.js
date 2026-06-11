document.addEventListener('DOMContentLoaded', () => {

  /* --- LOADER SCREEN HANDLER --- */
  const loader = document.getElementById('loader');
  const body = document.body;
  const TRANSITION_KEY = 'stackly-page-transition';
  const isHomePageRoute = !!document.getElementById('home');

  const hideLoader = () => {
    if (loader && !loader.classList.contains('fade-out')) {
      loader.classList.add('fade-out');
      body.classList.remove('menu-open');
    }
  };

  if (loader) {
    if (!body.classList.contains('menu-open')) {
      body.classList.add('menu-open');
    }

    const isPageTransition = sessionStorage.getItem(TRANSITION_KEY) === 'true';
    sessionStorage.removeItem(TRANSITION_KEY);

    if (isHomePageRoute && !isPageTransition) {
      setTimeout(hideLoader, 3000);
    } else {
      const minDuration = isPageTransition ? 1000 : 1200;
      const start = performance.now();
      const finishLoader = () => {
        const remaining = Math.max(0, minDuration - (performance.now() - start));
        setTimeout(hideLoader, remaining);
      };

      if (document.readyState === 'complete') {
        finishLoader();
      } else {
        window.addEventListener('load', finishLoader, { once: true });
      }
    }
  }

  const isInternalPageLink = (href) => {
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      return false;
    }

    try {
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return false;
      const path = url.pathname;
      return path.endsWith('.html') || path.endsWith('/') || path.endsWith('/index.html');
    } catch {
      return false;
    }
  };

  const showTransitionLoader = () => {
    sessionStorage.setItem(TRANSITION_KEY, 'true');
    if (loader) {
      loader.classList.remove('fade-out');
      body.classList.add('menu-open');
    }
  };

  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!isInternalPageLink(href)) return;
    if (link.target === '_blank' || link.hasAttribute('download')) return;

    link.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.pathname === window.location.pathname) return;

      e.preventDefault();
      showTransitionLoader();
      setTimeout(() => {
        window.location.href = link.href;
      }, 450);
    });
  });


  /* --- STICKY HEADER & SCROLL SPY --- */
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-menu .nav-link');
  const sections = document.querySelectorAll('section[id]');
  const isHomePage = sections.length > 0 && Array.from(navLinks).some(link => {
    const href = link.getAttribute('href');
    return href && href.startsWith('#');
  });

  window.addEventListener('scroll', () => {
    if (header) {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else if (isHomePage) {
        header.classList.remove('scrolled');
      }
    }

    if (isHomePage) {
      let currentId = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.offsetHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
          currentId = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === `#${currentId}`) {
          link.classList.add('active');
        }
      });
    }
  });


  /* --- MOBILE HAMBURGER MENU OVERLAY --- */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuLinks = mobileMenu.querySelectorAll('.nav-link');

  if (menuToggle && mobileMenu) {
    const toggleMenu = () => {
      const isOpen = mobileMenu.classList.contains('open');
      if (isOpen) {
        // Close menu
        mobileMenu.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        body.classList.remove('menu-open');
      } else {
        // Open menu
        mobileMenu.classList.add('open');
        menuToggle.classList.add('open');
        menuToggle.setAttribute('aria-expanded', 'true');
        mobileMenu.setAttribute('aria-hidden', 'false');
        body.classList.add('menu-open');
      }
    };

    menuToggle.addEventListener('click', toggleMenu);

    // Close mobile menu when links are clicked (for smooth page scrolling)
    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (mobileMenu.classList.contains('open')) {
          toggleMenu();
        }
      });
    });
  }


  /* --- SCROLL REVEAL (INTERSECTION OBSERVER) --- */
  const revealItems = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // Reveal only once
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealItems.forEach(item => {
    revealObserver.observe(item);
  });


  /* --- COUNTERS AND PROGRESS BARS ANIMATION --- */
  const whySection = document.getElementById('why-choose-us');
  let animationTriggered = false;

  const countUp = (counter) => {
    const target = parseInt(counter.getAttribute('data-target'), 10);
    const duration = 2000; // 2 seconds animation duration
    const frameRate = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameRate);
    let currentFrame = 0;

    const animate = () => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      // Ease out quadratic
      const easeProgress = progress * (2 - progress);
      const currentValue = Math.floor(easeProgress * target);

      counter.textContent = currentValue + (target === 15 ? '+' : target === 98 ? '%' : '+');

      if (currentFrame < totalFrames) {
        requestAnimationFrame(animate);
      } else {
        counter.textContent = target + (target === 15 ? '+' : target === 98 ? '%' : '+');
      }
    };

    requestAnimationFrame(animate);
  };

  const fillProgressBars = () => {
    const progressBars = document.querySelectorAll('.progress-bar');
    const progressPercentages = document.querySelectorAll('.skill-percentage');

    progressBars.forEach(bar => {
      const targetWidth = bar.getAttribute('data-width');
      bar.style.width = targetWidth;
      // Add filled class when progress animation completes to activate glow cap
      setTimeout(() => {
        bar.classList.add('filled');
      }, 1800);
    });

    progressPercentages.forEach(percentage => {
      const targetValue = parseInt(percentage.getAttribute('data-target'), 10);
      const duration = 1500;
      const frameRate = 1000 / 60;
      const totalFrames = Math.round(duration / frameRate);
      let currentFrame = 0;

      const animate = () => {
        currentFrame++;
        const progress = currentFrame / totalFrames;
        const easeProgress = progress * (2 - progress);
        const currentValue = Math.floor(easeProgress * targetValue);

        percentage.textContent = currentValue + '%';

        if (currentFrame < totalFrames) {
          requestAnimationFrame(animate);
        } else {
          percentage.textContent = targetValue + '%';
        }
      };

      requestAnimationFrame(animate);
    });
  };

  if (whySection) {
    const statObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animationTriggered) {
          animationTriggered = true;
          
          // Animate statistics counter cards
          const counters = whySection.querySelectorAll('.counter-number');
          counters.forEach(counter => countUp(counter));

          // Animate progress skills bars
          fillProgressBars();

          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2
    });

    statObserver.observe(whySection);
  }


  /* --- CARD GLOW MOUSE TRACKING (SERVICES & COUNTERS) --- */
  const glowCards = document.querySelectorAll('.service-card, .counter-card');
  glowCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });


  /* --- TESTIMONIALS SLIDER WITH SWIPE & DRAG SUPPORT --- */
  const track = document.getElementById('testimonials-track');
  const carousel = document.getElementById('testimonials-carousel');
  const dots = document.querySelectorAll('#carousel-dots .carousel-dot');
  
  if (track && carousel && dots.length > 0) {
    const slides = Array.from(track.children);
    let currentIndex = 0;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = 0;
    let autoplayTimer = null;

    const getSlideWidth = () => carousel.offsetWidth;

    const setPositionByIndex = () => {
      const slideWidth = getSlideWidth();
      currentTranslate = currentIndex * -slideWidth;
      track.style.transform = `translateX(${currentTranslate}px)`;
      prevTranslate = currentTranslate;
      updateDots();
    };

    const updateDots = () => {
      dots.forEach((dot, index) => {
        if (index === currentIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    };

    // Go to specific slide index
    const goToSlide = (index) => {
      currentIndex = index;
      // Clamp index boundaries
      if (currentIndex < 0) currentIndex = 0;
      if (currentIndex > slides.length - 1) currentIndex = slides.length - 1;
      setPositionByIndex();
    };

    // Autoplay implementation
    const startAutoplay = () => {
      stopAutoplay();
      autoplayTimer = setInterval(() => {
        currentIndex = (currentIndex + 1) % slides.length;
        setPositionByIndex();
      }, 5000);
    };

    const stopAutoplay = () => {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    };

    // Dot click listeners
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        goToSlide(index);
        startAutoplay(); // Reset timer on interaction
      });
    });

    // Touch and Drag Gestures Logic
    const getPositionX = (event) => {
      return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    };

    const animation = () => {
      track.style.transform = `translateX(${currentTranslate}px)`;
      if (isDragging) requestAnimationFrame(animation);
    };

    const dragStart = (event) => {
      stopAutoplay();
      isDragging = true;
      startPos = getPositionX(event);
      prevTranslate = currentIndex * -getSlideWidth();
      currentTranslate = prevTranslate;
      track.style.transition = 'none';
      
      if (event.type === 'touchstart') {
        // preventDefault might block vertical scroll, so we handle touch drag cautiously
      }
    };

    const dragMove = (event) => {
      if (!isDragging) return;
      const currentPosition = getPositionX(event);
      const diff = currentPosition - startPos;
      currentTranslate = prevTranslate + diff;
      track.style.transform = `translateX(${currentTranslate}px)`;
    };

    const dragEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      const movedBy = currentTranslate - prevTranslate;

      // Snap to slide threshold (100px drag)
      if (movedBy < -100 && currentIndex < slides.length - 1) {
        currentIndex += 1;
      } else if (movedBy > 100 && currentIndex > 0) {
        currentIndex -= 1;
      }

      track.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
      setPositionByIndex();
      startAutoplay();
    };

    // Event listeners
    carousel.addEventListener('touchstart', dragStart, { passive: true });
    carousel.addEventListener('touchmove', dragMove, { passive: true });
    carousel.addEventListener('touchend', dragEnd);

    carousel.addEventListener('mousedown', dragStart);
    carousel.addEventListener('mousemove', dragMove);
    carousel.addEventListener('mouseup', dragEnd);
    carousel.addEventListener('mouseleave', dragEnd);

    // Handle window resize recalculation
    window.addEventListener('resize', () => {
      track.style.transition = 'none';
      setPositionByIndex();
      setTimeout(() => {
        track.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
      }, 50);
    });

    // Start carousel behaviors
    setPositionByIndex();
    startAutoplay();
  }


  /* --- PROJECT FILTER (PROJECTS PAGE) --- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectItems = document.querySelectorAll('.project-item-sm[data-category]');

  if (filterBtns.length > 0 && projectItems.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');

        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        projectItems.forEach(item => {
          const category = item.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }


  /* --- CONTACT FORM HANDLER --- */
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (contactForm) {
    const contactValidators = {
      name(value) {
        const trimmed = value.trim();
        if (!trimmed) return 'Please enter your full name.';
        if (trimmed.length < 2) return 'Name must be at least 2 characters.';
        if (!/^[a-zA-Z\s.\-']+$/.test(trimmed)) return 'Name can only contain letters.';
        return '';
      },
      phone(value) {
        const trimmed = value.trim();
        if (!trimmed) return 'Please enter your phone number.';
        const digits = trimmed.replace(/\D/g, '');
        const mobile = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
        if (mobile.length !== 10 || !/^[6-9]\d{9}$/.test(mobile)) {
          return 'Enter a valid 10-digit Indian mobile number.';
        }
        return '';
      },
      email(value) {
        const trimmed = value.trim();
        if (!trimmed) return 'Please enter your email address.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Please enter a valid email address.';
        return '';
      },
      message(value) {
        const trimmed = value.trim();
        if (!trimmed) return 'Please describe your project.';
        if (trimmed.length < 10) return 'Please provide at least 10 characters of detail.';
        return '';
      }
    };

    const showFieldError = (fieldName, errorMessage) => {
      const group = contactForm.querySelector(`[data-field="${fieldName}"]`);
      const input = contactForm.querySelector(`#${fieldName}`);
      const errorEl = contactForm.querySelector(`#${fieldName}-error`);
      if (!group || !input || !errorEl) return;
      group.classList.add('has-error');
      errorEl.textContent = errorMessage;
      input.setAttribute('aria-invalid', 'true');
    };

    const clearFieldError = (fieldName) => {
      const group = contactForm.querySelector(`[data-field="${fieldName}"]`);
      const input = contactForm.querySelector(`#${fieldName}`);
      const errorEl = contactForm.querySelector(`#${fieldName}-error`);
      if (!group || !input || !errorEl) return;
      group.classList.remove('has-error');
      errorEl.textContent = '';
      input.removeAttribute('aria-invalid');
    };

    const validateField = (fieldName) => {
      const input = contactForm.querySelector(`#${fieldName}`);
      if (!input || !contactValidators[fieldName]) return true;
      const errorMessage = contactValidators[fieldName](input.value);
      if (errorMessage) {
        showFieldError(fieldName, errorMessage);
        return false;
      }
      clearFieldError(fieldName);
      return true;
    };

    Object.keys(contactValidators).forEach((fieldName) => {
      const input = contactForm.querySelector(`#${fieldName}`);
      if (!input) return;
      input.addEventListener('blur', () => validateField(fieldName));
      input.addEventListener('input', () => {
        const group = contactForm.querySelector(`[data-field="${fieldName}"]`);
        if (group && group.classList.contains('has-error')) {
          validateField(fieldName);
        }
      });
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fields = Object.keys(contactValidators);
      const results = fields.map((fieldName) => validateField(fieldName));
      const isValid = results.every(Boolean);

      if (!isValid) {
        const firstInvalid = fields.find((fieldName) => {
          const group = contactForm.querySelector(`[data-field="${fieldName}"]`);
          return group && group.classList.contains('has-error');
        });
        if (firstInvalid) {
          contactForm.querySelector(`#${firstInvalid}`).focus();
        }
        return;
      }

      contactForm.reset();
      fields.forEach(clearFieldError);
      if (formSuccess) {
        formSuccess.classList.add('show');
        setTimeout(() => formSuccess.classList.remove('show'), 5000);
      }
    });
  }


  /* --- FOOTER CURRENT YEAR --- */
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  /* --- CUSTOM CUSTOM CURSOR HANDLER --- */
  const cursorDot = document.getElementById('custom-cursor-dot');
  const cursorOutline = document.getElementById('custom-cursor-outline');

  if (cursorDot && cursorOutline) {
    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;
    let isCursorVisible = false;

    // Track mouse coordinates
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isCursorVisible) {
        cursorDot.style.opacity = '1';
        cursorOutline.style.opacity = '1';
        isCursorVisible = true;
      }

      // Position the inner solid dot instantly
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    // Lerped frame loop to animate outer outline lag smoothly
    const animateCursor = () => {
      const ease = 0.15; // spring ease coefficient
      outlineX += (mouseX - outlineX) * ease;
      outlineY += (mouseY - outlineY) * ease;

      cursorOutline.style.left = `${outlineX}px`;
      cursorOutline.style.top = `${outlineY}px`;

      requestAnimationFrame(animateCursor);
    };
    requestAnimationFrame(animateCursor);

    // Track interactive hovers to expand cursor
    const interactiveSelectors = 'a, button, .btn, .nav-link, .brand-item, .service-card, .project-item, .project-item-sm, .blog-card, .filter-btn, .carousel-dot, .social-icon, .story-play-btn, input, select, textarea';
    
    // Add hover class to body
    const handleMouseEnter = () => document.body.classList.add('cursor-hover');
    const handleMouseLeave = () => document.body.classList.remove('cursor-hover');

    // Attach listeners dynamically
    const attachCursorHoverListeners = () => {
      const elements = document.querySelectorAll(interactiveSelectors);
      elements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
      });
    };
    attachCursorHoverListeners();

    // Re-attach elements in case dynamic elements render later
    setTimeout(attachCursorHoverListeners, 1000);

    // Hide custom cursor when cursor leaves window viewport bounds
    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorOutline.style.opacity = '0';
      isCursorVisible = false;
    });

    document.addEventListener('mouseenter', () => {
      cursorDot.style.opacity = '1';
      cursorOutline.style.opacity = '1';
      isCursorVisible = true;
    });
  }

});
