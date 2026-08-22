import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Package, 
  Users, 
  Building2, 
  Target as TargetIcon,
  Database,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { Product, Employee, Distributor, Target } from '../types';
import dataService from '../services/dataService';

interface BulkUploadProps {
  onBulkImportProducts: (prods: Partial<Product>[]) => Promise<{ count: number }>;
}

export const BulkUpload: React.FC<BulkUploadProps> = ({
  onBulkImportProducts,
}) => {
  const [selectedEntity, setSelectedEntity] = useState<'products' | 'employees' | 'distributors' | 'targets'>('products');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  // Download Sample Templates matching Swasth Sampada schema
  const handleDownloadTemplate = () => {
    let headers = '';
    let sampleRow = '';
    let fileName = '';

    if (selectedEntity === 'products') {
      fileName = 'swasth_sampada_products_template.csv';
      headers = 'productName,productCode,category,composition,packing,mrp,ptr,pts,gst,stockQuantity,minStockAlert,division,hsnCode\n';
      sampleRow = 'L-CO-9,L-CO-9,Pharma,"",1*10,240,183.12,164.81,5,100,50,Pharma,30049099\n';
    } else if (selectedEntity === 'employees') {
      fileName = 'swasth_sampada_employees_template.csv';
      headers = 'name,employeeId,email,phone,hq,state,zone,staffType,reportingTo,monthlyTarget,password\n';
      sampleRow = 'Rajesh Sharma,EMP001,rajesh@swasthsampada.com,+91 9876543210,Thane,Maharashtra,West Zone,Medical Representative,Amitabh Verma,350000,EMP001\n';
    } else if (selectedEntity === 'distributors') {
      fileName = 'swasth_sampada_distributors_template.csv';
      headers = 'distributorName,distributorId,contactPerson,phone,email,address,pincode,role,assignedEmployeeName,hq,status\n';
      sampleRow = 'Apex Medico Agencies,DIST-THN-01,Suresh Singhania,+91 9810044556,apex@distributors.com,Jai Bai School Road,400601,Director,Rajesh Sharma,Thane,Active\n';
    } else {
      fileName = 'swasth_sampada_targets_template.csv';
      headers = 'employeeId,employeeName,month,year,salesTarget,doctorVisitTarget,chemistVisitTarget\n';
      sampleRow = 'EMP001,Rajesh Sharma,August,2026,350000,180,90\n';
    }

    const blob = new Blob([headers + sampleRow], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  // Parse CSV File & Validate Rows
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setImportSuccess(null);
    setErrors([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length <= 1) {
        setErrors(['CSV file is empty or missing headers']);
        setParsedData([]);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const rows = [];
      const errs: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const rowValues = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
        const cleanedValues = rowValues.map(v => v.trim().replace(/^"|"$/g, ''));
        
        const obj: any = {};
        headers.forEach((h, idx) => {
          obj[h] = cleanedValues[idx] || '';
        });

        // Entity-specific validation & default normalization
        if (selectedEntity === 'products') {
          if (!obj.productName && !obj.productCode) {
            errs.push(`Row ${i}: Missing product name and product code`);
          }
          obj.mrp = Number(obj.mrp) || 0;
          obj.ptr = Number(obj.ptr) || 0;
          obj.pts = Number(obj.pts) || 0;
          obj.price = Number(obj.pts) || 0;
          obj.gst = Number(obj.gst) || 5;
          obj.stockQuantity = Number(obj.stockQuantity) || 100;
          obj.minStockAlert = Number(obj.minStockAlert) || 50;
          obj.active = true;
        } else if (selectedEntity === 'employees') {
          if (!obj.name && !obj.employeeId) {
            errs.push(`Row ${i}: Missing employee name or employee ID`);
          }
          obj.code = obj.employeeId || obj.code || `EMP-${i}`;
          obj.password = obj.password || obj.code || 'EMP001';
          obj.status = obj.status || 'Active';
        } else if (selectedEntity === 'distributors') {
          if (!obj.distributorName && !obj.companyName) {
            errs.push(`Row ${i}: Missing distributor/company name`);
          }
          obj.distributorId = obj.distributorId || `DIST-${i}`;
          obj.distributorName = obj.distributorName || obj.companyName;
          obj.status = obj.status || 'Active';
        } else if (selectedEntity === 'targets') {
          if (!obj.employeeId && !obj.employeeName) {
            errs.push(`Row ${i}: Missing employee identifier for target`);
          }
          obj.salesTarget = Number(obj.salesTarget) || 0;
        }

        rows.push(obj);
      }

      setParsedData(rows);
      setErrors(errs);
    };

    reader.readAsText(selected);
  };

  // Execute Import directly into Firebase Firestore
  const handleExecuteImport = async () => {
    if (parsedData.length === 0) return;
    setLoading(true);
    try {
      let successCount = 0;

      if (selectedEntity === 'products') {
        const result = await onBulkImportProducts(parsedData);
        successCount = result.count;
        setImportSuccess(`Successfully imported ${successCount} products into Firebase database!`);
      } else if (selectedEntity === 'employees') {
        for (const emp of parsedData) {
          await dataService.saveEmployee(emp);
          successCount++;
        }
        setImportSuccess(`Successfully saved ${successCount} employees to Firebase database!`);
      } else if (selectedEntity === 'distributors') {
        for (const dist of parsedData) {
          await dataService.saveDistributor(dist);
          successCount++;
        }
        setImportSuccess(`Successfully saved ${successCount} stockist agencies to Firebase database!`);
      } else if (selectedEntity === 'targets') {
        for (const trg of parsedData) {
          await dataService.saveTarget(trg);
          successCount++;
        }
        setImportSuccess(`Successfully saved ${successCount} monthly sales targets to Firebase database!`);
      }

      setParsedData([]);
      setFile(null);
    } catch (err: any) {
      setErrors([`Database import error: ${err?.message || 'Unknown error'}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#005B96] via-[#09355c] to-[#06182c] rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[11px] font-bold tracking-wider uppercase border border-cyan-400/30">
              Firestore Sync Engine
            </span>
            <span className="text-xs text-slate-300">Swasth Sampada Group Operations</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Enterprise Bulk Data Importer
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Streamline database ingestion for product formularies, staff rosters, distributor networks, and sales quotas.
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download {selectedEntity.toUpperCase()} CSV Template</span>
        </button>
      </div>

      {/* Step 1: Target Module Selector Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#005B96] text-white flex items-center justify-center text-xs font-bold">1</span>
            Select Target Module
          </h3>
          <span className="text-xs text-slate-400 font-medium">Choose destination schema</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { key: 'products', label: 'Products Formulary', icon: Package, desc: '13 Columns (MRP, PTS, PTR, GST)' },
            { key: 'employees', label: 'Field Staff Roster', icon: Users, desc: '11 Columns (HQ, Zone, Targets)' },
            { key: 'distributors', label: 'Stockist Agencies', icon: Building2, desc: '11 Columns (GST, Credit Limits)' },
            { key: 'targets', label: 'Monthly Targets', icon: TargetIcon, desc: '7 Columns (Quotas, Visits)' },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = selectedEntity === item.key;

            return (
              <button
                key={item.key}
                onClick={() => {
                  setSelectedEntity(item.key as any);
                  setFile(null);
                  setParsedData([]);
                  setErrors([]);
                  setImportSuccess(null);
                }}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-[#005B96] ring-2 ring-[#005B96]/20 shadow-md'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-[#005B96] text-white px-2.5 py-0.5 rounded-bl-xl text-[10px] font-bold">
                    Active
                  </div>
                )}
                <div>
                  <div className={`p-2.5 rounded-xl w-fit ${isSelected ? 'bg-blue-50 text-[#005B96]' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className={`font-bold text-sm mt-3 ${isSelected ? 'text-[#005B96]' : 'text-slate-800'}`}>
                    {item.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Upload CSV Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#005B96] text-white flex items-center justify-center text-xs font-bold">2</span>
            Upload & Stage CSV Data
          </h3>
          <span className="text-xs text-slate-400 font-medium">UTF-8 Encoded Spreadsheet</span>
        </div>

        <div className="bg-white rounded-2xl p-8 border-2 border-dashed border-slate-300 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#005B96] flex items-center justify-center mx-auto shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              Upload {selectedEntity.toUpperCase()} CSV File
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Select your prepared spreadsheet formatted with matching column headers to stage records into the system.
            </p>
          </div>

          <label className="inline-flex items-center gap-2 px-6 py-3 bg-[#005B96] hover:bg-[#004875] text-white text-xs font-bold rounded-xl cursor-pointer shadow-md transition-all active:scale-95">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Choose CSV Spreadsheet</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {file && (
            <div className="pt-2 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 bg-emerald-50 py-2 px-4 rounded-xl max-w-xs mx-auto border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">Staged: {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}
        </div>
      </div>

      {/* Import Success Feedback */}
      {importSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-3 font-bold shadow-sm">
          <div className="p-2 bg-emerald-500 text-white rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-black">Database Synchronization Successful</p>
            <p className="text-xs font-medium text-emerald-700 mt-0.5">{importSuccess}</p>
          </div>
        </div>
      )}

      {/* Validation Warnings */}
      {errors.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-1 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Validation Warnings Detected ({errors.length}):</span>
          </div>
          <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-amber-700">
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      {/* Step 3: Staging Preview Table */}
      {parsedData.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#005B96] text-white flex items-center justify-center text-xs font-bold">3</span>
              Staging Preview & Commit ({parsedData.length} Records)
            </h3>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Ready for Firestore Commit
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs text-slate-500">
                  Verify row contents below. Clicking commit will instantly write records to <strong className="text-slate-800">{selectedEntity}</strong> collection in Firebase.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setParsedData([])}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Discard Staging
                </button>
                <button
                  id="bulk-import-confirm-btn"
                  onClick={handleExecuteImport}
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#005B96] hover:bg-[#004875] rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Database className="w-4 h-4 text-cyan-300" />
                  )}
                  <span>Commit {parsedData.length} Records to Database</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-96 border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 uppercase tracking-wider text-[10px] text-slate-400">#</th>
                    {Object.keys(parsedData[0] || {}).map((col) => (
                      <th key={col} className="py-3 px-3 uppercase tracking-wider text-[11px] font-bold text-slate-700">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {parsedData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-slate-400 font-semibold">{idx + 1}</td>
                      {Object.values(row).map((val: any, cidx) => (
                        <td key={cidx} className="py-2.5 px-3 truncate max-w-[200px] text-slate-800">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};