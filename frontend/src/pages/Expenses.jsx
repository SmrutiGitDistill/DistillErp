import { useState, useEffect } from 'react'
import api from '../api/axios'

const cardStyle = {
  backgroundColor: 'white', borderRadius: '12px',
  padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  border: '1px solid #F5F5F4', marginBottom: '16px'
}

const inputStyle = {
  width: '100%', border: '1px solid #E7E5E4',
  borderRadius: '8px', padding: '8px 12px',
  fontSize: '13px', outline: 'none', fontFamily: 'inherit'
}

const labelStyle = {
  display: 'block', fontSize: '11px',
  fontWeight: '600', color: '#78716C',
  marginBottom: '4px', textTransform: 'uppercase'
}

const tabStyle = (active) => ({
  padding: '8px 20px', borderRadius: '8px',
  border: 'none', cursor: 'pointer',
  fontSize: '13px', fontWeight: '600',
  fontFamily: 'inherit',
  backgroundColor: active ? '#C8760A' : 'white',
  color: active ? 'white' : '#78716C',
  boxShadow: active ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
})

const CATEGORIES = [
  { value: 'salary', label: '👤 Salary' },
  { value: 'diesel', label: '⛽ Diesel' },
  { value: 'petrol', label: '🛵 Petrol' },
  { value: 'meals', label: '🍱 Meals' },
  { value: 'raw_material', label: '🌾 Raw Material' },
  { value: 'maintenance', label: '🔧 Maintenance' },
  { value: 'excise_duty', label: '📋 Excise Duty' },
  { value: 'transport', label: '🚛 Transport' },
  { value: 'misc', label: '📦 Miscellaneous' },
]

const categoryLabel = (val) => CATEGORIES.find(c => c.value === val)?.label || val

const paymentBadge = (status) => {
  const map = {
    paid: { bg: '#F0FDF4', color: '#16A34A', label: '✅ Paid' },
    pending: { bg: '#FEF2F2', color: '#DC2626', label: '⏳ Pending' },
  }
  const s = map[status] || map.paid
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '999px',
      fontSize: '11px', fontWeight: '600',
      backgroundColor: s.bg, color: s.color
    }}>
      {s.label}
    </span>
  )
}

