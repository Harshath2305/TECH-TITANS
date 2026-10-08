import React from 'react';
import { Bell, Check, ExternalLink, AlertTriangle, Info, CheckCircle, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, navigate } = useApp();

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'warning':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-sky-500" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-700" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Notifications & Alerts
            </span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="text-[11px] text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> Mark all read
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No new compliance notifications
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => {
                  markNotificationAsRead(n.id);
                  if (n.linkRoute) {
                    navigate(n.linkRoute.replace('/', ''), n.linkParam);
                    onClose();
                  }
                }}
                className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 ${
                  !n.read ? 'bg-sky-50/30' : ''
                }`}
              >
                <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-semibold text-slate-900 truncate">{n.title}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{n.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
          <span className="text-[11px] text-slate-500">
            Real-time internal compliance monitor
          </span>
        </div>
      </div>
    </>
  );
};
