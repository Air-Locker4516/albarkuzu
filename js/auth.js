// ===== AUTH MANAGER =====
const AuthManager = {
  STORAGE_KEYS: {
    USERS: 'airlocker_users',
    CURRENT_USER: 'airlocker_current_user',
    ORDERS: 'airlocker_orders',
  },

  init() {
    // Seed admin user if not exists
    const users = this.getUsers();
    if (!users.find(u => u.username === 'admin')) {
      users.push({
        id: 'usr_admin',
        name: 'Admin',
        username: 'admin',
        password: 'admin',
        role: 'admin',
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    this.updateNavbar();
  },

  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS)) || [];
    } catch { return []; }
  },

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER));
    } catch { return null; }
  },

  register(name, username, password) {
    if (!name || !username || !password) return { ok: false, msg: 'All fields are required.' };
    if (username.length < 3) return { ok: false, msg: 'Username must be at least 3 characters.' };
    if (password.length < 3) return { ok: false, msg: 'Password must be at least 3 characters.' };

    const users = this.getUsers();
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { ok: false, msg: 'Username already taken.' };
    }

    const user = {
      id: 'usr_' + Date.now(),
      name,
      username,
      password,
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));

    // Auto-login
    const safeUser = { ...user };
    delete safeUser.password;
    localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));
    this.updateNavbar();
    return { ok: true, user: safeUser };
  },

  login(username, password) {
    if (!username || !password) return { ok: false, msg: 'Please enter username and password.' };

    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return { ok: false, msg: 'Invalid username or password.' };

    const safeUser = { ...user };
    delete safeUser.password;
    localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));
    this.updateNavbar();
    return { ok: true, user: safeUser };
  },

  logout() {
    localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
    this.updateNavbar();
  },

  // Orders
  getOrders() {
    try {
      const orders = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ORDERS)) || [];
      const user = this.getCurrentUser();
      if (!user) return [];
      return orders.filter(o => o.userId === user.id);
    } catch { return []; }
  },

  getAllOrders() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ORDERS)) || [];
    } catch { return []; }
  },

  placeOrder(orderData) {
    const user = this.getCurrentUser();
    if (!user) return { ok: false, msg: 'Please login first.' };

    const orders = this.getAllOrders();
    const order = {
      id: 'ORD-' + String(Date.now()).slice(-6),
      userId: user.id,
      userName: user.name,
      ...orderData,
      status: 'Ready for Pickup',
      createdAt: new Date().toISOString(),
    };
    orders.push(order);
    localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return { ok: true, order };
  },

  // Navbar update
  updateNavbar() {
    const user = this.getCurrentUser();
    const authBtns = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userNameDisplay');

    if (!authBtns || !userMenu) return;

    if (user) {
      authBtns.classList.add('hidden');
      userMenu.classList.remove('hidden');
      if (userName) {
        userName.textContent = user.name;
      }
      const avatarEl = document.getElementById('userAvatarText');
      if (avatarEl) {
        avatarEl.textContent = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      }
    } else {
      authBtns.classList.remove('hidden');
      userMenu.classList.add('hidden');
    }
  },
};

// ===== MODAL MANAGER =====
const ModalManager = {
  open(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  close(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  },

  closeAll() {
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
      m.classList.remove('active');
    });
    document.body.style.overflow = '';
  },
};

// ===== AUTH MODAL LOGIC =====
function initAuthModal() {
  // Tab switching
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      document.getElementById(target + 'Form').classList.add('active');
      clearAuthErrors();
    });
  });

  // Login form
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const result = AuthManager.login(username, password);

    if (result.ok) {
      ModalManager.close('authModal');
      document.getElementById('loginForm').reset();
      showToast('Welcome back, ' + result.user.name + '!', 'success');
      // If there's a pending purchase, continue
      if (pendingPurchase) {
        setTimeout(() => openOrderModal(pendingPurchase), 400);
        pendingPurchase = null;
      }
    } else {
      showAuthError('loginError', result.msg);
    }
  });

  // Register form
  document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const result = AuthManager.register(name, username, password);

    if (result.ok) {
      ModalManager.close('authModal');
      document.getElementById('registerForm').reset();
      showToast('Account created! Welcome, ' + result.user.name + '!', 'success');
      if (pendingPurchase) {
        setTimeout(() => openOrderModal(pendingPurchase), 400);
        pendingPurchase = null;
      }
    } else {
      showAuthError('registerError', result.msg);
    }
  });

  // Close modal on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        ModalManager.closeAll();
      }
    });
  });

  // Close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      ModalManager.closeAll();
    });
  });
}

