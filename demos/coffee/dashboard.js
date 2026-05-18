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

// ── NAV ───────────────────────────────────────────────────
window.nav = (page) => {
  showPage(page)
  if (page === 'dashboard') loadDashboard()
  if (page === 'inventory') renderInventory()
  if (page === 'expenses') renderExpenses()
  if (page === 'contacts') renderContacts()
  if (page === 'pos') renderPosItems()
}

window.openModal = openModal
window.closeModal = closeModal

// ── STATE ─────────────────────────────────────────────────
let inventory = [], expenses = [], contacts = [], sales = []
let invEdit = null, expEdit = null, conEdit = null
let cart = []

// ── LOAD ALL ──────────────────────────────────────────────
async function loadAll() {
  const uid = user.id
  const [i, e, c, s] = await Promise.all([
    sb.from('coffee_inventory').select('*').eq('user_id', uid).order('name'),
    sb.from('coffee_expenses').select('*').eq('user_id', uid).order('date', { ascending: false }),
    sb.from('coffee_contacts').select('*').eq('user_id', uid).order('name'),
    sb.from('coffee_sales').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(20),
  ])
  inventory = i.data || []; expenses = e.data || []
  contacts = c.data || []; sales = s.data || []
}

// ── DASHBOARD ─────────────────────────────────────────────
async function loadDashboard() {
  await loadAll()
  const todaySales = sales.filter(s => s.created_at?.slice(0, 10) === new Date().toISOString().slice(0, 10))
  const todayRevenue = todaySales.reduce((sum, s) => sum + Number(s.total), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const lowStock = inventory.filter(i => Number(i.stock) <= Number(i.min_stock))
  const invValue = inventory.reduce((s, i) => s + Number(i.stock) * Number(i.cost_price || 0), 0)

  document.getElementById('dash-metrics').innerHTML = `
    <div class="metric-card"><div class="metric-label">Today's Sales</div><div class="metric-value text-green">${peso(todayRevenue)}</div></div>
    <div class="metric-card"><div class="metric-label">Total Expenses</div><div class="metric-value text-red">${peso(totalExpenses)}</div></div>
    <div class="metric-card"><div class="metric-label">Low Stock Items</div><div class="metric-value ${lowStock.length > 0 ? 'text-red' : 'text-green'}">${lowStock.length}</div></div>
    <div class="metric-card"><div class="metric-label">Menu Items</div><div class="metric-value">${inventory.filter(i => i.show_in_pos).length}</div></div>
    <div class="metric-card"><div class="metric-label">Contacts</div><div class="metric-value">${contacts.length}</div></div>
  `

  document.getElementById('dash-lowstock').innerHTML = lowStock.length
    ? lowStock.map(i => {
        const pct = i.min_stock > 0 ? Math.min(100, Math.round(i.stock / i.min_stock * 100)) : 100
        return `<div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
            <span class="fw-500">${i.name}</span><span class="text-red">${i.stock} ${i.unit}</span>
          </div>
          <div style="height:5px;background:var(--border);border-radius:3px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:#C84B2F;border-radius:3px"></div>
          </div>
        </div>`
      }).join('')
    : '<div class="empty" style="padding:20px 0">All stock levels OK ✓</div>'

  document.getElementById('dash-sales').innerHTML = sales.slice(0, 6).length
    ? sales.slice(0, 6).map(s => `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">
          <div><div class="fw-500">Order #${s.id?.slice(-6)}</div><div class="text-muted" style="font-size:11px">${new Date(s.created_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div></div>
          <div class="fw-500 text-green">${peso(s.total)}</div>
        </div>`).join('')
    : '<div class="empty" style="padding:20px 0">No sales yet</div>'
}

// ── INVENTORY ─────────────────────────────────────────────
window.renderInventory = async () => {
  if (!inventory.length) await loadAll()
  const q = (document.getElementById('inv-search')?.value || '').toLowerCase()
  const items = inventory.filter(i => i.name.toLowerCase().includes(q) || (i.category || '').toLowerCase().includes(q))
  const tb = document.getElementById('inv-table')
  if (!items.length) { tb.innerHTML = `<tr><td colspan="8"><div class="empty">No items found</div></td></tr>`; return }
  tb.innerHTML = items.map(it => {
    const low = Number(it.stock) <= Number(it.min_stock)
    return `<tr>
      <td class="fw-500">${it.name}</td>
      <td><span class="badge gray">${it.category}</span></td>
      <td class="${low ? 'text-red fw-500' : ''}">${it.stock}</td>
      <td class="text-muted">${it.unit}</td>
      <td>${it.min_stock}</td>
      <td class="fw-500">${peso(it.selling_price || 0)}</td>
      <td><span class="badge ${low ? 'red' : 'green'}">${low ? 'Low' : 'OK'}</span></td>
      <td style="display:flex;gap:6px">
        <button class="btn sm" onclick="editInventory('${it.id}')"><i class="ti ti-edit"></i></button>
        <button class="btn sm danger" onclick="deleteInventory('${it.id}')"><i class="ti ti-trash"></i></button>
      </td>
    </tr>`
  }).join('')
}

window.editInventory = (id) => {
  const it = inventory.find(i => i.id === id); if (!it) return
  invEdit = id
  document.getElementById('inv-modal-title').textContent = 'Edit item'
  document.getElementById('inv-name').value = it.name
  document.getElementById('inv-cat').value = it.category
  document.getElementById('inv-unit').value = it.unit
  document.getElementById('inv-stock').value = it.stock
  document.getElementById('inv-min').value = it.min_stock
  document.getElementById('inv-price').value = it.selling_price || ''
  document.getElementById('inv-cost').value = it.cost_price || ''
  document.getElementById('inv-pos').value = it.show_in_pos ? '1' : '0'
  openModal('inv-modal')
}

window.saveInventory = async () => {
  const payload = {
    user_id: user.id,
    name: document.getElementById('inv-name').value.trim(),
    category: document.getElementById('inv-cat').value,
    unit: document.getElementById('inv-unit').value,
    stock: Number(document.getElementById('inv-stock').value) || 0,
    min_stock: Number(document.getElementById('inv-min').value) || 0,
    selling_price: Number(document.getElementById('inv-price').value) || 0,
    cost_price: Number(document.getElementById('inv-cost').value) || 0,
    show_in_pos: document.getElementById('inv-pos').value === '1',
  }
  if (!payload.name) { toast('Name is required', 'error'); return }
  const btn = document.getElementById('inv-save-btn'); btn.disabled = true; btn.textContent = 'Saving…'
  if (invEdit) await sb.from('coffee_inventory').update(payload).eq('id', invEdit)
  else await sb.from('coffee_inventory').insert(payload)
  invEdit = null; btn.disabled = false; btn.textContent = 'Save'
  closeModal('inv-modal'); toast('Item saved!')
  const { data } = await sb.from('coffee_inventory').select('*').eq('user_id', user.id).order('name')
  inventory = data || []; renderInventory()
}

window.deleteInventory = async (id) => {
  if (!confirm('Delete this item?')) return
  await sb.from('coffee_inventory').delete().eq('id', id)
  inventory = inventory.filter(i => i.id !== id); renderInventory(); toast('Deleted')
}

// ── POS ───────────────────────────────────────────────────
window.renderPosItems = () => {
  const q = (document.getElementById('pos-search')?.value || '').toLowerCase()
  const items = inventory.filter(i => i.show_in_pos && (i.name.toLowerCase().includes(q) || (i.category || '').toLowerCase().includes(q)))
  const grid = document.getElementById('pos-items-grid')
  grid.innerHTML = items.map(it => {
    const out = Number(it.stock) <= 0
    return `<div class="pos-item-card ${out ? 'out' : ''}" onclick="${out ? '' : `addToCart('${it.id}')`}">
      <div class="pos-item-name">${it.name}</div>
      <div class="pos-item-price">${peso(it.selling_price || 0)}</div>
      <div class="pos-item-stock">${out ? 'Out of stock' : `${it.stock} ${it.unit} left`}</div>
    </div>`
  }).join('') || '<div class="empty" style="padding:40px">No menu items. Add items in Inventory with "Show in POS" enabled.</div>'
}

window.addToCart = (id) => {
  const item = inventory.find(i => i.id === id); if (!item) return
  const existing = cart.find(c => c.id === id)
  if (existing) { if (existing.qty < item.stock) existing.qty++ }
  else cart.push({ id, name: item.name, price: Number(item.selling_price || 0), qty: 1 })
  renderCart()
}

window.updateQty = (id, delta) => {
  const idx = cart.findIndex(c => c.id === id)
  if (idx < 0) return
  cart[idx].qty += delta
  if (cart[idx].qty <= 0) cart.splice(idx, 1)
  renderCart()
}

window.clearCart = () => { cart = []; renderCart() }

function renderCart() {
  const el = document.getElementById('cart-items')
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0)
  document.getElementById('cart-total').textContent = peso(total)
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
  const items = cart.map(c => ({ id: c.id, name: c.name, qty: c.qty, price: c.price }))

  await sb.from('coffee_sales').insert({ user_id: user.id, items: JSON.stringify(items), total, created_at: new Date().toISOString() })

  // Deduct stock
  for (const c of cart) {
    const inv = inventory.find(i => i.id === c.id)
    if (inv) await sb.from('coffee_inventory').update({ stock: Math.max(0, inv.stock - c.qty) }).eq('id', c.id)
  }

  const { data } = await sb.from('coffee_inventory').select('*').eq('user_id', user.id).order('name')
  inventory = data || []
  toast(`Sale of ${peso(total)} recorded!`)
  clearCart(); renderPosItems()
}

