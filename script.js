const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!window.location.pathname.endsWith('login.html') && !localStorage.getItem('loggedIn')) {
  window.location.href = 'login.html';
}

const state = {
  theme: localStorage.getItem('theme') || 'dark',
  musicOn: false,
  audioContext: null,
  currentImage: null
};

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const themeToggle = document.querySelector('.theme-toggle');
const musicToggle = document.querySelector('.music-toggle');
const loadingScreen = document.querySelector('.loading-screen');
const backToTop = document.querySelector('.back-to-top');
const portfolioPage = document.querySelector('.portfolio-page');
const revealItems = document.querySelectorAll('.reveal');
const counterItems = document.querySelectorAll('.counter-value');
const typingText = document.querySelector('.typing-text');
const clockEl = document.querySelector('#clock');
const factEl = document.querySelector('#fact');
const countdownEl = document.querySelector('#countdown');
const form = document.querySelector('#contactForm');
const statusEl = document.querySelector('.form-status');
const lightbox = document.querySelector('.lightbox');
const lightboxTitle = document.querySelector('#lightboxTitle');
const lightboxDescription = document.querySelector('#lightboxDescription');
const lightboxVisual = document.querySelector('#lightboxVisual');
const lightboxClose = document.querySelector('.lightbox-close');
const galleryItems = document.querySelectorAll('.gallery-item');
const starfield = document.querySelector('#starfield');

const facts = [
  'A day on Venus is longer than its year.',
  'The Sun contains more than 99% of the solar system\'s mass.',
  'Neptune was the first planet discovered via mathematics.'
];

function updateTheme() {
  document.body.classList.toggle('light', state.theme === 'light');
  if (themeToggle) {
    themeToggle.textContent = state.theme === 'light' ? '☀️' : '🌙';
  }
}

function updateClock() {
  const now = new Date();
  if (clockEl) {
    const localTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    clockEl.textContent = `${localTime} • IST ${istTime}`;
  }
}

function setFact() {
  if (factEl) {
    factEl.textContent = facts[Math.floor(Math.random() * facts.length)];
  }
}

function startCountdown() {
  if (!countdownEl) return;

  const orbitDuration = 365.25 * 24 * 60 * 60 * 1000;
  const startDate = new Date('2026-01-01T00:00:00');

  const tick = () => {
    const now = new Date();
    const elapsed = now.getTime() - startDate.getTime();
    const progress = Math.min((elapsed / orbitDuration) * 100, 100);
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    countdownEl.textContent = `${dayOfYear + 1} / 365 days • ${progress.toFixed(1)}% orbit`;
  };

  tick();
  setInterval(tick, 1000);
}

function createStarfield() {
  if (prefersReducedMotion || !starfield) return;
  const ctx = starfield.getContext('2d');
  const stars = Array.from({ length: 120 }, () => ({
    x: Math.random() * starfield.width,
    y: Math.random() * starfield.height,
    radius: Math.random() * 1.8 + 0.4,
    speed: Math.random() * 0.2 + 0.05
  }));

  const resize = () => {
    starfield.width = window.innerWidth * window.devicePixelRatio;
    starfield.height = window.innerHeight * window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  };

  const draw = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    stars.forEach((star) => {
      star.y += star.speed;
      if (star.y > window.innerHeight) {
        star.y = -2;
        star.x = Math.random() * window.innerWidth;
      }
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.fill();
    });
    requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener('resize', resize);
  draw();
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', state.theme);
  updateTheme();
}

function toggleMusic() {
  if (!state.audioContext) {
    state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (!state.musicOn) {
    const oscillator = state.audioContext.createOscillator();
    const gain = state.audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 220;
    gain.gain.value = 0.02;
    oscillator.connect(gain);
    gain.connect(state.audioContext.destination);
    oscillator.start();
    state.musicOsc = oscillator;
    state.musicGain = gain;
    state.musicOn = true;
    if (musicToggle) {
      musicToggle.textContent = '🔊';
    }
  } else {
    if (state.musicOsc) {
      state.musicOsc.stop();
    }
    state.musicOn = false;
    if (musicToggle) {
      musicToggle.textContent = '🔈';
    }
  }
}

function playClickSound() {
  if (!state.audioContext) {
    state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  const oscillator = state.audioContext.createOscillator();
  const gain = state.audioContext.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.value = 880;
  oscillator.frequency.exponentialRampToValueAtTime(660, 0.08);
  gain.gain.value = 0.03;
  oscillator.connect(gain);
  gain.connect(state.audioContext.destination);
  oscillator.start();
  oscillator.stop(state.audioContext.currentTime + 0.08);
}

function handleIntersection(entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
    }
  });
}

