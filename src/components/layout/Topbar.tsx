import React, { useState } from 'react';
import { Menu, Search, Bell, Shield, Sparkles, User, HelpCircle, FileText, Bot } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationDrawer } from '../common/NotificationDrawer';

interface TopbarProps {
  onOpenMobileSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileSidebar }) => {
  const { activeRoute, setIsSearchOpen, notifications, navigate, openPrintReport, suppliers, setIsCopilotOpen, setIsExecutiveBriefOpen } = useApp();
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
        return 'Integrity Verification Center (SHA-256 Ledger)';
      case 'anomalies':
        return 'AI Supply Chain Anomaly Detection';
      case 'simulator':
        return 'What-If Compliance Risk Simulator';
      case 'heatmap':
        return 'Supplier Risk & Compliance Heatmap';
      case 'print-report':
        return 'Printable Supplier Compliance Summary';
      default:
        return 'Supplier Compliance Platform';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 glass-topbar px-4 sm:px-6 flex items-center justify-between no-print glass-reflection">
      {/* Left side: Hamburger & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 -ml-1 text-slate-300 hover:text-white rounded-lg lg:hidden transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>{getRouteTitle()}</span>
          </h1>
          <div className="text-[11px] text-slate-400 hidden sm:block">
            Internal Tenant Registry · Scope-3 Deterministic Accounting
          </div>
        </div>
      </div>

      {/* Right side: Global Search, Quick Demo, Notifications, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Global Search Button with Glass Effect */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs backdrop-blur-md shadow-xs cursor-pointer"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="hidden md:inline">Search everything...</span>
          <kbd className="hidden md:inline-block font-mono text-[10px] bg-slate-800/80 border border-white/10 px-1.5 py-0.5 rounded text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Enterprise AI Copilot Trigger Button with Depth & Shine */}
        <button
          onClick={() => setIsCopilotOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 text-xs font-bold transition-all shadow-md cursor-pointer group btn-shine neo-raised"
          title="Open SourceTrace Copilot: Ask questions about your verified supply-chain data"
        >
          <Bot className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Copilot</span>
          <span className="text-[10px] bg-teal-500 text-slate-950 px-1.5 py-0.2 rounded font-mono font-bold">
            AI
          </span>
        </button>

        {/* Quick Demo Button with Neumorphic Depth and Shine */}
        <button
          onClick={() => navigate('demo-verification')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg neo-button-primary btn-shine text-xs font-bold cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Demo Flow</span>
        </button>

        {/* Executive Risk Brief Button */}
        <button
          onClick={() => setIsExecutiveBriefOpen(true)}
          title="Open Executive Risk Brief"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 text-xs font-semibold cursor-pointer btn-shine"
        >
          <FileText className="w-3.5 h-3.5 text-teal-400" />
          <span>Executive Brief</span>
        </button>

        {/* Print Apex Quick Action */}
        <button
          onClick={() => openPrintReport('sup-apex-01')}
          title="Print Apex Compliance Report"
          className="p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors hidden xl:flex items-center gap-1.5 text-xs font-medium border border-white/10 neo-raised cursor-pointer btn-shine"
        >
          <FileText className="w-3.5 h-3.5 text-teal-400" />
          <span>Print Summary</span>
        </button>

        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(prev => !prev)}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg relative transition-colors cursor-pointer border border-white/5"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-400 ring-2 ring-slate-900" />
            )}
          </button>
          <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center ring-1 ring-white/20 shadow-xs">
            CO
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-white leading-tight">Compliance Lead</div>
            <div className="text-[10px] text-teal-400">Global ESG Operations</div>
          </div>
        </div>
      </div>
    </header>
  );
};
