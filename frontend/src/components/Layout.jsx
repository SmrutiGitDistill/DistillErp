import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Factory, Package, ShoppingCart,
  Receipt, BarChart3, BookOpen, Settings, LogOut, Menu, X
} from 'lucide-react'

const SIDEBAR_W = 224

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/production', icon: Factory, label: 'Production' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/sales', icon: ShoppingCart, label: 'Sales' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/ledger', icon: BookOpen, label: 'Daily Ledger' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const getIsDesktop = () => window.innerWidth >= 768
  const [isDesktop, setIsDesktop] = useState(getIsDesktop)
  const [sidebarOpen, setSidebarOpen] = useState(getIsDesktop)

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })

  useEffect(() => {
    const onResize = () => {
      const desktop = getIsDesktop()
      setIsDesktop(desktop)
      // Auto-open on desktop, auto-close on mobile when resizing
      setSidebarOpen(desktop)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNavClick = () => {
    if (!isDesktop) setSidebarOpen(false)
  }

  const roleColor = (role) => {
    if (role === 'superadmin') return { bg: '#FEF3C7', color: '#92400E' }
    if (role === 'owner') return { bg: '#EDE9FE', color: '#5B21B6' }
    return { bg: '#E0F2FE', color: '#0369A1' }
  }

  const mobileOverlay = !isDesktop && sidebarOpen

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative' }}>

      {/* Mobile overlay */}
      {mobileOverlay && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        position: 'fixed',
        top: 0,
        left: sidebarOpen ? 0 : `-${SIDEBAR_W}px`,
        width: `${SIDEBAR_W}px`,
        height: '100vh',
        backgroundColor: '#1C1917',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        transition: 'left 0.25s ease',
        boxShadow: mobileOverlay ? '4px 0 24px rgba(0,0,0,0.35)' : 'none',
      }}>

        {/* Brand header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #292524',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <span style={{ fontSize: '22px', flexShrink: 0 }}>🏭</span>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: 'white', fontWeight: '700', fontSize: '14px', lineHeight: 1.2 }}>DistillERP</p>
              <p style={{ color: '#A8A29E', fontSize: '11px' }}>Factory System</p>
            </div>
          </div>
          {/* Only show close button on mobile */}
          {!isDesktop && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'none', border: 'none',
                color: '#A8A29E', cursor: 'pointer',
                padding: '4px', borderRadius: '6px',
                flexShrink: 0, lineHeight: 0,
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={handleNavClick}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '2px',
                fontSize: '13px',
                fontWeight: '500',
                textDecoration: 'none',
                backgroundColor: isActive ? '#C8760A' : 'transparent',
                color: isActive ? 'white' : '#A8A29E',
                transition: 'background-color 0.15s, color 0.15s',
              })}
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div style={{ borderTop: '1px solid #292524', padding: '12px' }}>
          <div style={{ padding: '6px 8px 10px' }}>
            <p style={{ color: 'white', fontSize: '12px', fontWeight: '600', lineHeight: 1.3 }}>
              {user?.full_name}
            </p>
            <p style={{ color: '#A8A29E', fontSize: '11px', marginTop: '1px' }}>{user?.email}</p>
            <span style={{
              display: 'inline-block', marginTop: '6px',
              padding: '2px 10px', borderRadius: '999px',
              fontSize: '10px', fontWeight: '600',
              backgroundColor: roleColor(user?.role).bg,
              color: roleColor(user?.role).color,
            }}>
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 12px', borderRadius: '8px',
              color: '#A8A29E', background: 'none',
              border: 'none', cursor: 'pointer',
              fontSize: '13px', width: '100%',
              fontFamily: 'inherit', transition: 'background-color 0.15s, color 0.15s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.backgroundColor = '#7F1D1D'
              e.currentTarget.style.color = '#FCA5A5'
            }}
            onMouseOut={e => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#A8A29E'
            }}
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main column — shifts right to make room for the persistent sidebar on desktop */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0,
        marginLeft: isDesktop && sidebarOpen ? `${SIDEBAR_W}px` : 0,
        transition: 'margin-left 0.25s ease',
      }}>

        {/* Top bar */}
        <header style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #E7E5E4',
          padding: '0 16px',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            {/* Hamburger — opens sidebar on mobile, toggles on desktop */}
            <button
              onClick={() => setSidebarOpen(o => !o)}
              style={{
                background: 'none', border: 'none',
                cursor: 'pointer', padding: '6px',
                borderRadius: '8px', color: '#44403C',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#F5F5F4'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Menu size={20} />
            </button>

            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#1C1917', lineHeight: 1.2 }}>DistillERP</p>
              <p style={{ fontSize: '11px', color: '#A8A29E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {today}
              </p>
            </div>
          </div>

          <span style={{
            backgroundColor: roleColor(user?.role).bg,
            color: roleColor(user?.role).color,
            fontSize: '11px', fontWeight: '600',
            padding: '4px 12px', borderRadius: '999px',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {user?.role === 'superadmin' ? '👑' : '👤'} {user?.full_name}
          </span>
        </header>

        {/* Page content */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: isDesktop ? '24px' : '12px',
          backgroundColor: '#F8F7F4',
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}
