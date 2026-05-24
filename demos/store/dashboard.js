let user = null;

async function init() {
  user = await requireAuth('login.html')
  if (!user) return

  document.getElementById('user-name').textContent = user.user_metadata?.name || user.email.split('@')[0]
  document.getElementById('user-email').textContent = user.email
  document.getElementById('user-avatar').textContent = initials(user.user_metadata?.name || user.email)
  document.getElementById('dash-date').textContent = new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  document.getElementById('exp-date').value = new Date().toISOString().slice(0, 10)
  document.getElementById('po-date').value = new Date().toISOString().slice(0, 10)
  await loadAll()
  loadDashboard()
}

window.handleLogout = async () => { await signOut(); }
window.openModal = openModal
window.closeModal = closeModal

let inventory = [], purchases = [], expenses = [], contacts = []
let invEdit = null, poEdit = null, expEdit = null, conEdit = null

async function loadAll() {
  const uid = user.id
  const [i, p, e, c] = await Promise.all([
    sb.from('store_inventory').select('*').eq('user_id', uid).order('name'),
    sb.from('store_purchases').select('*').eq('user_id', uid).order('date', { ascending: false }),
    sb.from('store_expenses').select('*').eq('user_id', uid).order('date', { ascending: false }),
    sb.from('store_contacts').select('*').eq('user_id', uid).order('name'),
  ])
  inventory = i.data || []; purchases = p.data || []
  expenses = e.data || []; contacts = c.data || []
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
  if (page === 'inventory') renderInventory()
  if (page === 'purchases') renderPurchases()
  if (page === 'expenses') renderExpenses()
  if (page === 'contacts') renderContacts()

  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (sidebar && sidebar.classList.contains('open')) sidebar.classList.remove('open');
  if (overlay && overlay.classList.contains('open')) overlay.classList.remove('open');
}

async function loadDashboard() {
  await loadAll()
  const lowStock = inventory.filter(i => Number(i.stock) <= Number(i.min_stock))
  const invValue = inventory.reduce((s, i) => s + Number(i.stock) * Number(i.buy_price || 0), 0)
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const pendingPO = purchases.filter(p => p.status === 'Ordered' || p.status === 'Pending').length
  const totalPurchases = purchases.reduce((s, p) => s + (Number(p.qty) * Number(p.unit_cost)), 0)

  document.getElementById('dash-metrics').innerHTML = `
    <div class="metric-card"><div class="metric-label">Inventory Value</div><div class="metric-value" style="color:#1E4FA8">${peso(invValue)}</div></div>
    <div class="metric-card"><div class="metric-label">Total Expenses</div><div class="metric-value text-red">${peso(totalExpenses)}</div></div>
    <div class="metric-card"><div class="metric-label">Low Stock Items</div><div class="metric-value ${lowStock.length > 0 ? 'text-red' : 'text-green'}">${lowStock.length}</div></div>
    <div class="metric-card"><div class="metric-label">Total Products</div><div class="metric-value">${inventory.length}</div></div>
    <div class="metric-card"><div class="metric-label">Pending POs</div><div class="metric-value ${pendingPO > 0 ? '' : 'text-green'}">${pendingPO}</div></div>
    <div class="metric-card"><div class="metric-label">Total Purchased</div><div class="metric-value">${peso(totalPurchases)}</div></div>
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

  document.getElementById('dash-purchases').innerHTML = purchases.slice(0, 5).length
    ? purchases.slice(0, 5).map(p => {
        const sc = { Received: 'green', Ordered: 'blue', Pending: 'amber', Cancelled: 'red' }
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">
          <div><div class="fw-500">${p.product_name}</div><div class="text-muted" style="font-size:11px">${p.date} · ${p.supplier || '—'}</div></div>
          <div style="text-align:right"><div class="fw-500">${peso(Number(p.qty) * Number(p.unit_cost))}</div><span class="badge ${sc[p.status] || 'gray'}">${p.status}</span></div>
        </div>`
      }).join('')
    : '<div class="empty" style="padding:20px 0">No purchases yet</div>'
}

