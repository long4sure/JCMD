// ============================================================
// BizDemo — Drop-in Simulated Local Database & UI Helpers
// ============================================================

// ── SEED DATA GENERATOR ─────────────────────────────────────
function getSeedData(table) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMinus = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
  };

  const seed = {
    // 1. COFFEE SHOP SEEDS
    coffee_inventory: [
      { id: 'c-inv-1', name: 'Espresso Shot', category: 'Supplies', stock: 80, unit: 'pcs', min_stock: 20, selling_price: 0, cost_price: 15, show_in_pos: false },
      { id: 'c-inv-2', name: 'Arabica Coffee Beans', category: 'Supplies', stock: 12, unit: 'kg', min_stock: 3, selling_price: 0, cost_price: 450, show_in_pos: false },
      { id: 'c-inv-3', name: 'Fresh Milk', category: 'Milk & Cream', stock: 15, unit: 'L', min_stock: 5, selling_price: 0, cost_price: 95, show_in_pos: false },
      { id: 'c-inv-4', name: 'Iced Caramel Macchiato', category: 'Coffee', stock: 45, unit: 'pcs', min_stock: 10, selling_price: 150, cost_price: 60, show_in_pos: true },
      { id: 'c-inv-5', name: 'Hot Cafe Latte', category: 'Coffee', stock: 30, unit: 'pcs', min_stock: 10, selling_price: 120, cost_price: 45, show_in_pos: true },
      { id: 'c-inv-6', name: 'Chocolate Muffin', category: 'Pastries', stock: 2, unit: 'pcs', min_stock: 5, selling_price: 85, cost_price: 40, show_in_pos: true } // Low stock
    ],
    coffee_expenses: [
      { id: 'c-exp-1', description: 'Monthly Rent', date: todayStr, amount: 8000, category: 'Rent', payee: 'Aling Nena', status: 'Pending' },
      { id: 'c-exp-2', description: 'Coffee beans restock', date: todayMinus(1), amount: 2500, category: 'Ingredients', payee: 'Benguet Farms', status: 'Paid' },
      { id: 'c-exp-3', description: 'Electric bill', date: todayMinus(3), amount: 4800, category: 'Utilities', payee: 'Meralco', status: 'Paid' }
    ],
    coffee_contacts: [
      { id: 'c-con-1', name: 'Benguet Farms', type: 'Supplier', category: 'Coffee supplier', email: 'sales@benguet.com', phone: '0917-123-4567', notes: 'Reliable arabica and robusta bean grower' },
      { id: 'c-con-2', name: 'Aling Nena', type: 'Supplier', category: 'Landlord', email: 'nena@gmail.com', phone: '0920-987-6543', notes: 'Store rent landlord' },
      { id: 'c-con-3', name: 'Juan dela Cruz', type: 'Customer', category: 'Regular', email: 'juan@gmail.com', phone: '0999-555-1234', notes: 'Orders Caramel Macchiato weekly' }
    ],
    coffee_sales: [
      { id: 'c-sale-1', total: 300, items: JSON.stringify([{ id: 'c-inv-4', name: 'Iced Caramel Macchiato', qty: 2, price: 150 }]), created_at: new Date().toISOString() },
      { id: 'c-sale-2', total: 120, items: JSON.stringify([{ id: 'c-inv-5', name: 'Hot Cafe Latte', qty: 1, price: 120 }]), created_at: new Date(Date.now() - 3600000).toISOString() }
    ],

    // 2. KARINDERYA SEEDS
    kd_menu: [
      { id: 'k-inv-1', name: 'Adobong Manok', category: 'Main Viand', stock: 15, selling_price: 70, cost_price: 45, show_in_pos: true },
      { id: 'k-inv-2', name: 'Sinigang na Baboy', category: 'Main Viand', stock: 12, selling_price: 80, cost_price: 50, show_in_pos: true },
      { id: 'k-inv-3', name: 'Pinakbet', category: 'Vegetables', stock: 1, selling_price: 50, cost_price: 30, show_in_pos: true }, // Low Stock
      { id: 'k-inv-4', name: 'Extra Rice', category: 'Sides', stock: 50, selling_price: 15, cost_price: 6, show_in_pos: true },
      { id: 'k-inv-5', name: 'Softdrinks', category: 'Drinks', stock: 24, selling_price: 20, cost_price: 14, show_in_pos: true }
    ],
    kd_expenses: [
      { id: 'k-exp-1', description: 'Wet market fresh meat', date: todayStr, amount: 1800, category: 'Ingredients', payee: 'Calamba Public Market', status: 'Paid' },
      { id: 'k-exp-2', description: 'Gas Refill LPG', date: todayMinus(2), amount: 1100, category: 'Utilities', payee: 'Solane', status: 'Paid' }
    ],
    kd_contacts: [
      { id: 'k-con-1', name: 'Calamba Public Market', type: 'Supplier', category: 'Fresh goods', phone: '0945-888-9999', notes: 'Daily meat and veg supplier' },
      { id: 'k-con-2', name: 'Solane Gas Dealer', type: 'Supplier', category: 'Gas supplier', phone: '0922-333-4444', notes: 'LPG tank deliveries' }
    ],
    kd_orders: [
      { id: 'k-ord-1', total: 100, customer_name: 'Walk-in', items: JSON.stringify([{ id: 'k-inv-1', name: 'Adobong Manok', qty: 1, price: 70 }, { id: 'k-inv-4', name: 'Extra Rice', qty: 2, price: 15 }]), created_at: new Date().toISOString() }
    ],

    // 3. GENERAL STORE SEEDS
    store_inventory: [
      { id: 's-inv-1', name: 'Kopiko 3-in-1 Brown', category: 'Beverages', stock: 48, unit: 'pcs', min_stock: 10, buy_price: 7, sell_price: 9, supplier: 'Nest Distributors' },
      { id: 's-inv-2', name: 'Lucky Me Pancit Canton', category: 'Noodles', stock: 36, unit: 'pcs', min_stock: 12, buy_price: 11, sell_price: 14, supplier: 'Nest Distributors' },
      { id: 's-inv-3', name: 'Safeguard White Bar Soap', category: 'Personal Care', stock: 3, unit: 'pcs', min_stock: 8, buy_price: 38, sell_price: 45, supplier: 'Puregold Wholesale' }, // Low Stock
      { id: 's-inv-4', name: 'Coca-Cola 1.5L', category: 'Beverages', stock: 12, unit: 'pcs', min_stock: 6, buy_price: 52, sell_price: 60, supplier: 'Coca-Cola Sales' }
    ],
    store_purchases: [
      { id: 's-pur-1', product_name: 'Kopiko & Pancit Canton Restock', date: todayStr, supplier: 'Nest Distributors', qty: 100, unit_cost: 9, status: 'Received', notes: 'Standard wholesale batch delivery' }
    ],
    store_expenses: [
      { id: 's-exp-1', description: 'Puregold wholesale trip', date: todayStr, amount: 3500, category: 'Supplies', payee: 'Puregold', status: 'Paid' }
    ],
    store_contacts: [
      { id: 's-con-1', name: 'Nest Distributors', type: 'Supplier', category: 'FMCG Wholesaler', email: 'contact@nestdist.com', phone: '0915-444-5555', notes: 'Delivery every Tuesday morning' }
    ]
  };

  return seed[table] || [];
}

