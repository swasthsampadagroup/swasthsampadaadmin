import React, { useState } from 'react';
import { 
  Bell, 
  Send, 
  Users, 
  Building2, 
  Globe, 
  UserCheck, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Tag
} from 'lucide-react';
import { AppNotification, Employee, Distributor } from '../types';

interface NotificationsProps {
  notifications: AppNotification[];
  employees: Employee[];
  distributors: Distributor[];
  onSendNotification: (notif: Partial<AppNotification>) => Promise<AppNotification>;
}

export const Notifications: React.FC<NotificationsProps> = ({
  notifications,
  employees,
  distributors,
  onSendNotification,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<AppNotification['type']>('general');
  const targetAudience: AppNotification['targetAudience'] = 'specific_user';
  const [specificUserId, setSpecificUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setLoading(true);
    setSuccessMsg(null);

    const specificUser = employees.find(e => e.id === specificUserId);
    const specificDistributor = distributors.find(d => d.id === specificUserId || d.distributorId === specificUserId);
    if (!specificUser && !specificDistributor) return;

    try {
      await onSendNotification({
        title: title.trim(),
        message: message.trim(),
        type,
        targetAudience,
        specificUserId,
        specificUserName: specificUser?.name ?? specificDistributor?.companyName,
        sentBy: 'Super Admin',
      });

      setTitle('');
      setMessage('');
      setSuccessMsg('Notification broadcasted successfully to all target Android devices!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Broadcast & Push Notification Center</span>
          <span className="text-xs font-semibold bg-blue-100 text-[#005B96] px-2.5 py-0.5 rounded-full">
            FCM & Firestore Connected
          </span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Send real-time alerts, product launch announcements, and scheme updates to field representatives
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Form (1 Col) */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-2 bg-blue-50 text-[#005B96] rounded-lg">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Compose Broadcast</h3>
              <p className="text-[11px] text-slate-500">Android Push Notification</p>
            </div>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Title */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Notification Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. New Monsoon Bonus Scheme"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-semibold"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Announcement Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-semibold"
              >
                <option value="general">General Notice</option>
                <option value="product_launch">New Product Launch</option>
                <option value="announcement">Scheme & Price Update</option>
                <option value="target_update">Target Review Meeting</option>
                <option value="urgent">Urgent Operational Alert</option>
              </select>
            </div>

            {/* Target Recipient */}
            <div>
              <div className="p-2.5 rounded-xl border border-[#005B96] bg-blue-50 text-[#005B96] font-bold flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                <span>Send to one selected user only</span>
              </div>
            </div>

            {/* Specific User Dropdown */}
            {targetAudience === 'specific_user' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Recipient</label>
                <select
                  value={specificUserId}
                  onChange={(e) => setSpecificUserId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-semibold"
                >
                  <option value="">-- Select Employee or Distributor --</option>
                  {employees.map(e => (
                    <option key={`employee-${e.id}`} value={e.id}>{e.name} ({e.employeeId}) - Employee</option>
                  ))}
                  {distributors.map(d => (
                    <option key={`distributor-${d.id}`} value={d.id || d.distributorId}>{d.companyName} ({d.distributorId}) - Distributor</option>
                  ))}
                </select>
              </div>
            )}

            {/* Message Body */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Message Content *</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your official announcement here..."
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white leading-relaxed"
              />
            </div>

            {/* Broadcast Button */}
            <button
              id="notif-broadcast-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#005B96] hover:bg-[#004875] text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Broadcast to Android Devices</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sent History Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-[#005B96] rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Broadcast History</h3>
                  <p className="text-xs text-slate-500">Transmitted push logs</p>
                </div>
              </div>

              <span className="text-xs font-semibold text-[#005B96] bg-blue-50 px-2.5 py-0.5 rounded-full">
                {notifications.length} Sent
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No previous notifications logged.
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors text-xs space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>{n.title}</span>
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.2 rounded-full capitalize">
                          {n.type?.replace('_', ' ')}
                        </span>
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono shrink-0">
                        {new Date(n.sentAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-slate-600 leading-relaxed">{n.message}</p>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <div className="flex items-center gap-3 text-slate-500">
                        <span>Audience: <strong className="text-[#005B96] capitalize">{n.targetAudience}</strong></span>
                        <span>Sender: <strong>{n.sentBy}</strong></span>
                      </div>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{n.deliveryStatus}</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
