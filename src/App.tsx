import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './services/authContext';
import { dataService } from './services/dataService';
import { isFirebaseConfigured } from './services/firebase';
import { Sidebar, NavItemKey } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import { Users } from './pages/Users';
import { Distributors } from './pages/Distributors';
import { Targets } from './pages/Targets';
import { BulkUpload } from './pages/BulkUpload';
import { Reports } from './pages/Reports';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';

// Types
import { Product, Order, Employee, Distributor, Target, AppNotification, AuditLog, OrderRole, OrderStatus, UserStatus } from './types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ActivityLogSidebar } from './components/common/ActivityLogSidebar';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

const normalizeProduct = (product: any): Product => ({
  id: String(product?.id ?? product?.productId ?? ''),
  productId: product?.productId ?? String(product?.id ?? ''),
  productName: product?.productName ?? product?.name ?? 'Untitled Product',
  productCode: product?.productCode ?? '',
  category: product?.category ?? '',
  composition: product?.composition ?? '',
  description: product?.description ?? '',
  pharmaceuticalDescription: product?.pharmaceuticalDescription ?? product?.description ?? '',
  botanicalDescription: product?.botanicalDescription ?? '',
  packing: product?.packing ?? '',
  mrp: Number(product?.mrp ?? 0),
  ptr: Number(product?.ptr ?? 0),
  pts: Number(product?.pts ?? 0),
  gst: Number(product?.gst ?? 0),
  price: Number(product?.price ?? product?.ptr ?? product?.mrp ?? 0),
  stockQuantity: Number(product?.stockQuantity ?? 0),
  minStockAlert: Number(product?.minStockAlert ?? 0),
  imageUrl: product?.imageUrl ?? '',
  isActive: product?.isActive ?? product?.active ?? true,
  division: product?.division ?? '',
  hsnCode: product?.hsnCode ?? '',
  createdAt: product?.createdAt ? String(product.createdAt) : new Date().toISOString(),
  updatedAt: product?.updatedAt ? String(product.updatedAt) : undefined,
});

const normalizeOrderStatus = (status: unknown): OrderStatus => {
  const normalizedStatus = String(status ?? 'Pending').trim().toLowerCase();

  if (normalizedStatus === 'approved') return 'Approved';
  if (normalizedStatus === 'rejected') return 'Rejected';
  if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled') return 'Cancelled';
  if (normalizedStatus === 'dispatched') return 'Dispatched';
  if (normalizedStatus === 'delivered') return 'Delivered';

  return 'Pending';
};

const normalizeOrderRole = (role: unknown, order: any): OrderRole => {
  const normalizedRole = String(role ?? '').trim().toLowerCase();

  if (normalizedRole.includes('distributor') || normalizedRole.includes('stockist')) return 'distributor';
  if (normalizedRole.includes('employee') || normalizedRole.includes('marketing') || normalizedRole.includes('representative')) return 'employee';
  if (order?.distributorId || order?.stockistId) return 'distributor';
  if (order?.employeeId) return 'employee';

  return 'unknown';
};

const normalizeDate = (value: unknown, fallback?: string): string | undefined => {
  if (!value) return fallback;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? fallback : value.toISOString();
  }

  if (typeof value === 'object' && value !== null) {
    const timestamp = value as { toDate?: () => Date; seconds?: number };

    if (typeof timestamp.toDate === 'function') {
      return normalizeDate(timestamp.toDate(), fallback);
    }

    if (typeof timestamp.seconds === 'number') {
      return new Date(timestamp.seconds * 1000).toISOString();
    }
  }

  if (typeof value === 'number') {
    const milliseconds = value < 10000000000 ? value * 1000 : value;
    const date = new Date(milliseconds);
    return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
  }

  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
};

