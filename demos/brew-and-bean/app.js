// ============================================================
// LOCAL STORAGE MOCK CLIENT FOR BREW & BEAN
// ============================================================
const todayStr = new Date().toISOString().split('T')[0];
const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

const defaultMenuItems = [
  { id: 1, name: 'Espresso', category: 'Hot Coffee', price: 90.0, cost: 20.0, stock: 50, is_available: true, description: 'Strong black coffee' },
  { id: 2, name: 'Cappuccino', category: 'Hot Coffee', price: 110.0, cost: 30.0, stock: 40, is_available: true, description: 'Espresso with steamed milk foam' },
  { id: 3, name: 'Iced Latte', category: 'Iced Coffee', price: 120.0, cost: 35.0, stock: 2, is_available: true, description: 'Espresso with cold milk over ice' },
  { id: 4, name: 'Green Tea Latte', category: 'Tea', price: 130.0, cost: 40.0, stock: 15, is_available: true, description: 'Matcha green tea with milk' },
  { id: 5, name: 'Butter Croissant', category: 'Pastry', price: 85.0, cost: 25.0, stock: 8, is_available: true, description: 'Flaky buttery pastry' },
  { id: 6, name: 'Tuna Sandwich', category: 'Sandwich', price: 140.0, cost: 50.0, stock: 5, is_available: true, description: 'Tuna salad in sourdough toast' },
  { id: 7, name: 'Americano', category: 'Hot Coffee', price: 95.0, cost: 15.0, stock: 45, is_available: true, description: 'Rich espresso with hot water' },
  { id: 8, name: 'Caramel Macchiato', category: 'Iced Coffee', price: 135.0, cost: 40.0, stock: 25, is_available: true, description: 'Espresso with vanilla, milk, and caramel drizzle' },
  { id: 9, name: 'Chamomile Tea', category: 'Tea', price: 90.0, cost: 15.0, stock: 30, is_available: true, description: 'Calming chamomile herbal tea' },
  { id: 10, name: 'Chocolate Muffin', category: 'Pastry', price: 95.0, cost: 30.0, stock: 12, is_available: true, description: 'Rich double chocolate chip muffin' },
  { id: 11, name: 'Ham & Cheese Panini', category: 'Sandwich', price: 150.0, cost: 60.0, stock: 8, is_available: true, description: 'Smoked ham and cheddar melted in panini grill' },
  { id: 12, name: 'Iced Americano', category: 'Iced Coffee', price: 100.0, cost: 18.0, stock: 50, is_available: true, description: 'Espresso shots over cold water and ice' }
];

const defaultOrders = [
  { id: 1, customer_name: 'Walk-in', order_type: 'Dine-in', total_amount: 200.0, payment_method: 'Cash', status: 'Served', created_at: new Date(Date.now() - 3600000).toISOString(), created_by: 'demo-admin-id' }
];

const defaultOrderItems = [
  { id: 1, order_id: 1, menu_item_id: 1, quantity: 1, price_at_time: 90.0 },
  { id: 2, order_id: 1, menu_item_id: 2, quantity: 1, price_at_time: 110.0 }
];

const defaultDailySales = [
  { sale_date: yesterdayStr, total_orders: 12, total_revenue: 1480.0, total_cost: 410.0, cash_amount: 980.0, card_amount: 500.0, gcash_amount: 0.0, maya_amount: 0.0 }
];

function getLocal(table, defaults) {
  const key = `jcmd_bnb_${table}`;
  let data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(data);
}

function setLocal(table, data) {
  const key = `jcmd_bnb_${table}`;
  localStorage.setItem(key, JSON.stringify(data));
}

// Custom client builder
class MockClientBuilder {
  constructor(table) {
    this.table = table;
    if (table === 'menu_items') this.data = getLocal('menu_items', defaultMenuItems);
    else if (table === 'orders') this.data = getLocal('orders', defaultOrders);
    else if (table === 'order_items') this.data = getLocal('order_items', defaultOrderItems);
    else if (table === 'daily_sales') this.data = getLocal('daily_sales', defaultDailySales);
    else this.data = [];
  }

  select(fields) {
    return this;
  }

  insert(payload) {
    const list = Array.isArray(payload) ? payload : [payload];
    const saved = getLocal(this.table, []);
    
    list.forEach(item => {
      if (!item.id) {
        const maxId = saved.reduce((max, x) => typeof x.id === 'number' ? Math.max(max, x.id) : max, 0);
        item.id = maxId + 1;
      }
      if (!item.created_at) item.created_at = new Date().toISOString();
      saved.push(item);
    });

    setLocal(this.table, saved);
    this.data = saved;
    this.inserted = list;
    return this;
  }