// ─── NEW EXPENSE FORM ─────────────────────────────────────
function NewExpenseForm({ onSaved }) {
  const today = new Date().toISOString().split('T')[0]
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [batches, setBatches] = useState([])

  const [form, setForm] = useState({
    date: today,
    category: 'salary',
    sub_category: '',
    description: '',
    vendor_name: '',
    vendor_contact: '',
    amount: '',
    payment_mode: 'cash',
    payment_status: 'paid',
    payment_reference: '',
    batch_id: '',
    batch_number: '',
    notes: ''
  })

  useEffect(() => {
    api.get('/production/')
      .then(res => setBatches(res.data))
      .catch(() => {})
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'batch_id' && value) {
      const batch = batches.find(b => b.id === parseInt(value))
      setForm(f => ({ ...f, batch_id: value, batch_number: batch?.batch_number || '' }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        batch_id: form.batch_id ? parseInt(form.batch_id) : null,
      }
      await api.post('/expenses/', payload)
      setMessage({ type: 'success', text: '✅ Expense recorded!' })
      setForm({
        date: today, category: 'salary', sub_category: '',
        description: '', vendor_name: '', vendor_contact: '',
        amount: '', payment_mode: 'cash', payment_status: 'paid',
        payment_reference: '', batch_id: '', batch_number: '', notes: ''
      })
      onSaved()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Save failed' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>

      {/* Basic Details */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#44403C', marginBottom: '16px' }}>
          📝 Expense Details
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Date</label>
            <input type="date" name="date" value={form.date}
              onChange={handleChange} style={inputStyle} required />
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select name="category" value={form.category}
              onChange={handleChange} style={inputStyle}>
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Sub Category</label>
            <input name="sub_category" value={form.sub_category}
              onChange={handleChange} style={inputStyle}
              placeholder="e.g. Overtime, Fuel" />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <input name="description" value={form.description}
              onChange={handleChange} style={inputStyle}
              placeholder="Brief description" required />
          </div>
          <div>
            <label style={labelStyle}>Amount (₹)</label>
            <input type="number" name="amount" value={form.amount}
              onChange={handleChange} min="0" step="0.01"
              style={inputStyle} required />
          </div>
          <div>
            <label style={labelStyle}>Link to Batch (optional)</label>
            <select name="batch_id" value={form.batch_id}
              onChange={handleChange} style={inputStyle}>
              <option value="">No batch</option>
              {batches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.batch_number} — {b.date}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vendor Details */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#44403C', marginBottom: '16px' }}>
          🏪 Vendor Details
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Vendor / Payee Name</label>
            <input name="vendor_name" value={form.vendor_name}
              onChange={handleChange} style={inputStyle}
              placeholder="e.g. Raj Suppliers" />
          </div>
          <div>
            <label style={labelStyle}>Vendor Contact</label>
            <input name="vendor_contact" value={form.vendor_contact}
              onChange={handleChange} style={inputStyle}
              placeholder="Phone / Email" />
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#44403C', marginBottom: '16px' }}>
          💳 Payment Details
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Payment Mode</label>
            <select name="payment_mode" value={form.payment_mode}
              onChange={handleChange} style={inputStyle}>
              <option value="cash">💵 Cash</option>
              <option value="bank">🏦 Bank Transfer</option>
              <option value="upi">📱 UPI</option>
              <option value="cheque">📝 Cheque</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Payment Status</label>
            <select name="payment_status" value={form.payment_status}
              onChange={handleChange} style={inputStyle}>
              <option value="paid">✅ Paid</option>
              <option value="pending">⏳ Pending</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Reference No. (UTR/Cheque)</label>
            <input name="payment_reference" value={form.payment_reference}
              onChange={handleChange} style={inputStyle}
              placeholder="Transaction ref" />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div style={cardStyle}>
        <label style={labelStyle}>Notes</label>
        <textarea name="notes" value={form.notes}
          onChange={handleChange} rows={2}
          style={{ ...inputStyle, resize: 'vertical' }}
          placeholder="Any additional remarks..." />
      </div>

      {message && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px',
          fontSize: '13px', fontWeight: '500', marginBottom: '16px',
          backgroundColor: message.type === 'success' ? '#F0FDF4' : '#FEF2F2',
          color: message.type === 'success' ? '#15803D' : '#DC2626'
        }}>{message.text}</div>
      )}

      <button type="submit" disabled={saving} style={{
        width: '100%', backgroundColor: saving ? '#D6D3D1' : '#C8760A',
        color: 'white', border: 'none', borderRadius: '10px',
        padding: '14px', fontSize: '14px', fontWeight: '600',
        cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
      }}>
        {saving ? 'Saving...' : '💾 Record Expense'}
      </button>
    </form>
  )
}

