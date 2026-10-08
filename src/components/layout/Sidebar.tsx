import React from 'react';
import {
  LayoutDashboard,
  PlayCircle,
  Building2,
  GitCompare,
  FileCheck,
  Truck,
  Calculator,
  ShieldCheck,
  CheckSquare,
  Database,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeRoute, navigate, resetAllDemoData, demoCurrentStep } = useApp();

  const handleNav = (route: string) => {
    navigate(route);
    onClose();
  };

  const navItemClass = (route: string) => {
    const isActive = activeRoute === route || (route === 'suppliers' && activeRoute === 'supplier-detail');
    return `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
      isActive
        ? 'bg-teal-500/15 text-teal-300 font-semibold border-l-2 border-teal-400 pl-3'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-black tracking-wider text-base shadow-sm">
              ST
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                SOURCE TRACE AI
              </div>
              <div className="text-[10px] font-medium text-slate-400">
                Supplier Compliance Intelligence
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {/* SECTION 1: OVERVIEW */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              OVERVIEW
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNav('dashboard')}
                className={`w-full ${navItemClass('dashboard')}`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4 text-slate-400" />
                  <span>Dashboard</span>
                </div>
              </button>

              <button
                onClick={() => handleNav('demo-verification')}
                className={`w-full ${navItemClass('demo-verification')}`}
              >
                <div className="flex items-center gap-2.5">
                  <PlayCircle className="w-4 h-4 text-teal-400" />
                  <span className="flex items-center gap-1.5">
                    Demo Verification
                  </span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-400/20 text-teal-300 font-semibold border border-teal-500/30">
                  Step {demoCurrentStep}/5
                </span>
              </button>
            </div>
          </div>

          {/* SECTION 2: SUPPLY CHAIN */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              SUPPLY CHAIN
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNav('suppliers')}
                className={`w-full ${navItemClass('suppliers')}`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>Suppliers</span>
                </div>
              </button>

              <button
                onClick={() => handleNav('compare')}
                className={`w-full ${navItemClass('compare')}`}
              >
                <div className="flex items-center gap-2.5">
                  <GitCompare className="w-4 h-4 text-slate-400" />
                  <span>Compare Suppliers</span>
                </div>
              </button>

              <button
                onClick={() => handleNav('documents')}
                className={`w-full ${navItemClass('documents')}`}
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4 text-slate-400" />
                  <span>Document Verification</span>
                </div>
              </button>

              <button
                onClick={() => handleNav('shipments')}
                className={`w-full ${navItemClass('shipments')}`}
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-slate-400" />
                  <span>Shipment Analysis</span>
                </div>
              </button>

              <button
                onClick={() => handleNav('carbon')}
                className={`w-full ${navItemClass('carbon')}`}
              >
                <div className="flex items-center gap-2.5">
                  <Calculator className="w-4 h-4 text-slate-400" />
                  <span>Carbon Calculator</span>
                </div>
              </button>
            </div>
          </div>

          {/* SECTION 3: ASSURANCE */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              ASSURANCE
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNav('compliance')}
                className={`w-full ${navItemClass('compliance')}`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>Compliance Center</span>
                </div>
              </button>

              <button
                onClick={() => handleNav('actions')}
                className={`w-full ${navItemClass('actions')}`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckSquare className="w-4 h-4 text-slate-400" />
                  <span>Compliance Actions</span>
                </div>
              </button>

              <button
                onClick={() => handleNav('integrity')}
                className={`w-full ${navItemClass('integrity')}`}
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-slate-400" />
                  <span>Integrity Database</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info & Reset */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/40 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 mb-3">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Demo Mode Active
              </span>
              <span className="text-[10px] font-mono text-slate-400">demo_seed</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Deterministic calculations & internal ledger active. External verification not performed.
            </p>
          </div>

          <button
            onClick={() => {
              if (confirm('Reset all supplier records, shipments, and ledger back to original demo seed?')) {
                resetAllDemoData();
              }
            }}
            className="w-full py-2 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 transition-colors flex items-center justify-center gap-1.5 border border-slate-700/60"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Data
          </button>
        </div>
      </aside>
    </>
  );
};