  update(payload) {
    this.updatePayload = payload;
    return this;
  }

  eq(column, value) {
    const saved = getLocal(this.table, []);
    
    if (this.updatePayload) {
      const updated = saved.map(item => {
        if (String(item[column]) === String(value)) {
          return { ...item, ...this.updatePayload };
        }
        return item;
      });
      setLocal(this.table, updated);
      this.data = updated;
    } else {
      this.data = saved.filter(item => String(item[column]) === String(value));
    }
    return this;
  }

  gte(column, value) {
    this.data = this.data.filter(item => item[column] >= value);
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

  single() {
    this.isSingle = true;
    return this;
  }

  async then(onfulfilled) {
    let resultData = this.data;

    if (this.isSingle) {
      resultData = resultData[0] || null;
    }

    if (this.table === 'orders') {
      const orderItems = getLocal('order_items', defaultOrderItems);
      const menuItems = getLocal('menu_items', defaultMenuItems);
      
      const processOrder = (order) => {
        if (!order) return null;
        const itemsForOrder = orderItems.filter(oi => String(oi.order_id) === String(order.id)).map(oi => {
          const mItem = menuItems.find(m => String(m.id) === String(oi.menu_item_id));
          return {
            ...oi,
            menu_items: mItem ? { name: mItem.name } : null
          };
        });
        return {
          ...order,
          order_items: itemsForOrder
        };
      };

      if (Array.isArray(resultData)) {
        resultData = resultData.map(processOrder);
      } else {
        resultData = processOrder(resultData);
      }
    }

    const payload = { data: resultData, error: null };
    if (this.inserted) {
      payload.data = this.inserted;
    }
    return Promise.resolve(payload).then(onfulfilled);
  }
}

var client = {
  auth: {
    async getSession() {
      return { data: { session: { user: { id: 'demo-admin-id', email: 'admin@brewbean.com', user_metadata: { role: 'admin' } } } }, error: null };
    },
    async signInWithPassword({ email, password }) {
      return { data: { user: { id: 'demo-admin-id', email, user_metadata: { role: 'admin' } } }, error: null };
    },
    async signOut() {
      window.location.href = '../index.html';
      return { error: null };
    }
  },
  from(tableName) {
    return new MockClientBuilder(tableName);
  },
  async rpc(name, args = {}) {
    if (name === 'update_daily_sales') {
      const orders = getLocal('orders', defaultOrders);
      const orderItems = getLocal('order_items', defaultOrderItems);
      const menuItems = getLocal('menu_items', defaultMenuItems);

      const todayOrders = orders.filter(o => o.created_at.startsWith(todayStr) && o.status === 'Served');
      const totalOrders = todayOrders.length;
      const totalRevenue = todayOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
      
      let totalCost = 0;
      todayOrders.forEach(o => {
        const items = orderItems.filter(oi => String(oi.order_id) === String(o.id));
        items.forEach(oi => {
          const mItem = menuItems.find(m => String(m.id) === String(oi.menu_item_id));
          const unitCost = mItem ? parseFloat(mItem.cost) : 0;
          totalCost += unitCost * parseInt(oi.quantity);
        });
      });

      const cash_amount = todayOrders.filter(o => o.payment_method === 'Cash').reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
      const card_amount = todayOrders.filter(o => o.payment_method === 'Card').reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
      const gcash_amount = todayOrders.filter(o => o.payment_method === 'GCash').reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
      const maya_amount = todayOrders.filter(o => o.payment_method === 'Maya').reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

      const sales = getLocal('daily_sales', defaultDailySales);
      const existingTodayIndex = sales.findIndex(s => s.sale_date === todayStr);

      const record = {
        sale_date: todayStr,
        total_orders: totalOrders,
        total_revenue: totalRevenue,
        total_cost: totalCost,
        cash_amount,
        card_amount,
        gcash_amount,
        maya_amount
      };

      if (existingTodayIndex >= 0) {
        sales[existingTodayIndex] = record;
      } else {
        sales.unshift(record);
      }

      setLocal('daily_sales', sales);
      return { data: true, error: null };
    }

    if (name === 'get_all_users') {
      return {
        data: [
          { id: 'demo-admin-id', email: 'admin@brewbean.com', raw_user_meta_data: { role: 'admin' }, created_at: new Date().toISOString(), last_sign_in_at: new Date().toISOString() },
          { id: 'demo-staff-id', email: 'staff@brewbean.com', raw_user_meta_data: { role: 'staff' }, created_at: new Date().toISOString(), last_sign_in_at: new Date().toISOString() }
        ],
        error: null
      };
    }

    return { data: [], error: null };
  }
};
var currentUser = null
var currentOrder = []
var menuItems = []

// ============================================
// AUTHENTICATION
// ============================================

async function checkSession() {
    var result = await client.auth.getSession()
    if (result.data.session) {
        currentUser = result.data.session.user
        showDashboard()
    }
}

document.getElementById('loginForm').onsubmit = async function(e) {
    e.preventDefault()
    var errorEl = document.getElementById('loginError')
    errorEl.style.display = 'none'
    
    var result = await client.auth.signInWithPassword({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    })
    
    if (result.error) {
        errorEl.textContent = result.error.message
        errorEl.style.display = 'block'
    } else {
        currentUser = result.data.user
        showDashboard()
    }
}

function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none'
    document.getElementById('dashboard').style.display = 'block'
    document.body.style.display = 'block'
    document.body.style.alignItems = 'flex-start'
    document.getElementById('userEmail').textContent = currentUser.email
    