function showAuthError(elementId, msg) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = msg;
    el.classList.remove('hidden');
  }
}

function clearAuthErrors() {
  document.querySelectorAll('.auth-error').forEach(el => {
    el.classList.add('hidden');
    el.textContent = '';
  });
}

// ===== TOAST NOTIFICATION =====
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${type === 'success' ? '<path d="M20 6L9 17l-5-5"/>' :
      type === 'error' ? '<circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>' :
      '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'}
    </svg>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== PURCHASE FLOW =====
let pendingPurchase = null;

function handlePackageSelect(packageName, price) {
  const user = AuthManager.getCurrentUser();

  if (!user) {
    // Save pending purchase, open login
    pendingPurchase = { packageName, price };
    showToast('Please login to purchase a package.', 'info');
    setTimeout(() => ModalManager.open('authModal'), 300);
    return;
  }

  openOrderModal({ packageName, price });
}

function openOrderModal(data) {
  document.getElementById('orderPackageName').textContent = data.packageName;
  document.getElementById('orderPrice').textContent = '\u20AC' + data.price;
  document.getElementById('orderConfirmSection').classList.remove('hidden');
  document.getElementById('orderSuccessSection').classList.add('hidden');
  ModalManager.open('orderModal');
}

function initOrderModal() {
  // Confirm order
  document.getElementById('confirmOrderBtn').addEventListener('click', () => {
    const packageName = document.getElementById('orderPackageName').textContent;
    const price = document.getElementById('orderPrice').textContent;

    const result = AuthManager.placeOrder({
      packageName,
      price,
    });

    if (result.ok) {
      // Show success
      document.getElementById('orderConfirmSection').classList.add('hidden');
      document.getElementById('orderSuccessSection').classList.remove('hidden');
      document.getElementById('successOrderId').textContent = result.order.id;
      document.getElementById('successPackage').textContent = result.order.packageName;
    }
  });
}



// ===== MY ORDERS =====
function initMyOrders() {
  document.getElementById('myOrdersBtn')?.addEventListener('click', () => {
    renderMyOrders();
    ModalManager.open('ordersModal');
  });
}

function renderMyOrders() {
  const orders = AuthManager.getOrders();
  const list = document.getElementById('ordersList');
  if (!list) return;

  if (orders.length === 0) {
    list.innerHTML = `
      <div class="orders-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5">
          <rect x="2" y="7" width="20" height="14" rx="2"/>
          <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
        </svg>
        <p>No orders yet.</p>
        <a href="#packages" class="btn btn-primary btn-sm" onclick="ModalManager.close('ordersModal')">Browse Packages</a>
      </div>
    `;
    return;
  }

  list.innerHTML = orders.reverse().map(order => `
    <div class="order-card">
      <div class="order-card-header">
        <div class="order-id">${order.id}</div>
        <div class="order-status">
          <span class="status-dot-sm"></span>
          ${order.status}
        </div>
      </div>
      <div class="order-card-body">
        <div class="order-detail">
          <span class="order-label">Package</span>
          <span class="order-value">${order.packageName || 'N/A'}</span>
        </div>
        <div class="order-detail">
          <span class="order-label">Price</span>
          <span class="order-value order-price">${order.price || 'N/A'}</span>
        </div>
      </div>
      <div class="order-card-footer">
        <span class="order-date">Ordered: ${new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        <button class="order-qr-toggle" onclick="this.closest('.order-card').querySelector('.order-qr-section').classList.toggle('hidden')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          Show QR
        </button>
      </div>
      <div class="order-qr-section hidden">
        <img src="assets/QR_code.svg" alt="Pickup QR Code" class="order-qr-img" />
        <span class="order-qr-label">Scan at any Air-Locker station</span>
      </div>
    </div>
  `).join('');
}

// ===== USER DROPDOWN =====
function initUserDropdown() {
  const trigger = document.getElementById('userMenuTrigger');
  const dropdown = document.getElementById('userDropdown');
  if (!trigger || !dropdown) return;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    dropdown.classList.remove('show');
  });

  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    AuthManager.logout();
    dropdown.classList.remove('show');
    showToast('You have been logged out.', 'info');
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  AuthManager.init();
  initAuthModal();
  initOrderModal();
  initMyOrders();
  initUserDropdown();

  // Package select buttons
  document.querySelectorAll('[data-package]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      handlePackageSelect(btn.dataset.package, btn.dataset.price);
    });
  });
});
