import React, { useState } from 'react';
import {
  Bell,
  Check,
  ExternalLink,
  AlertTriangle,
  Info,
  CheckCircle,
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  Truck,
  Database,
  Bot,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type NotificationCategory = 'ALL' | 'Verification' | 'Compliance' | 'Shipment' | 'Integrity' | 'AI';

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, navigate } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory>('ALL');

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getCategory = (n: any): NotificationCategory => {
    const text = (n.title + ' ' + n.message).toLowerCase();
    if (text.includes('integrity') || text.includes('ledger') || text.includes('hash')) return 'Integrity';
    if (text.includes('shipment') || text.includes('consign') || text.includes('freight')) return 'Shipment';
    if (text.includes('copilot') || text.includes('insight') || text.includes('ai') || text.includes('recommendation')) return 'AI';
    if (text.includes('audit') || text.includes('verify') || text.includes('verified')) return 'Verification';
    return 'Compliance';
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'Verification':
        return <FileCheck className="w-3.5 h-3.5 text-teal-400" />;
      case 'Compliance':
        return <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />;
      case 'Shipment':
        return <Truck className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Integrity':
        return <Database className="w-3.5 h-3.5 text-emerald-400" />;
      case 'AI':
        return <Bot className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (selectedCategory === 'ALL') return true;
    return getCategory(n) === selectedCategory;
  });

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs" onClick={onClose} />
      <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 glass-modal rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100 glass-reflection">
        {/* Header */}
        <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Notifications & Alerts
            </span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-mono font-bold rounded-md">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="text-[11px] text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Check className="w-3 h-3" /> Mark all read
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="px-3 py-2 bg-white/[0.01] border-b border-white/5 flex gap-1 overflow-x-auto scrollbar-none text-[10px]">
          {(['ALL', 'Verification', 'Compliance', 'Shipment', 'Integrity', 'AI'] as NotificationCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-teal-500/20 text-teal-200 border border-teal-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-1">
              <CheckCircle className="w-6 h-6 text-teal-400/60 mx-auto mb-2" />
              <p className="font-medium text-white">All caught up</p>
              <p className="text-[11px]">No active notifications in this category.</p>
            </div>
          ) : (
            filteredNotifications.map(n => {
              const cat = getCategory(n);
              return (
                <div
                  key={n.id}
                  onClick={() => {
                    markNotificationAsRead(n.id);
                    if (n.linkRoute) {
                      navigate(n.linkRoute.replace('/', ''), n.linkParam);
                      onClose();
                    }
                  }}
                  className={`p-3.5 hover:bg-white/[0.04] cursor-pointer transition-colors flex items-start gap-3 ${
                    !n.read ? 'bg-teal-500/[0.04]' : ''
                  }`}
                >
                  <div className="mt-0.5 p-1 rounded bg-white/5 border border-white/10 shrink-0">
                    {getCategoryIcon(cat)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-white/5 text-slate-400 border border-white/10">
                          {cat}
                        </span>
                        <span className="text-xs font-semibold text-white truncate">{n.title}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] text-slate-500 font-mono">{n.timestamp}</span>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 ring-1 ring-teal-400/50" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-white/[0.02] border-t border-white/10 text-center">
          <span className="text-[10px] text-slate-400 font-mono">
            SourceTrace Automated Sentinel · Real-Time Tenant Feed
          </span>
        </div>
      </div>
    </>
  );
};