// ── LOCAL STORAGE ENGINE ─────────────────────────────────────
const mockStorage = {
  get(table) {
    const key = `jcmd_static_db_${table}`;
    let data = localStorage.getItem(key);
    if (!data) {
      data = getSeedData(table);
      localStorage.setItem(key, JSON.stringify(data));
    } else {
      data = JSON.parse(data);
    }
    return data;
  },
  set(table, data) {
    const key = `jcmd_static_db_${table}`;
    localStorage.setItem(key, JSON.stringify(data));
  }
};

class MockBuilder {
  constructor(table) {
    this.table = table;
    this.data = mockStorage.get(table);
  }

  select(fields) {
    return this;
  }

  insert(payload) {
    const list = Array.isArray(payload) ? payload : [payload];
    list.forEach(item => {
      if (!item.id) item.id = 'id_' + Math.random().toString(36).substr(2, 9);
      if (!item.created_at) item.created_at = new Date().toISOString();
      this.data.push(item);
    });
    mockStorage.set(this.table, this.data);
    return Promise.resolve({ data: list, error: null });
  }

  update(payload) {
    this.updatePayload = payload;
    return this;
  }

  delete() {
    this.shouldDelete = true;
    return this;
  }

  eq(column, value) {
    if (this.shouldDelete) {
      this.data = this.data.filter(item => item[column] !== value);
      mockStorage.set(this.table, this.data);
    } else if (this.updatePayload) {
      this.data = this.data.map(item => {
        if (item[column] === value) {
          return { ...item, ...this.updatePayload };
        }
        return item;
      });
      mockStorage.set(this.table, this.data);
    } else {
      this.data = this.data.filter(item => item[column] === value);
    }
    return this;
  }

