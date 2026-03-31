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

// Customization state
let isCustomizeMode = false;
let currentItems = [];
let removedItems = [];
let addedItems = [];
let basePrice = 0;

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

// Add-on items database
const addonItems = {
  clothing: [
    { name: 'Extra T-shirt', price: 5 },
    { name: 'Casual shorts', price: 8 },
    { name: 'Rain jacket', price: 15 },
    { name: 'Sleepwear set', price: 10 },
    { name: 'Formal tie', price: 7 },
    { name: 'Socks (3 pairs)', price: 4 },
    { name: 'Underwear set', price: 6 },
    { name: 'Workout clothes', price: 12 },
  ],
  accessories: [
    { name: 'Travel backpack', price: 18 },
    { name: 'Umbrella', price: 5 },
    { name: 'Passport holder', price: 6 },
    { name: 'Luggage lock', price: 4 },
    { name: 'Neck wallet', price: 5 },
    { name: 'Travel pillow (premium)', price: 12 },
  ],
  tech: [
    { name: 'Power bank 10000mAh', price: 15 },
    { name: 'USB-C cable', price: 4 },
    { name: 'Travel adapter (EU)', price: 6 },
    { name: 'Wireless earbuds', price: 20 },
    { name: 'Kindle e-reader', price: 25 },
    { name: 'Laptop sleeve', price: 10 },
  ],
  hygiene: [
    { name: 'Sunscreen SPF30', price: 5 },
    { name: 'Travel deodorant', price: 3 },
    { name: 'Toothbrush kit', price: 4 },
    { name: 'Skincare mini set', price: 8 },
    { name: 'Hand sanitizer', price: 2 },
    { name: 'First aid mini kit', price: 7 },
  ]
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
  let price = 42;
  if (parseInt(days) <= 1 && purpose === 'transit') {
    pkg = 'Handbag Package';
    price = 15;
  } else if (purpose === 'business') {
    pkg = 'Standard Package';
    price = 85;
  } else if (parseInt(days) >= 5) {
    pkg = 'Standard Package';
    price = 75 + (parseInt(days) - 3) * 12;
  }

  basePrice = price;

  // Update result card
  document.getElementById('resultPackage').textContent = pkg;
  document.getElementById('resultRoute').textContent = `Istanbul IST \u2192 ${city.name} ${city.code}`;
  document.getElementById('weatherText').textContent = city.weather;
  document.querySelector('.weather-icon').textContent = city.icon;

  // Reset customization state
  isCustomizeMode = false;
  currentItems = allItems.map(name => ({ name, isAI: true, price: 0 }));
  removedItems = [];
  addedItems = [];

  const customizeBtn = document.getElementById('customizeToggle');
  customizeBtn.classList.remove('active');
  document.getElementById('addItemsPanel').classList.add('hidden');
  document.getElementById('removedItemsBar').classList.add('hidden');
  document.getElementById('priceNote').classList.add('hidden');

  renderItems();
  updatePrice();

  // Show result
  demoResult.querySelector('.result-placeholder')?.classList.add('hidden');
  resultCard.classList.remove('hidden');
});

// Render items list
function renderItems() {
  const itemsList = document.getElementById('resultItems');
  itemsList.innerHTML = '';

  currentItems.forEach((item, index) => {
    const li = document.createElement('li');
    if (isCustomizeMode) {
      li.classList.add('customizable');
    }

    // Item content
    const contentSpan = document.createElement('span');
    contentSpan.className = 'item-content';
    contentSpan.textContent = item.name;

    // Tag
    if (item.isAI) {
      const tag = document.createElement('span');
      tag.className = 'item-tag item-tag-ai';
      tag.textContent = 'AI';
      contentSpan.appendChild(tag);
    } else {
      const tag = document.createElement('span');
      tag.className = 'item-tag item-tag-added';
      tag.textContent = 'ADDED';
      contentSpan.appendChild(tag);
    }

    li.appendChild(contentSpan);

    // Remove button (only in customize mode)
    if (isCustomizeMode) {
      const removeBtn = document.createElement('button');
      removeBtn.className = 'item-remove-btn';
      removeBtn.type = 'button';
      removeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';
      removeBtn.addEventListener('click', () => removeItem(index));
      li.appendChild(removeBtn);
    }

    // Add slide-in animation for newly added items
    if (!item.isAI && item.justAdded) {
      li.classList.add('item-added');
      item.justAdded = false;
    }

    itemsList.appendChild(li);
  });
}

