import React, { useState } from 'react';
import { Menu, Search, Bell, Shield, Sparkles, User, HelpCircle, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationDrawer } from '../common/NotificationDrawer';

interface TopbarProps {
  onOpenMobileSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileSidebar }) => {
  const { activeRoute, setIsSearchOpen, notifications, navigate, openPrintReport, suppliers } = useApp();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getRouteTitle = () => {
    switch (activeRoute) {
      case 'dashboard':
        return 'Executive Overview & Compliance Intelligence';
      case 'demo-verification':
        return '3-Minute Supplier Verification Flow';
      case 'suppliers':
      case 'supplier-detail':
        return 'Supplier Portfolio & 360° Audit';
      case 'compare':
        return 'Comparative Supplier Benchmarking';
      case 'documents':
        return 'Document Verification & Registry';
      case 'shipments':
        return 'Upstream Shipment Logistics Analysis';
      case 'carbon':
        return 'Scope-3 Category 4 Deterministic Calculator';
      case 'compliance':
        return 'Regulatory & Certification Compliance Center';
      case 'actions':
        return 'Compliance Action Tracker & Remediations';
      case 'integrity':
        return 'Internal Integrity Ledger (Audit Trail)';
      case 'print-report':
        return 'Printable Supplier Compliance Summary';
      default:
        return 'Supplier Compliance Platform';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between no-print">
      {/* Left side: Hamburger & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{getRouteTitle()}</span>
          </h1>
          <div className="text-[11px] text-slate-500 hidden sm:block">
            Internal Tenant Registry · Scope-3 Deterministic Accounting
          </div>
        </div>
      </div>

      {/* Right side: Global Search, Quick Demo, Notifications, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Global Search Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors text-xs"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="hidden md:inline">Search everything...</span>
          <kbd className="hidden md:inline-block font-mono text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Quick Demo Button */}
        <button
          onClick={() => navigate('demo-verification')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Demo Flow</span>
        </button>

        {/* Print Apex Quick Action */}
        <button
          onClick={() => openPrintReport('sup-apex-01')}
          title="Print Apex Compliance Report"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors hidden xl:flex items-center gap-1.5 text-xs font-medium border border-slate-200"
        >
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>Print Summary</span>
        </button>

        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(prev => !prev)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>
          <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-semibold text-xs flex items-center justify-center">
            CO
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-900 leading-tight">Compliance Lead</div>
            <div className="text-[10px] text-slate-500">Global ESG Operations</div>
          </div>
        </div>
      </div>
    </header>
  );
};
