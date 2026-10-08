import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  RefreshCw,
  Building2,
  Lock,
  Layers,
  ArrowRight,
  ExternalLink,
  Info,
  ShieldAlert,
  Search,
  Activity,
  Cpu,
  Download,
  Share2,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Supplier, InvestigationRecord } from '../types';
import { interpretInvestigationWithAi } from '../services/aiService';

export const AutonomousInvestigationView: React.FC = () => {
  const {
    suppliers,
    investigations,
    runAutonomousInvestigation,
    activeInvestigationSupplierId,
    setActiveInvestigationSupplierId,
    navigate,
    openPrintReport,
  } = useApp();

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    activeInvestigationSupplierId || suppliers[0]?.id || 'sup-apex-01'
  );

  const [currentInvestigation, setCurrentInvestigation] = useState<InvestigationRecord | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'graph' | 'timeline' | 'dossier'>('graph');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // AI synthesis state
  const [aiAnalysis, setAiAnalysis] = useState<{
    executiveSummary: string;
    actionPriorities: string[];
    source: string;
    isFallback: boolean;
  } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Sync if activeInvestigationSupplierId changes from another view
  useEffect(() => {
    if (activeInvestigationSupplierId && activeInvestigationSupplierId !== selectedSupplierId) {
      setSelectedSupplierId(activeInvestigationSupplierId);
    }
  }, [activeInvestigationSupplierId]);

  // Load existing investigation or prepare supplier
  useEffect(() => {
    const existing = investigations.find(i => i.supplierId === selectedSupplierId);
    if (existing) {
      setCurrentInvestigation(existing);
    } else {
      // Auto-trigger deterministic investigation if none exists
      triggerInvestigation(selectedSupplierId);
    }
  }, [selectedSupplierId]);

  const triggerInvestigation = async (supplierId: string) => {
    setIsRunning(true);
    setCurrentStageIndex(0);

    // Simulate animated 8-stage progress execution
    for (let i = 1; i <= 8; i++) {
      setCurrentStageIndex(i);
      await new Promise(r => setTimeout(r, 140));
    }

    const record = await runAutonomousInvestigation(supplierId);
    setCurrentInvestigation(record);
    setIsRunning(false);

    // Fetch AI interpretation in background
    setIsAiLoading(true);
    try {
      const aiResult = await interpretInvestigationWithAi(record);
      setAiAnalysis(aiResult);
    } catch {
      setAiAnalysis(null);
    } finally {
      setIsAiLoading(false);
    }
  };

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];

  const STAGE_NAMES = [
    'Registry Identity',
    'Accreditation Expiry',
    'Manifests & Filings',
    'Consignment Audits',
    'Scope-3 Carbon',
    'Corrective Actions',
    'Contradiction Graph',
    'Cryptographic Ledger',
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-slate-100">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-teal-400 animate-pulse" />
              Forensic Intelligence
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-slate-400 text-xs font-mono">8-GATE WORKFLOW</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Autonomous Investigation Mode
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Multi-stage autonomous audit scanning registry profiles, bills of lading, Scope-3 logistics intensity, 
            evidence contradictions, and SHA-256 cryptographic chain continuity.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Supplier Selector */}
          <div className="relative">
            <select
              value={selectedSupplierId}
              onChange={e => {
                setSelectedSupplierId(e.target.value);
                setActiveInvestigationSupplierId(e.target.value);
              }}
              className="px-3 py-2 pr-8 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white font-medium focus:outline-hidden focus:border-teal-400"
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.complianceScore}/100)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => triggerInvestigation(selectedSupplierId)}
            disabled={isRunning}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isRunning
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 animate-pulse'
                : 'neo-button-primary btn-shine shadow-md'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Investigating...' : 'Run Full Investigation'}</span>
          </button>

          <button
            onClick={() => {
              if (selectedSupplier) {
                openPrintReport(selectedSupplier.id);
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Print Compliance Summary"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export Dossier</span>
          </button>
        </div>
      </div>

      {/* Progress Bar (Visible while running or when completed) */}
      {isRunning && (
        <div className="glass-panel p-4 rounded-2xl border border-teal-500/30 bg-teal-950/20 shadow-lg">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-teal-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-spin" />
              Running Gate {currentStageIndex}/8: {STAGE_NAMES[currentStageIndex - 1] || 'Initializing'}
            </span>
            <span className="font-mono text-teal-400 text-[11px]">
              {Math.round((currentStageIndex / 8) * 100)}% Complete
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-200"
              style={{ width: `${(currentStageIndex / 8) * 100}%` }}
            />
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 mt-3">
            {STAGE_NAMES.map((name, idx) => (
              <div
                key={name}
                className={`text-[9px] p-1 rounded text-center truncate ${
                  idx + 1 < currentStageIndex
                    ? 'bg-teal-500/20 text-teal-300 font-semibold'
                    : idx + 1 === currentStageIndex
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'bg-white/5 text-slate-500'
                }`}
              >
                G{idx + 1}: {name.split(' ')[0]}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Summary Banner */}
      {currentInvestigation && (
        <div
          className={`glass-panel p-5 rounded-2xl border ${
            currentInvestigation.investigationStatus === 'FULL APPROVAL'
              ? 'border-emerald-500/30 bg-emerald-950/15'
              : currentInvestigation.investigationStatus === 'CONDITIONAL APPROVAL'
              ? 'border-amber-500/30 bg-amber-950/15'
              : 'border-rose-500/30 bg-rose-950/15'
          } relative overflow-hidden`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    currentInvestigation.investigationStatus === 'FULL APPROVAL'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : currentInvestigation.investigationStatus === 'CONDITIONAL APPROVAL'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {currentInvestigation.investigationStatus}
                </span>
                <span className="text-slate-400 text-xs">
                  ID: <span className="font-mono text-slate-300">{currentInvestigation.investigationId}</span>
                </span>
                <span className="text-slate-500 text-xs hidden sm:inline">•</span>
                <span className="text-slate-400 text-xs hidden sm:inline">
                  {new Date(currentInvestigation.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white font-serif">
                {currentInvestigation.supplierName} Forensic Audit Synthesis
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                {currentInvestigation.answer}
              </p>
            </div>

            {/* Quick KPI stats */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <div className="text-center px-3 py-2 rounded-xl bg-black/30 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Gates Cleared</span>
                <span className="text-base sm:text-lg font-extrabold text-teal-400 font-mono">
                  {currentInvestigation.checksPerformed.filter(c => c.passed).length}/8
                </span>
              </div>
              <div className="text-center px-3 py-2 rounded-xl bg-black/30 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Contradictions</span>
                <span className={`text-base sm:text-lg font-extrabold font-mono ${
                  currentInvestigation.contradictionsFound > 0 ? 'text-amber-400' : 'text-slate-400'
                }`}>
                  {currentInvestigation.contradictionsFound}
                </span>
              </div>
              <div className="text-center px-3 py-2 rounded-xl bg-black/30 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Ledger Integrity</span>
                <span className="text-base sm:text-lg font-extrabold text-emerald-400 font-mono">
                  100%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('graph')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'graph'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Root Cause Graph</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>8-Gate Evidence Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('dossier')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'dossier'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Executive AI Dossier</span>
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => navigate('contradictions')}
            className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Evidence Contradictions</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* TAB 1: ROOT CAUSE GRAPH (Interactive Node Map) */}
      {activeTab === 'graph' && currentInvestigation && (
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-base font-semibold text-white">
                  Evidence Dependency & Causality Graph
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any node to inspect evidence verification chain, registry roots, and contradiction links.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Verified
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Warning / Expiring
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  Breach / Contradiction
                </span>
              </div>
            </div>

            {/* Visual Node Graph Layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/60 border border-white/5 relative">
              {/* Column 1: Entity Root */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  LAYER 1: ENTITY ROOT
                </span>
                <div
                  onClick={() => setSelectedNode('entity')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedNode === 'entity'
                      ? 'border-teal-400 bg-teal-950/30 ring-1 ring-teal-400/50'
                      : 'border-white/10 bg-white/[0.03] hover:border-teal-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-teal-400" />
                      {currentInvestigation.supplierName}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    ID: {currentInvestigation.supplierId}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Base Score: {selectedSupplier?.complianceScore}/100
                  </div>
                </div>
              </div>

              {/* Column 2: Documents & Certs */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  LAYER 2: ACCREDITATIONS & MANIFESTS
                </span>

                <div
                  onClick={() => setSelectedNode('certs')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedNode === 'certs'
                      ? 'border-teal-400 bg-teal-950/30 ring-1 ring-teal-400/50'
                      : selectedSupplier?.certifications.some(c => c.status === 'Expired')
                      ? 'border-rose-500/30 bg-rose-950/20'
                      : selectedSupplier?.certifications.some(c => c.status === 'Expiring Soon')
                      ? 'border-amber-500/30 bg-amber-950/20'
                      : 'border-white/10 bg-white/[0.03] hover:border-teal-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                      Certifications ({selectedSupplier?.certifications.length})
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        selectedSupplier?.certifications.some(c => c.status === 'Expired')
                          ? 'bg-rose-400'
                          : selectedSupplier?.certifications.some(c => c.status === 'Expiring Soon')
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    {selectedSupplier?.certifications.map(c => c.name).join(', ') || 'No accreditations'}
                  </div>
                </div>

                <div
                  onClick={() => setSelectedNode('manifests')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedNode === 'manifests'
                      ? 'border-teal-400 bg-teal-950/30 ring-1 ring-teal-400/50'
                      : selectedSupplier?.shipments.some(s => !s.hasManifest)
                      ? 'border-amber-500/30 bg-amber-950/20'
                      : 'border-white/10 bg-white/[0.03] hover:border-teal-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-teal-400" />
                      Shipment Manifests
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        selectedSupplier?.shipments.some(s => !s.hasManifest)
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    {selectedSupplier?.shipments.filter(s => s.hasManifest).length} / {selectedSupplier?.shipments.length} filed
                  </div>
                </div>
              </div>

              {/* Column 3: Telemetry & Carbon */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  LAYER 3: TELEMETRY & EMISSIONS
                </span>

                <div
                  onClick={() => setSelectedNode('carbon')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedNode === 'carbon'
                      ? 'border-teal-400 bg-teal-950/30 ring-1 ring-teal-400/50'
                      : 'border-white/10 bg-white/[0.03] hover:border-teal-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-teal-400" />
                      Scope-3 Logistics
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {((selectedSupplier?.carbonSummary?.totalEmissionsKg || 0) / 1000).toFixed(2)} t CO2e
                  </div>
                  <div className="text-[10px] text-slate-400">GLEC Framework v2.0</div>
                </div>

                <div
                  onClick={() => setSelectedNode('contradictions')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedNode === 'contradictions'
                      ? 'border-teal-400 bg-teal-950/30 ring-1 ring-teal-400/50'
                      : currentInvestigation.contradictionsFound > 0
                      ? 'border-rose-500/30 bg-rose-950/20'
                      : 'border-white/10 bg-white/[0.03] hover:border-teal-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      Contradiction Check
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        currentInvestigation.contradictionsFound > 0 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {currentInvestigation.contradictionsFound} Cross-record variance(s)
                  </div>
                </div>
              </div>

              {/* Column 4: Ledger & Governance Decision */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  LAYER 4: DECISION & LEDGER
                </span>

                <div
                  onClick={() => setSelectedNode('ledger')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedNode === 'ledger'
                      ? 'border-teal-400 bg-teal-950/30 ring-1 ring-teal-400/50'
                      : 'border-white/10 bg-white/[0.03] hover:border-teal-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-teal-400" />
                      SHA-256 Ledger
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    Hash: 8f9b...a12c
                  </div>
                  <div className="text-[10px] text-emerald-400">Chain Validated</div>
                </div>

                <div
                  onClick={() => setSelectedNode('decision')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedNode === 'decision'
                      ? 'border-teal-400 bg-teal-950/30 ring-1 ring-teal-400/50'
                      : 'border-teal-500/30 bg-teal-950/20 hover:border-teal-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                      Audit Outcome
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-white">
                    {currentInvestigation.investigationStatus}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Priority: {currentInvestigation.recommendedActions[0] || 'Standard Review'}
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Drawer for Selected Node */}
            {selectedNode && (
              <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-teal-500/30 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-teal-300 uppercase tracking-wider text-[11px]">
                    Node Inspection: {selectedNode.toUpperCase()}
                  </span>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                <div className="text-slate-300 leading-relaxed">
                  {selectedNode === 'entity' && (
                    <p>Corporate profile established in SourceTrace registry. Primary facility in {selectedSupplier?.location}, risk tier {selectedSupplier?.riskLevel}. Verified legal entity identifier and business registration.</p>
                  )}
                  {selectedNode === 'certs' && (
                    <p>Accreditation records audited against regulatory registries. {selectedSupplier?.certifications.map(c => `${c.name} (${c.status}, expires ${c.expiryDate})`).join('; ')}.</p>
                  )}
                  {selectedNode === 'manifests' && (
                    <p>Consignment bills of lading cross-referenced against logistics tracking numbers. {selectedSupplier?.shipments.filter(s => s.hasManifest).length} manifests cryptographically timestamped.</p>
                  )}
                  {selectedNode === 'carbon' && (
                    <p>Scope-3 freight emissions calculated deterministically using fuel burn and modal tonne-kilometer factors. Total: {selectedSupplier?.carbonSummary?.totalEmissionsKg.toLocaleString()} kg CO2e.</p>
                  )}
                  {selectedNode === 'contradictions' && (
                    <p>{currentInvestigation.contradictionsFound > 0 ? `Detected ${currentInvestigation.contradictionsFound} discrepancies between declared manifests and commercial invoices.` : 'No contradictory records detected across supplier shipments.'}</p>
                  )}
                  {selectedNode === 'ledger' && (
                    <p>Audit trail secured with SHA-256 block hash chaining. All inspection events, score recalculations, and status transitions are tamper-evident.</p>
                  )}
                  {selectedNode === 'decision' && (
                    <p>Final policy evaluation: {currentInvestigation.investigationStatus}. Grounded in compliance score, accreditation statuses, and documentary evidence.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: 8-GATE EVIDENCE TIMELINE */}
      {activeTab === 'timeline' && currentInvestigation && (
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <div>
            <h3 className="font-serif text-base font-semibold text-white">
              8-Gate Deterministic Audit Pipeline
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Every verification check is evaluated deterministically without probabilistic hallucination.
            </p>
          </div>

          <div className="space-y-3">
            {currentInvestigation.checksPerformed.map(check => (
              <div
                key={check.stageId}
                className={`p-4 rounded-xl border transition-all ${
                  check.passed && !check.warning
                    ? 'border-emerald-500/20 bg-emerald-950/10'
                    : check.warning
                    ? 'border-amber-500/20 bg-amber-950/10'
                    : 'border-rose-500/20 bg-rose-950/10'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        check.passed && !check.warning
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : check.warning
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      G{check.stageId}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{check.stageName}</span>
                        <span className="text-slate-500 font-normal">•</span>
                        <span className="text-slate-300 font-medium text-[11px]">{check.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {check.detail}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:self-center shrink-0">
                    {check.metric && (
                      <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-slate-300">
                        {check.metric}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        check.passed && !check.warning
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : check.warning
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {check.passed && !check.warning ? 'Passed' : check.warning ? 'Warning' : 'Failed'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EXECUTIVE AI DOSSIER */}
      {activeTab === 'dossier' && currentInvestigation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main AI Synthesis */}
          <div className="lg:col-span-2 space-y-5">
            <div className="glass-panel p-5 rounded-2xl border border-teal-500/30 bg-teal-950/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-teal-400" />
                  Grounded Intelligence Synthesis
                </span>
                <span className="text-[10px] text-slate-400">
                  {isAiLoading ? 'Synthesizing insights...' : 'Verified from internal records'}
                </span>
              </div>

              <h3 className="font-serif text-lg font-bold text-white mb-2">
                Executive Risk Narrative
              </h3>

              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2 bg-black/30 p-4 rounded-xl border border-white/5">
                <p>
                  {aiAnalysis?.executiveSummary || currentInvestigation.answer}
                </p>
              </div>

              {/* Action Priorities */}
              <div className="mt-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                  CORRECTIVE REMEDIATION ROADMAP
                </span>
                <div className="space-y-2">
                  {(aiAnalysis?.actionPriorities || currentInvestigation.recommendedActions).map((action, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-2.5"
                    >
                      <div className="w-5 h-5 rounded-md bg-teal-500/20 text-teal-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="text-xs text-slate-300 leading-snug">
                        {action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Provenance Box */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-teal-300 font-semibold">
                <Lock className="w-3 h-3" />
                <span>Deterministic Grounding Provenance</span>
              </div>
              <p>{currentInvestigation.provenance}</p>
            </div>
          </div>

          {/* Right Column: Signals & Evidence Checklist */}
          <div className="space-y-5">
            {/* Positive Signals */}
            <div className="glass-panel p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-2.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                POSITIVE AUDIT SIGNALS ({currentInvestigation.positiveSignals.length})
              </span>
              <ul className="space-y-2">
                {currentInvestigation.positiveSignals.map((signal, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                    <span>{signal}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Attention Required */}
            {currentInvestigation.attentionRequired.length > 0 && (
              <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-950/10">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-2.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  ATTENTION REQUIRED ({currentInvestigation.attentionRequired.length})
                </span>
                <ul className="space-y-2">
                  {currentInvestigation.attentionRequired.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
