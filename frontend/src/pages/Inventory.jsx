import { useState, useEffect } from 'react'
import api from '../api/axios'

const tabStyle = (active) => ({
  padding: '8px 20px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '600',
  fontFamily: 'inherit',
  backgroundColor: active ? '#C8760A' : 'white',
  color: active ? 'white' : '#78716C',
  boxShadow: active ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
  transition: 'all 0.15s ease'
})

const cardStyle = {
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '20px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  border: '1px solid #F5F5F4',
  marginBottom: '16px'
}

const inputStyle = {
  width: '100%',
  border: '1px solid #E7E5E4',
  borderRadius: '8px',
  padding: '8px 12px',
  fontSize: '13px',
  outline: 'none',
  fontFamily: 'inherit'
}

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '600',
  color: '#78716C',
  marginBottom: '4px',
  textTransform: 'uppercase'
}

const btnStyle = (color = '#C8760A') => ({
  backgroundColor: color,
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  padding: '8px 16px',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer',
  fontFamily: 'inherit'
})

function AlertBadge({ count }) {
  if (!count) return null
  return (
    <span style={{
      backgroundColor: '#DC2626',
      color: 'white',
      borderRadius: '999px',
      fontSize: '10px',
      fontWeight: '700',
      padding: '2px 7px',
      marginLeft: '6px'
    }}>
      {count}
    </span>
  )
}

