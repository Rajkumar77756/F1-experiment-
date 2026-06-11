/**
 * AERO-DYNAMICS F1 website - Core Interaction Controller
 * Engineered by Senior Front-End Developer
 * Zero layout thrashing, 60FPS fluid animations, pure vanilla JS.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initMouseCoordinatesTracking();
  initIntersectionObserverReveal();
  initHeroCard3DTilt();
  initLazyVideoObserver();
});

/**
 * Throttles navbar styling state updates using requestAnimationFrame.
 * Eliminates layout thrashing during scroll events.
 */
function initNavbarScroll() {
  const nav = document.querySelector('.glass-nav');
  if (!nav) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  const updateNavbar = () => {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });
}

/**
 * Implements mouse coordinate mapping inside content grid cards.
 * Updates custom CSS variables to feed dynamic radial-gradient glow effects.
 */
function initMouseCoordinatesTracking() {
  const cards = document.querySelectorAll('.grid-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x coordinate within the element
      const y = e.clientY - rect.top;  // y coordinate within the element

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/**
 * Harnesses modern, high-performance IntersectionObserver API.
 * Triggers progressive CSS reveal animations for grid cards as they enter the viewport.
 */
function initIntersectionObserverReveal() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null, // relative to document viewport
      rootMargin: '0px 0px -80px 0px', // trigger slightly before entering fully
      threshold: 0.12 // trigger when 12% of element is visible
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target); // stop observing once animated
        }
      });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: immediately reveal all elements if API is unsupported
    revealElements.forEach(el => el.classList.add('revealed'));
  }
}

/**
 * Implements high-end 3D perspective glass tilt effect on the hero card.
 * Smoothly morphs on mouse hover and centers when cursor exits.
 * Fully optimized via requestAnimationFrame.
 */
function initHeroCard3DTilt() {
  const heroCard = document.getElementById('hero-interactive-card');
  if (!heroCard) return;

  let requestRef = null;
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;

  const TILT_STRENGTH = 12; // Maximum degrees of rotation
  const SMOOTHING = 0.08;   // Linear interpolation factor for buttery-smooth lag

  const handleMouseMove = (e) => {
    const rect = heroCard.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Normalise mouse position coordinates from -1 to 1
    const mouseX = (e.clientX - rect.left) / width * 2 - 1;
    const mouseY = (e.clientY - rect.top) / height * 2 - 1;
    
    // Calculate target rotations (inverted Y axis for intuitive tilt)
    targetX = -mouseY * TILT_STRENGTH;
    targetY = mouseX * TILT_STRENGTH;
  };

  const resetTilt = () => {
    targetX = 0;
    targetY = 0;
  };

  // Interpolates target values with current values to provide deceleration (inertia)
  const animateTilt = () => {
    currentX += (targetX - currentX) * SMOOTHING;
    currentY += (targetY - currentY) * SMOOTHING;

    // Apply the 3D perspective rotation and custom subtle inner shadow translation
    heroCard.style.transform = `rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg)`;
    
    // Continue loop
    requestRef = window.requestAnimationFrame(animateTilt);
  };

  heroCard.addEventListener('mousemove', handleMouseMove);
  heroCard.addEventListener('mouseleave', () => {
    resetTilt();
  });

  // Start the frame loop
  requestRef = window.requestAnimationFrame(animateTilt);
}

/**
 * Dynamic Intersection Observer for playing/pausing lazy-loaded showcase videos.
 * Runs only when video is in view to preserve active GPU/CPU resources.
 * Handles the play() promise to prevent asynchronous abort errors.
 */
function initLazyVideoObserver() {
  const lazyVideos = Array.from(document.querySelectorAll('.lazy-video'));
  if (lazyVideos.length === 0) return;

  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        
        if (entry.isIntersecting) {
          // Play video when entering viewport (threshold: 0.2)
          if (video.paused) {
            // Ensure preload is enabled for immediate load and play
            if (video.getAttribute('preload') === 'none') {
              video.setAttribute('preload', 'auto');
            }
            
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch(error => {
                // Auto-play was prevented or interrupted, catch gracefully
                console.warn('Video playback was interrupted or prevented:', error);
              });
            }
          }
        } else {
          // Pause video when exiting viewport to conserve system performance
          if (!video.paused) {
            video.pause();
          }
        }
      });
    }, {
      root: null,
      threshold: 0.2 // Trigger when 20% of the video container is visible
    });

    lazyVideos.forEach(video => videoObserver.observe(video));
  } else {
    // Fallback: load and play immediately if IntersectionObserver is not supported
    lazyVideos.forEach(video => {
      video.setAttribute('preload', 'auto');
      video.play().catch(() => {});
    });
  }
}