    var role = currentUser.user_metadata?.role || 'staff'
    document.getElementById('userRole').textContent = role.toUpperCase()
    
    if (role === 'admin') {
        document.getElementById('addMenuItemBtn').style.display = 'inline-block'
        document.getElementById('menuActionsCol').style.display = ''
    }
    
    showAdminFeatures()
    
    loadMenuItems()
    loadOrders()
    loadReports()
}

document.getElementById('logoutBtn').onclick = async function() {
    await client.auth.signOut()
}

// ============================================
// NAVIGATION
// ============================================

document.querySelectorAll('.nav-tab').forEach(function(tab) {
    tab.onclick = function() {
        document.querySelectorAll('.nav-tab').forEach(function(t) { t.classList.remove('active') })
        document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active') })
        this.classList.add('active')
        document.getElementById('tab-' + this.dataset.tab).classList.add('active')
        
        if (this.dataset.tab === 'orders') loadOrders()
        if (this.dataset.tab === 'menu') loadMenuItems()
        if (this.dataset.tab === 'reports') loadReports()
        if (this.dataset.tab === 'users') loadUsers()
    }
})

// ============================================
// HELPER FUNCTIONS
// ============================================

function isAdmin() {
    return currentUser?.user_metadata?.role === 'admin'
}

function showAdminFeatures() {
    if (isAdmin()) {
        document.getElementById('usersTab').style.display = 'inline-block'
        var bottomNavUsers = document.getElementById('bottomNavUsers')
        if (bottomNavUsers) bottomNavUsers.style.display = 'flex'
    }
}

function getIcon(category) {
    var icons = {
        'Hot Coffee': '<i class="ti ti-coffee"></i>',
        'Iced Coffee': '<i class="ti ti-glass-full"></i>',
        'Tea': '<i class="ti ti-leaf"></i>',
        'Pastry': '<i class="ti ti-bread"></i>',
        'Sandwich': '<i class="ti ti-tools-kitchen-2"></i>'
    }
    return icons[category] || '<i class="ti ti-bowl-spoon"></i>'
}

function formatPrice(price) {
    return '₱' + parseFloat(price).toFixed(2)
}

// ============================================
// MENU ITEMS
// ============================================

async function loadMenuItems() {
    var result = await client.from('menu_items').select('*').order('category')
    if (result.error) {
        console.error('Error loading menu:', result.error)
        return
    }
    menuItems = result.data
    displayMenuGrid(menuItems)
    displayMenuTable(menuItems)
    checkLowStock()
}

function displayMenuGrid(items) {
    var grid = document.getElementById('menuGrid')
    var available = items.filter(function(i) { return i.is_available && i.stock > 0 })
    
    if (available.length === 0) {
        grid.innerHTML = '<p style="text-align:center; grid-column:1/-1; padding:20px; color:#8b7355;">No items available</p>'
        return
    }
    
    grid.innerHTML = available.map(function(item) {
        return '<div class="menu-item" onclick="addToOrder(' + item.id + ')">' +
            '<div class="item-icon">' + getIcon(item.category) + '</div>' +
            '<div class="item-name">' + item.name + '</div>' +
            '<div class="item-price">' + formatPrice(item.price) + '</div>' +
        '</div>'
    }).join('')
}