  order(column, options = {}) {
    const asc = options.ascending !== false;
    this.data.sort((a, b) => {
      const valA = a[column];
      const valB = b[column];
      if (typeof valA === 'string') {
        return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return asc ? valA - valB : valB - valA;
    });
    return this;
  }

  limit(count) {
    this.data = this.data.slice(0, count);
    return this;
  }

  // Support for Promise-like .then()
  then(onfulfilled) {
    return Promise.resolve({ data: this.data, error: null }).then(onfulfilled);
  }
}

// ── DROPIN CLIENT EXPORT ─────────────────────────────────────
const sb = {
  from(tableName) {
    return new MockBuilder(tableName);
  }
};

// ── AUTHENTICATION MOCKS ─────────────────────────────────────
async function signIn(email, password) {
  return { id: 'demo-user', email, user_metadata: { name: 'Demo Owner' } };
}

async function signUp(email, password, name) {
  return { id: 'demo-user', email, user_metadata: { name } };
}

async function signOut() {
  // Gracefully redirect users back to the landing page on sign out
  if (window.location.pathname.includes('/demos/')) {
    window.location.href = '../../index.html';
  } else {
    window.location.href = '../index.html';
  }
}

async function getUser() {
  return {
    id: 'demo-user-id',
    email: 'demo@jcmd.online',
    user_metadata: {
      name: 'Demo Owner'
    }
  };
}

async function requireAuth(loginPath = 'login.html') {
  return getUser();
}

async function redirectIfAuth(dashPath = 'dashboard.html') {
  // Always logged in for static demo
}

// ── UI HELPERS ──────────────────────────────────────────────
const peso = n =>
  '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 0 });

function showError(elId, msg) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
}

function hideError(elId) {
  const el = document.getElementById(elId);
  if (el) el.classList.remove('show');
}

function setLoading(btnId, loading, label = 'Save') {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Please wait…' : label;
}

function openModal(id) {
  document.getElementById(id)?.classList.add('open');
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}

function showPage(pageId, navClass = 'nav-item') {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll(`.${navClass}`).forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + pageId)?.classList.add('active');
  document.querySelector(`[data-page="${pageId}"]`)?.classList.add('active');
}

function initials(name = '') {
  return name.split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    background:${type === 'success' ? '#1D8A5E' : '#C84B2F'};
    color:#fff;padding:10px 18px;border-radius:8px;
    font-size:13px;font-weight:500;box-shadow:0 4px 16px rgba(0,0,0,.15);
    animation:fadeIn .2s ease;
  `;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}

// Bind to window globally for standard script loading (works on file:// protocol)
if (typeof window !== 'undefined') {
  window.sb = sb;
  window.signIn = signIn;
  window.signUp = signUp;
  window.signOut = signOut;
  window.getUser = getUser;
  window.requireAuth = requireAuth;
  window.redirectIfAuth = redirectIfAuth;
  window.peso = peso;
  window.showError = showError;
  window.hideError = hideError;
  window.setLoading = setLoading;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.showPage = showPage;
  window.initials = initials;
  window.formatDate = formatDate;
  window.toast = toast;
}


