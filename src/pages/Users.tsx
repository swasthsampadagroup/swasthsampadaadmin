import React, { useState } from 'react';
import { 
  Users as UsersIcon, 
  Plus, 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Edit, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Briefcase,
  Eye,
  Award
} from 'lucide-react';
import { Employee, StaffType, UserStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';

interface UsersProps {
  employees: Employee[];
  onSaveEmployee: (emp: Partial<Employee>) => Promise<Employee>;
  onUpdateStatus: (id: string, status: UserStatus) => Promise<void>;
}

export const Users: React.FC<UsersProps> = ({
  employees,
  onSaveEmployee,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHQ, setSelectedHQ] = useState('ALL');
  const [selectedStaffType, setSelectedStaffType] = useState('ALL');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [formLoading, setFormLoading] = useState(false);

  // Detail Modal
  const [detailEmp, setDetailEmp] = useState<Employee | null>(null);

  const hqs = ['ALL', ...Array.from(new Set(employees.map(e => e.hq).filter(Boolean)))];
  const staffTypes = ['ALL', 'Marketing Executive', 'Area Sales Manager', 'Regional Sales Manager', 'Zonal Sales Manager'];

  const filteredEmployees = employees.filter(e => {
    const matchesTab = 
      activeTab === 'ALL' || 
      (activeTab === 'PENDING' && e.status === 'Pending') ||
      (activeTab === 'ACTIVE' && e.status === 'Active') ||
      (activeTab === 'MANAGERS' && (e.role === 'manager' || e.staffType.includes('Manager')));

    const matchesSearch = 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.phone.includes(searchTerm);

    const matchesHQ = selectedHQ === 'ALL' || e.hq === selectedHQ;
    const matchesStaffType = selectedStaffType === 'ALL' || e.staffType === selectedStaffType;

    return matchesTab && matchesSearch && matchesHQ && matchesStaffType;
  });

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setFormData({
      employeeId: `SS-${Math.floor(100 + Math.random() * 900)}`,
      code: '',
      password: '',
      name: '',
      email: '',
      phone: '+91 ',
      hq: '',
      state: '',
      zone: '',
      reportingTo: '',
      staffType: 'Marketing Executive',
      role: 'employee',
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
      monthlyTarget: 0,
      territory: [],
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({ ...emp });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await onSaveEmployee(formData);
      setIsFormOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Employees & Field Staff Directory</span>
            <span className="text-xs font-semibold bg-blue-100 text-[#005B96] px-2.5 py-0.5 rounded-full">
              {employees.length} Staff
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ManageMarketing Executives, Area Managers, and approval workflows
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#005B96] hover:bg-[#004875] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Staff</span>
        </button>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto text-xs font-semibold">
          {[
            { key: 'ALL', label: 'All Staff', count: employees.length },
            { key: 'PENDING', label: 'Pending Approvals', count: employees.filter(e => e.status === 'Pending').length, alert: true },
            { key: 'ACTIVE', label: 'Active Personnel', count: employees.filter(e => e.status === 'Active').length },
            { key: 'MANAGERS', label: 'Managers (ABM/RBM)', count: employees.filter(e => e.role === 'manager' || e.staffType.includes('Manager')).length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-[#005B96] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : tab.alert && tab.count > 0
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, Employee ID, email, phone..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/30 focus:border-[#005B96] focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={selectedHQ}
              onChange={(e) => {
                setSelectedHQ(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            >
              {hqs.map(hq => (
                <option key={hq} value={hq}>{hq === 'ALL' ? 'All Headquarter Locations' : hq}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStaffType}
              onChange={(e) => {
                setSelectedStaffType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            >
              {staffTypes.map(st => (
                <option key={st} value={st}>{st === 'ALL' ? 'All Staff Roles' : st}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Emp ID & Role</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">HQ & Zone</th>
                <th className="py-3.5 px-4">Reporting Manager</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <UsersIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm">No employees found</p>
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/90 transition-colors">
                    {/* Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-[#005B96] font-bold text-xs flex items-center justify-center shrink-0">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{emp.name}</p>
                          <p className="text-[10px] text-slate-400">Joined: {emp.joinDate}</p>
                        </div>
                      </div>
                    </td>

                    {/* Emp ID & Staff Type */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[#005B96] text-[11px] bg-blue-50 px-1.5 py-0.5 rounded">
                        {emp.employeeId}
                      </span>
                      <p className="text-[11px] text-slate-600 font-medium mt-1">{emp.staffType}</p>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 text-slate-600 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{emp.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{emp.phone}</span>
                      </div>
                    </td>

                    {/* HQ & Zone */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{emp.hq}</p>
                      <p className="text-[10px] text-slate-400">{emp.zone} • {emp.state}</p>
                    </td>

                    {/* Reporting To */}
                    <td className="py-3.5 px-4 text-slate-700">
                      {emp.reportingTo || 'Managing Director'}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={emp.status} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetailEmp(emp)}
                          className="p-1.5 text-slate-500 hover:text-[#005B96] hover:bg-blue-50 rounded-lg"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          title="Edit Staff"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {emp.status === 'Pending' && (
                          <button
                            onClick={() => onUpdateStatus(emp.id, 'Active')}
                            className="px-2 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg"
                            title="Approve Staff Registration"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredEmployees.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Add / Edit Staff Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingEmployee ? 'Edit Staff Profile' : 'Edit Staff Profile'}
        subtitle="Registers credentials and headquarter territory assignments"
        maxWidth="xl"
        footer={
          <>
            <button
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleFormSubmit}
              disabled={formLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-[#005B96] hover:bg-[#004875] rounded-lg shadow-xs"
            >
              Save Profile
            </button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ABHISHEK SINGH"
                required
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/20 focus:border-[#005B96] outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Employee ID *</label>
              <input
                type="text"
                value={formData.employeeId || ''}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                placeholder="SS-ME-001"
                required
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/20 focus:border-[#005B96] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Login Code *</label>
              <input
                type="text"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="ME0040"
                required
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/20 focus:border-[#005B96] outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Official Email *</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="abhishekshritoo@gmail.com"
                required
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/20 focus:border-[#005B96] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Login Password *</label>
              <input
                type="password"
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••"
                required
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/20 focus:border-[#005B96] outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number *</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 9918838050"
                required
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/20 focus:border-[#005B96] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Designation Role *</label>
              <select
                value={formData.staffType || 'Marketing Executive'}
                onChange={(e) => setFormData({ ...formData, staffType: e.target.value as StaffType })}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/20 focus:border-[#005B96] outline-none font-semibold"
              >
                <option value="Marketing Executive">Marketing Executive (ME)</option>
                <option value="Area Sales Manager">Area Sales Manager (ASM)</option>
                <option value="Regional Sales Manager">Regional Sales Manager (RSM)</option>
                <option value="Zonal Sales Manager">Zonal Sales Manager (ZSM)</option>
                <option value="Sales Manager">Sales Manager (SM)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">HQ Location *</label>
              <input
                type="text"
                value={formData.hq || ''}
                onChange={(e) => setFormData({ ...formData, hq: e.target.value })}
                placeholder="Gorakhpur"
                required
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/20 focus:border-[#005B96] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">State &amp; Zone</label>
              <input
                type="text"
                value={formData.state || ''}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="UTTAR PRADESH"
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/20 focus:border-[#005B96] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Reporting Manager</label>
              <input
                type="text"
                value={formData.reportingTo || ''}
                onChange={(e) => setFormData({ ...formData, reportingTo: e.target.value })}
                placeholder="Sunil Vishkarma"
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/20 focus:border-[#005B96] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Joined Date</label>
              <input
                type="date"
                value={formData.joinDate || ''}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/20 focus:border-[#005B96] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Monthly Target</label>
              <input
                type="number"
                min="0"
                value={formData.monthlyTarget ?? 0}
                onChange={(e) => setFormData({ ...formData, monthlyTarget: Number(e.target.value) || 0 })}
                placeholder="350000"
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/20 focus:border-[#005B96] outline-none"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Staff Detail Modal */}
      {detailEmp && (
        <Modal
          isOpen={Boolean(detailEmp)}
          onClose={() => setDetailEmp(null)}
          title={`Staff Profile: ${detailEmp.name}`}
          subtitle={`${detailEmp.staffType} • ID: ${detailEmp.employeeId}`}
          maxWidth="xl"
          footer={
            <button
              onClick={() => setDetailEmp(null)}
              className="px-5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg"
            >
              Close
            </button>
          }
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="space-y-2">
              <h3 className="text-[11px] font-black uppercase tracking-[0.14em] text-[#005B96]">Identity &amp; Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Full Name</div>
                  <div className="mt-1 font-bold text-slate-800">{detailEmp.name || '-'}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Employee ID</div>
                  <div className="mt-1 font-bold text-slate-800">{detailEmp.employeeId || '-'}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Official Email</div>
                  <div className="mt-1 font-bold text-slate-800 break-all">{detailEmp.email || '-'}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Phone Number</div>
                  <div className="mt-1 font-bold text-slate-800">{detailEmp.phone || '-'}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-[11px] font-black uppercase tracking-[0.14em] text-[#005B96]">Role &amp; Access</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Login Code</div>
                  <div className="mt-1 font-bold text-slate-800">{detailEmp.code || '-'}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Password</div>
                  <div className="mt-1 font-bold text-slate-800">•••••• (hidden)</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">System Role</div>
                  <div className="mt-1 font-bold text-slate-800">{detailEmp.role === 'manager' ? 'Manager' : 'Employee'}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-[11px] font-black uppercase tracking-[0.14em] text-[#005B96]">Territory &amp; Reporting</h3>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2.5">
                <div className="flex justify-between items-center gap-3">
                  <span className="text-slate-500 font-medium">Designation:</span>
                  <span className="font-bold text-slate-800 text-right">{detailEmp.staffType || '-'}</span>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-slate-500 font-medium">Headquarter:</span>
                  <span className="font-bold text-slate-800 text-right">{detailEmp.hq || '-'}</span>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-slate-500 font-medium">State / Zone:</span>
                  <span className="font-bold text-slate-800 text-right">{detailEmp.state || '-'} / {detailEmp.zone || '-'}</span>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-slate-500 font-medium">Reporting To:</span>
                  <span className="font-bold text-slate-800 text-right">{detailEmp.reportingTo || '-'}</span>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-slate-500 font-medium">Territory:</span>
                  <span className="font-bold text-slate-800 text-right">{detailEmp.territory && detailEmp.territory.length > 0 ? detailEmp.territory.join(', ') : 'Not assigned'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-[11px] font-black uppercase tracking-[0.14em] text-[#005B96]">Account &amp; Targets</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Account Status</div>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700 font-bold">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                    {detailEmp.status === 'Active' ? 'Active' : detailEmp.status}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Joining Date</div>
                  <div className="mt-1 font-bold text-slate-800">{detailEmp.joinDate || '-'}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Monthly Target</div>
                  <div className="mt-1 font-bold text-slate-800">{detailEmp.monthlyTarget ?? 0}</div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