const normalizeOrder = (order: any): Order => ({
  id: String(order?.id ?? order?.orderId ?? ''),
  orderId: order?.orderId ?? String(order?.id ?? ''),
  distributorId: order?.distributorId ?? order?.stockistId ?? '',
  companyName: order?.companyName ?? order?.distributorName ?? order?.stockistName ?? order?.customerName ?? '',
  employeeId: order?.employeeId ?? '',
  employeeName: order?.employeeName ?? 'Unknown Employee',
  hq: order?.hq ?? '',
  role: normalizeOrderRole(order?.role ?? order?.orderByRole ?? order?.orderedByRole ?? order?.userRole, order),
  items: Array.isArray(order?.items) ? order.items : [],
  itemCount: Number(order?.itemCount ?? order?.items?.length ?? 0),
  subtotal: Number(order?.subtotal ?? 0),
  gstAmount: Number(order?.gstAmount ?? 0),
  discount: Number(order?.discount ?? 0),
  grandTotal: Number(order?.grandTotal ?? order?.totalAmount ?? 0),
  status: normalizeOrderStatus(order?.status ?? order?.orderStatus ?? order?.approvalStatus),
  orderDate: normalizeDate(order?.orderDate ?? order?.createdAt, new Date().toISOString())!,
  remarks: order?.remarks ?? undefined,
  approvedAt: normalizeDate(order?.approvedAt),
  approvedBy: order?.approvedBy ?? undefined,
  rejectedAt: normalizeDate(order?.rejectedAt),
  rejectedBy: order?.rejectedBy ?? undefined,
  rejectionReason: order?.rejectionReason ?? undefined,
  paymentMode: order?.paymentMode ?? undefined,
  dispatchDate: normalizeDate(order?.dispatchDate),
  invoiceNumber: order?.invoiceNumber ?? undefined,
  createdAt: normalizeDate(order?.createdAt, new Date().toISOString())!,
  updatedAt: normalizeDate(order?.updatedAt),
});

const normalizeNotification = (notification: any): AppNotification => ({
  id: String(notification?.id ?? notification?.notificationId ?? `notif-${Date.now()}`),
  title: String(notification?.title ?? notification?.subject ?? 'Notification'),
  message: String(notification?.message ?? notification?.body ?? ''),
  type: (notification?.type ?? notification?.notificationType ?? 'general') as AppNotification['type'],
  targetAudience: (notification?.targetAudience ?? notification?.audience ?? 'everyone') as AppNotification['targetAudience'],
  specificUserId: notification?.specificUserId ?? notification?.userId ?? undefined,
  specificUserName: notification?.specificUserName ?? notification?.userName ?? undefined,
  sentBy: String(notification?.sentBy ?? notification?.sender ?? notification?.createdBy ?? 'Super Admin'),
  sentAt: normalizeDate(notification?.sentAt ?? notification?.createdAt ?? notification?.timestamp, new Date().toISOString())!,
  isRead: notification?.isRead,
  deliveryStatus: (notification?.deliveryStatus ?? notification?.status ?? 'Sent') as AppNotification['deliveryStatus'],
});

