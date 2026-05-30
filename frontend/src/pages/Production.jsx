import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function Production() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [isEdit, setIsEdit] = useState(false)

  const emptyForm = {
    date: today, shift: 'Morning', operator: '',
    mahua: 0, sugar: 0, molasses: 0, grains: 0, yeast: 0, water: 0,
    wash_volume: 0, fermentation_hours: 0, wash_abv: 0,
    open_produced: 0, pkg_produced: 0, opening_stock: 0,
    spirit_abv: 0, low_wine_volume: 0,
    wastage_litres: 0, wastage_reason: '', notes: ''
  }

  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    setLoading(true)
    setMessage(null)
    api.get(`/production/${date}`)
      .then(res => { setForm(res.data); setIsEdit(true) })
      .catch(() => { setForm({ ...emptyForm, date }); setIsEdit(false) })
      .finally(() => setLoading(false))
  }, [date])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  // Auto calculate yield
  const totalRaw = parseFloat(form.molasses || 0) + parseFloat(form.mahua || 0) + parseFloat(form.grains || 0)
  const yieldPct = totalRaw > 0 ? ((parseFloat(form.open_produced || 0) / totalRaw) * 100).toFixed(2) : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      if (isEdit) {
        await api.put(`/production/${date}`, form)
      } else {
        await api.post('/production/', { ...form, date })
        setIsEdit(true)
      }
      setMessage({ type: 'success', text: '✅ Production entry saved successfully!' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Save failed' })
    } finally {
      setSaving(false)
    }
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

  const cardStyle = {
    backgroundColor: 'white', borderRadius: '12px',
    padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #F5F5F4', marginBottom: '16px'
  }

  const sectionTitle = (title, subtitle) => (
    <div style={{ marginBottom: '16px' }}>
      <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#44403C' }}>{title}</h2>
      {subtitle && <p style={{ fontSize: '11px', color: '#A8A29E', marginTop: '2px' }}>{subtitle}</p>}
    </div>
  )

  return (
    <div style={{ maxWidth: '800px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1C1917' }}>Production Entry</h1>
          <p style={{ color: '#78716C', fontSize: '13px', marginTop: '4px' }}>Record daily manufacturing batch</p>
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ ...inputStyle, width: 'auto' }} />
      </div>

      {loading ? (
        <div style={{ color: '#C8760A', padding: '20px', textAlign: 'center' }}>Loading...</div>
      ) : (
        <form onSubmit={handleSubmit}>

          {/* Batch Info */}
          <div style={cardStyle}>
            {sectionTitle('🏭 Batch Information')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              {isEdit && (
                <div>
                  <label style={labelStyle}>Batch Number</label>
                  <input value={form.batch_number || 'Auto-generated'} disabled
                    style={{ ...inputStyle, backgroundColor: '#F5F5F4', fontFamily: 'monospace', fontWeight: '700' }} />
                </div>
              )}
              <div>
                <label style={labelStyle}>Shift</label>
                <select name="shift" value={form.shift} onChange={handleChange} style={inputStyle}>
                  <option>Morning</option>
                  <option>Afternoon</option>
                  <option>Night</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Operator Name</label>
                <input name="operator" value={form.operator} onChange={handleChange}
                  style={inputStyle} placeholder="e.g. Ramesh Kumar" required />
              </div>
            </div>
          </div>

          {/* Raw Materials */}
          <div style={cardStyle}>
            {sectionTitle('🌾 Raw Materials Used', 'Enter quantities in kg')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
              {[
                { name: 'mahua', label: 'Mahua (kg)' },
                { name: 'molasses', label: 'Molasses (kg)' },
                { name: 'grains', label: 'Grains (kg)' },
                { name: 'sugar', label: 'Sugar (kg)' },
                { name: 'yeast', label: 'Yeast (kg)' },
                { name: 'water', label: 'Water (litres)' },
              ].map(({ name, label }) => (
                <div key={name}>
                  <label style={labelStyle}>{label}</label>
                  <input type="number" name={name} value={form[name]}
                    onChange={handleChange} min="0" step="0.01" style={inputStyle} />
                </div>
              ))}
            </div>
          </div>

          {/* Fermentation */}
          <div style={cardStyle}>
            {sectionTitle('🧪 Fermentation Details')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Wash Volume (litres)</label>
                <input type="number" name="wash_volume" value={form.wash_volume}
                  onChange={handleChange} min="0" step="0.01" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Fermentation Time (hours)</label>
                <input type="number" name="fermentation_hours" value={form.fermentation_hours}
                  onChange={handleChange} min="0" step="0.5" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Wash ABV (%)</label>
                <input type="number" name="wash_abv" value={form.wash_abv}
                  onChange={handleChange} min="0" max="100" step="0.1" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Distillation Output */}
          <div style={cardStyle}>
            {sectionTitle('⚗️ Distillation Output')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Open Spirit Produced (L)</label>
                <input type="number" name="open_produced" value={form.open_produced}
                  onChange={handleChange} min="0" step="0.01" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Packaged Produced (bottles)</label>
                <input type="number" name="pkg_produced" value={form.pkg_produced}
                  onChange={handleChange} min="0" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Low Wine Volume (L)</label>
                <input type="number" name="low_wine_volume" value={form.low_wine_volume}
                  onChange={handleChange} min="0" step="0.01" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Spirit ABV (%)</label>
                <input type="number" name="spirit_abv" value={form.spirit_abv}
                  onChange={handleChange} min="0" max="100" step="0.1" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Opening Stock (L)</label>
                <input type="number" name="opening_stock" value={form.opening_stock}
                  onChange={handleChange} min="0" step="0.01" style={inputStyle} />
              </div>
            </div>

            {/* Auto Yield */}
            <div style={{
              marginTop: '16px', padding: '12px 16px',
              backgroundColor: '#FEF3C7', borderRadius: '8px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#92400E' }}>
                📊 Calculated Yield Efficiency
              </span>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#C8760A', fontFamily: 'monospace' }}>
                {yieldPct}%
              </span>
            </div>
          </div>

          {/* Wastage */}
          <div style={cardStyle}>
            {sectionTitle('⚠️ Wastage / Loss')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Wastage (litres)</label>
                <input type="number" name="wastage_litres" value={form.wastage_litres}
                  onChange={handleChange} min="0" step="0.01" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Wastage Reason</label>
                <input name="wastage_reason" value={form.wastage_reason || ''}
                  onChange={handleChange} style={inputStyle}
                  placeholder="e.g. Spillage, evaporation, equipment loss" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div style={cardStyle}>
            {sectionTitle('📝 Batch Notes')}
            <textarea name="notes" value={form.notes || ''} onChange={handleChange}
              rows={3} style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Any remarks about this batch..." />
          </div>

          {/* Message */}
          {message && (
            <div style={{
              padding: '12px 16px', borderRadius: '8px',
              fontSize: '13px', fontWeight: '500', marginBottom: '16px',
              backgroundColor: message.type === 'success' ? '#F0FDF4' : '#FEF2F2',
              color: message.type === 'success' ? '#15803D' : '#DC2626'
            }}>
              {message.text}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={saving} style={{
            width: '100%',
            backgroundColor: saving ? '#D6D3D1' : '#C8760A',
            color: 'white', border: 'none',
            borderRadius: '10px', padding: '14px',
            fontSize: '14px', fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit'
          }}>
            {saving ? 'Saving...' : isEdit ? '✏️ Update Entry' : '💾 Save Entry'}
          </button>

        </form>
      )}
    </div>
  )
}