window.renderInventory = async () => {
  if (!inventory.length) await loadAll()
  const q = (document.getElementById('inv-search')?.value || '').toLowerCase()
  const items = inventory.filter(i => i.name.toLowerCase().includes(q) || (i.category || '').toLowerCase().includes(q))
  const tb = document.getElementById('inv-table')
  const totalVal = items.reduce((s, i) => s + Number(i.stock) * Number(i.buy_price || 0), 0)
  document.getElementById('inv-total').textContent = `Total value: ${peso(totalVal)}`
  tb.innerHTML = items.length
    ? items.map(it => {
        const low = Number(it.stock) <= Number(it.min_stock)
        const margin = it.sell_price && it.buy_price ? Math.round(((it.sell_price - it.buy_price) / it.buy_price) * 100) : null
        return `<tr>
          <td><div class="fw-500">${it.name}</div><div style="font-size:11px;color:var(--muted)">${it.supplier || ''}</div></td>
          <td><span class="badge gray">${it.category}</span></td>
          <td class="${low ? 'text-red fw-500' : ''}">${it.stock}</td>
          <td class="text-muted">${it.unit}</td>
          <td>${it.min_stock}</td>
          <td>${peso(it.buy_price || 0)}</td>
          <td>${peso(it.sell_price || 0)}${margin !== null ? `<span style="font-size:10px;color:var(--success);margin-left:4px">+${margin}%</span>` : ''}</td>
          <td><span class="badge ${low ? 'red' : 'green'}">${low ? 'Low' : 'OK'}</span></td>
          <td style="display:flex;gap:6px">
            <button class="btn sm" onclick="editInventory('${it.id}')"><i class="ti ti-edit"></i></button>
            <button class="btn sm danger" onclick="deleteInventory('${it.id}')"><i class="ti ti-trash"></i></button>
          </td>
        </tr>`
      }).join('')
    : `<tr><td colspan="9"><div class="empty">No products found</div></td></tr>`
}

window.editInventory = (id) => {
  const it = inventory.find(i => i.id === id); if (!it) return
  invEdit = id
  document.getElementById('inv-modal-title').textContent = 'Edit product'
  document.getElementById('inv-name').value = it.name
  document.getElementById('inv-cat').value = it.category
  document.getElementById('inv-unit').value = it.unit
  document.getElementById('inv-stock').value = it.stock
  document.getElementById('inv-min').value = it.min_stock
  document.getElementById('inv-buy').value = it.buy_price || ''
  document.getElementById('inv-sell').value = it.sell_price || ''
  document.getElementById('inv-supplier').value = it.supplier || ''
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
    buy_price: Number(document.getElementById('inv-buy').value) || 0,
    sell_price: Number(document.getElementById('inv-sell').value) || 0,
    supplier: document.getElementById('inv-supplier').value.trim(),
  }
  if (!payload.name) { toast('Name required', 'error'); return }
  const btn = document.getElementById('inv-save-btn'); btn.disabled = true; btn.textContent = 'Saving…'
  if (invEdit) await sb.from('store_inventory').update(payload).eq('id', invEdit)
  else await sb.from('store_inventory').insert(payload)
  invEdit = null; btn.disabled = false; btn.textContent = 'Save'
  closeModal('inv-modal'); toast('Product saved!')
  const { data } = await sb.from('store_inventory').select('*').eq('user_id', user.id).order('name')
  inventory = data || []; renderInventory()
}

window.deleteInventory = async (id) => {
  if (!confirm('Delete?')) return
  await sb.from('store_inventory').delete().eq('id', id)
  inventory = inventory.filter(i => i.id !== id); renderInventory(); toast('Deleted')
}

window.renderPurchases = async () => {
  if (!purchases.length && !inventory.length) await loadAll()
  const q = (document.getElementById('po-search')?.value || '').toLowerCase()
  const items = purchases.filter(p => p.product_name?.toLowerCase().includes(q) || (p.supplier || '').toLowerCase().includes(q))
  const tb = document.getElementById('po-table')
  const sc = { Received: 'green', Ordered: 'blue', Pending: 'amber', Cancelled: 'red' }
  tb.innerHTML = items.length
    ? items.map(it => `<tr>
        <td class="text-muted">${it.date}</td>
        <td class="fw-500">${it.product_name}</td>
        <td>${it.supplier || '—'}</td>
        <td>${it.qty}</td>
        <td>${peso(it.unit_cost || 0)}</td>
        <td class="fw-500">${peso(Number(it.qty) * Number(it.unit_cost))}</td>
        <td><span class="badge ${sc[it.status] || 'gray'}">${it.status}</span></td>
        <td style="display:flex;gap:6px">
          <button class="btn sm" onclick="editPurchase('${it.id}')"><i class="ti ti-edit"></i></button>
          <button class="btn sm danger" onclick="deletePurchase('${it.id}')"><i class="ti ti-trash"></i></button>
        </td>
      </tr>`).join('')
    : `<tr><td colspan="8"><div class="empty">No purchases found</div></td></tr>`
}

