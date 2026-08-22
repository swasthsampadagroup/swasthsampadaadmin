import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  ShieldCheck, 
  RefreshCw, 
  Copy, 
  Check, 
  Server, 
  Layers, 
  Building, 
  Mail, 
  User, 
  Lock,
  Key,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../services/authContext';
import { dataService } from '../services/dataService';
import { isFirebaseConfigured } from '../services/firebase';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

interface SettingsProps {
  productCount: number;
  orderCount: number;
  employeeCount: number;
  distributorCount: number;
  targetCount: number;
  notificationCount: number;
  onRefreshData: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  productCount,
  orderCount,
  employeeCount,
  distributorCount,
  targetCount,
  notificationCount,
  onRefreshData,
}) => {
  const { user } = useAuth();
  const [copiedRules, setCopiedRules] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const firestoreRulesSnippet = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products formulary - readable by all authenticated app users & admin
    match /products/{productId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.role in ['admin', 'manager'];
    }
    
    // Purchase Orders - field staff can create, admin can approve/reject
    match /orders/{orderId} {
      allow read, create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.token.role in ['admin', 'manager'];
    }

    // Staff Roster & Distributors
    match /employees/{empId} {
      allow read, write: if request.auth != null;
    }
    match /distributors/{distId} {
      allow read, write: if request.auth != null;
    }
    
    // Notifications & Targets
    match /notifications/{notifId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /targets/{targetId} {
      allow read, write: if request.auth != null;
    }
  }
}`;

  const handleCopyRules = () => {
    navigator.clipboard.writeText(firestoreRulesSnippet);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2500);
  };

  const handleResetData = async () => {
    setResetLoading(true);
    try {
      dataService.resetToSeedData();
      onRefreshData();
      setStatusMessage('Database successfully refreshed with initial pharmaceutical seed records!');
      setResetConfirmOpen(false);
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>System Settings & Firebase Cloud Synchronization</span>
          <span className="text-xs font-semibold bg-blue-100 text-[#005B96] px-2.5 py-0.5 rounded-full">
            Admin Console
          </span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage administrator profile, cloud database link, security rules, and data caching
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Admin Profile & Enterprise Info (1 Col) */}
        <div className="space-y-6">
          {/* Admin Profile Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-[#005B96]" />
              <span>Admin Profile</span>
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#005B96] to-[#00A859] text-white font-black text-lg flex items-center justify-center shadow-xs">
                {user?.displayName?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{user?.displayName || 'Super Admin'}</p>
                <p className="text-xs text-slate-500">{user?.email || 'admin@swasthsampada.com'}</p>
                <span className="inline-block mt-1 text-[10px] font-bold uppercase bg-blue-50 text-[#005B96] px-2 py-0.2 rounded-full">
                  {user?.role || 'Super Admin'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span>Account Status:</span>
                <span className="font-bold text-emerald-600">Active & Verified</span>
              </div>
              <div className="flex justify-between">
                <span>Authentication:</span>
                <span className="font-mono text-slate-700">Firebase Auth / Local</span>
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#005B96]" />
              <span>Company Information</span>
            </h3>

            <div className="space-y-2 text-slate-600">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Legal Entity</span>
                <p className="font-bold text-slate-900">Swasth Sampada Healthcare Pvt Ltd</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Corporate HQ</span>
                <p className="font-medium text-slate-800">1109, Block C Siddhi Vinayak Tower Kataria Automobiles Rd, Makarba, Ahmedabad, Gujarat 380051 </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Support Desk</span>
                <p className="font-mono text-slate-800">admin@swasthsampada.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Firebase & Firestore Database Diagnostics (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cloud Sync Diagnostic Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-[#005B96] rounded-xl">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Cloud Firestore Real-Time Database</h3>
                  <p className="text-xs text-slate-500">Android App ↔ Web Admin synchronization engine</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                  isFirebaseConfigured 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-blue-50 text-[#005B96] border border-blue-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full animate-pulse ${isFirebaseConfigured ? 'bg-emerald-500' : 'bg-[#005B96]'}`} />
                  <span>{isFirebaseConfigured ? 'Firebase Cloud Live' : 'Active (Local + Auto-Sync)'}</span>
                </span>
              </div>
            </div>

            /* Collection Metrics Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500">/products</span>
                <p className="text-lg font-black text-slate-900 mt-0.5">{productCount} docs</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500">/orders</span>
                <p className="text-lg font-black text-slate-900 mt-0.5">{orderCount} docs</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500">/employees</span>
                <p className="text-lg font-black text-slate-900 mt-0.5">{employeeCount} docs</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500">/distributors</span>
                <p className="text-lg font-black text-slate-900 mt-0.5">{distributorCount} docs</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500">/targets</span>
                <p className="text-lg font-black text-slate-900 mt-0.5">{targetCount} docs</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500">/notifications</span>
                <p className="text-lg font-black text-slate-900 mt-0.5">{notificationCount} docs</p>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setResetConfirmOpen(true)}
                  className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-seed Sample Data</span>
                </button>

                <button
                  onClick={async () => {
                    setResetLoading(true);
                    try {
                      const res = await dataService.pushAllToFirestore();
                      setStatusMessage(res.message);
                      onRefreshData();
                      setTimeout(() => setStatusMessage(null), 5000);
                    } finally {
                      setResetLoading(false);
                    }
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Push & Seed to Cloud Firestore</span>
                </button>
              </div>

              <button
                onClick={onRefreshData}
                className="px-4 py-2 text-xs font-bold text-[#005B96] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Force Refresh Collections</span>
              </button>
            </div>
          </div>

          {/* Firestore Security Rules Box */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#005B96]" />
                <h3 className="text-sm font-bold text-slate-900">Firestore Security Rules (firestore.rules)</h3>
              </div>
              <button
                onClick={handleCopyRules}
                className="px-3 py-1 text-xs font-bold text-slate-700 hover:text-[#005B96] bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-all"
              >
                {copiedRules ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRules ? 'Copied to Clipboard!' : 'Copy Rules'}</span>
              </button>
            </div>

            <pre className="p-3.5 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-52">
              {firestoreRulesSnippet}
            </pre>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={handleResetData}
        title="Re-seed Sample Database"
        message="This will reset all products, orders, employees, distributors, and targets back to initial pharmaceutical catalog data. Are you sure you want to proceed?"
        confirmText="Confirm Re-seed"
        type="danger"
        loading={resetLoading}
      />
    </div>
  );
};
