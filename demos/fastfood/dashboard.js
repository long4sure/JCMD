let user = null;

async function init() {
  user = await requireAuth('login.html')
  if (!user) return

  document.getElementById('user-name').textContent = user.user_metadata?.name || user.email.split('@')[0]
  document.getElementById('user-email').textContent = user.email
  document.getElementById('user-avatar').textContent = initials(user.user_metadata?.name || user.email)
  document.getElementById('dash-date').textContent = new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  document.getElementById('exp-date').value = new Date().toISOString().slice(0, 10)
  await loadAll()
  loadDashboard()
}

window.handleLogout = async () => { await signOut(); }
window.openModal = openModal
window.closeModal = closeModal

let menu = [], expenses = [], contacts = [], orders = []
let menuEdit = null, expEdit = null, conEdit = null
let cart = []

async function loadAll() {
  const uid = user.id
  const [m, e, c, o] = await Promise.all([
    sb.from('kd_menu').select('*').eq('user_id', uid).order('category').order('name'),
    sb.from('kd_expenses').select('*').eq('user_id', uid).order('date', { ascending: false }),
    sb.from('kd_contacts').select('*').eq('user_id', uid).order('name'),
    sb.from('kd_orders').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(20),
  ])
  menu = m.data || []; expenses = e.data || []
  contacts = c.data || []; orders = o.data || []
}

window.toggleSidebar = () => {
  const sidebar = document.querySelector('.sidebar');
  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', window.toggleSidebar);
  }
  const isOpen = sidebar.classList.toggle('open');
  overlay.classList.toggle('open', isOpen);
}

window.nav = (page) => {
  showPage(page)
  if (page === 'dashboard') loadDashboard()
  if (page === 'menu') renderMenu()
  if (page === 'expenses') renderExpenses()
  if (page === 'contacts') renderContacts()
  if (page === 'pos') renderPosItems()
  
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (sidebar && sidebar.classList.contains('open')) sidebar.classList.remove('open');
  if (overlay && overlay.classList.contains('open')) overlay.classList.remove('open');
}

