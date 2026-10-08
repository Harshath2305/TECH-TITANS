import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  FileText,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Clock,
  Building2,
  Truck,
  Award,
  Layers,
  X,
  RefreshCw,
  Sliders,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EvidenceContradiction, SeverityLevel } from '../types';
import { explainContradictionWithAi } from '../services/aiService';

export const EvidenceContradictionsView: React.FC = () => {
  const {
    contradictions,
    updateContradictionStatus,
    navigate,
    setActiveInvestigationSupplierId,
  } = useApp();

  const [selectedContradiction, setSelectedContradiction] = useState<EvidenceContradiction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // AI explanation drawer states
  const [isExplaining, setIsExplaining] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<{
    whyItMatters: string;
    recommendedAction: string;
    source: string;
    isFallback: boolean;
  } | null>(null);

  // Summary counts
  const totalCount = contradictions.length;
  const criticalCount = contradictions.filter(c => c.severity === 'CRITICAL').length;
  const highCount = contradictions.filter(c => c.severity === 'HIGH').length;
  const mediumCount = contradictions.filter(c => c.severity === 'MEDIUM').length;
  const resolvedCount = contradictions.filter(c => c.status === 'Resolved').length;

  const filteredContradictions = useMemo(() => {
    return contradictions.filter(c => {
      const matchSearch =
        c.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.field.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.shipmentId && c.shipmentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        c.sourceA.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.sourceB.toLowerCase().includes(searchQuery.toLowerCase());

      const matchSeverity = severityFilter === 'ALL' || c.severity === severityFilter;
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;

      return matchSearch && matchSeverity && matchStatus;
    });
  }, [contradictions, searchQuery, severityFilter, statusFilter]);

  const handleOpenDrawer = async (contradiction: EvidenceContradiction) => {
    setSelectedContradiction(contradiction);
    setIsExplaining(true);
    setAiExplanation(null);

    try {
      const res = await explainContradictionWithAi(contradiction);
      setAiExplanation(res);
    } catch {
      setAiExplanation({
        whyItMatters: contradiction.explanation || 'Discrepancy detected across stored records.',
        recommendedAction: contradiction.recommendedAction || 'Request formal reconciliation documentation.',
        source: 'deterministic_fallback',
        isFallback: true,
      });
    } finally {
      setIsExplaining(false);
    }
  };

  const getSeverityBadge = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getStatusBadge = (status: EvidenceContradiction['status']) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Investigating':
        return 'bg-teal-500/15 text-teal-300 border-teal-500/30';
      default:
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-white tracking-tight">
              Evidence Contradiction Engine
            </h2>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
              CROSS-DOCUMENT SURVEILLANCE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Identifies when two or more verified sources disagree across commercial invoices, bill of lading manifests,
            regulatory certification registries, and Scope-3 carbon accounting models.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('digital-twin')}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span>Digital Twin Map</span>
          </button>
          <button
            onClick={() => navigate('investigations')}
            className="px-3.5 py-2 rounded-xl neo-button-primary btn-shine text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Investigation</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="glass-metric-card p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            TOTAL CONTRADICTIONS
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1">
            {totalCount}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Cross-record variances</span>
        </div>

        <div className="glass-metric-card p-4">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
            CRITICAL SEVERITY
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono mt-1">
            {criticalCount}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Requires PO hold</span>
        </div>

        <div className="glass-metric-card p-4">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
            HIGH SEVERITY
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono mt-1">
            {highCount}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Weight / date mismatch</span>
        </div>

        <div className="glass-metric-card p-4">
          <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider block">
            MEDIUM SEVERITY
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-yellow-400 font-mono mt-1">
            {mediumCount}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Audit review pending</span>
        </div>

        <div className="glass-metric-card p-4 col-span-2 md:col-span-1">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
            RESOLVED
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono mt-1">
            {resolvedCount}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Reconciled in ERP</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by supplier, field, consignment, or source document..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-500 focus:outline-hidden focus:border-teal-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Severity:</span>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-slate-200 text-xs focus:outline-hidden"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-slate-200 text-xs focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Investigating">Investigating</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contradictions Master Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-sm sm:text-base font-semibold text-white">
              Detected Evidence Inconsistencies ({filteredContradictions.length})
            </h3>
            <p className="text-[11px] text-slate-400">
              Click any contradiction row to open the forensic comparison drawer.
            </p>
          </div>
          <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
            Deterministic Rule Engine
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 text-slate-400 border-b border-white/10 uppercase text-[10px] tracking-wider font-semibold font-mono">
              <tr>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-3">Consignment</th>
                <th className="py-3 px-4">Contradiction Field</th>
                <th className="py-3 px-4">Evidence A (Declared)</th>
                <th className="py-3 px-4">Evidence B (Audit Record)</th>
                <th className="py-3 px-3">Variance</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-2">Confidence</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredContradictions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-teal-400/60 mx-auto mb-2" />
                    <p className="font-medium text-white text-sm">No verified contradictions detected</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      All compared invoices, manifests, and certifications match stored parameters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredContradictions.map(item => (
                  <tr
                    key={item.contradictionId}
                    onClick={() => handleOpenDrawer(item)}
                    className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>{item.supplierName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-300">
                      {item.shipmentId || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-teal-200">
                      {item.field}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{item.valueA}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[160px] font-mono">
                        {item.sourceA}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{item.valueB}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[160px] font-mono">
                        {item.sourceB}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-amber-300">
                      {item.difference || 'Mismatch'}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${getSeverityBadge(item.severity)}`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 font-mono text-teal-400 font-bold">
                      {item.confidence}%
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenDrawer(item)}
                        className="px-2.5 py-1 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <span>Investigate</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Investigation Drawer */}
      {selectedContradiction && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-xl h-full glass-modal p-6 overflow-y-auto flex flex-col justify-between text-slate-100 border-l border-white/10 shadow-2xl glass-reflection">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-300">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400">
                      FORENSIC EVIDENCE CONTRADICTION
                    </span>
                    <h3 className="font-serif text-lg font-bold text-white mt-0.5">
                      {selectedContradiction.field}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedContradiction(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Entity Overview */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Affected Supplier:</span>
                  <span className="font-bold text-white text-sm mt-0.5 block">{selectedContradiction.supplierName}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Consignment Identifier:</span>
                  <span className="font-mono font-bold text-teal-300 text-sm mt-0.5 block">{selectedContradiction.shipmentId || 'N/A (Accreditation Record)'}</span>
                </div>
              </div>

              {/* Side-by-Side Conflicting Evidence Cards */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  Cross-Verification Evidence Comparison
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Source A */}
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400">
                      <span>Source A</span>
                      <span className="text-teal-400">Carrier Manifest</span>
                    </div>
                    <div className="text-lg font-black font-mono text-white">
                      {selectedContradiction.valueA}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {selectedContradiction.sourceA}
                    </p>
                  </div>

                  {/* Source B */}
                  <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase text-rose-300">
                      <span>Source B</span>
                      <span className="text-rose-400">Invoice / Audit Scan</span>
                    </div>
                    <div className="text-lg font-black font-mono text-rose-200">
                      {selectedContradiction.valueB}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {selectedContradiction.sourceB}
                    </p>
                  </div>
                </div>

                {/* Variance Highlight */}
                {selectedContradiction.difference && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs">
                    <span className="text-amber-200 font-semibold">Mathematical Discrepancy:</span>
                    <span className="font-mono font-extrabold text-amber-300 text-sm">
                      {selectedContradiction.difference}
                    </span>
                  </div>
                )}
              </div>

              {/* Deterministic Severity & Confidence Metrics */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-center text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block font-bold">Severity</span>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${getSeverityBadge(selectedContradiction.severity)}`}>
                    {selectedContradiction.severity}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block font-bold">Rule Confidence</span>
                  <span className="text-base font-extrabold font-mono text-teal-400 mt-0.5 block">
                    {selectedContradiction.confidence}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block font-bold">Status</span>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(selectedContradiction.status)}`}>
                    {selectedContradiction.status}
                  </span>
                </div>
              </div>

              {/* WHY THIS MATTERS (AI Forensic Analysis) */}
              <div className="glass-panel p-4.5 rounded-2xl space-y-2 border-teal-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <h4 className="font-serif text-sm font-semibold text-white">
                      Why This Matters
                    </h4>
                  </div>
                  {isExplaining && (
                    <span className="text-[10px] font-mono text-teal-300 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Analyzing...
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {aiExplanation?.whyItMatters || selectedContradiction.explanation}
                </p>
              </div>

              {/* RECOMMENDED ACTION */}
              <div className="glass-panel p-4.5 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-serif text-sm font-semibold text-white">
                    Recommended Action
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {aiExplanation?.recommendedAction || selectedContradiction.recommendedAction}
                </p>
              </div>

              {/* Mandatory AI Label */}
              <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-center">
                <span className="text-[10px] font-mono font-bold text-teal-300 tracking-wider">
                  AI-GENERATED ANALYSIS — ADVISORY ONLY
                </span>
              </div>
            </div>

            {/* Drawer Actions Footer */}
            <div className="pt-6 border-t border-white/10 space-y-2.5">
              <div className="flex items-center gap-2">
                {selectedContradiction.status !== 'Resolved' ? (
                  <button
                    onClick={() => {
                      updateContradictionStatus(selectedContradiction.contradictionId, 'Resolved');
                      setSelectedContradiction(prev => prev ? { ...prev, status: 'Resolved' } : null);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark as Resolved</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      updateContradictionStatus(selectedContradiction.contradictionId, 'Open');
                      setSelectedContradiction(prev => prev ? { ...prev, status: 'Open' } : null);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Reopen Contradiction</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveInvestigationSupplierId(selectedContradiction.supplierId);
                    navigate('investigations');
                  }}
                  className="py-2 px-3 rounded-xl neo-button-primary btn-shine text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Investigate Supplier</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <button
                  onClick={() => navigate('supplier-detail', selectedContradiction.supplierId)}
                  className="hover:text-teal-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Supplier 360° Audit</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <span className="font-mono text-[10px]">
                  Detected: {new Date(selectedContradiction.detectedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