function displayMenuTable(items) {
    var tbody = document.getElementById('menuTableBody')
    
    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading">No menu items found</td></tr>'
        return
    }
    
    tbody.innerHTML = items.map(function(item) {
        var margin = item.price > 0 ? ((item.price - item.cost) / item.price * 100).toFixed(1) : 0
        return '<tr>' +
            '<td><strong>' + item.name + '</strong></td>' +
            '<td>' + item.category + '</td>' +
            '<td>' + formatPrice(item.price) + '</td>' +
            '<td>' + formatPrice(item.cost) + '</td>' +
            '<td class="' + (item.stock < 5 ? 'low-stock' : '') + '">' + item.stock + (item.stock < 5 ? ' <i class="ti ti-alert-triangle" style="color:#d68910;vertical-align:middle"></i>' : '') + '</td>' +
            '<td>' + margin + '%</td>' +
            '<td>' + (item.is_available ? '<i class="ti ti-circle-check" style="color:#27ae60;vertical-align:middle"></i> Available' : '<i class="ti ti-circle-x" style="color:#c0392b;vertical-align:middle"></i> Unavailable') + '</td>' +
            (isAdmin() ? '<td><button class="btn-sm btn-coffee" onclick="editMenuItem(' + item.id + ')">Edit</button></td>' : '<td></td>') +
        '</tr>'
    }).join('')
}

// ============================================
// MENU ITEM MODAL (ADMIN ONLY)
// ============================================

document.getElementById('addMenuItemBtn').onclick = function() {
    document.getElementById('menuItemId').value = ''
    document.getElementById('menuItemForm').reset()
    document.getElementById('itemAvailable').checked = true
    document.getElementById('menuItemModalTitle').textContent = 'Add Menu Item'
    document.getElementById('menuItemModal').style.display = 'block'
}

document.getElementById('closeMenuModal').onclick = function() {
    document.getElementById('menuItemModal').style.display = 'none'
}

function editMenuItem(id) {
    var item = menuItems.find(function(i) { return i.id === id })
    if (!item) return
    
    document.getElementById('menuItemId').value = item.id
    document.getElementById('itemName').value = item.name
    document.getElementById('itemCategory').value = item.category
    document.getElementById('itemPrice').value = item.price
    document.getElementById('itemCost').value = item.cost
    document.getElementById('itemStock').value = item.stock
    document.getElementById('itemDescription').value = item.description || ''
    document.getElementById('itemAvailable').checked = item.is_available
    document.getElementById('menuItemModalTitle').textContent = 'Edit Menu Item'
    document.getElementById('menuItemModal').style.display = 'block'
}

document.getElementById('menuItemForm').onsubmit = async function(e) {
    e.preventDefault()
    
    var itemData = {
        name: document.getElementById('itemName').value,
        category: document.getElementById('itemCategory').value,
        price: parseFloat(document.getElementById('itemPrice').value) || 0,
        cost: parseFloat(document.getElementById('itemCost').value) || 0,
        stock: parseInt(document.getElementById('itemStock').value) || 0,
        description: document.getElementById('itemDescription').value,
        is_available: document.getElementById('itemAvailable').checked
    }
    
    var id = document.getElementById('menuItemId').value
    var result
    
    if (id) {
        result = await client.from('menu_items').update(itemData).eq('id', id)
    } else {
        result = await client.from('menu_items').insert([itemData])
    }
    
    if (result.error) {
        alert('Error saving item: ' + result.error.message)
        return
    }
    
    document.getElementById('menuItemModal').style.display = 'none'
    loadMenuItems()
}

// ============================================
// ORDER MANAGEMENT (POS)
// ============================================

function addToOrder(menuItemId) {
    var item = menuItems.find(function(i) { return i.id === menuItemId })
    if (!item) return
    
    var existing = currentOrder.find(function(o) { return o.menu_item_id === menuItemId })
    if (existing) {
        existing.quantity++
    } else {
        currentOrder.push({
            menu_item_id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
        })
    }
    refreshCurrentOrder()
}

