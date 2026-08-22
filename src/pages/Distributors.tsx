import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Edit, 
  FileText, 
  IndianRupee, 
  Eye,
  CheckCircle2
} from 'lucide-react';
import { Distributor } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';

interface DistributorsProps {
  distributors: Distributor[];
  onSaveDistributor: (dist: Partial<Distributor>) => Promise<Distributor>;
}

const formatDistributorDate = (value: unknown): string => {
  if (!value) return '-';

  let date: Date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    date = (value as { toDate: () => Date }).toDate();
  } else if (typeof value === 'object' && value !== null && 'seconds' in value && typeof (value as { seconds?: unknown }).seconds === 'number') {
    date = new Date((value as { seconds: number }).seconds * 1000);
  } else {
    date = new Date(String(value));
  }

  return Number.isNaN(date.getTime())
    ? '-'
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const Distributors: React.FC<DistributorsProps> = ({
  distributors,
  onSaveDistributor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDistributor, setEditingDistributor] = useState<Distributor | null>(null);
  const [formData, setFormData] = useState<Partial<Distributor>>({});
  const [formLoading, setFormLoading] = useState(false);

  // Detail Modal
  const [detailDist, setDetailDist] = useState<Distributor | null>(null);

  const filteredDistributors = (distributors || []).filter(d => {
    const query = (searchTerm || '').toLowerCase();
    const matchesSearch = 
      (d?.companyName || '').toLowerCase().includes(query) ||
      (d?.distributorId || '').toLowerCase().includes(query) ||
      (d?.contactPerson || '').toLowerCase().includes(query) ||
      (d?.email || '').toLowerCase().includes(query);

    const matchesStatus = selectedStatus === 'ALL' || d?.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const paginatedDistributors = filteredDistributors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenAdd = () => {
    setEditingDistributor(null);
    setFormData({
      distributorId: `DIST-${Math.floor(100 + Math.random() * 900)}`,
      companyName: '',
      contactPerson: '',
      phone: '+91 ',
      email: '',
      address: '',
      pincode: '',
      assignedEmployeeName: '',
      role: '',
      hq: '',
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (dist: Distributor) => {
    setEditingDistributor(dist);
    setFormData({ ...dist });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await onSaveDistributor(formData);
      setIsFormOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Distributor & Stockist Network</span>
            <span className="text-xs font-semibold bg-blue-100 text-[#005B96] px-2.5 py-0.5 rounded-full">
              {distributors.length} Registered Agencies
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Contact information, reporting hierarchy, role assignments, and status tracking
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#005B96] hover:bg-[#004875] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Stockist</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search distributor, contact, email..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/30 focus:border-[#005B96] focus:outline-hidden"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
          >
            <option value="ALL">All Account Statuses</option>
            <option value="Active">Active Agencies</option>
            <option value="Pending">Pending Verification</option>
            <option value="Blocked">Blocked / On Hold</option>
          </select>
        </div>
      </div>

      {/* Distributors Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Distributor Agency</th>
                <th className="py-3.5 px-4">Contact Person</th>
                <th className="py-3.5 px-4">Reporting Employee</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Email ID</th>
                <th className="py-3.5 px-4">HQ</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedDistributors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm">No distributors found</p>
                  </td>
                </tr>
              ) : (
                paginatedDistributors.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/90 transition-colors">
                    {/* Agency */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 truncate max-w-[200px]">{d.companyName}</p>
                      <span className="font-mono text-[10px] text-[#005B96] bg-blue-50 px-1.5 py-0.2 rounded font-semibold">
                        {d.distributorId}
                      </span>
                    </td>

                    {/* Contact Person */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{d.contactPerson}</p>
                      <p className="text-[10px] text-slate-500">{d.phone}</p>
                    </td>

                    {/* Reporting Employee */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-700">{d.assignedEmployeeName || '-'}</p>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-700">{d.role || '-'}</p>
                    </td>

                    {/* Email ID */}
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-600 text-[10px]">{d.email}</p>
                    </td>

                    {/* HQ */}
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-700">{d.hq || '-'}</p>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={d.status} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetailDist(d)}
                          className="p-1.5 text-slate-500 hover:text-[#005B96] hover:bg-blue-50 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(d)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          title="Edit Stockist"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
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
          totalItems={filteredDistributors.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingDistributor ? 'Edit Stockist Agency' : 'Register New Distributor Agency'}
        maxWidth="xl"
        footer={
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleFormSubmit}
              disabled={formLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-[#005B96] hover:bg-[#004875] rounded-xl shadow-xs"
            >
              Save Stockist Agency
            </button>
          </div>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Agency Name *</label>
              <input
                type="text"
                value={formData.companyName || ''}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. Apex Medico Agencies"
                required
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/20 focus:border-[#005B96] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Stockist ID *</label>
              <input
                type="text"
                value={formData.distributorId || ''}
                onChange={(e) => setFormData({ ...formData, distributorId: e.target.value })}
                placeholder="e.g. DIST-DEL-01"
                required
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/20 focus:border-[#005B96] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contact Person *</label>
              <input
                type="text"
                value={formData.contactPerson || ''}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="e.g. Suresh Singhania"
                required
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/20 focus:border-[#005B96] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number *</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98100 44556"
                required
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/20 focus:border-[#005B96] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email ID *</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@distributor.com"
                required
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/20 focus:border-[#005B96] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role</label>
              <input
                type="text"
                value={formData.role || ''}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Manager, Owner"
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/20 focus:border-[#005B96] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Reporting Employee</label>
              <input
                type="text"
                value={formData.assignedEmployeeName || ''}
                onChange={(e) => setFormData({ ...formData, assignedEmployeeName: e.target.value })}
                placeholder="e.g. Rajesh Sharma (MR)"
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/20 focus:border-[#005B96] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">HQ</label>
              <input
                type="text"
                value={formData.hq || ''}
                onChange={(e) => setFormData({ ...formData, hq: e.target.value })}
                placeholder="e.g. Delhi, Mumbai"
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/20 focus:border-[#005B96] outline-none"
              />
            </div>

            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">City</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Mumbai"
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/20 focus:border-[#005B96] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">State</label>
                <input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g. Maharashtra"
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/20 focus:border-[#005B96] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode || ''}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="e.g. 400001"
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/20 focus:border-[#005B96] outline-none"
                />
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      {detailDist && (
        <Modal
          isOpen={Boolean(detailDist)}
          onClose={() => setDetailDist(null)}
          title="Distributor Profile"
          maxWidth="xl"
          footer={
            <button
              onClick={() => setDetailDist(null)}
              className="px-5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg"
            >
              Close
            </button>
          }
        >
          <div className="space-y-5 text-xs text-slate-700">
            <section>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#005B96] mb-3">Agency &amp; Contact</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <div className="text-slate-500 font-medium">Agency Name</div>
                  <div className="mt-1 text-sm font-semibold text-slate-800">{detailDist.companyName || '-'}</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <div className="text-slate-500 font-medium">Stockist ID</div>
                  <div className="mt-1 text-sm font-semibold text-slate-800">{detailDist.distributorId || '-'}</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <div className="text-slate-500 font-medium">Contact Person</div>
                  <div className="mt-1 text-sm font-semibold text-slate-800">{detailDist.contactPerson || '-'}</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <div className="text-slate-500 font-medium">Phone Number</div>
                  <div className="mt-1 text-sm font-semibold text-slate-800">{detailDist.phone || '-'}</div>
                </div>

                <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <div className="text-slate-500 font-medium">Email ID</div>
                  <div className="mt-1 text-sm font-semibold text-slate-800">{detailDist.email || '-'}</div>
                </div>
              </div>
            </section>

            <section>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#005B96] mb-3">Location</h4>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 space-y-2.5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500 font-medium">HQ:</span>
                  <span className="font-semibold text-slate-800 text-right">{detailDist.hq || '-'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500 font-medium">City / State:</span>
                  <span className="font-semibold text-slate-800 text-right">{detailDist.city || '-'} / {detailDist.state || '-'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500 font-medium">Pincode:</span>
                  <span className="font-semibold text-slate-800 text-right">{detailDist.pincode || '-'}</span>
                </div>
              </div>
            </section>

            <section>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#005B96] mb-3">Assignment &amp; Account</h4>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 space-y-2.5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500 font-medium">Role:</span>
                  <span className="font-semibold text-slate-800 text-right">{detailDist.role || 'distributor'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500 font-medium">Reporting Employee:</span>
                  <span className="font-semibold text-slate-800 text-right">{detailDist.assignedEmployeeName || '-'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500 font-medium">Reporting Employee ID:</span>
                  <span className="font-semibold text-slate-800 text-right">{detailDist.assignedEmployeeId || '-'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500 font-medium">Account Status:</span>
                  <span className="inline-flex items-center gap-2 font-semibold text-emerald-600 text-right">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    {detailDist.status === 'Blocked' ? 'Blocked' : detailDist.status === 'Pending' ? 'Pending' : 'Approved'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500 font-medium">Joined Date:</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {formatDistributorDate(detailDist.joinedDate || detailDist.createdAt)}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </Modal>
      )}
    </div>
  );
};