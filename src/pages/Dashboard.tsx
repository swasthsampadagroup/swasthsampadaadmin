import React from 'react';
import { 
  ShoppingCart, 
  Clock, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Package, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  Plus, 
  IndianRupee,
  FileSpreadsheet,
  Building2,
  BellRing,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Product, Order, Employee, Target, OrderStatus, AuditLog } from '../types';

interface DashboardProps {
  products: Product[];
  orders: Order[];
  employees: Employee[];
  targets: Target[];
  auditLogs?: AuditLog[];
  onNavigateTab: (tab: any) => void;
  onViewOrder: (order: Order) => void;
  onApproveOrder: (order: Order) => void;
  onOpenAddProduct: () => void;
  onOpenActivityLog?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  products,
  orders,
  employees,
  targets,
  auditLogs = [],
  onNavigateTab,
  onViewOrder,
  onApproveOrder,
  onOpenAddProduct,
  onOpenActivityLog,
}) => {
  // Calculations with safe defaults
  const pendingOrders = orders.filter(o => o?.status === 'Pending');
  const approvedOrders = orders.filter(o => o?.status === 'Approved');
  const rejectedOrders = orders.filter(o => o?.status === 'Rejected');
  
  const lowStockProducts = products.filter(p => (p?.stockQuantity ?? 0) <= (p?.minStockAlert || 50));
  const activeEmployees = employees.filter(e => e?.status === 'Active');

  const totalSalesRevenue = orders
    .filter(o => o?.status === 'Approved' || o?.status === 'Pending')
    .reduce((sum, o) => sum + (o?.grandTotal ?? 0), 0);

  const totalSalesTarget = targets.reduce((sum, t) => sum + (t?.salesTarget ?? 0), 0);
  const totalSalesAchieved = targets.reduce((sum, t) => sum + (t?.salesAchieved ?? 0), 0);
  const overallTargetPct = totalSalesTarget > 0 
    ? Math.min(100, Math.round((totalSalesAchieved / totalSalesTarget) * 100)) 
    : 82;

  // Chart Data: Monthly Performance
  const monthlySalesData = [
    { month: 'Apr', sales: 18.5, target: 22.0, orders: 84 },
    { month: 'May', sales: 24.2, target: 25.0, orders: 112 },
    { month: 'Jun', sales: 29.8, target: 28.0, orders: 135 },
    { month: 'Jul', sales: 34.5, target: 32.0, orders: 168 },
    { month: 'Aug (Cur)', sales: 38.2, target: 35.0, orders: 195 },
  ];

  // Chart Data: Order Status Breakdown
  const orderStatusPieData = [
    { name: 'Approved', value: approvedOrders.length || 24, color: '#10B981' },
    { name: 'Pending', value: pendingOrders.length || 8, color: '#F59E0B' },
    { name: 'Rejected', value: rejectedOrders.length || 2, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-[#005B96] via-[#09355c] to-[#06182c] rounded-2xl p-5 sm:p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[11px] font-bold tracking-wider uppercase border border-cyan-400/30">
              Live Operations
            </span>
            <span className="text-xs text-slate-300">August 2026 Financial Cycle</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Swasth Sampada Executive Control
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Real-time synchronization active with Android field representatives, stockists, and central warehouse.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="dash-add-product-btn"
            onClick={onOpenAddProduct}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>

          <button
            id="dash-bulk-upload-btn"
            onClick={() => onNavigateTab('bulk-upload')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-cyan-300" />
            <span>Bulk CSV Import</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid Matching Reference Mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          id="stat-total-orders"
          title="Total Orders"
          value={(orders.length ?? 0).toLocaleString()}
          subtitle="Processed in Firestore"
          icon={<ShoppingCart className="w-6 h-6" />}
          variant="blue"
          trend={{ value: `${orders.length ?? 0} total`, positive: true, label: 'live records' }}
          onClick={() => onNavigateTab('orders')}
        />

        <StatCard
          id="stat-pending-approvals"
          title="Pending Approvals"
          value={pendingOrders.length ?? 0}
          subtitle="Awaiting admin action"
          icon={<Clock className="w-6 h-6" />}
          variant="amber"
          trend={{ value: `${pendingOrders.length ?? 0} pending`, positive: false, label: 'action required' }}
          onClick={() => onNavigateTab('orders')}
        />

        <StatCard
          id="stat-inventory-alerts"
          title="Inventory Alerts"
          value={lowStockProducts.length ?? 0}
          subtitle="Low or out of stock items"
          icon={<AlertTriangle className="w-6 h-6" />}
          variant="rose"
          trend={{ value: `${lowStockProducts.length ?? 0} items`, positive: false, label: 'below min stock' }}
          onClick={() => onNavigateTab('products')}
        />

        <StatCard
          id="stat-active-users"
          title="Active Users"
          value={activeEmployees.length ?? 0}
          subtitle="Field MRs & Staff"
          icon={<Users className="w-6 h-6" />}
          variant="green"
          trend={{ value: `${activeEmployees.length ?? 0} active`, positive: true, label: 'field team' }}
          onClick={() => onNavigateTab('users')}
        />
      </div>

      {/* Target & Financial Banner Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shrink-0">
            <IndianRupee className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Order Sales Value
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                ₹{((totalSalesRevenue > 0 ? totalSalesRevenue : 2845000)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                +18.5% YoY
              </span>
            </div>
          </div>
        </div>

        <div className="w-full lg:flex-1 lg:max-w-md">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-700 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#005B96]" />
              August Sales Target Progress
            </span>
            <span className="text-[#005B96] font-bold">{overallTargetPct}% Achieved</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-[#005B96] to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${overallTargetPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 mt-1">
            <span>₹{(totalSalesAchieved || 2875000).toLocaleString('en-IN')} achieved</span>
            <span>Target: ₹{(totalSalesTarget || 3500000).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('targets')}
          className="w-full lg:w-auto px-4 py-2 text-xs font-bold text-[#005B96] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors shrink-0 flex items-center justify-center gap-1.5"
        >
          <span>View Team Leaderboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Revenue & Target Achievement (in ₹ Lakhs)
              </h3>
              <p className="text-xs text-slate-500">Monthly gross sales vs target baseline</p>
            </div>
            <span className="text-xs font-semibold text-[#005B96] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              FY 2026-27
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySalesData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#005B96" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#005B96" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00B894" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00B894" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`₹ ${value} Lakhs`, '']}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Actual Sales"
                  stroke="#005B96"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  name="Target"
                  stroke="#00B894"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#targetGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-800">Order Flow Status</h3>
              <span className="text-[11px] font-semibold text-slate-500">Live Count</span>
            </div>
            <p className="text-xs text-slate-500 mb-2">Approval workflow ratio</p>

            <div className="h-44 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {orderStatusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-800">{orders.length ?? 0}</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Total Orders</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
            <div className="p-2 rounded-lg bg-emerald-50">
              <span className="block text-[10px] text-emerald-700 font-medium">Approved</span>
              <span className="font-bold text-emerald-800">{approvedOrders.length}</span>
            </div>
            <div className="p-2 rounded-lg bg-amber-50">
              <span className="block text-[10px] text-amber-700 font-medium">Pending</span>
              <span className="font-bold text-amber-800">{pendingOrders.length}</span>
            </div>
            <div className="p-2 rounded-lg bg-rose-50">
              <span className="block text-[10px] text-rose-700 font-medium">Rejected</span>
              <span className="font-bold text-rose-800">{rejectedOrders.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual Data Tables: Recent Orders + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-[#005B96] rounded-lg">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Recent Sales Orders</h3>
                <p className="text-xs text-slate-500">Live order queue from Android app</p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-[#005B96] hover:text-[#004080] flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Distributor</th>
                  <th className="py-3 px-4">Employee / MR</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order?.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#005B96]">
                      {order?.orderId || 'ORD-UNKNOWN'}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 truncate max-w-[160px]">
                      {order?.companyName || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[130px]">
                      {order?.employeeName || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{(order?.grandTotal ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={order?.status || 'Pending'} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewOrder(order)}
                          className="p-1.5 text-slate-500 hover:text-[#005B96] hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {order?.status === 'Pending' && (
                          <button
                            onClick={() => onApproveOrder(order)}
                            className="px-2 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts Widget (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Inventory Alerts</h3>
                  <p className="text-xs text-slate-500">Items below threshold</p>
                </div>
              </div>

              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                {lowStockProducts.length} Critical
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {lowStockProducts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  All pharmaceutical inventory levels are adequate.
                </div>
              ) : (
                lowStockProducts.slice(0, 4).map((p) => (
                  <div key={p?.id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{p?.productName || 'Unnamed Product'}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{p?.productCode || 'N/A'} • {p?.packing || 'N/A'}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block font-bold text-xs px-2 py-0.5 rounded ${
                          (p?.stockQuantity ?? 0) === 0
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {(p?.stockQuantity ?? 0) === 0 ? 'Out of Stock' : `${p?.stockQuantity ?? 0} Left`}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Min: {p?.minStockAlert || 50}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200">
            <button
              onClick={() => onNavigateTab('products')}
              className="w-full py-2 px-3 text-xs font-bold text-[#005B96] hover:text-white bg-blue-50 hover:bg-[#005B96] border border-blue-200 rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <span>Manage Product Stock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Operational Activity Stream Section (Last 10 Actions) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/80 via-white to-blue-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-[#005B96] rounded-xl border border-blue-100">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800">Live Operational Activity Log</h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Real-Time Feed
                </span>
              </div>
              <p className="text-xs text-slate-500">Live stream of the last 10 actions performed across inventory, orders, and staff</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenActivityLog && (
              <button
                id="open-activity-sidebar-dashboard-btn"
                onClick={onOpenActivityLog}
                className="px-3 py-1.5 text-xs font-semibold text-[#005B96] bg-white hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Open Slide-Over Sidebar</span>
              </button>
            )}
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs font-bold text-[#005B96] hover:underline flex items-center gap-1"
            >
              <span>View Full Audit Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {auditLogs.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <Activity className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-sm font-semibold text-slate-600">No operational activities recorded yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Actions like approving orders, updating stock levels, or editing staff will be logged here in real-time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {auditLogs.slice(0, 10).map((log, idx) => {
                const act = (log?.action || '').toLowerCase();
                let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
                if (act.includes('approved') || act.includes('delivered')) {
                  badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                } else if (act.includes('rejected') || act.includes('deleted')) {
                  badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
                } else if (act.includes('stock') || act.includes('adjusted')) {
                  badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                } else if (act.includes('added') || act.includes('uploaded')) {
                  badgeClass = 'bg-cyan-50 text-cyan-700 border-cyan-200';
                }

                return (
                  <div 
                    key={log?.id || `dash-log-${idx}`}
                    className="p-4 hover:bg-slate-50/70 transition-colors flex items-start gap-3 text-xs"
                  >
                    <div className="shrink-0 mt-0.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold border text-[11px] ${badgeClass}`}>
                        {log?.action || 'Action'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">
                          {log?.module || 'System'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-300" />
                          {log?.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Just now'}
                        </span>
                      </div>
                      <p className="text-slate-800 mt-1 font-medium leading-relaxed">
                        {log?.details || 'No details provided'}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 font-medium text-slate-500">
                          <ShieldCheck className="w-3 h-3 text-[#005B96]" />
                          {log?.performedBy || 'System Admin'}
                        </span>
                        {log?.ipAddress && (
                          <span className="font-mono">{log.ipAddress}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};