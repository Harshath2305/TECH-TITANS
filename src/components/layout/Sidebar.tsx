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
  AlertTriangle,
  Sliders,
  Grid,
  Bot,
  Layers,
  Cpu,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeRoute, navigate, resetAllDemoData, demoCurrentStep, setIsCopilotOpen, contradictions } = useApp();

  const handleNav = (route: string) => {
    navigate(route);
    onClose();
  };

  const navItemClass = (route: string) => {
    const isActive = activeRoute === route || (route === 'suppliers' && activeRoute === 'supplier-detail');
    return `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group ${
      isActive
        ? 'bg-teal-500/15 text-teal-200 font-semibold border-l-2 border-teal-400 pl-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
        : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0a101d] border-r border-white/[0.08] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-black tracking-wider text-xs shadow-sm ring-1 ring-teal-300/30">
              ST
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
                SOURCE TRACE AI
              </div>
              <div className="text-[10px] font-medium text-slate-400">
                Enterprise Supply Intelligence
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {/* SECTION 1: OVERVIEW */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              OVERVIEW
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => handleNav('dashboard')}
                className={`w-full ${navItemClass('dashboard')}`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
                  <span>Dashboard</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsCopilotOpen(true);
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 transition-all duration-150 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Bot className="w-4 h-4 text-teal-400 group-hover:scale-105 transition-transform" />
                  <span>AI Copilot</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-400/20 text-teal-300 font-mono tracking-tight">
                  Ask AI
                </span>
              </button>
            </div>
          </div>

          {/* SECTION 2: VERIFICATION */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              VERIFICATION
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => handleNav('demo-verification')}
                className={`w-full ${navItemClass('demo-verification')}`}
              >
                <div className="flex items-center gap-2.5">
                  <PlayCircle className="w-4 h-4 text-teal-400 group-hover:translate-x-0.5 transition-all" />
                  <span className="flex items-center gap-1.5">
                    Demo Verification
                  </span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-400/20 text-teal-300 font-semibold border border-teal-500/30">
                  Step {demoCurrentStep}/5
                </span>
              </button>

              <button
                onClick={() => handleNav('documents')}
                className={`w-full ${navItemClass('documents')}`}
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
                  <span>Document Verification</span>
                </div>
              </button>
            </div>
          </div>

          {/* SECTION 3: SUPPLY CHAIN */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              SUPPLY CHAIN
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => handleNav('suppliers')}
                className={`w-full ${navItemClass('suppliers')}`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
                  <span>Suppliers</span>
                </div>
              </button>

              <button
                onClick={() => handleNav('compare')}
                className={`w-full ${navItemClass('compare')}`}
              >
                <div className="flex items-center gap-2.5">
                  <GitCompare className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
                  <span>Compare Suppliers</span>
                </div>
              </button>

              <button
                onClick={() => handleNav('shipments')}
                className={`w-full ${navItemClass('shipments')}`}
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
                  <span>Shipment Analysis</span>
                </div>
              </button>

              <button
                onClick={() => handleNav('carbon')}
                className={`w-full ${navItemClass('carbon')}`}
              >
                <div className="flex items-center gap-2.5">
                  <Calculator className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
                  <span>Carbon Calculator</span>
                </div>
              </button>
            </div>
          </div>

          {/* SECTION 4: INTELLIGENCE */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              INTELLIGENCE
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => handleNav('contradictions')}
                className={`w-full ${navItemClass('contradictions')}`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-all" />
                  <span>Contradictions</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold font-mono">
                  {contradictions.length}
                </span>
              </button>

              <button
                onClick={() => handleNav('investigations')}
                className={`w-full ${navItemClass('investigations')}`}
              >
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-teal-400 group-hover:translate-x-0.5 transition-all" />
                  <span>Autonomous Audit</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-semibold">
                  8-Gate
                </span>
              </button>

              <button
                onClick={() => handleNav('digital-twin')}
                className={`w-full ${navItemClass('digital-twin')}`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  <span>Digital Twin</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">
                  6-Layer
                </span>
              </button>

              <button
                onClick={() => handleNav('heatmap')}
                className={`w-full ${navItemClass('heatmap')}`}
              >
                <div className="flex items-center gap-2.5">
                  <Grid className="w-4 h-4 text-teal-400 group-hover:translate-x-0.5 transition-all" />
                  <span>Risk Heatmap</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-semibold">
                  2D
                </span>
              </button>

              <button
                onClick={() => handleNav('anomalies')}
                className={`w-full ${navItemClass('anomalies')}`}
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-all" />
                  <span>Anomaly Detection</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                  Live
                </span>
              </button>

              <button
                onClick={() => handleNav('simulator')}
                className={`w-full ${navItemClass('simulator')}`}
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-teal-400 group-hover:translate-x-0.5 transition-all" />
                  <span>What-If Simulator</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-semibold">
                  Sandbox
                </span>
              </button>
            </div>
          </div>

          {/* SECTION 5: COMPLIANCE */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              COMPLIANCE
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => handleNav('compliance')}
                className={`w-full ${navItemClass('compliance')}`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
                  <span>Compliance Center</span>
                </div>
              </button>

              <button
                onClick={() => handleNav('actions')}
                className={`w-full ${navItemClass('actions')}`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckSquare className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
                  <span>Compliance Actions</span>
                </div>
              </button>
            </div>
          </div>

          {/* SECTION 6: INTEGRITY */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              INTEGRITY
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => handleNav('integrity')}
                className={`w-full ${navItemClass('integrity')}`}
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-teal-400 group-hover:translate-x-0.5 transition-all" />
                  <span>Integrity Ledger</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info & Reset */}
        <div className="p-3 border-t border-white/[0.08] bg-[#080d17] text-xs">
          <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] mb-2.5">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Demo Mode Active
              </span>
              <span className="text-[10px] font-mono text-slate-400">demo_seed</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Deterministic calculations & internal ledger active.
            </p>
          </div>

          <button
            onClick={() => {
              if (confirm('Reset all supplier records, shipments, and ledger back to original demo seed?')) {
                resetAllDemoData();
              }
            }}
            className="w-full py-1.5 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors flex items-center justify-center gap-1.5 border border-white/[0.08] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Data
          </button>
        </div>
      </aside>
    </>
  );
};
