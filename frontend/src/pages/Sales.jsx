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

const paymentBadge = (status) => {
  const map = {
    paid: { bg: '#F0FDF4', color: '#16A34A', label: '✅ Paid' },
    outstanding: { bg: '#FEF2F2', color: '#DC2626', label: '❌ Outstanding' },
    partial: { bg: '#FEF3C7', color: '#92400E', label: '⏳ Partial' },
  }
  const s = map[status] || map.outstanding
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

// ─── NEW SALE FORM ────────────────────────────────────────
function NewSaleForm({ onSaved }) {
  const today = new Date().toISOString().split('T')[0]
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const [form, setForm] = useState({
    date: today,
    invoice_number: '',
    buyer_name: '',
    buyer_address: '',
    destination: '',
    excise_permit_number: '',
    excise_permit_date: '',
    transport_pass_number: '',
    qty_p1: 0, rate_p1: 50, label_p1: 'Slab A',
    qty_p2: 0, rate_p2: 45, label_p2: 'Slab B',
    qty_p3: 0, rate_p3: 20, label_p3: 'Slab C',
    qty_o1: 0, rate_o1: 170, label_o1: 'Tier 1',
    qty_o2: 0, rate_o2: 120, label_o2: 'Tier 2',
    qty_o3: 0, rate_o3: 100, label_o3: 'Tier 3',
    excise_duty: 0,
    payment_status: 'outstanding',
    payment_mode: '',
    payment_date: '',
    amount_paid: 0,
    notes: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const calcSubtotal = () => {
    const pkg = form.qty_p1 * form.rate_p1 + form.qty_p2 * form.rate_p2 + form.qty_p3 * form.rate_p3
    const open = form.qty_o1 * form.rate_o1 + form.qty_o2 * form.rate_o2 + form.qty_o3 * form.rate_o3
    return pkg + open
  }

  const subtotal = calcSubtotal()
  const total = subtotal + parseFloat(form.excise_duty || 0)
  const amountDue = total - parseFloat(form.amount_paid || 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const payload = {
        ...form,
        qty_p1: parseFloat(form.qty_p1), rate_p1: parseFloat(form.rate_p1),
        qty_p2: parseFloat(form.qty_p2), rate_p2: parseFloat(form.rate_p2),
        qty_p3: parseFloat(form.qty_p3), rate_p3: parseFloat(form.rate_p3),
        qty_o1: parseFloat(form.qty_o1), rate_o1: parseFloat(form.rate_o1),
        qty_o2: parseFloat(form.qty_o2), rate_o2: parseFloat(form.rate_o2),
        qty_o3: parseFloat(form.qty_o3), rate_o3: parseFloat(form.rate_o3),
        excise_duty: parseFloat(form.excise_duty || 0),
        amount_paid: parseFloat(form.amount_paid || 0),
        excise_permit_date: form.excise_permit_date || null,
        payment_date: form.payment_date || null,
      }
      await api.post('/sales/', payload)
      setMessage({ type: 'success', text: '✅ Sale recorded successfully!' })
      onSaved()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Save failed' })
    } finally {
      setSaving(false)
    }
  }

  const sectionTitle = (title) => (
    <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#44403C', marginBottom: '16px' }}>
      {title}
    </h2>
  )

  const slabs = [
    { qty: 'qty_p1', rate: 'rate_p1', label: 'label_p1', title: 'Packaged Slab A' },
    { qty: 'qty_p2', rate: 'rate_p2', label: 'label_p2', title: 'Packaged Slab B' },
    { qty: 'qty_p3', rate: 'rate_p3', label: 'label_p3', title: 'Packaged Slab C' },
    { qty: 'qty_o1', rate: 'rate_o1', label: 'label_o1', title: 'Open Tier 1' },
    { qty: 'qty_o2', rate: 'rate_o2', label: 'label_o2', title: 'Open Tier 2' },
    { qty: 'qty_o3', rate: 'rate_o3', label: 'label_o3', title: 'Open Tier 3' },
  ]

  return (
    <form onSubmit={handleSubmit}>

      {/* Invoice Details */}
      <div style={cardStyle}>
        {sectionTitle('🧾 Invoice Details')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Date</label>
            <input type="date" name="date" value={form.date}
              onChange={handleChange} style={inputStyle} required />
          </div>
          <div>
            <label style={labelStyle}>Invoice Number</label>
            <input name="invoice_number" value={form.invoice_number}
              onChange={handleChange} style={inputStyle}
              placeholder="Auto-generated if empty" />
          </div>
          <div>
            <label style={labelStyle}>Buyer Name</label>
            <input name="buyer_name" value={form.buyer_name}
              onChange={handleChange} style={inputStyle}
              placeholder="e.g. Ram Wines" required />
          </div>
          <div>
            <label style={labelStyle}>Buyer Address</label>
            <input name="buyer_address" value={form.buyer_address}
              onChange={handleChange} style={inputStyle}
              placeholder="Full address" />
          </div>
          <div>
            <label style={labelStyle}>Destination</label>
            <input name="destination" value={form.destination}
              onChange={handleChange} style={inputStyle}
              placeholder="e.g. Mumbai" />
          </div>
        </div>
      </div>

      {/* Excise Details */}
      <div style={cardStyle}>
        {sectionTitle('📋 Excise Details')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Excise Permit No.</label>
            <input name="excise_permit_number" value={form.excise_permit_number}
              onChange={handleChange} style={inputStyle}
              placeholder="Permit number" />
          </div>
          <div>
            <label style={labelStyle}>Permit Date</label>
            <input type="date" name="excise_permit_date" value={form.excise_permit_date}
              onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Transport Pass No.</label>
            <input name="transport_pass_number" value={form.transport_pass_number}
              onChange={handleChange} style={inputStyle}
              placeholder="TP number" />
          </div>
          <div>
            <label style={labelStyle}>Excise Duty (₹)</label>
            <input type="number" name="excise_duty" value={form.excise_duty}
              onChange={handleChange} min="0" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Sales Slabs */}
      <div style={cardStyle}>
        {sectionTitle('💰 Sales by Price Tier')}
        <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '420px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #F5F5F4' }}>
              {['Tier / Label', 'Rate (₹)', 'Qty', 'Amount'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px', color: '#78716C', fontWeight: '600' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slabs.map(({ qty, rate, label, title }) => (
              <tr key={qty} style={{ borderBottom: '1px solid #F5F5F4' }}>
                <td style={{ padding: '8px' }}>
                  <input name={label} value={form[label]}
                    onChange={handleChange} style={{ ...inputStyle, width: '120px' }}
                    placeholder={title} />
                </td>
                <td style={{ padding: '8px' }}>
                  <input type="number" name={rate} value={form[rate]}
                    onChange={handleChange} min="0"
                    style={{ ...inputStyle, width: '90px' }} />
                </td>
                <td style={{ padding: '8px' }}>
                  <input type="number" name={qty} value={form[qty]}
                    onChange={handleChange} min="0"
                    style={{ ...inputStyle, width: '90px' }} />
                </td>
                <td style={{ padding: '8px', fontFamily: 'monospace', fontWeight: '600' }}>
                  ₹{(parseFloat(form[qty] || 0) * parseFloat(form[rate] || 0)).toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* Totals */}
        <div style={{
          marginTop: '16px', padding: '16px',
          backgroundColor: '#F8F7F4', borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#78716C' }}>Subtotal</span>
            <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#78716C' }}>Excise Duty</span>
            <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>₹{parseFloat(form.excise_duty || 0).toLocaleString('en-IN')}</span>
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            paddingTop: '8px', borderTop: '2px solid #1C1917'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '700' }}>Total</span>
            <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '16px', color: '#16A34A' }}>
              ₹{total.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Payment */}
      <div style={cardStyle}>
        {sectionTitle('💳 Payment Details')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Payment Status</label>
            <select name="payment_status" value={form.payment_status}
              onChange={handleChange} style={inputStyle}>
              <option value="outstanding">Outstanding</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Payment Mode</label>
            <select name="payment_mode" value={form.payment_mode}
              onChange={handleChange} style={inputStyle}>
              <option value="">Select mode</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Amount Paid (₹)</label>
            <input type="number" name="amount_paid" value={form.amount_paid}
              onChange={handleChange} min="0" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Payment Date</label>
            <input type="date" name="payment_date" value={form.payment_date}
              onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        {/* Amount Due */}
        <div style={{
          marginTop: '16px', padding: '12px 16px',
          backgroundColor: amountDue > 0 ? '#FEF2F2' : '#F0FDF4',
          borderRadius: '8px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: amountDue > 0 ? '#DC2626' : '#16A34A' }}>
            {amountDue > 0 ? '❌ Amount Due' : '✅ Fully Paid'}
          </span>
          <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '16px', color: amountDue > 0 ? '#DC2626' : '#16A34A' }}>
            ₹{amountDue.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Notes */}
      <div style={cardStyle}>
        <label style={labelStyle}>Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange}
          rows={2} style={{ ...inputStyle, resize: 'vertical' }}
          placeholder="Any remarks..." />
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
        {saving ? 'Saving...' : '💾 Record Sale'}
      </button>
    </form>
  )
}

// ─── SALES LIST ───────────────────────────────────────────
function SalesList({ refresh }) {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState(null)
  const [message, setMessage] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/sales/')
      .then(res => setSales(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [refresh])

  const filtered = sales.filter(s => {
    const matchFilter = filter === 'all' || s.payment_status === filter
    const matchSearch = !search ||
      s.buyer_name.toLowerCase().includes(search.toLowerCase()) ||
      s.invoice_number.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const markPaid = async (id) => {
    setUpdating(id)
    try {
      await api.put(`/sales/${id}`, {
        payment_status: 'paid',
        amount_paid: sales.find(s => s.id === id)?.total_sales
      })
      setMessage({ type: 'success', text: '✅ Marked as paid!' })
      load()
    } catch {
      setMessage({ type: 'error', text: 'Failed to update' })
    } finally {
      setUpdating(null)
    }
  }

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

  const totalOutstanding = sales
    .filter(s => s.payment_status !== 'paid')
    .reduce((sum, s) => sum + s.amount_due, 0)

  return (
    <div>
      {/* Summary */}
      {totalOutstanding > 0 && (
        <div style={{
          ...cardStyle, backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA', marginBottom: '16px'
        }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#DC2626' }}>
            💰 Total Outstanding: {fmt(totalOutstanding)}
          </p>
        </div>
      )}

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
        {['all', 'paid', 'outstanding', 'partial'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={tabStyle(filter === f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search buyer / invoice..."
          style={{
            border: '1px solid #E7E5E4', borderRadius: '8px',
            padding: '8px 12px', fontSize: '13px',
            outline: 'none', fontFamily: 'inherit',
            flex: '1 1 160px', minWidth: 0, maxWidth: '280px',
            marginLeft: 'auto',
          }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ color: '#C8760A', padding: '20px' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', color: '#78716C', padding: '40px' }}>
          No sales found
        </div>
      ) : (
        <div style={cardStyle}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F5F5F4' }}>
                  {['Date', 'Invoice', 'Buyer', 'Destination', 'Excise Permit', 'Total', 'Paid', 'Due', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 8px', color: '#78716C', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #F5F5F4' }}>
                    <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: '12px' }}>{s.date}</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: '12px', color: '#2563EB' }}>{s.invoice_number}</td>
                    <td style={{ padding: '10px 8px', fontWeight: '600' }}>{s.buyer_name}</td>
                    <td style={{ padding: '10px 8px', color: '#78716C' }}>{s.destination || '—'}</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: '12px' }}>{s.excise_permit_number || '—'}</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontWeight: '700', color: '#16A34A' }}>{fmt(s.total_sales)}</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'monospace', color: '#16A34A' }}>{fmt(s.amount_paid)}</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'monospace', color: '#DC2626', fontWeight: '700' }}>{fmt(s.amount_due)}</td>
                    <td style={{ padding: '10px 8px' }}>{paymentBadge(s.payment_status)}</td>
                    <td style={{ padding: '10px 8px' }}>
                      {s.payment_status !== 'paid' && (
                        <button
                          onClick={() => markPaid(s.id)}
                          disabled={updating === s.id}
                          style={{
                            padding: '4px 12px', borderRadius: '6px',
                            fontSize: '12px', fontWeight: '600',
                            cursor: 'pointer', border: 'none',
                            backgroundColor: '#F0FDF4', color: '#16A34A',
                            fontFamily: 'inherit'
                          }}
                        >
                          {updating === s.id ? '...' : '✓ Mark Paid'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN SALES PAGE ─────────────────────────────────────
export default function Sales() {
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
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1C1917' }}>Sales</h1>
        <p style={{ color: '#78716C', fontSize: '13px', marginTop: '4px' }}>
          Invoices, excise permits, payment tracking
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('list')} style={tabStyle(activeTab === 'list')}>
          📋 All Sales
        </button>
        <button onClick={() => setActiveTab('new')} style={tabStyle(activeTab === 'new')}>
          + New Sale
        </button>
      </div>

      {activeTab === 'new' && <NewSaleForm onSaved={handleSaved} />}
      {activeTab === 'list' && <SalesList refresh={refresh} />}
    </div>
  )
}