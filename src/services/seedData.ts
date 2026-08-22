import { Product, Order, Employee, Distributor, Target, AppNotification, AuditLog } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-001',
    employeeId: 'SS-MR-101',
    code: 'EMP001',
    password: 'EMP001',
    name: 'Ramesh Kumar',
    email: 'ramesh@swasthsampada.com',
    phone: '+91 9876543210',
    hq: 'New Delhi',
    state: 'Delhi',
    zone: 'North Zone',
    staffType: 'Marketing Executive',
    role: 'employee',
    status: 'Active',
    joinDate: '2024-01-15',
    monthlyTarget: 350000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'emp-002',
    employeeId: 'SS-MR-102',
    code: 'EMP002',
    password: 'EMP002',
    name: 'Priya Singh',
    email: 'priya@swasthsampada.com',
    phone: '+91 9876543211',
    hq: 'Mumbai',
    state: 'Maharashtra',
    zone: 'West Zone',
    staffType: 'Marketing Executive',
    role: 'employee',
    status: 'Active',
    joinDate: '2024-02-20',
    monthlyTarget: 350000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'emp-003',
    employeeId: 'SS-ABM-101',
    code: 'EMP003',
    password: 'EMP003',
    name: 'Amitabh Verma',
    email: 'amitabh@swasthsampada.com',
    phone: '+91 9876543212',
    hq: 'New Delhi',
    state: 'Delhi',
    zone: 'North Zone',
    staffType: 'Area Sales Manager',
    role: 'manager',
    status: 'Active',
    joinDate: '2023-06-10',
    monthlyTarget: 500000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'emp-004',
    employeeId: 'SS-RBM-101',
    code: 'EMP004',
    password: 'EMP004',
    name: 'Rajesh Sharma',
    email: 'rajesh@swasthsampada.com',
    phone: '+91 9876543213',
    hq: 'Lucknow',
    state: 'Uttar Pradesh',
    zone: 'East Zone',
    staffType: 'Regional Sales Manager',
    role: 'manager',
    status: 'Active',
    joinDate: '2023-03-05',
    monthlyTarget: 750000,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_DISTRIBUTORS: Distributor[] = [
 
];

export const INITIAL_ORDERS: Order[] = [

];

export const INITIAL_TARGETS: Target[] = [
 
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
];