window.editPurchase = (id) => {
  const it = purchases.find(p => p.id === id); if (!it) return
  poEdit = id
  document.getElementById('po-modal-title').textContent = 'Edit purchase'
  document.getElementById('po-product').value = it.product_name
  document.getElementById('po-date').value = it.date
  document.getElementById('po-supplier').value = it.supplier || ''
  document.getElementById('po-qty').value = it.qty
  document.getElementById('po-cost').value = it.unit_cost || ''
  document.getElementById('po-status').value = it.status
  document.getElementById('po-notes').value = it.notes || ''
  openModal('po-modal')
}

window.savePurchase = async () => {
  const payload = {
    user_id: user.id,
    product_name: document.getElementById('po-product').value.trim(),
    date: document.getElementById('po-date').value || new Date().toISOString().slice(0, 10),
    supplier: document.getElementById('po-supplier').value.trim(),
    qty: Number(document.getElementById('po-qty').value) || 0,
    unit_cost: Number(document.getElementById('po-cost').value) || 0,
    status: document.getElementById('po-status').value,
    notes: document.getElementById('po-notes').value.trim(),
  }
  if (!payload.product_name) { toast('Product name required', 'error'); return }
  const btn = document.getElementById('po-save-btn'); btn.disabled = true; btn.textContent = 'Saving…'
  if (poEdit) await sb.from('store_purchases').update(payload).eq('id', poEdit)
  else await sb.from('store_purchases').insert(payload)
  poEdit = null; btn.disabled = false; btn.textContent = 'Save'
  closeModal('po-modal'); toast('Purchase saved!')
  const { data } = await sb.from('store_purchases').select('*').eq('user_id', user.id).order('date', { ascending: false })
  purchases = data || []; renderPurchases()
}

window.deletePurchase = async (id) => {
  if (!confirm('Delete?')) return
  await sb.from('store_purchases').delete().eq('id', id)
  purchases = purchases.filter(p => p.id !== id); renderPurchases(); toast('Deleted')
}

window.renderExpenses = async () => {
  if (!expenses.length && !inventory.length) await loadAll()
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
  if (expEdit) await sb.from('store_expenses').update(payload).eq('id', expEdit)
  else await sb.from('store_expenses').insert(payload)
  expEdit = null; btn.disabled = false; btn.textContent = 'Save'
  closeModal('exp-modal'); toast('Expense saved!')
  const { data } = await sb.from('store_expenses').select('*').eq('user_id', user.id).order('date', { ascending: false })
  expenses = data || []; renderExpenses()
}

window.deleteExpense = async (id) => {
  if (!confirm('Delete?')) return
  await sb.from('store_expenses').delete().eq('id', id)
  expenses = expenses.filter(e => e.id !== id); renderExpenses(); toast('Deleted')
}

window.renderContacts = async () => {
  if (!contacts.length && !inventory.length) await loadAll()
  const q = (document.getElementById('con-search')?.value || '').toLowerCase()
  const items = contacts.filter(c => c.name?.toLowerCase().includes(q) || (c.type || '').toLowerCase().includes(q))
  const tb = document.getElementById('con-table')
  tb.innerHTML = items.length
    ? items.map(it => `<tr>
        <td><div style="display:flex;align-items:center;gap:8px">
          <div style="width:28px;height:28px;border-radius:50%;background:#EEF5FF;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#1E4FA8;flex-shrink:0">${initials(it.name)}</div>
          <span class="fw-500">${it.name}</span>
        </div></td>
        <td><span class="badge ${it.type === 'Supplier' ? 'amber' : 'blue'}">${it.type}</span></td>
        <td class="text-muted">${it.category || '—'}</td>
        <td class="text-muted">${it.email || '—'}</td>
        <td>${it.phone || '—'}</td>
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
  if (conEdit) await sb.from('store_contacts').update(payload).eq('id', conEdit)
  else await sb.from('store_contacts').insert(payload)
  conEdit = null; btn.disabled = false; btn.textContent = 'Save'
  closeModal('con-modal'); toast('Contact saved!')
  const { data } = await sb.from('store_contacts').select('*').eq('user_id', user.id).order('name')
  contacts = data || []; renderContacts()
}

window.deleteContact = async (id) => {
  if (!confirm('Delete?')) return
  await sb.from('store_contacts').delete().eq('id', id)
  contacts = contacts.filter(c => c.id !== id); renderContacts(); toast('Deleted')
}

init();
