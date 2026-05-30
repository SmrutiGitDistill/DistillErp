import { useState, useEffect } from 'react'
import api from '../api/axios'
import { TrendingUp, TrendingDown, Factory, ShoppingCart, Receipt, Package } from 'lucide-react'

function KpiCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className={`bg-white rounded-xl border-t-4 ${color} p-5 shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">{label}</span>
        <Icon size={18} className="text-stone-400" />
      </div>
      <p className="text-2xl font-bold font-mono text-stone-800">{value}</p>
      {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    api.get(`/dashboard/summary/${today}`)
      .then(res => setSummary(res.data))
      .catch(() => setError('Could not load dashboard data'))
      .finally(() => setLoading(false))
  }, [today])

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-amber-600 font-medium animate-pulse">Loading dashboard...</div>
    </div>
  )

  if (error) return (
    <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>
  )

  const { production, sales, expenses, inventory, financials } = summary

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Dashboard</h1>
        <p className="text-stone-500 text-sm mt-1">Today's operational overview</p>
      </div>

      {/* Entry Status */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-100">
        <h2 className="text-sm font-semibold text-stone-600 mb-3">Today's Entry Status</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Production', entered: production.entered },
            { label: 'Sales', entered: sales.entered },
            { label: 'Expenses', entered: expenses.entered },
          ].map(({ label, entered }) => (
            <span key={label} className={`px-4 py-1.5 rounded-full text-xs font-semibold
              ${entered ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {label}: {entered ? '✓ Entered' : '⏳ Pending'}
            </span>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Sales"
          value={fmt(financials.total_sales)}
          icon={ShoppingCart}
          color="border-green-500"
          sub="Today's revenue"
        />
        <KpiCard
          label="Total Expenses"
          value={fmt(financials.total_expenses)}
          icon={Receipt}
          color="border-red-500"
          sub="Today's costs"
        />
        <KpiCard
          label="Net Profit"
          value={fmt(financials.net_profit)}
          icon={financials.is_profit ? TrendingUp : TrendingDown}
          color={financials.is_profit ? 'border-amber-500' : 'border-red-500'}
          sub={financials.is_profit ? '📈 Profitable' : '📉 Loss'}
        />
        <KpiCard
          label="Open Balance"
          value={`${inventory.open_balance} L`}
          icon={Package}
          color="border-blue-500"
          sub={`Pkg: ${inventory.pkg_balance} bottles`}
        />
      </div>

      {/* Production Info */}
      {production.entered && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-100">
          <h2 className="text-sm font-semibold text-stone-600 mb-3">
            <Factory size={16} className="inline mr-2" />
            Production Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-stone-400 text-xs">Batch</p>
              <p className="font-mono font-semibold text-stone-800">{production.batch_number}</p>
            </div>
            <div>
              <p className="text-stone-400 text-xs">Shift</p>
              <p className="font-semibold text-stone-800">{production.shift}</p>
            </div>
            <div>
              <p className="text-stone-400 text-xs">Open Produced</p>
              <p className="font-semibold text-stone-800">{production.open_produced} L</p>
            </div>
            <div>
              <p className="text-stone-400 text-xs">Pkg Produced</p>
              <p className="font-semibold text-stone-800">{production.pkg_produced} bottles</p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