function refreshCurrentOrder() {
    var container = document.getElementById('currentOrderItems')
    var total = 0
    
    if (currentOrder.length === 0) {
        container.innerHTML = '<p style="color:#8b7355; text-align:center; padding:20px;">No items in order<br>Click menu items to add</p>'
        document.getElementById('currentOrderTotal').textContent = '0.00'
        return
    }
    
    container.innerHTML = currentOrder.map(function(item, index) {
        var subtotal = item.price * item.quantity
        total += subtotal
        return '<div style="display:flex; gap:10px; align-items:center; padding:8px; background:#fdf9f5; border-radius:6px; margin-bottom:5px;">' +
            '<strong style="flex:1;">' + item.name + '</strong>' +
            '<input type="number" min="1" value="' + item.quantity + '" onchange="updateQuantity(' + index + ', this.value)" style="width:50px; padding:5px;">' +
            '<span style="min-width:70px; text-align:right;">' + formatPrice(subtotal) + '</span>' +
            '<button class="btn-sm" style="background:#c0392b; color:white; padding:3px 8px;" onclick="removeFromOrder(' + index + ')">×</button>' +
        '</div>'
    }).join('')
    
    document.getElementById('currentOrderTotal').textContent = total.toFixed(2)
}

function updateQuantity(index, qty) {
    currentOrder[index].quantity = parseInt(qty) || 1
    refreshCurrentOrder()
}

function removeFromOrder(index) {
    currentOrder.splice(index, 1)
    refreshCurrentOrder()
}

document.getElementById('clearOrderBtn').onclick = function() {
    if (currentOrder.length === 0) return
    if (confirm('Clear current order?')) {
        currentOrder = []
        refreshCurrentOrder()
    }
}

document.getElementById('placeOrderBtn').onclick = async function() {
    if (currentOrder.length === 0) {
        alert('Add items to order first')
        return
    }
    
    var total = currentOrder.reduce(function(s, i) { return s + (i.price * i.quantity) }, 0)
    
    var orderResult = await client.from('orders').insert([{
        customer_name: document.getElementById('customerName').value || 'Walk-in',
        order_type: document.getElementById('orderType').value,
        total_amount: total,
        payment_method: document.getElementById('paymentMethod').value,
        status: 'Pending',
        created_by: currentUser.id
    }]).select()
    
    if (orderResult.error) {
        alert('Error creating order: ' + orderResult.error.message)
        return
    }
    
    var orderId = orderResult.data[0].id
    
    var items = currentOrder.map(function(i) {
        return {
            order_id: orderId,
            menu_item_id: i.menu_item_id,
            quantity: i.quantity,
            price_at_time: i.price
        }
    })
    
    var itemsResult = await client.from('order_items').insert(items)
    if (itemsResult.error) {
        alert('Error adding items: ' + itemsResult.error.message)
        return
    }
    
    // Update stock
    for (var i = 0; i < currentOrder.length; i++) {
        var item = menuItems.find(function(m) { return m.id === currentOrder[i].menu_item_id })
        if (item) {
            var newStock = Math.max(0, item.stock - currentOrder[i].quantity)
            await client.from('menu_items').update({ stock: newStock }).eq('id', item.id)
        }
    }
    
    // Print receipt
    printReceipt(orderId)
    
    // Reset
    currentOrder = []
    refreshCurrentOrder()
    document.getElementById('customerName').value = ''
    loadMenuItems()
    loadOrders()
}

// ============================================
// ORDERS TABLE
// ============================================

async function loadOrders() {
    var statusFilter = document.getElementById('orderStatusFilter').value
    var query = client.from('orders').select('*, order_items(*, menu_items(name))').order('created_at', { ascending: false }).limit(100)
    
    if (statusFilter) {
        query = query.eq('status', statusFilter)
    }
    
    var result = await query
    
    if (result.error) {
        console.error('Error loading orders:', result.error)
        return
    }
    
    var tbody = document.getElementById('ordersTableBody')
    
    if (result.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="loading">No orders found</td></tr>'
        return
    }
    
    tbody.innerHTML = result.data.map(function(order) {
        var items = order.order_items.map(function(oi) {
            return oi.quantity + 'x ' + (oi.menu_items?.name || 'Item')
        }).join(', ')
        
        var statusClass = 'badge-' + order.status.toLowerCase()
        var time = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        
        return '<tr>' +
            '<td><strong>#' + order.id + '</strong></td>' +
            '<td>' + order.customer_name + '</td>' +
            '<td>' + order.order_type + '</td>' +
            '<td>' + items + '</td>' +
            '<td>' + formatPrice(order.total_amount) + '</td>' +
            '<td>' + order.payment_method + '</td>' +
            '<td><span class="badge ' + statusClass + '">' + order.status + '</span></td>' +
            '<td>' + time + '</td>' +
            '<td>' +
                '<select onchange="updateOrderStatus(' + order.id + ', this.value)" style="padding:5px; margin-bottom:4px; width:100%;">' +
                    '<option ' + (order.status === 'Pending' ? 'selected' : '') + '>Pending</option>' +
                    '<option ' + (order.status === 'Preparing' ? 'selected' : '') + '>Preparing</option>' +
                    '<option ' + (order.status === 'Ready' ? 'selected' : '') + '>Ready</option>' +
                    '<option ' + (order.status === 'Served' ? 'selected' : '') + '>Served</option>' +
                    '<option ' + (order.status === 'Cancelled' ? 'selected' : '') + '>Cancelled</option>' +
                '</select>' +
                '<button class="btn-sm" style="background:#6f4e37; color:white; padding:3px 8px; font-size:11px; width:100%;" onclick="printReceipt(' + order.id + ')"><i class="ti ti-printer"></i> Print</button>' +
            '</td>' +
        '</tr>'
    }).join('')
}