// ─── EXPENSE LIST ─────────────────────────────────────────
function ExpenseList({ refresh }) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/expenses/')
      .then(res => setExpenses(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [refresh])

  const filtered = expenses.filter(e => {
    const matchStatus = filter === 'all' || e.payment_status === filter
    const matchCat = catFilter === 'all' || e.category === catFilter
    const matchSearch = !search ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      (e.vendor_name || '').toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchCat && matchSearch
  })

  const total = filtered.reduce((sum, e) => sum + e.amount, 0)
  const pending = filtered.filter(e => e.payment_status === 'pending')
  const pendingAmount = pending.reduce((sum, e) => sum + e.amount, 0)

  const markPaid = async (id) => {
    try {
      await api.put(`/expenses/${id}`, { payment_status: 'paid' })
      setMessage({ type: 'success', text: '✅ Marked as paid!' })
      load()
    } catch {
      setMessage({ type: 'error', text: 'Failed to update' })
    }
  }

  const deleteExpense = async (id) => {
    if (!window.confirm('Delete this expense?')) return
    try {
      await api.delete(`/expenses/${id}`)
      setMessage({ type: 'success', text: '✅ Expense deleted!' })
      load()
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete' })
    }
  }

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

  return (
    <div>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div style={{ ...cardStyle, marginBottom: 0, borderTop: '3px solid #DC2626' }}>
          <p style={{ fontSize: '11px', color: '#78716C', fontWeight: '600', textTransform: 'uppercase' }}>Total</p>
          <p style={{ fontSize: '20px', fontWeight: '700', color: '#DC2626', fontFamily: 'monospace', marginTop: '4px' }}>{fmt(total)}</p>
        </div>
        <div style={{ ...cardStyle, marginBottom: 0, borderTop: '3px solid #F59E0B' }}>
          <p style={{ fontSize: '11px', color: '#78716C', fontWeight: '600', textTransform: 'uppercase' }}>Pending</p>
          <p style={{ fontSize: '20px', fontWeight: '700', color: '#F59E0B', fontFamily: 'monospace', marginTop: '4px' }}>{fmt(pendingAmount)}</p>
        </div>
        <div style={{ ...cardStyle, marginBottom: 0, borderTop: '3px solid #16A34A' }}>
          <p style={{ fontSize: '11px', color: '#78716C', fontWeight: '600', textTransform: 'uppercase' }}>Entries</p>
          <p style={{ fontSize: '20px', fontWeight: '700', color: '#16A34A', fontFamily: 'monospace', marginTop: '4px' }}>{filtered.length}</p>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
          marginBottom: '16px', fontWeight: '500',
          backgroundColor: message.type === 'success' ? '#F0FDF4' : '#FEF2F2',
          color: message.type === 'success' ? '#15803D' : '#DC2626'
        }}>{message.text}</div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        {['all', 'paid', 'pending'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={tabStyle(filter === f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          style={{ ...inputStyle, width: 'auto', minWidth: '140px', flex: '0 1 160px' }}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search description / vendor..."
          style={{
            border: '1px solid #E7E5E4', borderRadius: '8px',
            padding: '8px 12px', fontSize: '13px',
            outline: 'none', fontFamily: 'inherit',
            flex: '1 1 160px', minWidth: 0, maxWidth: '280px',
            marginLeft: 'auto',
          }} />
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ color: '#C8760A', padding: '20px' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', color: '#78716C', padding: '40px' }}>
          No expenses found
        </div>
      ) : (
        <div style={cardStyle}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F5F5F4' }}>
                  {['Date', 'Category', 'Description', 'Vendor', 'Batch', 'Amount', 'Mode', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 8px', color: '#78716C', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #F5F5F4' }}>
                    <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: '12px' }}>{e.date}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '6px',
                        fontSize: '11px', fontWeight: '600',
                        backgroundColor: '#F5F5F4', color: '#44403C'
                      }}>
                        {categoryLabel(e.category)}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', fontWeight: '500' }}>{e.description}</td>
                    <td style={{ padding: '10px 8px', color: '#78716C', fontSize: '12px' }}>{e.vendor_name || '—'}</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: '11px', color: '#2563EB' }}>
                      {e.batch_number || '—'}
                    </td>
                    <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontWeight: '700', color: '#DC2626' }}>
                      {fmt(e.amount)}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#78716C', fontSize: '12px', textTransform: 'uppercase' }}>
                      {e.payment_mode}
                    </td>
                    <td style={{ padding: '10px 8px' }}>{paymentBadge(e.payment_status)}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {e.payment_status === 'pending' && (
                          <button onClick={() => markPaid(e.id)} style={{
                            padding: '4px 10px', borderRadius: '6px',
                            fontSize: '11px', fontWeight: '600',
                            cursor: 'pointer', border: 'none',
                            backgroundColor: '#F0FDF4', color: '#16A34A',
                            fontFamily: 'inherit'
                          }}>
                            ✓ Pay
                          </button>
                        )}
                        <button onClick={() => deleteExpense(e.id)} style={{
                          padding: '4px 10px', borderRadius: '6px',
                          fontSize: '11px', fontWeight: '600',
                          cursor: 'pointer', border: 'none',
                          backgroundColor: '#FEF2F2', color: '#DC2626',
                          fontFamily: 'inherit'
                        }}>
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid #1C1917', backgroundColor: '#F8F7F4' }}>
                  <td colSpan={5} style={{ padding: '10px 8px', fontWeight: '700' }}>TOTAL</td>
                  <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontWeight: '800', color: '#DC2626' }}>
                    {fmt(total)}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CATEGORY SUMMARY ─────────────────────────────────────