// ─── RAW MATERIALS TAB ───────────────────────────────────
function RawMaterials() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showTx, setShowTx] = useState(null)
  const [message, setMessage] = useState(null)

  const [form, setForm] = useState({
    name: '', unit: 'kg', reorder_level: 0, current_stock: 0
  })

  const [txForm, setTxForm] = useState({
    material_id: null, date: new Date().toISOString().split('T')[0],
    transaction_type: 'received', quantity: 0, vendor: '', notes: ''
  })

  const load = () => {
    setLoading(true)
    api.get('/inventory/raw-materials')
      .then(res => setMaterials(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await api.post('/inventory/raw-materials', form)
      setMessage({ type: 'success', text: '✅ Material added!' })
      setShowAdd(false)
      setForm({ name: '', unit: 'kg', reorder_level: 0, current_stock: 0 })
      load()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed' })
    }
  }

  const handleTx = async (e) => {
    e.preventDefault()
    try {
      await api.post('/inventory/raw-materials/transaction', txForm)
      setMessage({ type: 'success', text: '✅ Transaction recorded!' })
      setShowTx(null)
      load()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed' })
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <p style={{ fontSize: '13px', color: '#78716C' }}>
          Track raw material stock levels and movements
        </p>
        <button onClick={() => setShowAdd(!showAdd)} style={btnStyle()}>
          + Add Material
        </button>
      </div>

      {message && (
        <div style={{
          padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
          marginBottom: '16px', fontWeight: '500',
          backgroundColor: message.type === 'success' ? '#F0FDF4' : '#FEF2F2',
          color: message.type === 'success' ? '#15803D' : '#DC2626'
        }}>{message.text}</div>
      )}

      {/* Add Material Form */}
      {showAdd && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
            Add Raw Material
          </h3>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>Material Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={inputStyle} placeholder="e.g. Molasses" required />
              </div>
              <div>
                <label style={labelStyle}>Unit</label>
                <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  style={inputStyle}>
                  <option value="kg">kg</option>
                  <option value="litre">litre</option>
                  <option value="ton">ton</option>
                  <option value="bag">bag</option>
                  <option value="drum">drum</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Opening Stock</label>
                <input type="number" min="0" value={form.current_stock}
                  onChange={e => setForm(f => ({ ...f, current_stock: parseFloat(e.target.value) || 0 }))}
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Reorder Level</label>
                <input type="number" min="0" value={form.reorder_level}
                  onChange={e => setForm(f => ({ ...f, reorder_level: parseFloat(e.target.value) || 0 }))}
                  style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" style={btnStyle()}>Save</button>
              <button type="button" onClick={() => setShowAdd(false)}
                style={btnStyle('#78716C')}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Transaction Form */}
      {showTx && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
            Record Transaction — {materials.find(m => m.id === showTx)?.name}
          </h3>
          <form onSubmit={handleTx}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>Type</label>
                <select value={txForm.transaction_type}
                  onChange={e => setTxForm(f => ({ ...f, transaction_type: e.target.value }))}
                  style={inputStyle}>
                  <option value="received">Received (Purchase)</option>
                  <option value="consumed">Consumed (Used)</option>
                  <option value="adjusted">Stock Adjustment</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Date</label>
                <input type="date" value={txForm.date}
                  onChange={e => setTxForm(f => ({ ...f, date: e.target.value }))}
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Quantity</label>
                <input type="number" min="0" value={txForm.quantity}
                  onChange={e => setTxForm(f => ({ ...f, quantity: parseFloat(e.target.value) || 0 }))}
                  style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Vendor (optional)</label>
                <input value={txForm.vendor}
                  onChange={e => setTxForm(f => ({ ...f, vendor: e.target.value }))}
                  style={inputStyle} placeholder="Vendor name" />
              </div>
              <div>
                <label style={labelStyle}>Notes</label>
                <input value={txForm.notes}
                  onChange={e => setTxForm(f => ({ ...f, notes: e.target.value }))}
                  style={inputStyle} placeholder="Optional notes" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" style={btnStyle()}>Record</button>
              <button type="button" onClick={() => setShowTx(null)}
                style={btnStyle('#78716C')}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Materials Table */}
      {loading ? (
        <div style={{ color: '#C8760A', padding: '20px' }}>Loading...</div>
      ) : materials.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', color: '#78716C', padding: '40px' }}>
          No raw materials added yet. Click "+ Add Material" to start.
        </div>
      ) : (
        <div style={cardStyle}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F5F5F4' }}>
                  {['Material', 'Unit', 'Current Stock', 'Reorder Level', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 8px', color: '#78716C', fontWeight: '600' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {materials.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #F5F5F4' }}>
                    <td style={{ padding: '10px 8px', fontWeight: '600', color: '#1C1917' }}>{m.name}</td>
                    <td style={{ padding: '10px 8px', color: '#78716C' }}>{m.unit}</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontWeight: '700',
                      color: m.is_low ? '#DC2626' : '#16A34A' }}>
                      {m.current_stock} {m.unit}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#78716C' }}>
                      {m.reorder_level} {m.unit}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '999px',
                        fontSize: '11px', fontWeight: '600',
                        backgroundColor: m.is_low ? '#FEF2F2' : '#F0FDF4',
                        color: m.is_low ? '#DC2626' : '#16A34A'
                      }}>
                        {m.is_low ? '⚠️ Low Stock' : '✅ OK'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <button
                        onClick={() => {
                          setShowTx(m.id)
                          setTxForm(f => ({ ...f, material_id: m.id }))
                        }}
                        style={{
                          padding: '4px 12px', borderRadius: '6px',
                          fontSize: '12px', fontWeight: '600',
                          cursor: 'pointer', border: 'none',
                          backgroundColor: '#EFF6FF', color: '#2563EB',
                          fontFamily: 'inherit'
                        }}
                      >
                        + Transaction
                      </button>
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

// ─── SKU TAB ─────────────────────────────────────────────
function SKUTab() {
  const [skus, setSkus] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showStock, setShowStock] = useState(null)
  const [message, setMessage] = useState(null)

  const [form, setForm] = useState({
    brand_name: '', sku_code: '', bottle_size_ml: 750,
    bottles_per_case: 12, rate_per_bottle: 0,
    rate_per_case: 0, current_stock_bottles: 0, reorder_level: 0
  })

  const [stockForm, setStockForm] = useState({ quantity: 0, type: 'received' })

  const load = () => {
    setLoading(true)
    api.get('/inventory/sku')
      .then(res => setSkus(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await api.post('/inventory/sku', form)
      setMessage({ type: 'success', text: '✅ SKU added!' })
      setShowAdd(false)
      load()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed' })
    }
  }

  const handleStock = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/inventory/sku/${showStock}/stock`, stockForm)
      setMessage({ type: 'success', text: '✅ Stock updated!' })
      setShowStock(null)
      load()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed' })
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <p style={{ fontSize: '13px', color: '#78716C' }}>Manage product SKUs and finished goods stock</p>
        <button onClick={() => setShowAdd(!showAdd)} style={btnStyle()}>+ Add SKU</button>
      </div>

      {message && (
        <div style={{
          padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
          marginBottom: '16px', fontWeight: '500',
          backgroundColor: message.type === 'success' ? '#F0FDF4' : '#FEF2F2',
          color: message.type === 'success' ? '#15803D' : '#DC2626'
        }}>{message.text}</div>
      )}

      {showAdd && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>Add SKU / Product</h3>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>Brand Name</label>
                <input value={form.brand_name}
                  onChange={e => setForm(f => ({ ...f, brand_name: e.target.value }))}
                  style={inputStyle} placeholder="e.g. Royal Stag" required />
              </div>
              <div>
                <label style={labelStyle}>SKU Code</label>
                <input value={form.sku_code}
                  onChange={e => setForm(f => ({ ...f, sku_code: e.target.value }))}
                  style={inputStyle} placeholder="e.g. RS-750" required />
              </div>
              <div>
                <label style={labelStyle}>Bottle Size (ml)</label>
                <select value={form.bottle_size_ml}
                  onChange={e => setForm(f => ({ ...f, bottle_size_ml: parseInt(e.target.value) }))}
                  style={inputStyle}>
                  <option value={180}>180ml</option>
                  <option value={375}>375ml</option>
                  <option value={750}>750ml</option>
                  <option value={1000}>1000ml</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Bottles/Case</label>
                <input type="number" min="1" value={form.bottles_per_case}
                  onChange={e => setForm(f => ({ ...f, bottles_per_case: parseInt(e.target.value) || 12 }))}
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Rate/Bottle (₹)</label>
                <input type="number" min="0" value={form.rate_per_bottle}
                  onChange={e => setForm(f => ({ ...f, rate_per_bottle: parseFloat(e.target.value) || 0 }))}
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Rate/Case (₹)</label>
                <input type="number" min="0" value={form.rate_per_case}
                  onChange={e => setForm(f => ({ ...f, rate_per_case: parseFloat(e.target.value) || 0 }))}
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Opening Stock (bottles)</label>
                <input type="number" min="0" value={form.current_stock_bottles}
                  onChange={e => setForm(f => ({ ...f, current_stock_bottles: parseFloat(e.target.value) || 0 }))}
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Reorder Level</label>
                <input type="number" min="0" value={form.reorder_level}
                  onChange={e => setForm(f => ({ ...f, reorder_level: parseInt(e.target.value) || 0 }))}
                  style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" style={btnStyle()}>Save SKU</button>
              <button type="button" onClick={() => setShowAdd(false)} style={btnStyle('#78716C')}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showStock && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
            Update Stock — {skus.find(s => s.id === showStock)?.brand_name}
          </h3>
          <form onSubmit={handleStock}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <label style={labelStyle}>Type</label>
                <select value={stockForm.type}
                  onChange={e => setStockForm(f => ({ ...f, type: e.target.value }))}
                  style={inputStyle}>
                  <option value="received">Received</option>
                  <option value="sold">Sold</option>
                  <option value="adjusted">Adjust Stock</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Quantity (bottles)</label>
                <input type="number" min="0" value={stockForm.quantity}
                  onChange={e => setStockForm(f => ({ ...f, quantity: parseFloat(e.target.value) || 0 }))}
                  style={{ ...inputStyle, width: '120px' }} required />
              </div>
              <button type="submit" style={btnStyle()}>Update</button>
              <button type="button" onClick={() => setShowStock(null)} style={btnStyle('#78716C')}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ color: '#C8760A', padding: '20px' }}>Loading...</div>
      ) : skus.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', color: '#78716C', padding: '40px' }}>
          No SKUs added yet. Click "+ Add SKU" to start.
        </div>
      ) : (
        <div style={cardStyle}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F5F5F4' }}>
                  {['Brand', 'SKU', 'Size', 'Rate/Bottle', 'Rate/Case', 'Stock', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 8px', color: '#78716C', fontWeight: '600' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {skus.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #F5F5F4' }}>
                    <td style={{ padding: '10px 8px', fontWeight: '600' }}>{s.brand_name}</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: '12px' }}>{s.sku_code}</td>
                    <td style={{ padding: '10px 8px', color: '#78716C' }}>{s.bottle_size_ml}ml</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'monospace' }}>₹{s.rate_per_bottle}</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'monospace' }}>₹{s.rate_per_case}</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontWeight: '700',
                      color: s.is_low ? '#DC2626' : '#16A34A' }}>
                      {s.current_stock_bottles} btls
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '999px',
                        fontSize: '11px', fontWeight: '600',
                        backgroundColor: s.is_low ? '#FEF2F2' : '#F0FDF4',
                        color: s.is_low ? '#DC2626' : '#16A34A'
                      }}>
                        {s.is_low ? '⚠️ Low' : '✅ OK'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <button
                        onClick={() => { setShowStock(s.id); setStockForm({ quantity: 0, type: 'received' }) }}
                        style={{
                          padding: '4px 12px', borderRadius: '6px',
                          fontSize: '12px', fontWeight: '600',
                          cursor: 'pointer', border: 'none',
                          backgroundColor: '#EFF6FF', color: '#2563EB',
                          fontFamily: 'inherit'
                        }}
                      >
                        Update Stock
                      </button>
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

// ─── PACKAGING TAB ───────────────────────────────────────
function PackagingTab() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showStock, setShowStock] = useState(null)
  const [message, setMessage] = useState(null)
  const [form, setForm] = useState({ name: '', unit: 'pcs', current_stock: 0, reorder_level: 0 })
  const [stockForm, setStockForm] = useState({ quantity: 0, type: 'received' })

  const load = () => {
    setLoading(true)
    api.get('/inventory/packaging')
      .then(res => setMaterials(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await api.post('/inventory/packaging', form)
      setMessage({ type: 'success', text: '✅ Packaging material added!' })
      setShowAdd(false)
      load()
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to add' })
    }
  }

  const handleStock = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/inventory/packaging/${showStock}/stock`, stockForm)
      setMessage({ type: 'success', text: '✅ Stock updated!' })
      setShowStock(null)
      load()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed' })
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <p style={{ fontSize: '13px', color: '#78716C' }}>Track labels, caps, cartons and other packaging</p>
        <button onClick={() => setShowAdd(!showAdd)} style={btnStyle()}>+ Add Material</button>
      </div>

      {message && (
        <div style={{
          padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
          marginBottom: '16px', fontWeight: '500',
          backgroundColor: message.type === 'success' ? '#F0FDF4' : '#FEF2F2',
          color: message.type === 'success' ? '#15803D' : '#DC2626'
        }}>{message.text}</div>
      )}

      {showAdd && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>Add Packaging Material</h3>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>Material Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={inputStyle} placeholder="e.g. Labels, Caps" required />
              </div>
              <div>
                <label style={labelStyle}>Unit</label>
                <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  style={inputStyle}>
                  <option value="pcs">pcs</option>
                  <option value="box">box</option>
                  <option value="roll">roll</option>
                  <option value="bundle">bundle</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Current Stock</label>
                <input type="number" min="0" value={form.current_stock}
                  onChange={e => setForm(f => ({ ...f, current_stock: parseFloat(e.target.value) || 0 }))}
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Reorder Level</label>
                <input type="number" min="0" value={form.reorder_level}
                  onChange={e => setForm(f => ({ ...f, reorder_level: parseFloat(e.target.value) || 0 }))}
                  style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" style={btnStyle()}>Save</button>
              <button type="button" onClick={() => setShowAdd(false)} style={btnStyle('#78716C')}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showStock && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
            Update Stock — {materials.find(m => m.id === showStock)?.name}
          </h3>
          <form onSubmit={handleStock}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <label style={labelStyle}>Type</label>
                <select value={stockForm.type}
                  onChange={e => setStockForm(f => ({ ...f, type: e.target.value }))}
                  style={inputStyle}>
                  <option value="received">Received</option>
                  <option value="consumed">Consumed</option>
                  <option value="adjusted">Adjust</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Quantity</label>
                <input type="number" min="0" value={stockForm.quantity}
                  onChange={e => setStockForm(f => ({ ...f, quantity: parseFloat(e.target.value) || 0 }))}
                  style={{ ...inputStyle, width: '120px' }} />
              </div>
              <button type="submit" style={btnStyle()}>Update</button>
              <button type="button" onClick={() => setShowStock(null)} style={btnStyle('#78716C')}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ color: '#C8760A', padding: '20px' }}>Loading...</div>
      ) : materials.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', color: '#78716C', padding: '40px' }}>
          No packaging materials added yet.
        </div>
      ) : (
        <div style={cardStyle}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F5F5F4' }}>
                  {['Material', 'Unit', 'Current Stock', 'Reorder Level', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 8px', color: '#78716C', fontWeight: '600' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {materials.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #F5F5F4' }}>
                    <td style={{ padding: '10px 8px', fontWeight: '600' }}>{m.name}</td>
                    <td style={{ padding: '10px 8px', color: '#78716C' }}>{m.unit}</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontWeight: '700',
                      color: m.is_low ? '#DC2626' : '#16A34A' }}>
                      {m.current_stock} {m.unit}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#78716C' }}>{m.reorder_level} {m.unit}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '999px',
                        fontSize: '11px', fontWeight: '600',
                        backgroundColor: m.is_low ? '#FEF2F2' : '#F0FDF4',
                        color: m.is_low ? '#DC2626' : '#16A34A'
                      }}>
                        {m.is_low ? '⚠️ Low' : '✅ OK'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <button
                        onClick={() => { setShowStock(m.id); setStockForm({ quantity: 0, type: 'received' }) }}
                        style={{
                          padding: '4px 12px', borderRadius: '6px',
                          fontSize: '12px', fontWeight: '600',
                          cursor: 'pointer', border: 'none',
                          backgroundColor: '#EFF6FF', color: '#2563EB',
                          fontFamily: 'inherit'
                        }}
                      >
                        Update Stock
                      </button>
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

// ─── ALERTS TAB ──────────────────────────────────────────
function AlertsTab() {
  const [alerts, setAlerts] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/inventory/alerts')
      .then(res => setAlerts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const alertCard = (title, items, unit = '') => (
    <div style={cardStyle}>
      <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#44403C', marginBottom: '12px' }}>
        {title} ({items.length})
      </h3>
      {items.length === 0 ? (
        <p style={{ color: '#16A34A', fontSize: '13px' }}>✅ All stock levels are healthy!</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #F5F5F4' }}>
              {['Item', 'Current Stock', 'Reorder Level'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px', color: '#78716C', fontWeight: '600' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #F5F5F4' }}>
                <td style={{ padding: '8px', fontWeight: '600', color: '#DC2626' }}>⚠️ {item.name}</td>
                <td style={{ padding: '8px', fontFamily: 'monospace', color: '#DC2626', fontWeight: '700' }}>
                  {item.current} {item.unit || unit}
                </td>
                <td style={{ padding: '8px', fontFamily: 'monospace', color: '#78716C' }}>
                  {item.reorder} {item.unit || unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )

  return (
    <div>
      <p style={{ fontSize: '13px', color: '#78716C', marginBottom: '16px' }}>
        Items that have reached or fallen below reorder levels
      </p>
      {loading ? (
        <div style={{ color: '#C8760A' }}>Loading alerts...</div>
      ) : !alerts ? (
        <div style={{ ...cardStyle, textAlign: 'center', color: '#78716C', padding: '40px' }}>
          Could not load alerts
        </div>
      ) : (
        <>
          {alerts.total_alerts === 0 ? (
            <div style={{
              ...cardStyle, textAlign: 'center',
              padding: '40px', backgroundColor: '#F0FDF4'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#16A34A' }}>
                All stock levels are healthy!
              </p>
              <p style={{ fontSize: '13px', color: '#78716C', marginTop: '4px' }}>
                No items below reorder level
              </p>
            </div>
          ) : (
            <>
              <div style={{
                ...cardStyle,
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                marginBottom: '16px'
              }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#DC2626' }}>
                  🚨 {alerts.total_alerts} item{alerts.total_alerts > 1 ? 's' : ''} need attention!
                </p>
              </div>
              {alertCard('🌾 Raw Materials', alerts.low_raw_materials)}
              {alertCard('📦 Finished Goods (SKU)', alerts.low_sku, 'bottles')}
              {alertCard('🏷️ Packaging Materials', alerts.low_packaging)}
            </>
          )}
        </>
      )}
    </div>
  )
}

// ─── MAIN INVENTORY PAGE ─────────────────────────────────
export default function Inventory() {
  const [activeTab, setActiveTab] = useState('raw')
  const [alertCount, setAlertCount] = useState(0)

  useEffect(() => {
    api.get('/inventory/alerts')
      .then(res => setAlertCount(res.data.total_alerts))
      .catch(() => {})
  }, [])

  const tabs = [
    { id: 'raw', label: '🌾 Raw Materials' },
    { id: 'sku', label: '📦 Finished Goods' },
    { id: 'packaging', label: '🏷️ Packaging' },
    { id: 'alerts', label: '🚨 Alerts' },
  ]

  return (
    <div style={{ maxWidth: '1000px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1C1917' }}>
          Inventory
          {alertCount > 0 && <AlertBadge count={alertCount} />}
        </h1>
        <p style={{ color: '#78716C', fontSize: '13px', marginTop: '4px' }}>
          Stock management — raw materials, finished goods & packaging
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={tabStyle(activeTab === tab.id)}
          >
            {tab.label}
            {tab.id === 'alerts' && alertCount > 0 && <AlertBadge count={alertCount} />}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'raw' && <RawMaterials />}
      {activeTab === 'sku' && <SKUTab />}
      {activeTab === 'packaging' && <PackagingTab />}
      {activeTab === 'alerts' && <AlertsTab />}
    </div>
  )
}