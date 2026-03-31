// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;
  if (currentScroll > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  lastScroll = currentScroll;
});

// ===== MOBILE NAV TOGGLE =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('mobile-open');
  document.body.style.overflow = navLinks.classList.contains('mobile-open') ? 'hidden' : '';
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('mobile-open');
    document.body.style.overflow = '';
  });
});

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'));
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  });
});

// ===== SCROLL REVEAL ANIMATION =====
const revealSelector = '.step-card, .pricing-card, .feature-card, .location-card, .testimonial-card, .faq-item, .section-header, .demo-layout, .expansion-note, .cta-card';
const revealElements = document.querySelectorAll(revealSelector);
const revealSet = new Set(revealElements);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const parent = entry.target.parentElement;
      const siblings = Array.from(parent.children).filter(el => revealSet.has(el) || el.classList.contains('step-connector'));
      const idx = siblings.indexOf(entry.target);
      const delay = Math.max(0, idx) * 80;

      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

revealElements.forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// ===== COUNTER ANIMATION =====
const statNumbers = document.querySelectorAll('.stat-number[data-count]');

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      const duration = 1500;
      const start = performance.now();

      function updateCounter(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(updateCounter);
      }

      requestAnimationFrame(updateCounter);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

statNumbers.forEach(el => counterObserver.observe(el));

// ===== HERO PARTICLES =====
const particlesContainer = document.getElementById('heroParticles');

function createParticles() {
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    particle.style.left = Math.random() * 100 + '%';
    particle.style.width = particle.style.height = (Math.random() * 3 + 1) + 'px';
    particle.style.animationDuration = (Math.random() * 10 + 8) + 's';
    particle.style.animationDelay = (Math.random() * 10) + 's';
    particlesContainer.appendChild(particle);
  }
}

createParticles();

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-question').forEach(question => {
  question.addEventListener('click', () => {
    const item = question.parentElement;
    const answer = item.querySelector('.faq-answer');
    const isActive = item.classList.contains('active');

    // Close all
    document.querySelectorAll('.faq-item.active').forEach(activeItem => {
      activeItem.classList.remove('active');
      activeItem.querySelector('.faq-answer').style.maxHeight = '0';
    });

    // Open clicked (if wasn't active)
    if (!isActive) {
      item.classList.add('active');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

// ===== DEMO FORM INTERACTIVITY =====
const demoForm = document.getElementById('demoForm');
const demoResult = document.getElementById('demoResult');
const resultCard = document.getElementById('resultCard');

// Duration buttons
document.querySelectorAll('.dur-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.dur-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Purpose buttons
document.querySelectorAll('.purpose-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.purpose-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// City data for demo
const cityData = {
  london: { name: 'London', code: 'LHR', weather: '12\u00B0C, Light Rain', icon: '\u26C5', cold: true },
  paris: { name: 'Paris', code: 'CDG', weather: '16\u00B0C, Partly Cloudy', icon: '\u26C5', cold: false },
  berlin: { name: 'Berlin', code: 'BER', weather: '8\u00B0C, Overcast', icon: '\u2601', cold: true },
  rome: { name: 'Rome', code: 'FCO', weather: '22\u00B0C, Sunny', icon: '\u2600', cold: false },
  barcelona: { name: 'Barcelona', code: 'BCN', weather: '24\u00B0C, Clear Sky', icon: '\u2600', cold: false },
  amsterdam: { name: 'Amsterdam', code: 'AMS', weather: '10\u00B0C, Rainy', icon: '\uD83C\uDF27', cold: true },
};

const packageItems = {
  business: {
    base: ['Formal dress shirt (x2)', 'Business slacks', 'Leather belt', 'Hygiene & grooming kit', 'Universal charger & adapter'],
    cold: ['Wool overcoat', 'Scarf'],
    warm: ['Lightweight blazer'],
  },
  leisure: {
    base: ['Casual t-shirts (x3)', 'Jeans & shorts', 'Comfortable sneakers', 'Sunglasses', 'Hygiene kit', 'Travel guidebook'],
    cold: ['Warm hoodie', 'Beanie'],
    warm: ['Swimwear', 'Sunscreen SPF50'],
  },
  transit: {
    base: ['Comfortable outfit', 'Neck pillow', 'Eye mask & earplugs', 'Snack pack', 'Hygiene essentials', 'Phone charger'],
    cold: ['Light jacket'],
    warm: [],
  },
};

demoForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const destination = document.getElementById('demoDestination').value;
  const days = document.querySelector('.dur-btn.active')?.dataset.days || '2';
  const purpose = document.querySelector('.purpose-btn.active')?.dataset.purpose || 'business';

  if (!destination) {
    document.getElementById('demoDestination').focus();
    return;
  }

  const city = cityData[destination];
  const items = packageItems[purpose];
  const allItems = [...items.base, ...(city.cold ? items.cold : items.warm)];

  // Determine recommended package
  let pkg = 'Economy Package';
  let price = '\u20AC42';
  if (parseInt(days) <= 1 && purpose === 'transit') {
    pkg = 'Handbag Package';
    price = '\u20AC15';
  } else if (purpose === 'business') {
    pkg = 'Standard Package';
    price = '\u20AC85';
  } else if (parseInt(days) >= 5) {
    pkg = 'Standard Package';
    price = '\u20AC' + (75 + (parseInt(days) - 3) * 12);
  }

  // Update result card
  document.getElementById('resultPackage').textContent = pkg;
  document.getElementById('resultRoute').textContent = `Istanbul IST \u2192 ${city.name} ${city.code}`;
  document.getElementById('weatherText').textContent = city.weather;
  document.querySelector('.weather-icon').textContent = city.icon;
  document.getElementById('resultPrice').textContent = price;

  const itemsList = document.getElementById('resultItems');
  itemsList.innerHTML = '';
  allItems.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    itemsList.appendChild(li);
  });

  // Show result
  demoResult.querySelector('.result-placeholder')?.classList.add('hidden');
  resultCard.classList.remove('hidden');
});

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');

function updateActiveNav() {
  const scrollY = window.scrollY + 150;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (link) {
      if (scrollY >= top && scrollY < top + height) {
        document.querySelectorAll('.nav-links a').forEach(a => a.style.color = '');
        link.style.color = navbar.classList.contains('scrolled') ? 'var(--primary)' : '#fff';
      }
    }
  });
}

window.addEventListener('scroll', updateActiveNav);