// ── EXPENSES ──────────────────────────────────────────────
window.renderExpenses = async () => {
  if (!expenses.length && !inventory.length) await loadAll()
  const q = (document.getElementById('exp-search')?.value || '').toLowerCase()
  const items = expenses.filter(e => e.description?.toLowerCase().includes(q) || (e.category || '').toLowerCase().includes(q))
  const tb = document.getElementById('exp-table')
  const sc = { Paid: 'green', Pending: 'amber', Overdue: 'red' }
  if (!items.length) { tb.innerHTML = `<tr><td colspan="6"><div class="empty">No expenses found</div></td></tr>`; return }
  tb.innerHTML = items.map(it => `<tr>
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
  if (expEdit) await sb.from('coffee_expenses').update(payload).eq('id', expEdit)
  else await sb.from('coffee_expenses').insert(payload)
  expEdit = null; btn.disabled = false; btn.textContent = 'Save'
  closeModal('exp-modal'); toast('Expense saved!')
  const { data } = await sb.from('coffee_expenses').select('*').eq('user_id', user.id).order('date', { ascending: false })
  expenses = data || []; renderExpenses()
}

window.deleteExpense = async (id) => {
  if (!confirm('Delete?')) return
  await sb.from('coffee_expenses').delete().eq('id', id)
  expenses = expenses.filter(e => e.id !== id); renderExpenses(); toast('Deleted')
}

// ── CONTACTS ──────────────────────────────────────────────
window.renderContacts = async () => {
  if (!contacts.length && !inventory.length) await loadAll()
  const q = (document.getElementById('con-search')?.value || '').toLowerCase()
  const items = contacts.filter(c => c.name?.toLowerCase().includes(q) || (c.type || '').toLowerCase().includes(q))
  const tb = document.getElementById('con-table')
  if (!items.length) { tb.innerHTML = `<tr><td colspan="6"><div class="empty">No contacts found</div></td></tr>`; return }
  tb.innerHTML = items.map(it => `<tr>
    <td><div style="display:flex;align-items:center;gap:8px">
      <div style="width:28px;height:28px;border-radius:50%;background:#FEF3E2;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#92400E;flex-shrink:0">${initials(it.name)}</div>
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
  if (conEdit) await sb.from('coffee_contacts').update(payload).eq('id', conEdit)
  else await sb.from('coffee_contacts').insert(payload)
  conEdit = null; btn.disabled = false; btn.textContent = 'Save'
  closeModal('con-modal'); toast('Contact saved!')
  const { data } = await sb.from('coffee_contacts').select('*').eq('user_id', user.id).order('name')
  contacts = data || []; renderContacts()
}

window.deleteContact = async (id) => {
  if (!confirm('Delete?')) return
  await sb.from('coffee_contacts').delete().eq('id', id)
  contacts = contacts.filter(c => c.id !== id); renderContacts(); toast('Deleted')
}

// ── INIT ──────────────────────────────────────────────────
init();
