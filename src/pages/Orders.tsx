import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShoppingCart, 
  FileText, 
  Printer, 
  User, 
  Building2, 
  Calendar,
  AlertTriangle,
  IndianRupee,
  ShieldCheck
} from 'lucide-react';
import { Distributor, Order, OrderStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

interface OrdersProps {
  orders: Order[];
  distributors?: Distributor[];
  onUpdateOrderStatus: (
    orderId: string, 
    newStatus: OrderStatus, 
    performedBy?: string, 
    reason?: string
  ) => Promise<Order | null>;
  selectedOrderForModal?: Order | null;
  onCloseOrderModal?: () => void;
}

export const Orders: React.FC<OrdersProps> = ({
  orders = [],
  distributors = [],
  onUpdateOrderStatus,
  selectedOrderForModal = null,
  onCloseOrderModal,
}) => {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHQ, setSelectedHQ] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Detail Modal
  const [activeOrder, setActiveOrder] = useState<Order | null>(selectedOrderForModal);

  // Rejection Modal
  const [rejectOrderId, setRejectOrderId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Insufficient warehouse stock or payment clearance pending.');

  // Approval Confirm Dialog
  const [approveConfirmOrder, setApproveConfirmOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeDistributors = Array.isArray(distributors) ? distributors : [];
  const getDistributor = (order: Order) => safeDistributors.find((item) =>
    item.id === order.distributorId || item.distributorId === order.distributorId
  );
  const getDistributorName = (order: Order) => {
    if (order.companyName) return order.companyName;

    return getDistributor(order)?.companyName || 'Unknown Distributor';
  };
  const getOrderHQ = (order: Order) => order.hq || getDistributor(order)?.hq || '';
  const getOrderRole = (order: Order) => order.role || 'unknown';
  const hqs = ['ALL', ...Array.from(new Set(safeOrders.map(getOrderHQ).filter(Boolean)))];

  // Safe Filtering Logic
  const filteredOrders = safeOrders.filter(order => {
    if (!order) return false;
    
    const statusStr = String(order.status || '').toUpperCase();
    const matchesTab = activeTab === 'ALL' || statusStr === activeTab;
    
    const searchLower = (searchTerm || '').toLowerCase();
    const orderId = String(order.orderId ?? '').toLowerCase();
    const companyName = getDistributorName(order).toLowerCase();
    const employeeName = String(order.employeeName ?? '').toLowerCase();
    const invoiceNumber = String(order.invoiceNumber ?? '').toLowerCase();

    const matchesSearch = 
      orderId.includes(searchLower) ||
      companyName.includes(searchLower) ||
      employeeName.includes(searchLower) ||
      invoiceNumber.includes(searchLower);
    
    const matchesHQ = selectedHQ === 'ALL' || getOrderHQ(order) === selectedHQ;
    const matchesRole = selectedRole === 'ALL' || getOrderRole(order) === selectedRole;

    return matchesTab && matchesSearch && matchesHQ && matchesRole;
  });

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleApprove = async (order: Order) => {
    if (!order?.id) return;
    setActionLoading(true);
    try {
      await onUpdateOrderStatus(order.id, 'Approved', 'Super Admin');
      setApproveConfirmOrder(null);
      if (activeOrder && activeOrder.id === order.id) {
        setActiveOrder({ ...activeOrder, status: 'Approved' });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectOrderId) return;
    setActionLoading(true);
    try {
      await onUpdateOrderStatus(rejectOrderId, 'Rejected', 'Super Admin', rejectionReason);
      setRejectOrderId(null);
      if (activeOrder && activeOrder.id === rejectOrderId) {
        setActiveOrder({ ...activeOrder, status: 'Rejected', rejectionReason });
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Tabs */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Sales Orders & Approvals</span>
            <span className="text-xs font-semibold bg-blue-100 text-[#005B96] px-2.5 py-0.5 rounded-full">
              {safeOrders.length} Total Orders
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Process incoming purchase orders from Marketing Executive & Stockists
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto text-xs font-semibold">
          {[
            { key: 'ALL', label: 'All Orders', count: safeOrders.length },
            { key: 'PENDING', label: 'Pending', count: safeOrders.filter(o => o?.status === 'Pending').length, alert: true },
            { key: 'APPROVED', label: 'Approved', count: safeOrders.filter(o => o?.status === 'Approved').length },
            { key: 'REJECTED', label: 'Rejected', count: safeOrders.filter(o => o?.status === 'Rejected').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-[#005B96] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : tab.alert && tab.count > 0
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search & HQ Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search Order ID, Distributor name, Marketing Executive..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/30 focus:border-[#005B96] focus:outline-hidden"
          />
        </div>

      <div className="w-full sm:w-60">
          <select
            value={selectedHQ}
            onChange={(e) => {
              setSelectedHQ(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/30 focus:border-[#005B96] focus:outline-hidden"
          >
            {hqs.map((hq) => (
              <option key={hq} value={hq}>
                {hq === 'ALL' ? 'All Headquarters (HQ)' : hq}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-48">
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/30 focus:border-[#005B96] focus:outline-hidden"
          >
            <option value="ALL">All Order Roles</option>
            <option value="distributor">Ordered by Distributor</option>
            <option value="employee">Ordered by Employee</option>
            <option value="unknown">Unknown Role</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Distributor</th>
                <th className="py-3.5 px-4">Ordered By</th>
                <th className="py-3.5 px-4">Employee / HQ</th>
                <th className="py-3.5 px-4 text-center">Items</th>
                <th className="py-3.5 px-4 text-right">Subtotal</th>
                <th className="py-3.5 px-4 text-right">Grand Total</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm">No orders found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      No matching records found for this filter criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const itemsList = Array.isArray(order?.items) ? order.items : [];
                  const totalUnits = itemsList.reduce((s, i) => s + (i?.quantity ?? 0), 0);

                  return (
                    <tr key={order?.id} className="hover:bg-slate-50/90 transition-colors">
                      {/* Order ID & Date */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#005B96] text-xs">
                          {order?.orderId || 'N/A'}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {order?.orderDate ? new Date(order.orderDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }) : 'N/A'}
                        </p>
                      </td>

                      {/* Distributor */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800 truncate max-w-[180px]">
                          {getDistributorName(order)}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">{order?.distributorId || ''}</p>
                      </td>

                      {/* Order Role */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                          getOrderRole(order) === 'distributor'
                            ? 'bg-blue-50 text-[#005B96]'
                            : getOrderRole(order) === 'employee'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {getOrderRole(order)}
                        </span>
                      </td>

                      {/* Employee & HQ */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-700">{order?.employeeName || 'N/A'}</p>
                        <span className="inline-block text-[10px] text-[#005B96] bg-blue-50 px-1.5 py-0.2 rounded font-medium">
                          {getOrderHQ(order) || 'General HQ'}
                        </span>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                        {totalUnits} units
                        <span className="block text-[10px] text-slate-400 font-normal">
                          ({itemsList.length} SKUs)
                        </span>
                      </td>

                      {/* Subtotal */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                        ₹{(order?.subtotal ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>

                      {/* Grand Total */}
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-xs">
                        ₹{(order?.grandTotal ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={order?.status || 'Pending'} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveOrder(order)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-[#005B96] bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          {order?.status === 'Pending' && getOrderRole(order) === 'distributor' && (
                            <>
                              <button
                                onClick={() => setApproveConfirmOrder(order)}
                                className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors"
                                title="Approve Order"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setRejectOrderId(order.id);
                                  setRejectionReason('Out of stock or distributor credit limit exceeded.');
                                }}
                                className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                                title="Reject Order"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredOrders.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Order Detail Modal */}
      {activeOrder && (
        <Modal
          isOpen={Boolean(activeOrder)}
          onClose={() => {
            setActiveOrder(null);
            if (onCloseOrderModal) onCloseOrderModal();
          }}
          title={`Order Invoice: ${activeOrder?.orderId || 'N/A'}`}
          subtitle={`Placed on ${activeOrder?.orderDate ? new Date(activeOrder.orderDate).toLocaleString() : 'N/A'} • HQ: ${getOrderHQ(activeOrder) || 'N/A'}`}
          maxWidth="4xl"
          footer={
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusBadge status={activeOrder?.status || 'Pending'} size="md" />
                {activeOrder?.invoiceNumber && (
                  <span className="text-xs font-mono font-bold text-slate-600">
                    Invoice: {activeOrder.invoiceNumber}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice</span>
                </button>

                {activeOrder?.status === 'Pending' && getOrderRole(activeOrder) === 'distributor' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setRejectOrderId(activeOrder.id)}
                      className="px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg"
                    >
                      Reject Order
                    </button>
                    <button
                      type="button"
                      onClick={() => setApproveConfirmOrder(activeOrder)}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                    >
                      Approve & Dispatch
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setActiveOrder(null)}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-5 text-xs">
            {/* Distributor & Employee Header Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#005B96]" />
                  Stockist / Distributor Information
                </h4>
                <p className="font-bold text-slate-900 text-sm">{getDistributorName(activeOrder)}</p>
                <p className="text-slate-600 font-mono mt-0.5">ID: {activeOrder?.distributorId || 'N/A'}</p>
                <p className="text-slate-500 mt-1">Order By Role: <span className="font-semibold capitalize">{getOrderRole(activeOrder)}</span></p>
                <p className="text-slate-500 mt-1">Headquarter Territory: {getOrderHQ(activeOrder) || 'N/A'}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#005B96]" />
                  Booking Marketing Executive (ME)
                </h4>
                <p className="font-bold text-slate-900 text-sm">{activeOrder?.employeeName || 'N/A'}</p>
                <p className="text-slate-600 font-mono mt-0.5">ID: {activeOrder?.employeeId || 'N/A'}</p>
                <p className="text-slate-500 mt-1">Order Remarks: {activeOrder?.remarks || 'Standard Order Booking'}</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Product Description</th>
                    <th className="py-2.5 px-3">Packing</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">MRP (₹)</th>
                    <th className="py-2.5 px-3 text-right">PTS Price (₹)</th>
                    <th className="py-2.5 px-3 text-center">GST %</th>
                    <th className="py-2.5 px-3 text-right">Item Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Array.isArray(activeOrder?.items) && activeOrder.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {item?.productName || 'Product'}
                        <span className="block text-[10px] text-slate-400 font-mono font-normal">
                          {item?.productCode || ''}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{item?.packing || 'N/A'}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-800">{item?.quantity ?? 0}</td>
                      <td className="py-2.5 px-3 text-right font-mono">₹{item?.mrp ?? 0}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">₹{item?.pts ?? item?.price ?? 0}</td>
                      <td className="py-2.5 px-3 text-center">{item?.gst ?? 0}%</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{(item?.total ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="flex justify-end">
              <div className="w-72 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Amount:</span>
                  <span className="font-mono font-semibold">₹{(activeOrder?.subtotal ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST Taxes:</span>
                  <span className="font-mono font-semibold">₹{(activeOrder?.gstAmount ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                {(activeOrder?.discount ?? 0) > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Scheme Discount:</span>
                    <span className="font-mono">-₹{(activeOrder?.discount ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                  <span>Grand Total:</span>
                  <span className="text-[#005B96] font-mono">
                    ₹{(activeOrder?.grandTotal ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Audit Information */}
            {activeOrder?.approvedAt && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Approved by <strong>{activeOrder?.approvedBy || 'Super Admin'}</strong> on {new Date(activeOrder.approvedAt).toLocaleString()}</span>
                </div>
              </div>
            )}

            {activeOrder?.rejectedAt && (
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800">
                <p className="font-bold">Order Rejected on {new Date(activeOrder.rejectedAt).toLocaleString()}</p>
                <p className="mt-0.5">Reason: {activeOrder?.rejectionReason || 'No reason specified'}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Approval Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(approveConfirmOrder)}
        onClose={() => setApproveConfirmOrder(null)}
        onConfirm={() => approveConfirmOrder && handleApprove(approveConfirmOrder)}
        title="Approve & Dispatch Order"
        message={`Approve Order ${approveConfirmOrder?.orderId || ''} for ${approveConfirmOrder ? getDistributorName(approveConfirmOrder) : 'Distributor'}? This will automatically deduct warehouse stock and credit sales achievement to ${approveConfirmOrder?.employeeName || 'Employee'}.`}
        confirmText="Approve & Deduct Stock"
        type="success"
        loading={actionLoading}
      />

      {/* Rejection Modal with Reason */}
      <Modal
        isOpen={Boolean(rejectOrderId)}
        onClose={() => setRejectOrderId(null)}
        title="Reject Purchase Order"
        maxWidth="md"
        footer={
          <>
            <button
              onClick={() => setRejectOrderId(null)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
            >
              Confirm Rejection
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-700">
            Please specify the administrative reason for rejecting this order (will be transmitted to Android app user):
          </p>
          <textarea
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
            placeholder="e.g. Stock unavailable, distributor exceeded credit limit..."
          />
        </div>
      </Modal>
    </div>
  );
};