async function updateOrderStatus(orderId, status) {
    var result = await client.from('orders').update({ status: status }).eq('id', orderId)
    if (result.error) {
        alert('Error updating status: ' + result.error.message)
    }
    loadOrders()
    loadReports()
}

document.getElementById('orderStatusFilter').onchange = function() {
    loadOrders()
}

document.getElementById('refreshOrdersBtn').onclick = function() {
    loadOrders()
}

// ============================================
// RECEIPT PRINTING
// ============================================

function printReceipt(orderId) {
    client.from('orders').select('*, order_items(*, menu_items(name))').eq('id', orderId).single().then(function(result) {
        if (result.error) {
            alert('Error loading order for receipt')
            return
        }
        
        var order = result.data
        var now = new Date()
        var receipt = ''
        
        receipt += '══════════════════════════\n'
        receipt += '     BREW & BEAN     \n'
        receipt += '   Coffee Shop Manager    \n'
        receipt += '══════════════════════════\n\n'
        receipt += 'Order #: ' + order.id + '\n'
        receipt += 'Date: ' + now.toLocaleDateString() + '\n'
        receipt += 'Time: ' + now.toLocaleTimeString() + '\n'
        receipt += 'Customer: ' + order.customer_name + '\n'
        receipt += 'Type: ' + order.order_type + '\n'
        receipt += 'Payment: ' + order.payment_method + '\n'
        receipt += '──────────────────────────\n\n'
        
        order.order_items.forEach(function(item) {
            var name = item.menu_items?.name || 'Item'
            var qty = item.quantity
            var price = item.price_at_time * qty
            var line = qty + 'x ' + name
            var priceStr = formatPrice(price)
            var spaces = Math.max(1, 26 - line.length - priceStr.length)
            var dots = ''
            for (var d = 0; d < spaces; d++) dots += '.'
            receipt += line + ' ' + dots + ' ' + priceStr + '\n'
        })
        
        receipt += '\n──────────────────────────\n'
        receipt += 'TOTAL: ' + formatPrice(order.total_amount) + '\n'
        receipt += '──────────────────────────\n'
        receipt += 'Status: ' + order.status + '\n'
        receipt += 'Served by: ' + currentUser.email + '\n\n'
        receipt += '     Thank you! Come again!    \n'
        receipt += '══════════════════════════\n'
        
        var printWindow = window.open('', '_blank', 'width=300,height=400')
        printWindow.document.write('<pre style="font-family: monospace; font-size: 12px; white-space: pre;">' + receipt + '</pre>')
        printWindow.document.close()
        setTimeout(function() {
            printWindow.print()
            printWindow.close()
        }, 500)
    })
}

// ============================================
// REPORTS
// ============================================

