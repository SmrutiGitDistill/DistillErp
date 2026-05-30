import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const apiBaseURL = (import.meta.env.VITE_API_URL?.trim() || '').replace(/\/$/, '')

export default function Settings() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'superadmin'
  const isAdmin = user?.role === 'admin' || user?.role === 'owner' || isSuperAdmin

  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [message, setMessage] = useState(null)

  // Backup state
  const [backupLoading, setBackupLoading] = useState(false)
  const [backups, setBackups] = useState([])
  const [schedule, setSchedule] = useState({ frequency: 'daily', hour: 2, minute: 0 })
  const [backupMessage, setBackupMessage] = useState(null)

  // Password change state
  const [changingPassword, setChangingPassword] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [pwMessage, setPwMessage] = useState(null)

  // Company settings state
  const [companySettings, setCompanySettings] = useState(null)
  const [editingCompany, setEditingCompany] = useState(false)
  const [companyForm, setCompanyForm] = useState({})
  const [companyMessage, setCompanyMessage] = useState(null)
  const [companyLoading, setCompanyLoading] = useState(false)

  useEffect(() => {
    loadCompanySettings()
    if (isSuperAdmin) {
      loadUsers()
      loadBackups()
    }
  }, [isSuperAdmin])

  const loadCompanySettings = async () => {
    try {
      const res = await api.get('/settings/')
      setCompanySettings(res.data)
      setCompanyForm(res.data)
    } catch {
      setCompanySettings(null)
    }
  }

  const loadUsers = async () => {
    setUsersLoading(true)
    try {
      const res = await api.get('/auth/users')
      setUsers(res.data)
    } catch {
      setUsers([])
    }
    finally { setUsersLoading(false) }
  }

  const loadBackups = async () => {
    try {
      const res = await api.get('/backup/list')
      setBackups(res.data)
    } catch {
      setBackups([])
    }
  }

  const saveCompanySettings = async () => {
    setCompanyLoading(true)
    try {
      const res = await api.put('/settings/', companyForm)
      setCompanySettings(res.data)
      setCompanyForm(res.data)
      setEditingCompany(false)
      setCompanyMessage({ type: 'success', text: 'Company settings saved successfully.' })
    } catch {
      setCompanyMessage({ type: 'error', text: 'Failed to save settings.' })
    } finally {
      setCompanyLoading(false)
    }
  }

  const toggleUser = async (id) => {
    try {
      const res = await api.patch(`/auth/users/${id}/toggle-active`)
      setMessage({ type: 'success', text: res.data.message })
      loadUsers()
    } catch {
      setMessage({ type: 'error', text: 'Failed to update user' })
    }
  }

  const handlePasswordChange = async (userId) => {
    if (!newPassword || newPassword.length < 8) {
      setPwMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }
    try {
      await api.put(`/auth/users/${userId}/password`, { password: newPassword })
      setPwMessage({ type: 'success', text: '✅ Password updated successfully' })
      setNewPassword('')
      setChangingPassword(null)
      loadUsers()
    } catch (err) {
      setPwMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update password' })
    }
  }

  const runBackup = async () => {
    setBackupLoading(true)
    try {
      const res = await api.post('/backup/now')
      setBackupMessage({ type: 'success', text: `✅ ${res.data.message} — ${res.data.file}` })
      loadBackups()
    } catch {
      setBackupMessage({ type: 'error', text: '❌ Backup failed. Please try again.' })
    } finally {
      setBackupLoading(false)
    }
  }

  const saveSchedule = async () => {
    try {
      const res = await api.post('/backup/schedule', schedule)
      setBackupMessage({
        type: 'success',
        text: `✅ Schedule saved. Next run: ${new Date(res.data.next_run).toLocaleString('en-IN')}`
      })
    } catch {
      setBackupMessage({ type: 'error', text: '❌ Failed to save schedule' })
    }
  }

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #F5F5F4',
    marginBottom: '16px'
  }

  const inputStyle = {
    border: '1px solid #E7E5E4', borderRadius: '8px',
    padding: '8px 12px', fontSize: '13px',
    outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box'
  }

  const roleColor = (role) => {
    if (role === 'superadmin') return { bg: '#FEF3C7', color: '#92400E' }
    if (role === 'owner') return { bg: '#EDE9FE', color: '#5B21B6' }
    return { bg: '#E0F2FE', color: '#0369A1' }
  }

  const MessageBox = ({ msg }) => msg ? (
    <div style={{
      padding: '10px 14px', borderRadius: '8px',
      fontSize: '13px', marginBottom: '16px',
      backgroundColor: msg.type === 'success' ? '#F0FDF4' : '#FEF2F2',
      color: msg.type === 'success' ? '#15803D' : '#DC2626',
      fontWeight: '500'
    }}>
      {msg.text}
    </div>
  ) : null

  const Field = ({ label, value }) => (
    <div>
      <p style={{ fontSize: '11px', color: '#78716C', marginBottom: '4px' }}>{label}</p>
      <p style={{ fontWeight: '500', color: '#1C1917', fontSize: '13px' }}>{value || '—'}</p>
    </div>
  )

  return (
    <div style={{ maxWidth: '900px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1C1917' }}>Settings</h1>
        <p style={{ color: '#78716C', fontSize: '13px', marginTop: '4px' }}>
          System configuration and user management
        </p>
      </div>

      {/* Current User Info */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#44403C', marginBottom: '16px' }}>
          Your Account
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
          <Field label="Full Name" value={user?.full_name} />
          <Field label="Email" value={user?.email} />
          <div>
            <p style={{ fontSize: '11px', color: '#78716C', marginBottom: '4px' }}>Role</p>
            <span style={{
              display: 'inline-block',
              padding: '3px 12px', borderRadius: '999px',
              fontSize: '12px', fontWeight: '600',
              backgroundColor: roleColor(user?.role).bg,
              color: roleColor(user?.role).color
            }}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Company Profile */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#44403C' }}>
            Company Profile
          </h2>
          {isAdmin && !editingCompany && (
            <button
              onClick={() => { setEditingCompany(true); setCompanyMessage(null) }}
              style={{
                backgroundColor: '#F5F5F4', color: '#44403C',
                border: 'none', borderRadius: '8px',
                padding: '6px 14px', fontSize: '12px',
                fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              Edit
            </button>
          )}
        </div>

        <MessageBox msg={companyMessage} />

        {!companySettings ? (
          <p style={{ color: '#78716C', fontSize: '13px' }}>Loading...</p>
        ) : editingCompany ? (
          <div>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#44403C', marginBottom: '12px' }}>
              General Info
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {[
                { key: 'company_name', label: 'Company Name' },
                { key: 'location', label: 'Location' },
                { key: 'excise_licence', label: 'Excise Licence No.' },
                { key: 'gst_number', label: 'GST Number' },
                { key: 'phone', label: 'Phone' },
                { key: 'email', label: 'Email' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#78716C', marginBottom: '4px' }}>{label}</label>
                  <input
                    value={companyForm[key] || ''}
                    onChange={e => setCompanyForm(f => ({ ...f, [key]: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#78716C', marginBottom: '4px' }}>Default Shift</label>
                <select
                  value={companyForm.default_shift || 'Morning'}
                  onChange={e => setCompanyForm(f => ({ ...f, default_shift: e.target.value }))}
                  style={inputStyle}
                >
                  <option>Morning</option>
                  <option>Evening</option>
                  <option>Night</option>
                </select>
              </div>
            </div>

            <p style={{ fontSize: '12px', fontWeight: '600', color: '#44403C', marginBottom: '12px' }}>
              Price Slabs — Packaged
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {['p1', 'p2', 'p3'].map(k => (
                <div key={k} style={{ padding: '12px', backgroundColor: '#F8F7F4', borderRadius: '8px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#78716C', marginBottom: '4px' }}>Label ({k.toUpperCase()})</label>
                    <input value={companyForm[`label_${k}`] || ''} onChange={e => setCompanyForm(f => ({ ...f, [`label_${k}`]: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#78716C', marginBottom: '4px' }}>Rate (₹/bottle)</label>
                    <input type="number" value={companyForm[`rate_${k}`] || ''} onChange={e => setCompanyForm(f => ({ ...f, [`rate_${k}`]: parseFloat(e.target.value) || 0 }))} style={inputStyle} />
                  </div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '12px', fontWeight: '600', color: '#44403C', marginBottom: '12px' }}>
              Price Tiers — Open Liquor
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {['o1', 'o2', 'o3'].map(k => (
                <div key={k} style={{ padding: '12px', backgroundColor: '#F8F7F4', borderRadius: '8px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#78716C', marginBottom: '4px' }}>Label ({k.toUpperCase()})</label>
                    <input value={companyForm[`label_${k}`] || ''} onChange={e => setCompanyForm(f => ({ ...f, [`label_${k}`]: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#78716C', marginBottom: '4px' }}>Rate (₹/unit)</label>
                    <input type="number" value={companyForm[`rate_${k}`] || ''} onChange={e => setCompanyForm(f => ({ ...f, [`rate_${k}`]: parseFloat(e.target.value) || 0 }))} style={inputStyle} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={saveCompanySettings}
                disabled={companyLoading}
                style={{
                  backgroundColor: companyLoading ? '#D6D3D1' : '#C8760A', color: 'white',
                  border: 'none', borderRadius: '8px',
                  padding: '10px 20px', fontSize: '13px',
                  fontWeight: '600', cursor: companyLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                {companyLoading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => { setEditingCompany(false); setCompanyForm(companySettings); setCompanyMessage(null) }}
                style={{
                  backgroundColor: '#F5F5F4', color: '#78716C',
                  border: 'none', borderRadius: '8px',
                  padding: '10px 20px', fontSize: '13px',
                  fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <Field label="Company Name" value={companySettings.company_name} />
              <Field label="Location" value={companySettings.location} />
              <Field label="Excise Licence" value={companySettings.excise_licence} />
              <Field label="GST Number" value={companySettings.gst_number} />
              <Field label="Phone" value={companySettings.phone} />
              <Field label="Email" value={companySettings.email} />
              <Field label="Default Shift" value={companySettings.default_shift} />
            </div>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#44403C', marginBottom: '8px' }}>Price Slabs</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
              {['p1', 'p2', 'p3'].map(k => (
                <div key={k} style={{ padding: '8px 12px', backgroundColor: '#F0FDF4', borderRadius: '8px' }}>
                  <p style={{ fontSize: '11px', color: '#78716C' }}>{companySettings[`label_${k}`]} (Pkg)</p>
                  <p style={{ fontWeight: '600', color: '#15803D', fontSize: '13px' }}>₹{companySettings[`rate_${k}`]}/bottle</p>
                </div>
              ))}
              {['o1', 'o2', 'o3'].map(k => (
                <div key={k} style={{ padding: '8px 12px', backgroundColor: '#EFF6FF', borderRadius: '8px' }}>
                  <p style={{ fontSize: '11px', color: '#78716C' }}>{companySettings[`label_${k}`]} (Open)</p>
                  <p style={{ fontWeight: '600', color: '#2563EB', fontSize: '13px' }}>₹{companySettings[`rate_${k}`]}/unit</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Management — Superadmin only */}
      {isSuperAdmin && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#44403C', marginBottom: '16px' }}>
            User Management
          </h2>

          <MessageBox msg={message} />
          <MessageBox msg={pwMessage} />

          {usersLoading ? (
            <div style={{ color: '#C8760A', padding: '16px' }}>Loading users...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #F5F5F4' }}>
                    {['Name', 'Email', 'Role', 'Password', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '10px 8px',
                        color: '#78716C', fontWeight: '600',
                        whiteSpace: 'nowrap'
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <>
                      <tr key={u.id} style={{ borderBottom: '1px solid #F5F5F4' }}>
                        <td style={{ padding: '10px 8px', fontWeight: '500' }}>{u.full_name}</td>
                        <td style={{ padding: '10px 8px', color: '#78716C', fontSize: '12px' }}>{u.email}</td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{
                            padding: '2px 10px', borderRadius: '999px',
                            fontSize: '11px', fontWeight: '600',
                            backgroundColor: roleColor(u.role).bg,
                            color: roleColor(u.role).color
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{
                          padding: '10px 8px',
                          fontFamily: 'monospace',
                          color: u.role === 'superadmin' ? '#D1D5DB' : '#1C1917'
                        }}>
                          {u.plain_password}
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{
                            padding: '2px 10px', borderRadius: '999px',
                            fontSize: '11px', fontWeight: '600',
                            backgroundColor: u.is_active ? '#F0FDF4' : '#FEF2F2',
                            color: u.is_active ? '#16A34A' : '#DC2626'
                          }}>
                            {u.is_active ? '● Active' : '● Disabled'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {u.role !== 'superadmin' && (
                              <>
                                <button
                                  onClick={() => toggleUser(u.id)}
                                  style={{
                                    padding: '4px 12px', borderRadius: '6px',
                                    fontSize: '12px', fontWeight: '600',
                                    cursor: 'pointer', border: 'none',
                                    backgroundColor: u.is_active ? '#FEF2F2' : '#F0FDF4',
                                    color: u.is_active ? '#DC2626' : '#16A34A',
                                    fontFamily: 'inherit'
                                  }}
                                >
                                  {u.is_active ? 'Disable' : 'Enable'}
                                </button>
                                <button
                                  onClick={() => {
                                    setChangingPassword(changingPassword === u.id ? null : u.id)
                                    setNewPassword('')
                                    setPwMessage(null)
                                  }}
                                  style={{
                                    padding: '4px 12px', borderRadius: '6px',
                                    fontSize: '12px', fontWeight: '600',
                                    cursor: 'pointer', border: 'none',
                                    backgroundColor: '#EFF6FF', color: '#2563EB',
                                    fontFamily: 'inherit'
                                  }}
                                >
                                  Password
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {changingPassword === u.id && (
                        <tr key={`pw-${u.id}`} style={{ backgroundColor: '#F8F7F4' }}>
                          <td colSpan={6} style={{ padding: '12px 8px' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input
                                type="password"
                                placeholder="New password (min 8 chars)"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                style={{ ...inputStyle, width: '240px' }}
                              />
                              <button
                                onClick={() => handlePasswordChange(u.id)}
                                style={{
                                  backgroundColor: '#C8760A', color: 'white',
                                  border: 'none', borderRadius: '8px',
                                  padding: '8px 16px', fontSize: '13px',
                                  fontWeight: '600', cursor: 'pointer',
                                  fontFamily: 'inherit'
                                }}
                              >
                                Save
                              </button>
                              <button
                                onClick={() => { setChangingPassword(null); setNewPassword('') }}
                                style={{
                                  backgroundColor: '#F5F5F4', color: '#78716C',
                                  border: 'none', borderRadius: '8px',
                                  padding: '8px 16px', fontSize: '13px',
                                  fontWeight: '600', cursor: 'pointer',
                                  fontFamily: 'inherit'
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Backup Management — Superadmin only */}
      {isSuperAdmin && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#44403C', marginBottom: '16px' }}>
            Backup Management
          </h2>

          <MessageBox msg={backupMessage} />

          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '12px', color: '#78716C', marginBottom: '8px' }}>
              Create an immediate backup of all data
            </p>
            <button
              onClick={runBackup}
              disabled={backupLoading}
              style={{
                backgroundColor: backupLoading ? '#D6D3D1' : '#1C1917',
                color: 'white', border: 'none',
                borderRadius: '8px', padding: '10px 20px',
                fontSize: '13px', fontWeight: '600',
                cursor: backupLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit'
              }}
            >
              {backupLoading ? 'Creating backup...' : 'Backup Now'}
            </button>
          </div>

          <div style={{
            padding: '16px', backgroundColor: '#F8F7F4',
            borderRadius: '10px', marginBottom: '20px'
          }}>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#44403C', marginBottom: '12px' }}>
              Scheduled Automatic Backup
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#78716C', marginBottom: '4px' }}>Frequency</label>
                <select value={schedule.frequency} onChange={e => setSchedule(s => ({ ...s, frequency: e.target.value }))} style={{ ...inputStyle, width: 'auto' }}>
                  <option value="hourly">Every Hour</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#78716C', marginBottom: '4px' }}>Hour (0-23)</label>
                <input type="number" min="0" max="23" value={schedule.hour} onChange={e => setSchedule(s => ({ ...s, hour: parseInt(e.target.value) || 0 }))} style={{ ...inputStyle, width: '80px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#78716C', marginBottom: '4px' }}>Minute (0-59)</label>
                <input type="number" min="0" max="59" value={schedule.minute} onChange={e => setSchedule(s => ({ ...s, minute: parseInt(e.target.value) || 0 }))} style={{ ...inputStyle, width: '80px' }} />
              </div>
              <button onClick={saveSchedule} style={{ backgroundColor: '#C8760A', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                Save Schedule
              </button>
            </div>
          </div>

          {backups.length > 0 && (
            <div>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#44403C', marginBottom: '12px' }}>
                Recent Backups ({backups.length})
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #F5F5F4' }}>
                      {['File', 'Size', 'Created At', 'Download'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px', color: '#78716C', fontWeight: '600' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {backups.map(b => (
                      <tr key={b.filename} style={{ borderBottom: '1px solid #F5F5F4' }}>
                        <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '12px', color: '#44403C' }}>{b.filename}</td>
                        <td style={{ padding: '8px', color: '#78716C' }}>{b.size_kb} KB</td>
                        <td style={{ padding: '8px', color: '#78716C' }}>{new Date(b.created_at).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '8px' }}>
                          <a href={`${apiBaseURL}/backup/download/${encodeURIComponent(b.filename)}`} style={{ color: '#C8760A', fontWeight: '600', fontSize: '12px', textDecoration: 'none' }} download>
                            Download
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {backups.length === 0 && (
            <p style={{ color: '#78716C', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
              No backups yet. Click "Backup Now" to create your first backup.
            </p>
          )}
        </div>
      )}

      {/* Login Logs — Superadmin only */}
      {isSuperAdmin && <LoginLogs />}

      {/* Audit Log — Admin and above */}
      {isAdmin && <AuditLogs />}

    </div>
  )
}

function LoginLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/auth/login-logs')
      .then(res => setLogs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{
      backgroundColor: 'white', borderRadius: '12px',
      padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      border: '1px solid #F5F5F4', marginBottom: '16px'
    }}>
      <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#44403C', marginBottom: '16px' }}>
        Login Activity Log
      </h2>
      {loading ? (
        <div style={{ color: '#C8760A' }}>Loading logs...</div>
      ) : logs.length === 0 ? (
        <p style={{ color: '#78716C', fontSize: '13px' }}>No login activity yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #F5F5F4' }}>
                {['Email', 'IP Address', 'Status', 'Reason', 'Time'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px', color: '#78716C', fontWeight: '600' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #F5F5F4' }}>
                  <td style={{ padding: '8px', fontWeight: '500' }}>{log.email}</td>
                  <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '12px', color: '#78716C' }}>{log.ip_address}</td>
                  <td style={{ padding: '8px' }}>
                    <span style={{
                      padding: '2px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600',
                      backgroundColor: log.success ? '#F0FDF4' : '#FEF2F2',
                      color: log.success ? '#16A34A' : '#DC2626'
                    }}>
                      {log.success ? 'Success' : 'Failed'}
                    </span>
                  </td>
                  <td style={{ padding: '8px', color: '#78716C', fontSize: '12px' }}>{log.reason || '—'}</td>
                  <td style={{ padding: '8px', color: '#78716C', fontSize: '12px' }}>{new Date(log.created_at).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/audit/logs')
      .then(res => setLogs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const actionColor = (action) => {
    if (action === 'CREATE') return { bg: '#F0FDF4', color: '#16A34A' }
    if (action === 'UPDATE') return { bg: '#EFF6FF', color: '#2563EB' }
    if (action === 'DELETE') return { bg: '#FEF2F2', color: '#DC2626' }
    return { bg: '#F5F5F4', color: '#78716C' }
  }

  return (
    <div style={{
      backgroundColor: 'white', borderRadius: '12px',
      padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      border: '1px solid #F5F5F4', marginBottom: '16px'
    }}>
      <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#44403C', marginBottom: '16px' }}>
        Audit Log
      </h2>
      {loading ? (
        <div style={{ color: '#C8760A' }}>Loading audit log...</div>
      ) : logs.length === 0 ? (
        <p style={{ color: '#78716C', fontSize: '13px' }}>No audit entries yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #F5F5F4' }}>
                {['Time', 'User', 'Action', 'Entity', 'ID', 'Summary'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px', color: '#78716C', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #F5F5F4' }}>
                  <td style={{ padding: '8px', color: '#78716C', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '8px', fontSize: '12px', color: '#44403C' }}>{log.user_email || '—'}</td>
                  <td style={{ padding: '8px' }}>
                    <span style={{
                      padding: '2px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600',
                      backgroundColor: actionColor(log.action).bg,
                      color: actionColor(log.action).color
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '8px', color: '#78716C', fontSize: '12px' }}>{log.entity_type}</td>
                  <td style={{ padding: '8px', color: '#78716C', fontSize: '12px', fontFamily: 'monospace' }}>{log.entity_id || '—'}</td>
                  <td style={{ padding: '8px', color: '#44403C', fontSize: '12px' }}>{log.summary || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
