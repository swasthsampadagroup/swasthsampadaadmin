import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Filter, 
  TrendingUp, 
  Package, 
  Users, 
  Building2, 
  IndianRupee,
  FileSpreadsheet
} from 'lucide-react';
import { Order, Product, Employee, Distributor } from '../types';

interface ReportsProps {
  orders: Order[];
  products: Product[];
  employees: Employee[];
  distributors: Distributor[];
}

export const Reports: React.FC<ReportsProps> = ({
  orders = [],
  products = [],
  employees = [],
  distributors = [],
}) => {
  const [reportType, setReportType] = useState<'sales' | 'products' | 'employees' | 'distributors'>('sales');
  const [timeRange, setTimeRange] = useState<'ALL' | 'THIS_MONTH' | 'LAST_30_DAYS'>('ALL');

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeEmployees = Array.isArray(employees) ? employees : [];
  const safeDistributors = Array.isArray(distributors) ? distributors : [];

  // Calculations with safe fallbacks
  const approvedOrders = safeOrders.filter(o => o?.status === 'Approved');
  const grossSales = approvedOrders.reduce((s, o) => s + (o?.grandTotal ?? 0), 0);
  const totalGST = approvedOrders.reduce((s, o) => s + (o?.gstAmount ?? 0), 0);
  const totalUnits = approvedOrders.reduce((s, o) => {
    const items = Array.isArray(o?.items) ? o.items : [];
    return s + items.reduce((sum, i) => sum + (i?.quantity ?? 0), 0);
  }, 0);

  // Export to CSV
  const handleExportCSV = () => {
    let csvContent = '';
    let filename = '';

    if (reportType === 'sales') {
      filename = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = 'Order ID,Date,Distributor,MR / Employee,HQ,Subtotal (INR),GST (INR),Grand Total (INR),Status\n';
      safeOrders.forEach(o => {
        csvContent += `"${o?.orderId || ''}","${o?.orderDate || ''}","${o?.companyName || ''}","${o?.employeeName || ''}","${o?.hq || ''}",${o?.subtotal ?? 0},${o?.gstAmount ?? 0},${o?.grandTotal ?? 0},"${o?.status || ''}"\n`;
      });
    } else if (reportType === 'products') {
      filename = `product_sales_report_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = 'Product Code,Product Name,Category,Packing,MRP,PTS,Stock,GST %\n';
      safeProducts.forEach(p => {
        csvContent += `"${p?.productCode || ''}","${p?.productName || ''}","${p?.category || ''}","${p?.packing || ''}",${p?.mrp ?? 0},${p?.pts ?? 0},${p?.stockQuantity ?? 0},${p?.gst ?? 0}\n`;
      });
    } else if (reportType === 'employees') {
      filename = `staff_performance_report_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = 'Employee ID,Name,Email,Phone,Designation,Role,HQ,State,Zone,Reporting Manager,Join Date,Monthly Target (INR),Status\n';
      safeEmployees.forEach(e => {
        csvContent += `"${e?.employeeId || ''}","${e?.name || ''}","${e?.email || ''}","${e?.phone || ''}","${e?.staffType || ''}","${e?.role || ''}","${e?.hq || ''}","${e?.state || ''}","${e?.zone || ''}","${e?.reportingTo || ''}","${e?.joinDate || ''}",${e?.monthlyTarget ?? 0},"${e?.status || 'Active'}"\n`;
      });
    } else {
      filename = `distributor_network_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = 'Stockist ID,Agency Name,Contact Person,Email,Phone,Reporting Employee,Role,HQ,Status\n';
      safeDistributors.forEach(d => {
        csvContent += `"${d?.distributorId || ''}","${d?.companyName || ''}","${d?.contactPerson || ''}","${d?.email || ''}","${d?.phone || ''}","${d?.assignedEmployeeName || ''}","${d?.role || ''}","${d?.hq || ''}","${d?.status || ''}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Business Analytics & Executive Reports</span>
            <span className="text-xs font-semibold bg-blue-100 text-[#005B96] px-2.5 py-0.5 rounded-full">
              Export Ready
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-ready GST statements, inventory movement ledgers, and field force productivity
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#005B96] hover:bg-[#004875] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export {reportType.toUpperCase()} CSV</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Gross Approved Revenue</p>
          <p className="text-2xl font-black text-slate-900 mt-1">₹{(grossSales ?? 0).toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">From {approvedOrders.length} processed orders</p>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total GST Collected</p>
          <p className="text-2xl font-black text-[#005B96] mt-1">₹{(totalGST ?? 0).toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-400 mt-1">Output tax liability</p>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Units Dispatched</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{(totalUnits ?? 0).toLocaleString('en-IN')} units</p>
          <p className="text-[11px] text-slate-400 mt-1">Across all product lines</p>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Avg Order Ticket Value</p>
          <p className="text-2xl font-black text-teal-600 mt-1">
            ₹{approvedOrders.length > 0 ? Math.round(grossSales / approvedOrders.length).toLocaleString('en-IN') : 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Per approved invoice</p>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap gap-2 text-xs font-bold">
        {[
          { key: 'sales', label: 'Sales & Invoice Statement', icon: TrendingUp },
          { key: 'products', label: 'Product Stock & Pricing Ledger', icon: Package },
          { key: 'employees', label: 'Field Staff Performance', icon: Users },
          { key: 'distributors', label: 'Stockist Credit & Outstandings', icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = reportType === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setReportType(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                isSelected
                  ? 'bg-[#005B96] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Report Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm capitalize">
            {reportType.replace('_', ' ')} Records ({reportType === 'sales' ? safeOrders.length : reportType === 'products' ? safeProducts.length : reportType === 'employees' ? safeEmployees.length : safeDistributors.length})
          </h3>
          <span className="text-[11px] text-slate-400">Real-time sync</span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          {reportType === 'sales' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold sticky top-0">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Distributor</th>
                  <th className="py-3 px-4">MR / HQ</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                  <th className="py-3 px-4 text-right">GST</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {safeOrders.map(o => (
                  <tr key={o?.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-[#005B96]">{o?.orderId || 'N/A'}</td>
                    <td className="py-2.5 px-4 text-slate-500">{o?.orderDate ? new Date(o.orderDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">{o?.companyName || 'N/A'}</td>
                    <td className="py-2.5 px-4 text-slate-600">{o?.employeeName || 'N/A'} ({o?.hq || 'N/A'})</td>
                    <td className="py-2.5 px-4 text-right font-mono">₹{(o?.subtotal ?? 0).toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-600">₹{(o?.gstAmount ?? 0).toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">₹{(o?.grandTotal ?? 0).toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        o?.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {o?.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'products' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold sticky top-0">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Packing</th>
                  <th className="py-3 px-4 text-right">MRP</th>
                  <th className="py-3 px-4 text-right">PTR</th>
                  <th className="py-3 px-4 text-right">PTS</th>
                  <th className="py-3 px-4 text-center">GST</th>
                  <th className="py-3 px-4 text-center">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {safeProducts.map(p => (
                  <tr key={p?.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-[#005B96]">{p?.productCode || 'N/A'}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{p?.productName || 'N/A'}</td>
                    <td className="py-2.5 px-4 text-slate-600">{p?.packing || 'N/A'}</td>
                    <td className="py-2.5 px-4 text-right font-mono">₹{p?.mrp ?? 0}</td>
                    <td className="py-2.5 px-4 text-right font-mono">₹{p?.ptr ?? 0}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold">₹{p?.pts ?? 0}</td>
                    <td className="py-2.5 px-4 text-center">{p?.gst ?? 0}%</td>
                    <td className="py-2.5 px-4 text-center font-bold text-slate-800">{p?.stockQuantity ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'employees' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold sticky top-0">
                <tr>
                  <th className="py-3 px-4">Emp ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email ID</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">HQ & Zone</th>
                  <th className="py-3 px-4">Reporting To</th>
                  <th className="py-3 px-4">Join Date</th>
                  <th className="py-3 px-4 text-right">Monthly Target</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {safeEmployees.map(e => (
                  <tr key={e?.id} className="hover:bg-slate-50 align-top">
                    <td className="py-2.5 px-4 font-mono font-bold text-[#005B96]">{e?.employeeId || 'N/A'}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{e?.name || 'N/A'}</td>
                    <td className="py-2.5 px-4 text-slate-600 break-all">{e?.email || 'N/A'}</td>
                    <td className="py-2.5 px-4 text-slate-600">{e?.phone || 'N/A'}</td>
                    <td className="py-2.5 px-4 text-slate-600">
                      <div className="font-medium">{e?.staffType || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{e?.role || 'Employee'}</div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      <div className="font-medium">{e?.hq || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500">{e?.state || 'N/A'} / {e?.zone || 'N/A'}</div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-700">{e?.reportingTo || 'Managing Director'}</td>
                    <td className="py-2.5 px-4 text-slate-600">{e?.joinDate ? new Date(e.joinDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold">₹{((e?.monthlyTarget ?? 300000)).toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        (e?.status || 'Active') === 'Active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : (e?.status || 'Active') === 'Pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {e?.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'distributors' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold sticky top-0">
                <tr>
                  <th className="py-3 px-4">Stockist ID</th>
                  <th className="py-3 px-4">Agency Name</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Reporting Employee</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">HQ</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {safeDistributors.map(d => (
                  <tr key={d?.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-[#005B96]">{d?.distributorId || 'N/A'}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{d?.companyName || 'N/A'}</td>
                    <td className="py-2.5 px-4 text-slate-600">{d?.contactPerson || 'N/A'} ({d?.phone || 'N/A'})</td>
                    <td className="py-2.5 px-4 text-slate-600 text-[10px]">{d?.email || 'N/A'}</td>
                    <td className="py-2.5 px-4 text-slate-700">{d?.assignedEmployeeName || 'N/A'}</td>
                    <td className="py-2.5 px-4 text-slate-700">{d?.role || 'N/A'}</td>
                    <td className="py-2.5 px-4 text-slate-700">{d?.hq || 'N/A'}</td>
                    <td className="py-2.5 px-4 text-center font-semibold">{d?.status || 'Active'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};