async function loadDashboard() {
  await loadAll()
  const today = new Date().toISOString().slice(0, 10)
  const todayOrders = orders.filter(o => o.created_at?.slice(0, 10) === today)
  const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.total), 0)
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const availableViands = menu.filter(m => Number(m.stock) > 0 && m.show_in_pos)
  const todayCost = expenses.filter(e => e.date === today).reduce((s, e) => s + Number(e.amount), 0)
  const profit = todayRevenue - todayCost

  document.getElementById('dash-metrics').innerHTML = `
    <div class="metric-card"><div class="metric-label">Today's Revenue</div><div class="metric-value text-green">${peso(todayRevenue)}</div></div>
    <div class="metric-card"><div class="metric-label">Today's Expenses</div><div class="metric-value text-red">${peso(todayCost)}</div></div>
    <div class="metric-card"><div class="metric-label">Today's Profit</div><div class="metric-value ${profit >= 0 ? 'text-green' : 'text-red'}">${peso(profit)}</div></div>
    <div class="metric-card"><div class="metric-label">Available Viands</div><div class="metric-value">${availableViands.length}</div></div>
    <div class="metric-card"><div class="metric-label">Today's Orders</div><div class="metric-value">${todayOrders.length}</div></div>
  `

  document.getElementById('dash-viands').innerHTML = availableViands.length
    ? availableViands.map(v => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">
          <div><span class="fw-500">${v.name}</span> <span class="viand-badge">${v.category}</span></div>
          <div style="display:flex;align-items:center;gap:10px">
            <span class="text-muted">${v.stock} servings</span>
            <span class="fw-500">${peso(v.selling_price)}</span>
          </div>
        </div>`).join('')
    : '<div class="empty" style="padding:20px 0">No viands available</div>'

  document.getElementById('dash-orders').innerHTML = orders.slice(0, 5).length
    ? orders.slice(0, 5).map(o => `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">
          <div>
            <div class="fw-500">${o.customer_name || 'Walk-in'}</div>
            <div class="text-muted" style="font-size:11px">${new Date(o.created_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          <div class="fw-500 text-green">${peso(o.total)}</div>
        </div>`).join('')
    : '<div class="empty" style="padding:20px 0">No orders yet</div>'
}

window.renderPosItems = () => {
  const q = (document.getElementById('pos-search')?.value || '').toLowerCase()
  const items = menu.filter(i => i.show_in_pos && (i.name.toLowerCase().includes(q) || (i.category || '').toLowerCase().includes(q)))
  document.getElementById('pos-items-grid').innerHTML = items.map(it => {
    const out = Number(it.stock) <= 0
    return `<div class="pos-item-card ${out ? 'out' : ''}" onclick="${out ? '' : `addToCart('${it.id}')`}">
      <div style="font-size:11px;color:var(--muted);margin-bottom:4px">${it.category}</div>
      <div class="pos-item-name">${it.name}</div>
      <div class="pos-item-price">${peso(it.selling_price || 0)}</div>
      <div class="pos-item-stock">${out ? '— Sold out —' : `${it.stock} servings`}</div>
    </div>`
  }).join('') || '<div class="empty">No menu items. Add items in Menu/Viands with "Show in POS" enabled.</div>'
}

window.addToCart = (id) => {
  const item = menu.find(i => i.id === id); if (!item) return
  const existing = cart.find(c => c.id === id)
  if (existing) { if (existing.qty < item.stock) existing.qty++ }
  else cart.push({ id, name: item.name, price: Number(item.selling_price || 0), qty: 1 })
  renderCart()
}

window.updateQty = (id, delta) => {
  const idx = cart.findIndex(c => c.id === id); if (idx < 0) return
  cart[idx].qty += delta
  if (cart[idx].qty <= 0) cart.splice(idx, 1)
  renderCart()
}

window.clearCart = () => { cart = []; renderCart() }

function renderCart() {
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0)
  document.getElementById('cart-total').textContent = peso(total)
  const el = document.getElementById('cart-items')
  if (!cart.length) { el.innerHTML = '<div class="empty" style="padding:32px 0">No items yet</div>'; return }
  el.innerHTML = cart.map(c => `
    <div class="cart-item">
      <div class="cart-item-name">${c.name}</div>
      <div class="cart-qty">
        <button onclick="updateQty('${c.id}', -1)">−</button>
        <span>${c.qty}</span>
        <button onclick="updateQty('${c.id}', 1)">+</button>
      </div>
      <div class="cart-item-price">${peso(c.price * c.qty)}</div>
    </div>`).join('')
}

window.checkout = async () => {
  if (!cart.length) { toast('Cart is empty', 'error'); return }
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0)
  const customerName = document.getElementById('customer-name').value.trim()
  await sb.from('kd_orders').insert({ user_id: user.id, items: JSON.stringify(cart), total, customer_name: customerName || null, created_at: new Date().toISOString() })
  for (const c of cart) {
    const item = menu.find(i => i.id === c.id)
    if (item) await sb.from('kd_menu').update({ stock: Math.max(0, item.stock - c.qty) }).eq('id', c.id)
  }
  const { data } = await sb.from('kd_menu').select('*').eq('user_id', user.id).order('category').order('name')
  menu = data || []
  toast(`Order of ${peso(total)} placed!`)
  document.getElementById('customer-name').value = ''
  clearCart(); renderPosItems()
}

window.renderMenu = async () => {
  if (!menu.length) await loadAll()
  const q = (document.getElementById('menu-search')?.value || '').toLowerCase()
  const items = menu.filter(i => i.name.toLowerCase().includes(q) || (i.category || '').toLowerCase().includes(q))
  const tb = document.getElementById('menu-table')
  if (!items.length) { tb.innerHTML = `<tr><td colspan="7"><div class="empty">No items found</div></td></tr>`; return }
  tb.innerHTML = items.map(it => {
    const out = Number(it.stock) <= 0
    return `<tr>
      <td class="fw-500">${it.name}</td>
      <td><span class="badge gray">${it.category}</span></td>
      <td class="${out ? 'text-red fw-500' : ''}">${it.stock}</td>
      <td class="fw-500">${peso(it.selling_price || 0)}</td>
      <td class="text-muted">${peso(it.cost_price || 0)}</td>
      <td><span class="badge ${out ? 'red' : 'green'}">${out ? 'Sold out' : 'Available'}</span></td>
      <td style="display:flex;gap:6px">
        <button class="btn sm" onclick="editMenu('${it.id}')"><i class="ti ti-edit"></i></button>
        <button class="btn sm danger" onclick="deleteMenu('${it.id}')"><i class="ti ti-trash"></i></button>
      </td>
    </tr>`
  }).join('')
}

window.editMenu = (id) => {
  const it = menu.find(i => i.id === id); if (!it) return
  menuEdit = id
  document.getElementById('menu-modal-title').textContent = 'Edit item'
  document.getElementById('menu-name').value = it.name
  document.getElementById('menu-cat').value = it.category
  document.getElementById('menu-stock').value = it.stock
  document.getElementById('menu-price').value = it.selling_price || ''
  document.getElementById('menu-cost').value = it.cost_price || ''
  document.getElementById('menu-pos').value = it.show_in_pos ? '1' : '0'
  openModal('menu-modal')
}

window.saveMenu = async () => {
  const payload = {
    user_id: user.id,
    name: document.getElementById('menu-name').value.trim(),
    category: document.getElementById('menu-cat').value,
    stock: Number(document.getElementById('menu-stock').value) || 0,
    selling_price: Number(document.getElementById('menu-price').value) || 0,
    cost_price: Number(document.getElementById('menu-cost').value) || 0,
    show_in_pos: document.getElementById('menu-pos').value === '1',
  }
  if (!payload.name) { toast('Name required', 'error'); return }
  const btn = document.getElementById('menu-save-btn'); btn.disabled = true; btn.textContent = 'Saving…'
  if (menuEdit) await sb.from('kd_menu').update(payload).eq('id', menuEdit)
  else await sb.from('kd_menu').insert(payload)
  menuEdit = null; btn.disabled = false; btn.textContent = 'Save'
  closeModal('menu-modal'); toast('Item saved!')
  const { data } = await sb.from('kd_menu').select('*').eq('user_id', user.id).order('category').order('name')
  menu = data || []; renderMenu()
}

window.deleteMenu = async (id) => {
  if (!confirm('Delete this item?')) return
  await sb.from('kd_menu').delete().eq('id', id)
  menu = menu.filter(i => i.id !== id); renderMenu(); toast('Deleted')
}

window.renderExpenses = async () => {
  if (!expenses.length && !menu.length) await loadAll()
  const q = (document.getElementById('exp-search')?.value || '').toLowerCase()
  const items = expenses.filter(e => e.description?.toLowerCase().includes(q) || (e.category || '').toLowerCase().includes(q))
  const tb = document.getElementById('exp-table')
  const sc = { Paid: 'green', Pending: 'amber', Overdue: 'red' }
  tb.innerHTML = items.length
    ? items.map(it => `<tr>
        <td class="text-muted">${it.date}</td>
        <td class="fw-500">${it.description}</td>
        <td><span class="badge blue">${it.category}</span></td>
        <td class="fw-500">${peso(it.amount)}</td>
        <td><span class="badge ${sc[it.status] || 'gray'}">${it.status}</span></td>
        <td style="display:flex;gap:6px">
          <button class="btn sm" onclick="editExpense('${it.id}')"><i class="ti ti-edit"></i></button>
          <button class="btn sm danger" onclick="deleteExpense('${it.id}')"><i class="ti ti-trash"></i></button>
        </td>
      </tr>`).join('')
    : `<tr><td colspan="6"><div class="empty">No expenses found</div></td></tr>`
}

window.editExpense = (id) => {
  const it = expenses.find(e => e.id === id); if (!it) return
  expEdit = id
  document.getElementById('exp-modal-title').textContent = 'Edit expense'
  document.getElementById('exp-desc').value = it.description
  document.getElementById('exp-date').value = it.date
  document.getElementById('exp-amount').value = it.amount
  document.getElementById('exp-cat').value = it.category
  document.getElementById('exp-payee').value = it.payee || ''
  document.getElementById('exp-status').value = it.status
  openModal('exp-modal')
}

window.saveExpense = async () => {
  const payload = {
    user_id: user.id,
    description: document.getElementById('exp-desc').value.trim(),
    date: document.getElementById('exp-date').value || new Date().toISOString().slice(0, 10),
    amount: Number(document.getElementById('exp-amount').value) || 0,
    category: document.getElementById('exp-cat').value,
    payee: document.getElementById('exp-payee').value.trim(),
    status: document.getElementById('exp-status').value,
  }
  if (!payload.description) { toast('Description required', 'error'); return }
  const btn = document.getElementById('exp-save-btn'); btn.disabled = true; btn.textContent = 'Saving…'
  if (expEdit) await sb.from('kd_expenses').update(payload).eq('id', expEdit)
  else await sb.from('kd_expenses').insert(payload)
  expEdit = null; btn.disabled = false; btn.textContent = 'Save'
  closeModal('exp-modal'); toast('Expense saved!')
  const { data } = await sb.from('kd_expenses').select('*').eq('user_id', user.id).order('date', { ascending: false })
  expenses = data || []; renderExpenses()
}

window.deleteExpense = async (id) => {
  if (!confirm('Delete?')) return
  await sb.from('kd_expenses').delete().eq('id', id)
  expenses = expenses.filter(e => e.id !== id); renderExpenses(); toast('Deleted')
}

window.renderContacts = async () => {
  if (!contacts.length && !menu.length) await loadAll()
  const q = (document.getElementById('con-search')?.value || '').toLowerCase()
  const items = contacts.filter(c => c.name?.toLowerCase().includes(q) || (c.type || '').toLowerCase().includes(q))
  const tb = document.getElementById('con-table')
  tb.innerHTML = items.length
    ? items.map(it => `<tr>
        <td><div style="display:flex;align-items:center;gap:8px">
          <div style="width:28px;height:28px;border-radius:50%;background:#FFF1F0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#C84B2F;flex-shrink:0">${initials(it.name)}</div>
          <span class="fw-500">${it.name}</span>
        </div></td>
        <td><span class="badge ${it.type === 'Supplier' ? 'amber' : 'blue'}">${it.type}</span></td>
        <td class="text-muted">${it.email || '—'}</td>
        <td>${it.phone || '—'}</td>
        <td class="text-muted">${it.notes || '—'}</td>
        <td style="display:flex;gap:6px">
          <button class="btn sm" onclick="editContact('${it.id}')"><i class="ti ti-edit"></i></button>
          <button class="btn sm danger" onclick="deleteContact('${it.id}')"><i class="ti ti-trash"></i></button>
        </td>
      </tr>`).join('')
    : `<tr><td colspan="6"><div class="empty">No contacts found</div></td></tr>`
}

window.editContact = (id) => {
  const it = contacts.find(c => c.id === id); if (!it) return
  conEdit = id
  document.getElementById('con-modal-title').textContent = 'Edit contact'
  document.getElementById('con-name').value = it.name
  document.getElementById('con-type').value = it.type
  document.getElementById('con-cat').value = it.category || ''
  document.getElementById('con-email').value = it.email || ''
  document.getElementById('con-phone').value = it.phone || ''
  document.getElementById('con-notes').value = it.notes || ''
  openModal('con-modal')
}

window.saveContact = async () => {
  const payload = {
    user_id: user.id,
    name: document.getElementById('con-name').value.trim(),
    type: document.getElementById('con-type').value,
    category: document.getElementById('con-cat').value.trim(),
    email: document.getElementById('con-email').value.trim(),
    phone: document.getElementById('con-phone').value.trim(),
    notes: document.getElementById('con-notes').value.trim(),
  }
  if (!payload.name) { toast('Name required', 'error'); return }
  const btn = document.getElementById('con-save-btn'); btn.disabled = true; btn.textContent = 'Saving…'
  if (conEdit) await sb.from('kd_contacts').update(payload).eq('id', conEdit)
  else await sb.from('kd_contacts').insert(payload)
  conEdit = null; btn.disabled = false; btn.textContent = 'Save'
  closeModal('con-modal'); toast('Contact saved!')
  const { data } = await sb.from('kd_contacts').select('*').eq('user_id', user.id).order('name')
  contacts = data || []; renderContacts()
}

window.deleteContact = async (id) => {
  if (!confirm('Delete?')) return
  await sb.from('kd_contacts').delete().eq('id', id)
  contacts = contacts.filter(c => c.id !== id); renderContacts(); toast('Deleted')
}

init();
