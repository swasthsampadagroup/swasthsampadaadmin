export type UserRole = 'super_admin' | 'admin' | 'manager' | 'viewer';

export type StaffType = 
  | 'Marketing Executive'
  | 'Area Sales Manager'
  | 'Regional Sales Manager'
  | 'Zonal Sales Manager'
  | 'Sr. Zonal Sales Manager'
  | 'Sales Manager'


export type UserStatus = 'Active' | 'Pending' | 'Rejected' | 'Inactive';

export type OrderStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Dispatched' | 'Delivered';

export type OrderRole = 'distributor' | 'employee' | 'unknown';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  phone?: string;
  designation?: string;
  lastLogin?: string;
}

export interface Product {
  id: string; // Firestore document ID
  productId?: string;
  productName: string;
  productCode: string;
  category: string;
  composition: string;
  description: string;
  pharmaceuticalDescription?: string;
  botanicalDescription?: string;
  packing: string; // e.g. "10x10 Tablets", "200 ml", "1 Vial"
  mrp: number; // Maximum Retail Price
  ptr: number; // Price to Retailer
  pts: number; // Price to Stockist / Distributor
  gst: number; // GST Percentage (e.g. 5, 12, 18)
  price: number; // Base selling price
  stockQuantity: number;
  minStockAlert?: number;
  imageUrl?: string;
  isActive: boolean;
  division?: string;
  hsnCode?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productCode: string;
  packing: string;
  quantity: number;
  mrp: number;
  ptr: number;
  pts: number;
  gst: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderId: string; // e.g. "ORD-2026-0812"
  distributorId: string;
  companyName: string;
  employeeId: string;
  employeeName: string;
  hq: string;
  role?: OrderRole;
  items: OrderItem[];
  itemCount: number;
  subtotal: number;
  gstAmount: number;
  discount: number;
  grandTotal: number;
  status: OrderStatus;
  orderDate: string;
  remarks?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  paymentMode?: string;
  dispatchDate?: string;
  invoiceNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Employee {
  id: string;
  employeeId: string; // e.g. "SS-EMP-104"
  code?: string; // Login code for employee (e.g. "EMP-001")
  password?: string; // Password for login
  name: string;
  email: string;
  phone: string;
  hq: string; // Headquarter location
  state: string;
  zone: string;
  reportingTo?: string; // Manager's Employee ID or Name
  staffType: StaffType;
  role: 'employee' | 'manager' | 'admin';
  status: UserStatus;
  joinDate: string;
  monthlyTarget?: number;
  profilePic?: string;
  territory?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Distributor {
  id: string;
  distributorId: string; // e.g. "DIST-DL-004"
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  pincode: string;
  city?: string;
  state?: string;
  creditLimit?: number;
  outstandingBalance?: number;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  reportingEmployee?: string; // Reporting employee name
  role?: string; // Role of contact person (e.g. Manager, Owner, etc.)
  hq?: string; // Headquarters location
  status: 'Active' | 'Pending' | 'Inactive' | 'Blocked';
  joinedDate: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Target {
  id: string;
  employeeId: string;
  employeeName: string;
  hq: string;
  month: string; // e.g. "August"
  year: number; // e.g. 2026
  salesTarget: number;
  salesAchieved: number;
  doctorVisitTarget: number;
  doctorVisitAchieved: number;
  chemistVisitTarget: number;
  chemistVisitAchieved: number;
  totalIncentive: number;
  incentiveEarned: number;
  status: 'In Progress' | 'Achieved' | 'Missed';
  notes?: string;
  updatedAt?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'general' | 'order' | 'product_launch' | 'target_update' | 'urgent' | 'announcement';
  targetAudience: 'everyone' | 'employees' | 'distributors' | 'specific_user';
  specificUserId?: string;
  specificUserName?: string;
  sentBy: string;
  sentAt: string;
  isRead?: boolean;
  deliveryStatus: 'Sent' | 'Scheduled' | 'Failed';
}

export interface AuditLog {
  id: string;
  action: string;
  module: string;
  details: string;
  performedBy: string;
  timestamp: string;
  ipAddress?: string;
}

export interface BulkUploadPreviewRow {
  rowNumber: number;
  data: Record<string, any>;
  isValid: boolean;
  errors: string[];
}