// Get active add-items category
function getActiveCategory() {
  const activeBtn = document.querySelector('.add-cat-btn.active');
  return activeBtn ? activeBtn.dataset.category : 'clothing';
}

// Refresh add items grid if panel is open
function refreshAddItemsGrid() {
  const panel = document.getElementById('addItemsPanel');
  if (!panel.classList.contains('hidden')) {
    renderAddItemsGrid(getActiveCategory());
  }
}

// Remove an item
function removeItem(index) {
  const itemsList = document.getElementById('resultItems');
  const li = itemsList.children[index];

  if (li) {
    li.classList.add('item-removing');

    setTimeout(() => {
      const removed = currentItems.splice(index, 1)[0];
      removedItems.push(removed);
      renderItems();
      updateRemovedBar();
      updatePrice();
      refreshAddItemsGrid();
    }, 300);
  }
}

// Update removed items bar
function updateRemovedBar() {
  const bar = document.getElementById('removedItemsBar');
  const count = document.getElementById('removedCount');

  if (removedItems.length > 0) {
    bar.classList.remove('hidden');
    count.textContent = removedItems.length;
  } else {
    bar.classList.add('hidden');
  }
}

// Undo all removed items
document.getElementById('undoRemoveBtn').addEventListener('click', () => {
  currentItems = [...currentItems, ...removedItems.map(item => ({ ...item, justAdded: true }))];
  removedItems = [];
  renderItems();
  updateRemovedBar();
  updatePrice();
  refreshAddItemsGrid();
});

// Update price
function updatePrice() {
  const addedCost = currentItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const removedSavings = removedItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalPrice = basePrice + addedCost - removedSavings;

  const priceEl = document.getElementById('resultPrice');
  priceEl.textContent = `\u20AC${totalPrice}`;

  // Animate price change
  priceEl.classList.remove('price-updated');
  void priceEl.offsetWidth; // Force reflow
  priceEl.classList.add('price-updated');

  // Show price note if customized
  const priceNote = document.getElementById('priceNote');
  const noteText = document.getElementById('priceNoteText');
  if (addedCost > 0 || removedItems.length > 0) {
    priceNote.classList.remove('hidden');
    const parts = [];
    if (addedCost > 0) parts.push(`+\u20AC${addedCost} for added items`);
    if (removedItems.length > 0) parts.push(`${removedItems.length} item(s) removed`);
    noteText.textContent = parts.join(' · ');
  } else {
    priceNote.classList.add('hidden');
  }
}

// Customize toggle
document.getElementById('customizeToggle').addEventListener('click', () => {
  isCustomizeMode = !isCustomizeMode;
  const btn = document.getElementById('customizeToggle');
  const panel = document.getElementById('addItemsPanel');

  btn.classList.toggle('active', isCustomizeMode);

  if (isCustomizeMode) {
    panel.classList.remove('hidden');
    renderAddItemsGrid('clothing');
  } else {
    panel.classList.add('hidden');
  }

  renderItems();
});

// Category buttons for add-items panel
document.querySelectorAll('.add-cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.add-cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderAddItemsGrid(btn.dataset.category);
  });
});

// Render add items grid
function renderAddItemsGrid(category) {
  const grid = document.getElementById('addItemsGrid');
  grid.innerHTML = '';

  const items = addonItems[category] || [];
  items.forEach(item => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'add-item-chip';

    const isAlreadyAdded = currentItems.some(ci => ci.name === item.name);
    if (isAlreadyAdded) {
      chip.classList.add('added');
    }

    chip.innerHTML = `
      <span class="chip-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${isAlreadyAdded ? '<path d="M20 6L9 17l-5-5"/>' : '<path d="M12 5v14M5 12h14"/>'}
        </svg>
      </span>
      <span>${item.name}</span>
      <span class="add-item-price">${isAlreadyAdded ? 'Added' : '+\u20AC' + item.price}</span>
    `;

    if (!isAlreadyAdded) {
      chip.addEventListener('click', () => {
        addItemToSuitcase(item, chip, category);
      });
    }

    grid.appendChild(chip);
  });
}

// Add item to suitcase
function addItemToSuitcase(item, chipEl, category) {
  currentItems.push({ name: item.name, isAI: false, price: item.price, justAdded: true });
  addedItems.push(item.name);

  renderItems();
  updatePrice();

  // Update the chip to show "added"
  renderAddItemsGrid(category);
}

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