function CategorySummary() {
  const today = new Date().toISOString().split('T')[0]
  const firstDay = today.slice(0, 7) + '-01'
  const [fromDate, setFromDate] = useState(firstDay)
  const [toDate, setToDate] = useState(today)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = () => {
    setLoading(true)
    api.get(`/expenses/summary?from_date=${fromDate}&to_date=${toDate}`)
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

  return (
    <div>
      {/* Date Controls */}
      <div style={{ ...cardStyle, display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label style={labelStyle}>From</label>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
            style={{ ...inputStyle, width: 'auto' }} />
        </div>
        <div>
          <label style={labelStyle}>To</label>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
            style={{ ...inputStyle, width: 'auto' }} />
        </div>
        <button onClick={load} disabled={loading} style={{
          backgroundColor: '#C8760A', color: 'white', border: 'none',
          borderRadius: '8px', padding: '10px 20px', fontSize: '13px',
          fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
        }}>
          {loading ? 'Loading...' : '📊 Generate'}
        </button>
      </div>

      {data && (
        <>
          {/* Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div style={{ ...cardStyle, marginBottom: 0, borderTop: '3px solid #DC2626' }}>
              <p style={{ fontSize: '11px', color: '#78716C', fontWeight: '600' }}>TOTAL EXPENSES</p>
              <p style={{ fontSize: '22px', fontWeight: '700', color: '#DC2626', fontFamily: 'monospace', marginTop: '6px' }}>{fmt(data.total)}</p>
            </div>
            <div style={{ ...cardStyle, marginBottom: 0, borderTop: '3px solid #F59E0B' }}>
              <p style={{ fontSize: '11px', color: '#78716C', fontWeight: '600' }}>PENDING</p>
              <p style={{ fontSize: '22px', fontWeight: '700', color: '#F59E0B', fontFamily: 'monospace', marginTop: '6px' }}>{fmt(data.pending_amount)}</p>
              <p style={{ fontSize: '11px', color: '#78716C' }}>{data.pending_count} entries</p>
            </div>
          </div>

          {/* By Category */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#44403C', marginBottom: '16px' }}>
              By Category
            </h2>
            {Object.entries(data.by_category)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, amount]) => {
                const pct = data.total > 0 ? (amount / data.total * 100).toFixed(1) : 0
                return (
                  <div key={cat} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>{categoryLabel(cat)}</span>
                      <span style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: '700' }}>
                        {fmt(amount)} <span style={{ color: '#78716C', fontWeight: '400' }}>({pct}%)</span>
                      </span>
                    </div>
                    <div style={{ backgroundColor: '#F5F5F4', borderRadius: '4px', height: '6px' }}>
                      <div style={{
                        backgroundColor: '#C8760A', borderRadius: '4px',
                        height: '6px', width: `${pct}%`,
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                )
              })}
          </div>

          {/* By Payment Mode */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#44403C', marginBottom: '16px' }}>
              By Payment Mode
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              {Object.entries(data.by_payment_mode).map(([mode, amount]) => (
                <div key={mode} style={{
                  padding: '16px', backgroundColor: '#F8F7F4',
                  borderRadius: '8px', textAlign: 'center'
                }}>
                  <p style={{ fontSize: '20px', marginBottom: '4px' }}>
                    {mode === 'cash' ? '💵' : mode === 'bank' ? '🏦' : mode === 'upi' ? '📱' : '📝'}
                  </p>
                  <p style={{ fontSize: '11px', color: '#78716C', textTransform: 'uppercase', fontWeight: '600' }}>{mode}</p>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#C8760A', fontFamily: 'monospace', marginTop: '4px' }}>{fmt(amount)}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── MAIN EXPENSES PAGE ───────────────────────────────────
export default function Expenses() {
  const [activeTab, setActiveTab] = useState('list')
  const [refresh, setRefresh] = useState(0)

  const handleSaved = () => {
    setRefresh(r => r + 1)
    setActiveTab('list')
  }

  return (
    <div style={{ maxWidth: '1100px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1C1917' }}>Expenses</h1>
        <p style={{ color: '#78716C', fontSize: '13px', marginTop: '4px' }}>
          Track all operational costs with vendor and payment details
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('list')} style={tabStyle(activeTab === 'list')}>
          📋 All Expenses
        </button>
        <button onClick={() => setActiveTab('new')} style={tabStyle(activeTab === 'new')}>
          + Add Expense
        </button>
        <button onClick={() => setActiveTab('summary')} style={tabStyle(activeTab === 'summary')}>
          📊 Category Summary
        </button>
      </div>

      {activeTab === 'new' && <NewExpenseForm onSaved={handleSaved} />}
      {activeTab === 'list' && <ExpenseList refresh={refresh} />}
      {activeTab === 'summary' && <CategorySummary />}
    </div>
  )
}