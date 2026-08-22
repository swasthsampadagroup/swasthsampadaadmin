import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Package, 
  AlertTriangle, 
  Layers, 
  Eye, 
  RefreshCw,
  Image as ImageIcon,
  IndianRupee
} from 'lucide-react';
import { Product } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

interface ProductsProps {
  products: Product[];
  onSaveProduct: (prod: Partial<Product>) => Promise<Product>;
  onDeleteProduct: (id: string) => Promise<boolean>;
  onUpdateStock: (id: string, newStock: number) => Promise<void>;
  isOpenAddModal?: boolean;
  onCloseAddModal?: () => void;
}

export const Products: React.FC<ProductsProps> = ({
  products,
  onSaveProduct,
  onDeleteProduct,
  onUpdateStock,
  isOpenAddModal = false,
  onCloseAddModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStockStatus, setSelectedStockStatus] = useState('ALL');
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form Modal States
  const [isFormOpen, setIsFormOpen] = useState(isOpenAddModal);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [formLoading, setFormLoading] = useState(false);

  // Quick Stock Adjustment Modal State
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);

  // Detail View Modal
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Confirm Delete Dialog
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Categories & Divisions Extraction
  const categories = ['ALL', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  const divisions = ['ALL', ...Array.from(new Set(products.map(p => p.division).filter(Boolean)))];

  // Filtering
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.composition.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesDivision = selectedDivision === 'ALL' || p.division === selectedDivision;

    let matchesStock = true;
    if (selectedStockStatus === 'ACTIVE') matchesStock = p.isActive;
    if (selectedStockStatus === 'INACTIVE') matchesStock = !p.isActive;
    if (selectedStockStatus === 'LOW_STOCK') matchesStock = p.stockQuantity > 0 && p.stockQuantity <= (p.minStockAlert || 50);
    if (selectedStockStatus === 'OUT_OF_STOCK') matchesStock = p.stockQuantity === 0;

    return matchesSearch && matchesCategory && matchesDivision && matchesStock;
  });

  // Pagination
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      productName: '',
      productCode: `SWP-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Syrups & Suspensions',
      composition: '',
      description: '',
      pharmaceuticalDescription: '',
      botanicalDescription: '',
      packing: '10x10 Strips',
      mrp: 120,
      ptr: 85,
      pts: 76.5,
      gst: 12,
      price: 76.5,
      stockQuantity: 200,
      minStockAlert: 50,
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
      isActive: true,
      division: 'General & Pediatric',
      hsnCode: '30049099',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await onSaveProduct(formData);
      setIsFormOpen(false);
      if (onCloseAddModal) onCloseAddModal();
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleteLoading(true);
    try {
      await onDeleteProduct(deleteConfirmId);
      setDeleteConfirmId(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStockSave = async () => {
    if (!stockModalProduct) return;
    await onUpdateStock(stockModalProduct.id, newStockValue);
    setStockModalProduct(null);
  };

  return (
    <div className="space-y-5">
      {/* Header Action Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Product Catalog & Pharmaceutical Formulary</span>
            <span className="text-xs font-semibold bg-blue-100 text-[#005B96] px-2.5 py-0.5 rounded-full">
              {products.length} Products
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete management of MRP, PTR, PTS, GST, and real-time inventory counts
          </p>
        </div>

        <button
          id="products-add-btn"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#005B96] hover:bg-[#004875] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search & Multi-Filter Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search product name, code, composition..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/30 focus:border-[#005B96] focus:outline-hidden"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/30 focus:border-[#005B96] focus:outline-hidden"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Division Filter */}
          <div>
            <select
              value={selectedDivision}
              onChange={(e) => {
                setSelectedDivision(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/30 focus:border-[#005B96] focus:outline-hidden"
            >
              {divisions.map((div) => (
                <option key={div} value={div}>
                  {div === 'ALL' ? 'All Divisions' : div}
                </option>
              ))}
            </select>
          </div>

          {/* Stock & Status Filter */}
          <div>
            <select
              value={selectedStockStatus}
              onChange={(e) => {
                setSelectedStockStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/30 focus:border-[#005B96] focus:outline-hidden"
            >
              <option value="ALL">All Stock Levels</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
              <option value="LOW_STOCK">Low Stock (≤ 50)</option>
              <option value="OUT_OF_STOCK">Out of Stock (0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Product Details</th>
                <th className="py-3.5 px-4">Code & Division</th>
                <th className="py-3.5 px-4">Packing</th>
                <th className="py-3.5 px-4 text-right">MRP (₹)</th>
                <th className="py-3.5 px-4 text-right">PTR / PTS (₹)</th>
                <th className="py-3.5 px-4 text-center">GST %</th>
                <th className="py-3.5 px-4 text-center">Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm">No products found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try adjusting your search criteria or add a new product.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isLow = p.stockQuantity > 0 && p.stockQuantity <= (p.minStockAlert || 50);
                  const isOut = p.stockQuantity === 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/90 transition-colors group">
                      {/* Product Name & Composition */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate group-hover:text-[#005B96]">
                              {p.productName}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate max-w-xs">
                              {p.composition || p.category}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Code & Division */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#005B96] bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                          {p.productCode}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">{p.division || 'Pharmaceuticals'}</p>
                      </td>

                      {/* Packing */}
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {p.packing}
                      </td>

                      {/* MRP */}
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ₹{Number(p.mrp).toFixed(2)}
                      </td>

                      {/* PTR / PTS */}
                      <td className="py-3 px-4 text-right font-mono">
                        <div className="text-slate-800 font-semibold">₹{Number(p.ptr).toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400">PTS: ₹{Number(p.pts).toFixed(2)}</div>
                      </td>

                      {/* GST */}
                      <td className="py-3 px-4 text-center font-semibold text-slate-700">
                        {p.gst}%
                      </td>

                      {/* Stock Quantity + Quick Adjust */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setStockModalProduct(p);
                            setNewStockValue(p.stockQuantity);
                          }}
                          className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded transition-transform active:scale-95 ${
                            isOut
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : isLow
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                          }`}
                          title="Click to adjust inventory stock"
                        >
                          <span>{p.stockQuantity}</span>
                          <RefreshCw className="w-2.5 h-2.5 opacity-60" />
                        </button>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <StatusBadge
                          status={p.isActive ? (isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Active') : 'Inactive'}
                          size="sm"
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDetailProduct(p)}
                            className="p-1.5 text-slate-500 hover:text-[#005B96] hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Full Formulary"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
          totalItems={filteredProducts.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingProduct ? 'Edit Pharmaceutical Product' : 'Add New Pharmaceutical Product'}
        subtitle="All field names directly synchronized with the Android App database"
        maxWidth="2xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleFormSubmit}
              disabled={formLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-[#005B96] hover:bg-[#004875] rounded-lg shadow-xs flex items-center gap-2"
            >
              {formLoading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{editingProduct ? 'Update Product' : 'Save & Publish Product'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.productName || ''}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                placeholder="e.g. Sampada-Cold Relief Syrup"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/30 focus:border-[#005B96] focus:outline-hidden font-semibold"
              />
            </div>

            {/* Product Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Product Code / SKU *
              </label>
              <input
                type="text"
                value={formData.productCode || ''}
                onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                placeholder="e.g. SSP-CR-01"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/30 focus:border-[#005B96] focus:outline-hidden font-mono"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Therapeutic Category *
              </label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Antibiotics, Syrups, Gastro"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/30 focus:border-[#005B96] focus:outline-hidden"
              />
            </div>

            {/* Division */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Marketing Division
              </label>
              <input
                type="text"
                value={formData.division || ''}
                onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                placeholder="e.g. General & Pediatric, Ayurvedic"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/30 focus:border-[#005B96] focus:outline-hidden"
              />
            </div>

            {/* Packing */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Packaging Presentation *
              </label>
              <input
                type="text"
                value={formData.packing || ''}
                onChange={(e) => setFormData({ ...formData, packing: e.target.value })}
                placeholder="e.g. 10x10 Alu-Alu Strip / 200 ml Bottle"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/30 focus:border-[#005B96] focus:outline-hidden"
              />
            </div>

            {/* HSN Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                HSN Code
              </label>
              <input
                type="text"
                value={formData.hsnCode || ''}
                onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                placeholder="e.g. 30049099"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/30 focus:border-[#005B96] focus:outline-hidden font-mono"
              />
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-[#005B96]" />
              Pricing & GST Breakdown
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  MRP (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.mrp || 0}
                  onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  PTR (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.ptr || 0}
                  onChange={(e) => setFormData({ ...formData, ptr: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  PTS (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pts || 0}
                  onChange={(e) => setFormData({ ...formData, pts: Number(e.target.value), price: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  GST Rate (%) *
                </label>
                <select
                  value={formData.gst || 12}
                  onChange={(e) => setFormData({ ...formData, gst: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-semibold"
                >
                  <option value={0}>0% (Exempt)</option>
                  <option value={5}>5% (Herbal/Essential)</option>
                  <option value={12}>12% (Standard Pharma)</option>
                  <option value={18}>18% (Supplements)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stock & Inventory */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current Stock Quantity *
              </label>
              <input
                type="number"
                value={formData.stockQuantity || 0}
                onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Low Stock Threshold Alert
              </label>
              <input
                type="number"
                value={formData.minStockAlert || 50}
                onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catalog Status
              </label>
              <select
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-semibold"
              >
                <option value="active">Active (Visible in App)</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          {/* Composition */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Active Chemical / Botanical Composition
            </label>
            <input
              type="text"
              value={formData.composition || ''}
              onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
              placeholder="e.g. Paracetamol 250mg + Phenylephrine HCl 5mg + Chlorpheniramine Maleate 2mg"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

        
          {/* Medical Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pharmacological / Usage Details
            </label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Indications, dosage guidelines, therapeutic benefits..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>
        </form>
      </Modal>

      {/* Quick Stock Adjustment Modal */}
      <Modal
        isOpen={Boolean(stockModalProduct)}
        onClose={() => setStockModalProduct(null)}
        title="Quick Stock Adjustment"
        subtitle={`Product: ${stockModalProduct?.productName} (${stockModalProduct?.productCode})`}
        maxWidth="sm"
        footer={
          <>
            <button
              onClick={() => setStockModalProduct(null)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleStockSave}
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#005B96] hover:bg-[#004875] rounded-lg shadow-xs"
            >
              Update Stock
            </button>
          </>
        }
      >
        <div className="space-y-4 text-center">
          <p className="text-xs text-slate-600">
            Enter new physical warehouse inventory units:
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setNewStockValue(Math.max(0, newStockValue - 50))}
              className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 text-sm"
            >
              -50
            </button>
            <button
              type="button"
              onClick={() => setNewStockValue(Math.max(0, newStockValue - 10))}
              className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 text-sm"
            >
              -10
            </button>

            <input
              type="number"
              value={newStockValue}
              onChange={(e) => setNewStockValue(Math.max(0, Number(e.target.value)))}
              className="w-28 py-2 text-center text-lg font-black bg-slate-50 border-2 border-[#005B96] rounded-xl text-slate-900"
            />

            <button
              type="button"
              onClick={() => setNewStockValue(newStockValue + 10)}
              className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 text-sm"
            >
              +10
            </button>
            <button
              type="button"
              onClick={() => setNewStockValue(newStockValue + 50)}
              className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 text-sm"
            >
              +50
            </button>
          </div>
        </div>
      </Modal>

      {/* Product Detail Modal */}
      {detailProduct && (
        <Modal
          isOpen={Boolean(detailProduct)}
          onClose={() => setDetailProduct(null)}
          title={detailProduct.productName}
          subtitle={`SKU: ${detailProduct.productCode} • Division: ${detailProduct.division || 'Pharmaceuticals'}`}
          maxWidth="lg"
          footer={
            <button
              onClick={() => setDetailProduct(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg"
            >
              Close
            </button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex gap-4 items-start">
              
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{detailProduct.productName}</span>
                  <StatusBadge status={detailProduct.isActive ? 'Active' : 'Inactive'} size="sm" />
                </div>
                <p className="text-slate-600"><span className="font-semibold text-slate-800">Composition:</span> {detailProduct.composition}</p>
                <p className="text-slate-600"><span className="font-semibold text-slate-800">Packaging:</span> {detailProduct.packing}</p>
                <p className="text-slate-600"><span className="font-semibold text-slate-800">HSN Code:</span> {detailProduct.hsnCode || '30049099'}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div>
                <span className="text-[10px] text-slate-500 font-medium">MRP</span>
                <p className="font-bold text-slate-900">₹{detailProduct.mrp}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-medium">PTR</span>
                <p className="font-bold text-slate-900">₹{detailProduct.ptr}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-medium">PTS</span>
                <p className="font-bold text-slate-900">₹{detailProduct.pts}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-medium">GST Rate</span>
                <p className="font-bold text-[#005B96]">{detailProduct.gst}%</p>
              </div>
            </div>

            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <h5 className="font-bold text-slate-800 mb-1">Medical & Usage Description</h5>
              <p className="text-slate-600 leading-relaxed">{detailProduct.description || 'No additional notes provided.'}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Pharmaceutical Product"
        message="Are you sure you want to permanently remove this product from the database? This action will also remove it from the Android app catalog."
        confirmText="Delete Product"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
};