async function loadReports() {
    var today = new Date().toISOString().split('T')[0]
    
    var todayResult = await client.from('orders').select('*').gte('created_at', today)
    var todayOrders = todayResult.data || []
    var servedOrders = todayOrders.filter(function(o) { return o.status === 'Served' })
    
    var revenue = servedOrders.reduce(function(s, o) { return s + parseFloat(o.total_amount) }, 0)
    document.getElementById('todayRevenue').textContent = formatPrice(revenue)
    document.getElementById('todayOrders').textContent = servedOrders.length
    document.getElementById('avgOrderValue').textContent = servedOrders.length > 0 ? formatPrice(revenue / servedOrders.length) : formatPrice(0)
    
    var totalCost = 0
    var totalPotential = 0
    menuItems.forEach(function(item) {
        if (item.is_available) {
            totalCost += item.cost * item.stock
            totalPotential += item.price * item.stock
        }
    })
    var margin = totalPotential > 0 ? ((totalPotential - totalCost) / totalPotential * 100).toFixed(1) : 0
    document.getElementById('profitMargin').textContent = margin + '%'
    
    var salesResult = await client.from('daily_sales').select('*').order('sale_date', { ascending: false }).limit(30)
    var tbody = document.getElementById('salesTableBody')
    
    if (salesResult.error) {
        tbody.innerHTML = '<tr><td colspan="9" class="loading">Error loading reports</td></tr>'
        return
    }
    
    if (salesResult.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="loading">No sales data yet. Click Calculate to generate.</td></tr>'
        return
    }
    
    tbody.innerHTML = salesResult.data.map(function(s) {
        var profit = parseFloat(s.total_revenue) - parseFloat(s.total_cost)
        return '<tr>' +
            '<td>' + s.sale_date + '</td>' +
            '<td>' + s.total_orders + '</td>' +
            '<td>' + formatPrice(s.total_revenue) + '</td>' +
            '<td>' + formatPrice(s.total_cost) + '</td>' +
            '<td style="color:' + (profit >= 0 ? '#27ae60' : '#c0392b') + '; font-weight:bold;">' + formatPrice(profit) + '</td>' +
            '<td>' + formatPrice(s.cash_amount) + '</td>' +
            '<td>' + formatPrice(s.card_amount) + '</td>' +
            '<td>' + formatPrice(s.gcash_amount) + '</td>' +
            '<td>' + formatPrice(s.maya_amount) + '</td>' +
        '</tr>'
    }).join('')
}

document.getElementById('refreshSalesBtn').onclick = async function() {
    var result = await client.rpc('update_daily_sales')
    if (result.error) {
        alert('Error calculating sales: ' + result.error.message)
    } else {
        loadReports()
        alert('Daily sales updated successfully!')
    }
}

// ============================================
// MENU SEARCH & FILTER
// ============================================

document.getElementById('menuSearch').oninput = function() {
    var term = this.value.toLowerCase()
    var filtered = menuItems.filter(function(i) {
        return i.name.toLowerCase().includes(term)
    })
    displayMenuGrid(filtered)
}

document.getElementById('categoryFilter').onchange = function() {
    var cat = this.value
    var filtered = cat ? menuItems.filter(function(i) { return i.category === cat }) : menuItems
    displayMenuGrid(filtered)
}

// ============================================
// LOW STOCK ALERTS
// ============================================

function checkLowStock() {
    var lowItems = menuItems.filter(function(item) {
        return item.stock < 5 && item.is_available
    })
    
    var alertDiv = document.getElementById('lowStockAlert')
    var alertText = document.getElementById('lowStockItems')
    
    if (lowItems.length > 0) {
        alertDiv.style.display = 'block'
        alertText.textContent = lowItems.map(function(i) {
            return i.name + ' (' + i.stock + ' left)'
        }).join(', ')
    } else {
        alertDiv.style.display = 'none'
    }
}

// ============================================
// USER MANAGEMENT (ADMIN ONLY)
// ============================================

async function loadUsers() {
    var result = await client.rpc('get_all_users')
    
    var tbody = document.getElementById('usersTableBody')
    
    if (result.error || !result.data || result.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">' +
            '<p>Unable to load users from client-side.</p>' +
            '<p style="margin-top:10px;">Use <strong>Supabase Dashboard → Authentication → Users</strong> for full user management.</p>' +
            '<p style="margin-top:5px;">Role changes are handled via this panel.</p>' +
            '</td></tr>'
        return
    }
    
    tbody.innerHTML = result.data.map(function(user) {
        var role = user.raw_user_meta_data?.role || 'staff'
        var created = new Date(user.created_at).toLocaleDateString()
        var lastLogin = user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'
        
        return '<tr>' +
            '<td>' + user.email + '</td>' +
            '<td><span class="badge ' + (role === 'admin' ? 'badge-served' : 'badge-preparing') + '">' + role.toUpperCase() + '</span></td>' +
            '<td>' + created + '</td>' +
            '<td>' + lastLogin + '</td>' +
            '<td>' +
                '<button class="btn-sm btn-coffee" onclick="editUserRole(\'' + user.id + '\', \'' + user.email + '\', \'' + role + '\')" style="margin-right:3px;">Role</button>' +
                '<button class="btn-sm" style="background:#f39c12; color:white;" onclick="showChangePassword(\'' + user.id + '\', \'' + user.email + '\')">Password</button>' +
            '</td>' +
        '</tr>'
    }).join('')
}