const MainApp: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  
  // Navigation
  const [activeTab, setActiveTab] = useState<NavItemKey>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isActivitySidebarOpen, setIsActivitySidebarOpen] = useState<boolean>(false);

  // Data state with safe defaults
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  // Modals & Navigation intents
  const [isAddProductOpen, setIsAddProductOpen] = useState<boolean>(false);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);

  // Toast system
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const loadAllData = useCallback(async () => {
    setDataLoading(true);
    try {
      // Initialize seed data to Firestore if collections are empty
      await dataService.initializeSeedDataIfEmpty();

      const [prods, ords, emps, dists, trgs, notifs, logs] = await Promise.all([
        dataService.getProducts(),
        dataService.getOrders(),
        dataService.getEmployees(),
        dataService.getDistributors(),
        dataService.getTargets(),
        dataService.getNotifications(),
        dataService.getAuditLogs(),
      ]);
      setProducts(Array.isArray(prods) ? prods.map(normalizeProduct) : []);
      setOrders(Array.isArray(ords) ? ords.map(normalizeOrder) : []);
      setEmployees(Array.isArray(emps) ? emps : []);
      setDistributors(Array.isArray(dists) ? dists : []);
      setTargets(Array.isArray(trgs) ? trgs : []);
      setNotifications(Array.isArray(notifs) ? notifs.map(normalizeNotification) : []);
      setAuditLogs(Array.isArray(logs) ? logs : []);
    } catch (err) {
      console.error('Failed to load data:', err);
      showToast('Error refreshing data from server', 'error');
    } finally {
      setDataLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAllData();

    // Subscribe to real-time sync updates
    const unsubscribe = dataService.subscribe((data) => {
      if (data?.products) setProducts(Array.isArray(data.products) ? data.products.map(normalizeProduct) : []);
      if (data?.orders) setOrders(Array.isArray(data.orders) ? data.orders.map(normalizeOrder) : []);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [loadAllData]);

  // Product Operations
  const handleSaveProduct = async (prod: Partial<Product>): Promise<Product> => {
    try {
      const saved = await dataService.saveProduct(prod);
      showToast(`Product "${saved?.productName || 'Item'}" saved successfully!`, 'success');
      await loadAllData();
      return saved;
    } catch (err: any) {
      showToast(err?.message || 'Failed to save product', 'error');
      throw err;
    }
  };

  const handleDeleteProduct = async (id: string): Promise<boolean> => {
    try {
      const success = await dataService.deleteProduct(id);
      if (success) {
        showToast('Product removed from catalog', 'info');
        await loadAllData();
      }
      return success;
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete product', 'error');
      return false;
    }
  };

  const handleUpdateStock = async (id: string, newStock: number): Promise<void> => {
    try {
      await dataService.updateProductStock(id, newStock);
      showToast('Stock level updated successfully', 'success');
      await loadAllData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update stock', 'error');
      throw err;
    }
  };

  // Order Operations
  const handleUpdateOrderStatus = async (
    orderId: string, 
    newStatus: OrderStatus, 
    performedBy?: string, 
    reason?: string
  ): Promise<Order | null> => {
    try {
      const updated = await dataService.updateOrderStatus(
        orderId, 
        newStatus, 
        performedBy || user?.displayName || 'Admin', 
        reason
      );
      if (updated) {
        if (newStatus === 'Approved') {
          showToast(`Order ${updated?.orderId || orderId} approved! Inventory updated automatically.`, 'success');
        } else if (newStatus === 'Rejected') {
          showToast(`Order ${updated?.orderId || orderId} marked as rejected.`, 'info');
        } else {
          showToast(`Order ${updated?.orderId || orderId} status changed to ${newStatus}.`, 'success');
        }
        await loadAllData();
      }
      return updated;
    } catch (err: any) {
      showToast(err?.message || 'Failed to update order status', 'error');
      return null;
    }
  };

  // Employee Operations
  const handleSaveEmployee = async (emp: Partial<Employee>): Promise<Employee> => {
    try {
      const saved = await dataService.saveEmployee(emp);
      showToast(`Employee "${saved?.name || 'Staff'}" updated successfully!`, 'success');
      await loadAllData();
      return saved;
    } catch (err: any) {
      showToast(err?.message || 'Failed to save employee', 'error');
      throw err;
    }
  };

  const handleUpdateEmployeeStatus = async (id: string, status: UserStatus): Promise<void> => {
    try {
      await dataService.updateEmployeeStatus(id, status);
      showToast(`Employee account status set to ${status}`, 'success');
      await loadAllData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update employee status', 'error');
      throw err;
    }
  };

  // Distributor Operations
  const handleSaveDistributor = async (dist: Partial<Distributor>): Promise<Distributor> => {
    try {
      const saved = await dataService.saveDistributor(dist);
      showToast(`Distributor "${saved?.companyName || 'Stockist'}" saved successfully!`, 'success');
      await loadAllData();
      return saved;
    } catch (err: any) {
      showToast(err?.message || 'Failed to save distributor', 'error');
      throw err;
    }
  };

  // Target Operations
  const handleSaveTarget = async (trg: Partial<Target>): Promise<Target> => {
    try {
      const saved = await dataService.saveTarget(trg);
      showToast(`Monthly sales target assigned successfully!`, 'success');
      await loadAllData();
      return saved;
    } catch (err: any) {
      showToast(err?.message || 'Failed to assign target', 'error');
      throw err;
    }
  };

  // Bulk Import
  const handleBulkImportProducts = async (prods: Partial<Product>[]): Promise<{ count: number }> => {
    try {
      const result = await dataService.bulkImportProducts(prods);
      showToast(`Successfully imported ${result?.count || 0} products to the database!`, 'success');
      await loadAllData();
      return result;
    } catch (err: any) {
      showToast(err?.message || 'Bulk import failed', 'error');
      throw err;
    }
  };

  // Notification Operations
  const handleSendNotification = async (notif: Partial<AppNotification>): Promise<AppNotification> => {
    try {
      const saved = await dataService.sendNotification(notif);
      showToast('Notification broadcasted to mobile users!', 'success');
      await loadAllData();
      return saved;
    } catch (err: any) {
      showToast(err?.message || 'Failed to broadcast notification', 'error');
      throw err;
    }
  };

  // Fast Navigation Shortcuts
  const handleNavigateTab = (tab: NavItemKey) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAddProductFromAnywhere = () => {
    setActiveTab('products');
    setIsAddProductOpen(true);
  };

  const handleViewOrderFromDashboard = (order: Order) => {
    setSelectedOrderForModal(order);
    setActiveTab('orders');
  };

  const handleApproveOrderFromDashboard = async (order: Order) => {
    if (order?.id) {
      await handleUpdateOrderStatus(order.id, 'Approved', user?.displayName || 'Admin');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <LoadingSpinner size="lg" color="cyan" text="Authenticating Administrator..." />
      </div>
    );
  }

  if (!user) {
    return <Login onSuccessLogin={() => loadAllData()} />;
  }

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeEmployees = Array.isArray(employees) ? employees : [];
  const safeDistributors = Array.isArray(distributors) ? distributors : [];
  const safeTargets = Array.isArray(targets) ? targets : [];
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const safeAuditLogs = Array.isArray(auditLogs) ? auditLogs : [];

  const pendingOrdersCount = safeOrders.filter(o => o?.status === 'Pending').length;
  const lowStockCount = safeProducts.filter(p => (p?.stockQuantity ?? 0) <= (p?.minStockAlert || 50)).length;

  return (
    <div className="flex h-screen bg-[#F4F6F9] text-slate-800 font-sans antialiased overflow-hidden select-none">
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-emerald-900/95 text-white border-emerald-700 shadow-emerald-950/20'
                : toast.type === 'error'
                ? 'bg-red-900/95 text-white border-red-700 shadow-red-950/20'
                : 'bg-slate-900/95 text-white border-slate-700 shadow-slate-950/20'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />}
            <span className="flex-1 font-medium">{toast.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Primary Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleNavigateTab}
        pendingOrdersCount={pendingOrdersCount}
        lowStockCount={lowStockCount}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isFirebaseActive={isFirebaseConfigured}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <Header
          currentTab={activeTab}
          onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
          notifications={safeNotifications}
          onRefreshData={loadAllData}
          onNavigateTab={handleNavigateTab}
          onOpenActivityLog={() => setIsActivitySidebarOpen(true)}
          activityCount={safeAuditLogs.length}
        />

        {/* Dynamic Page Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F4F6F9]">
          <div className="max-w-7xl mx-auto">
            {dataLoading && safeProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <LoadingSpinner size="lg" text="Syncing Healthcare Database..." />
              </div>
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <Dashboard
                    products={safeProducts}
                    orders={safeOrders}
                    employees={safeEmployees}
                    targets={safeTargets}
                    auditLogs={safeAuditLogs}
                    onNavigateTab={handleNavigateTab}
                    onViewOrder={handleViewOrderFromDashboard}
                    onApproveOrder={handleApproveOrderFromDashboard}
                    onOpenAddProduct={handleOpenAddProductFromAnywhere}
                    onOpenActivityLog={() => setIsActivitySidebarOpen(true)}
                  />
                )}

                {activeTab === 'products' && (
                  <Products
                    products={safeProducts}
                    onSaveProduct={handleSaveProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onUpdateStock={handleUpdateStock}
                    isOpenAddModal={isAddProductOpen}
                    onCloseAddModal={() => setIsAddProductOpen(false)}
                  />
                )}

                {activeTab === 'orders' && (
                  <Orders
                    orders={safeOrders}
                    distributors={safeDistributors}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    selectedOrderForModal={selectedOrderForModal}
                    onCloseOrderModal={() => setSelectedOrderForModal(null)}
                  />
                )}

                {activeTab === 'users' && (
                  <Users
                    employees={safeEmployees}
                    onSaveEmployee={handleSaveEmployee}
                    onUpdateStatus={handleUpdateEmployeeStatus}
                  />
                )}

                {activeTab === 'distributors' && (
                  <Distributors
                    distributors={safeDistributors}
                    onSaveDistributor={handleSaveDistributor}
                  />
                )}

                {activeTab === 'targets' && (
                  <Targets
                    targets={safeTargets}
                    employees={safeEmployees}
                    onSaveTarget={handleSaveTarget}
                  />
                )}

                {activeTab === 'bulk-upload' && (
                  <BulkUpload
                    onBulkImportProducts={handleBulkImportProducts}
                  />
                )}

                {activeTab === 'reports' && (
                  <Reports
                    orders={safeOrders}
                    products={safeProducts}
                    employees={safeEmployees}
                    distributors={safeDistributors}
                  />
                )}

                {activeTab === 'notifications' && (
                  <Notifications
                    notifications={safeNotifications}
                    employees={safeEmployees}
                    distributors={safeDistributors}
                    onSendNotification={handleSendNotification}
                  />
                )}

                {activeTab === 'settings' && (
                  <Settings
                    productCount={safeProducts.length}
                    orderCount={safeOrders.length}
                    employeeCount={safeEmployees.length}
                    distributorCount={safeDistributors.length}
                    targetCount={safeTargets.length}
                    notificationCount={safeNotifications.length}
                    onRefreshData={loadAllData}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Real-time Activity Log Slide-Over Sidebar */}
      <ActivityLogSidebar
        isOpen={isActivitySidebarOpen}
        onClose={() => setIsActivitySidebarOpen(false)}
        logs={safeAuditLogs}
        onNavigateTab={handleNavigateTab}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}