function observeSections() {
  const observer = new IntersectionObserver(handleIntersection, { threshold: 0.2 });
  document.querySelectorAll('.timeline-card, .planet-card, .gallery-item').forEach((item) => {
    item.style.animationPlayState = 'paused';
    observer.observe(item);
  });
}

function observeReveal() {
  revealItems.forEach((item) => item.classList.add('visible'));

  if (typeof IntersectionObserver === 'undefined') return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealItems.forEach((item) => observer.observe(item));
}

function animateCounters() {
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const element = entry.target;
      const target = Number(element.dataset.target || 0);
      const suffix = element.dataset.suffix || '';
      const duration = 1200;
      const startTime = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const value = Math.floor(progress * target);
        element.textContent = `${value}${suffix}`;
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          element.textContent = `${target}${suffix}`;
        }
      };

      requestAnimationFrame(tick);
      observer.unobserve(element);
    });
  }, { threshold: 0.7 });

  counterItems.forEach((item) => counterObserver.observe(item));
}

function typeDesignation() {
  if (!typingText) return;
  const text = typingText.dataset.typed || '';

  if (prefersReducedMotion) {
    typingText.textContent = text;
    return;
  }

  typingText.textContent = '';
  let index = 0;

  const tick = () => {
    typingText.textContent = text.slice(0, index);
    index += 1;
    if (index <= text.length) {
      setTimeout(tick, 70);
    }
  };

  tick();
}

function updateParallax(event) {
  if (!portfolioPage) return;
  const x = (event.clientX / window.innerWidth - 0.5) * 10;
  const y = (event.clientY / window.innerHeight - 0.5) * 10;
  portfolioPage.style.setProperty('--parallax-x', `${x}px`);
  portfolioPage.style.setProperty('--parallax-y', `${y}px`);
}

function updateActiveLink() {
  let current = '';
  sections.forEach((section) => {
    const top = section.offsetTop - 140;
    if (window.scrollY >= top) current = section.id;
  });
  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

function showLightbox(item) {
  if (!lightbox || !lightboxTitle || !lightboxDescription || !lightboxVisual) return;

  const title = item.dataset.title;
  const description = item.dataset.description;
  const type = item.dataset.type;
  const image = item.dataset.image;
  lightboxTitle.textContent = title;
  lightboxDescription.textContent = description;
  lightboxVisual.className = `gallery-visual ${type}`;
  lightboxVisual.style.backgroundImage = image ? `url('${image}')` : '';
  lightboxVisual.style.backgroundSize = 'cover';
  lightboxVisual.style.backgroundPosition = 'center';
  lightbox.classList.add('active');
  state.currentImage = item;
}

function closeLightbox() {
  if (lightbox) {
    lightbox.classList.remove('active');
  }
}

window.addEventListener('scroll', () => {
  if (backToTop) {
    backToTop.classList.toggle('visible', window.scrollY > 450);
  }
  updateActiveLink();
});

window.addEventListener('mousemove', updateParallax);

window.addEventListener('DOMContentLoaded', () => {
  updateTheme();
  updateClock();
  setFact();
  startCountdown();
  createStarfield();
  observeSections();
  observeReveal();
  animateCounters();
  typeDesignation();
  updateActiveLink();
  setInterval(updateClock, 1000);
  if (loadingScreen) {
    setTimeout(() => loadingScreen.classList.add('hidden'), 1200);
  }
});

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    playClickSound();
    toggleTheme();
  });
}

if (musicToggle) {
  musicToggle.addEventListener('click', () => {
    playClickSound();
    toggleMusic();
  });
}

if (backToTop) {
  backToTop.addEventListener('click', () => {
    playClickSound();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

if (galleryItems.length) {
  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      playClickSound();
      showLightbox(item);
    });
  });
}

if (lightboxClose) {
  lightboxClose.addEventListener('click', closeLightbox);
}

if (lightbox) {
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeLightbox();
});

if (form && statusEl) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    statusEl.textContent = 'Transmission received. Mission control will contact you shortly.';
    form.reset();
  });
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const targetId = anchor.getAttribute('href');
    const target = document.querySelector(targetId);
    if (target) {
      event.preventDefault();
      playClickSound();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