document.getElementById('addUserBtn').onclick = function() {
    document.getElementById('editUserId').value = ''
    document.getElementById('userForm').reset()
    document.getElementById('userModalTitle').textContent = 'Add New User'
    document.getElementById('userPassword').required = true
    document.getElementById('userModal').style.display = 'block'
}

document.getElementById('closeUserModal').onclick = function() {
    document.getElementById('userModal').style.display = 'none'
}

document.getElementById('closePasswordModal').onclick = function() {
    document.getElementById('passwordModal').style.display = 'none'
}

function editUserRole(userId, email, currentRole) {
    document.getElementById('editUserId').value = userId
    document.getElementById('userEmailInput').value = email
    document.getElementById('userPassword').value = '********'
    document.getElementById('userPassword').required = false
    document.getElementById('userRoleSelect').value = currentRole
    document.getElementById('userModalTitle').textContent = 'Edit User Role'
    document.getElementById('userModal').style.display = 'block'
}

function showChangePassword(userId, email) {
    alert('Password changes require Supabase Dashboard.\n\n1. Go to Authentication → Users\n2. Find user: ' + email + '\n3. Click "..." → "Change Password"')
}

document.getElementById('userForm').onsubmit = async function(e) {
    e.preventDefault()
    
    var userId = document.getElementById('editUserId').value
    var email = document.getElementById('userEmailInput').value
    var password = document.getElementById('userPassword').value
    var role = document.getElementById('userRoleSelect').value
    
    if (userId) {
        // Update existing user's role
        var result = await client.rpc('update_user_role', {
            user_id: userId,
            new_role: role
        })
        
        if (result.error) {
            alert('Error updating role: ' + result.error.message)
        } else {
            alert('Role updated to ' + role.toUpperCase() + '!')
            document.getElementById('userModal').style.display = 'none'
            loadUsers()
        }
    } else {
        // New user - provide instructions
        alert('To create a new user:\n\n1. Go to Supabase Dashboard\n2. Authentication → Users → Add User\n3. Email: ' + email + '\n4. Password: ' + password + '\n\nThen run this SQL to set role:\nUPDATE auth.users SET raw_user_meta_data = \'{"role":"' + role + '"}\'::jsonb WHERE email = \'' + email + '\';')
        
        document.getElementById('userModal').style.display = 'none'
        document.getElementById('userForm').reset()
    }
}

document.getElementById('passwordForm').onsubmit = async function(e) {
    e.preventDefault()
    alert('Password changes require Supabase Dashboard.\n\n1. Go to Authentication → Users\n2. Find the user\n3. Click "..." → "Change Password"')
    document.getElementById('passwordModal').style.display = 'none'
}

document.getElementById('refreshUsersBtn').onclick = function() {
    loadUsers()
}

// ============================================
// MODAL CLOSE ON OUTSIDE CLICK
// ============================================

window.onclick = function(event) {
    if (event.target === document.getElementById('menuItemModal')) {
        document.getElementById('menuItemModal').style.display = 'none'
    }
    if (event.target === document.getElementById('userModal')) {
        document.getElementById('userModal').style.display = 'none'
    }
    if (event.target === document.getElementById('passwordModal')) {
        document.getElementById('passwordModal').style.display = 'none'
    }
}

// ============================================
// BOTTOM NAV (Mobile)
// ============================================

function switchBottomTab(tabName, btn) {
    // Update top nav-tabs to stay in sync
    document.querySelectorAll('.nav-tab').forEach(function(t) { t.classList.remove('active') })
    var topTab = document.querySelector('.nav-tab[data-tab="' + tabName + '"]')
    if (topTab) topTab.classList.add('active')

    // Update bottom nav active state
    document.querySelectorAll('.bottom-nav .nav-btn').forEach(function(b) { b.classList.remove('active') })
    if (btn) btn.classList.add('active')

    // Switch tab content
    document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active') })
    var tabEl = document.getElementById('tab-' + tabName)
    if (tabEl) tabEl.classList.add('active')

    // Load data for the tab
    if (tabName === 'orders') loadOrders()
    if (tabName === 'menu') loadMenuItems()
    if (tabName === 'reports') loadReports()
    if (tabName === 'users') loadUsers()
}

// ============================================
// STARTUP
// ============================================

checkSession()