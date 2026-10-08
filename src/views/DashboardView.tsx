import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  CloudFog,
  ListTodo,
  ShieldAlert,
  PlayCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Eye,
  Bot,
  Grid,
  Sliders,
  Database,
  Cpu,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MetricCard } from '../components/common/MetricCard';
import { ComplianceScoreBadge } from '../components/common/ComplianceScoreBadge';
import { RiskBadge } from '../components/common/RiskBadge';
import { VerificationProvenance } from '../components/common/VerificationProvenance';
import { ExecutiveRiskBriefModal } from '../components/common/ExecutiveRiskBriefModal';
import { fetchExecutiveInsights, resetClientAiCooldown } from '../services/aiService';
import { ExecutiveInsight } from '../types';

export const DashboardView: React.FC = () => {
  const { suppliers, navigate, openPrintReport, setIsCopilotOpen, contradictions } = useApp();
  const [insights, setInsights] = useState<ExecutiveInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState<boolean>(true);
  const [selectedInsightEvidence, setSelectedInsightEvidence] = useState<ExecutiveInsight | null>(null);
  const [isExecutiveBriefOpen, setIsExecutiveBriefOpen] = useState<boolean>(false);
  const [isFallbackNotice, setIsFallbackNotice] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const hasLoadedRef = React.useRef(false);

  // Compute overall KPI metrics
  const totalSuppliers = suppliers.length;
  const verifiedSuppliers = suppliers.filter(s => s.verificationStatus === 'Verified').length;
  const pendingVerification = suppliers.filter(s => s.verificationStatus !== 'Verified').length;
  const highRiskSuppliers = suppliers.filter(s => s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL').length;
  const avgComplianceScore = Math.round(
    suppliers.reduce((acc, s) => acc + s.complianceScore, 0) / (totalSuppliers || 1)
  );

  const totalCarbonKg = suppliers.reduce((acc, s) => acc + (s.carbonSummary?.totalEmissionsKg || 0), 0);
  const totalCarbonTonnes = (totalCarbonKg / 1000).toFixed(2);

  const allActions = suppliers.flatMap(s => s.actions);
  const openActionsCount = allActions.filter(a => a.status === 'Open' || a.status === 'In Progress').length;

  const allCerts = suppliers.flatMap(s => s.certifications);
  const expiringCertsCount = allCerts.filter(c => c.status === 'Expiring Soon' || c.status === 'Expired').length;

  const loadExecutiveInsights = React.useCallback(async () => {
    setLoadingInsights(true);
    try {
      const res = await fetchExecutiveInsights(suppliers, {
        totalSuppliers,
        avgComplianceScore,
        totalCarbonKg,
        highRiskSuppliers,
      });
      setInsights(res.insights);
      if (res.isFallback && res.notice) {
        setIsFallbackNotice(res.notice);
      } else {
        setIsFallbackNotice(null);
      }
    } catch {
      // Deterministic fallback already guaranteed by fetchExecutiveInsights
    } finally {
      setLoadingInsights(false);
      setIsRetrying(false);
    }
  }, []);

  // Controlled initialization: run once on mount, never on routine render cycles
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadExecutiveInsights();
    }
  }, [loadExecutiveInsights]);

  const handleManualRetry = () => {
    setIsRetrying(true);
    resetClientAiCooldown();
    loadExecutiveInsights();
  };

  // Risk Distribution counts
  const riskCounts = {
    LOW: suppliers.filter(s => s.riskLevel === 'LOW').length,
    MEDIUM: suppliers.filter(s => s.riskLevel === 'MEDIUM').length,
    HIGH: suppliers.filter(s => s.riskLevel === 'HIGH').length,
    CRITICAL: suppliers.filter(s => s.riskLevel === 'CRITICAL').length,
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Banner / Fast Demo CTA — Premium Glassmorphism Surface */}
      <div className="glass-hero rounded-3xl p-6 sm:p-9 text-white relative overflow-hidden glass-reflection group">
        {/* Subtle radial light behind hero */}
        <div className="absolute right-0 top-0 bottom-0 w-[420px] bg-gradient-to-l from-teal-500/15 via-teal-500/5 to-transparent pointer-events-none rounded-r-3xl" />
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Supplier Compliance & Supply Chain Intelligence</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3.5xl font-semibold text-white tracking-tight leading-tight">
            Verify Suppliers With Explainable AI & Deterministic Scope-3 Audits
          </h2>
          <p className="mt-3 text-slate-300 text-sm leading-relaxed">
            SourceTrace combines deterministic carbon calculations, internal registry checks, and grounded AI risk advisory.
            External verification not performed. AI strictly reasons over stored application records without fabrication.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3.5">
            <button
              onClick={() => navigate('demo-verification')}
              className="px-5 py-2.5 rounded-xl neo-button-primary btn-shine text-xs font-bold shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Launch 3-Minute Guided Demo</span>
            </button>
            <button
              onClick={() => setIsExecutiveBriefOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/35 btn-shine text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md neo-raised"
            >
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Generate Executive Brief</span>
            </button>
            <button
              onClick={() => openPrintReport('sup-apex-01')}
              className="px-4 py-2.5 rounded-xl neo-button-dark btn-shine text-xs font-medium flex items-center gap-2 cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4 text-teal-400" />
              <span>Print Compliance Summary</span>
            </button>
          </div>
        </div>
      </div>

      {/* INTELLIGENCE PACK FEATURE SHORTCUTS — Translucent Glass Surfaces */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Feature 1: Copilot */}
        <button
          onClick={() => setIsCopilotOpen(true)}
          className="text-left p-5 rounded-2xl glass-feature-card cursor-pointer group text-slate-100"
        >
          <div className="flex items-center justify-between mb-2.5 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-300 border border-teal-500/30 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/25">
              Grounded AI
            </span>
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors relative z-10">
            Supply Chain Copilot
          </h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug relative z-10">
            Ask natural-language questions about verified suppliers, carbon, and missing documents.
          </p>
        </button>

        {/* Feature 2: Evidence Contradiction Engine */}
        <button
          onClick={() => navigate('contradictions')}
          className="text-left p-5 rounded-2xl glass-feature-card cursor-pointer group text-slate-100"
        >
          <div className="flex items-center justify-between mb-2.5 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors shadow-xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/25 font-mono">
              {contradictions.length} Active
            </span>
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors relative z-10">
            Evidence Contradiction Engine
          </h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug relative z-10">
            Cross-record variance detection comparing manifests, invoices, carbon, and certificates.
          </p>
        </button>

        {/* Feature 3: Autonomous Investigation Mode */}
        <button
          onClick={() => navigate('investigations')}
          className="text-left p-5 rounded-2xl glass-feature-card cursor-pointer group text-slate-100"
        >
          <div className="flex items-center justify-between mb-2.5 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-300 border border-teal-500/30 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors shadow-xs">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/25">
              8-Gate Workflow
            </span>
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors relative z-10">
            Autonomous Investigation Mode
          </h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug relative z-10">
            Deterministic 8-gate forensic root-cause graph scanning accreditations and blockchain ledger.
          </p>
        </button>

        {/* Feature 4: Supply Chain Digital Twin */}
        <button
          onClick={() => navigate('digital-twin')}
          className="text-left p-5 rounded-2xl glass-feature-card cursor-pointer group text-slate-100"
        >
          <div className="flex items-center justify-between mb-2.5 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
              6-Layer Twin
            </span>
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors relative z-10">
            Supply Chain Digital Twin
          </h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug relative z-10">
            Living entity digital twin synthesizing identity, logistics telemetry, and policy governance.
          </p>
        </button>

        {/* Feature 5: Anomaly Detection */}
        <button
          onClick={() => navigate('anomalies')}
          className="text-left p-5 rounded-2xl glass-feature-card cursor-pointer group text-slate-100"
        >
          <div className="flex items-center justify-between mb-2.5 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/25">
              Surveillance
            </span>
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors relative z-10">
            Anomaly Detection
          </h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug relative z-10">
            Surveillance scanning carbon outliers, missing manifests, and certification expiry windows.
          </p>
        </button>

        {/* Feature 6: What-If Simulator */}
        <button
          onClick={() => navigate('simulator')}
          className="text-left p-5 rounded-2xl glass-feature-card cursor-pointer group text-slate-100"
        >
          <div className="flex items-center justify-between mb-2.5 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors shadow-xs">
              <Sliders className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/25">
              Interactive
            </span>
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors relative z-10">
            What-If Risk Simulator
          </h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug relative z-10">
            Model prospective score gains from uploading manifests, renewing ISOs, and route shifts.
          </p>
        </button>
      </div>

      {/* 8 Primary Executive Metric Cards */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            PORTFOLIO KEY METRICS
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Source: Internal Tenant Registry
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Total Suppliers"
            value={totalSuppliers}
            subtext="5 active tier-1 vendors"
            icon={<Building2 className="w-4 h-4 text-slate-400" />}
            onClick={() => navigate('suppliers')}
          />
          <MetricCard
            label="Verified Suppliers"
            value={verifiedSuppliers}
            unit={`/ ${totalSuppliers}`}
            subtext="Passed primary checks"
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            onClick={() => navigate('suppliers')}
          />
          <MetricCard
            label="Pending Verification"
            value={pendingVerification}
            subtext="Documentation in review"
            icon={<Clock className="w-4 h-4 text-sky-500" />}
            onClick={() => navigate('documents')}
          />
          <MetricCard
            label="High Risk Suppliers"
            value={highRiskSuppliers}
            subtext="1 flagged (Nova Precision)"
            icon={<AlertTriangle className="w-4 h-4 text-rose-500" />}
            trend={{ value: 'Immediate Action', positive: false }}
            onClick={() => navigate('suppliers')}
          />
          <MetricCard
            label="Avg Compliance Score"
            value={`${avgComplianceScore}`}
            unit="/ 100"
            subtext="Higher score is better"
            icon={<Award className="w-4 h-4 text-teal-500" />}
            trend={{ value: '+4.2 pts', positive: true }}
          />
          <MetricCard
            label="Total Scope-3 Carbon"
            value={totalCarbonTonnes}
            unit="tonnes CO2e"
            subtext={`${totalCarbonKg.toLocaleString()} kg calculated`}
            icon={<CloudFog className="w-4 h-4 text-indigo-500" />}
            onClick={() => navigate('carbon')}
          />
          <MetricCard
            label="Open Compliance Actions"
            value={openActionsCount}
            subtext="2 critical/high priority"
            icon={<ListTodo className="w-4 h-4 text-amber-500" />}
            onClick={() => navigate('actions')}
          />
          <MetricCard
            label="Expiring / Lapsed Certs"
            value={expiringCertsCount}
            subtext="ISO 45001 & ISO 14001"
            icon={<ShieldAlert className="w-4 h-4 text-orange-500" />}
            onClick={() => navigate('compliance')}
          />
        </div>
      </div>

      {/* AI Executive Insights Panel */}
      <div className="glass-panel rounded-2xl p-6 glass-reflection">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <h3 className="font-serif text-base font-semibold text-white tracking-tight">
                AI Executive Insights
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                {isFallbackNotice ? 'Evidence-Based Fallback' : 'Grounded in Stored Records'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic evidence synthesis — advisory only. No facts invented.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isFallbackNotice && (
              <button
                onClick={handleManualRetry}
                disabled={isRetrying}
                className="text-[11px] font-semibold text-teal-300 hover:text-white bg-teal-500/10 hover:bg-teal-500/20 px-2.5 py-1 rounded-lg border border-teal-500/30 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isRetrying ? 'Retrying AI...' : 'Retry AI analysis'}
              </button>
            )}
            <div className="text-xs text-slate-400 italic bg-white/5 px-3 py-1 rounded-lg border border-white/10">
              "AI-generated analysis — advisory only."
            </div>
          </div>
        </div>

        {isFallbackNotice && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>AI service temporarily unavailable. Showing evidence-based registry information.</span>
            </div>
            <span className="text-[11px] font-mono text-amber-700">source: deterministic_fallback</span>
          </div>
        )}

        {loadingInsights ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-32 neo-recessed animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map(insight => (
              <div
                key={insight.id}
                className="p-4 rounded-xl neo-raised hover:border-teal-400/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-white leading-snug">
                      {insight.title}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border shrink-0 ${
                        insight.severity === 'CRITICAL'
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          : insight.severity === 'HIGH'
                          ? 'bg-orange-500/10 text-orange-300 border-orange-500/30'
                          : insight.severity === 'MEDIUM'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                      }`}
                    >
                      {insight.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {insight.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                  <div className="text-slate-400 text-[11px] truncate max-w-[220px]">
                    <span className="font-semibold text-slate-300">Action:</span> {insight.recommendedNextStep}
                  </div>
                  <button
                    onClick={() => setSelectedInsightEvidence(insight)}
                    className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 text-[11px] shrink-0 hover:underline cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View evidence</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Evidence Modal when clicking "View evidence" */}
      {selectedInsightEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="glass-modal rounded-3xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-100 glass-reflection text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Stored Evidence Reference</span>
              </h4>
              <button
                onClick={() => setSelectedInsightEvidence(null)}
                className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 rounded hover:bg-white/5 cursor-pointer"
              >
                ✕ CLOSE
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-400">Insight Topic:</span>
                <p className="font-medium text-white mt-0.5">{selectedInsightEvidence.title}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-400">Affected Suppliers:</span>
                <p className="text-teal-300 mt-0.5 font-semibold">{selectedInsightEvidence.affectedSuppliers.join(', ')}</p>
              </div>
              <div className="p-3 neo-recessed rounded-xl font-mono text-[11px] text-slate-300">
                <span className="font-bold text-white block mb-1">Stored Database Evidence:</span>
                {selectedInsightEvidence.evidenceReference}
              </div>
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200 text-[11px]">
                Notice: AI-generated advisory analysis based strictly on internal application records.
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedInsightEvidence(null)}
                className="px-4 py-2 neo-button-primary btn-shine rounded-xl text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Analytics Grid: 2 Analytic Cards with Glass Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Breakdown */}
        <div className="glass-panel rounded-2xl p-5 glass-reflection">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-white">
                Supplier Risk Distribution
              </h4>
              <p className="text-xs text-slate-400">Categorized by internal compliance checks</p>
            </div>
            <span className="text-xs font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
              {totalSuppliers} Total
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> LOW RISK (3)
                </span>
                <span className="font-mono text-slate-400">60%</span>
              </div>
              <div className="w-full neo-recessed h-2.5 rounded-full overflow-hidden p-0.5">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '60%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> MEDIUM RISK (1)
                </span>
                <span className="font-mono text-slate-400">20%</span>
              </div>
              <div className="w-full neo-recessed h-2.5 rounded-full overflow-hidden p-0.5">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '20%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-rose-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" /> HIGH RISK (1)
                </span>
                <span className="font-mono text-slate-400">20%</span>
              </div>
              <div className="w-full neo-recessed h-2.5 rounded-full overflow-hidden p-0.5">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Apex Components: LOW RISK (90/100)</span>
            <button
              onClick={() => navigate('suppliers')}
              className="text-teal-400 hover:text-teal-300 font-semibold cursor-pointer"
            >
              View directory →
            </button>
          </div>
        </div>

        {/* Scope-3 Carbon Emissions Breakdown */}
        <div className="glass-panel rounded-2xl p-5 glass-reflection">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-white">
                Scope-3 Emissions by Supplier
              </h4>
              <p className="text-xs text-slate-400">GLEC Framework v2.0 deterministic metrics</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {totalCarbonKg.toLocaleString()} kg CO2e
            </span>
          </div>

          <div className="space-y-2.5">
            {suppliers.map(s => {
              const kg = s.carbonSummary?.totalEmissionsKg || 0;
              const pct = totalCarbonKg > 0 ? Math.round((kg / totalCarbonKg) * 100) : 0;
              return (
                <div key={s.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-300 truncate max-w-[200px]">
                      {s.name}
                    </span>
                    <span className="font-mono text-slate-400 tabular-nums">
                      {kg.toLocaleString()} kg ({pct}%)
                    </span>
                  </div>
                  <div className="w-full neo-recessed h-2 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full ${
                        s.code === 'APX-COMP' ? 'bg-teal-400' : 'bg-slate-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Apex 3 shipments: 1,191.28 kg CO2e</span>
            <button
              onClick={() => navigate('carbon')}
              className="text-teal-400 hover:text-teal-300 font-semibold cursor-pointer"
            >
              Open calculator →
            </button>
          </div>
        </div>
      </div>

      {/* Supplier Directory Quick Table with Dark Enterprise Table on Glass */}
      <div className="glass-panel rounded-2xl p-5 glass-reflection">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-white">
              Supplier Compliance Overview
            </h4>
            <p className="text-xs text-slate-400">
              Compliance score (0-100, higher is better), risk level, and verified credentials
            </p>
          </div>
          <button
            onClick={() => navigate('suppliers')}
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Suppliers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-xs bg-slate-900/80">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-white/10 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Supplier Name</th>
                <th className="py-2.5 px-3">Country</th>
                <th className="py-2.5 px-3">Compliance Score</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Scope-3 Carbon</th>
                <th className="py-2.5 px-3">Open Actions</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {suppliers.map(sup => (
                <tr
                  key={sup.id}
                  className="hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => navigate('supplier-detail', sup.id)}
                >
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white">{sup.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{sup.code} · {sup.industry}</div>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-300">{sup.country}</td>
                  <td className="py-3 px-3">
                    <ComplianceScoreBadge score={sup.complianceScore} size="sm" showSubtitle={false} />
                  </td>
                  <td className="py-3 px-3">
                    <RiskBadge level={sup.riskLevel} size="sm" />
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-slate-200 tabular-nums">
                    {sup.carbonSummary?.totalEmissionsKg.toLocaleString()} kg
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-slate-300">
                      {sup.actions.filter(a => a.status !== 'Resolved').length} open
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => navigate('supplier-detail', sup.id)}
                      className="text-xs font-semibold text-teal-300 hover:text-white px-2.5 py-1 rounded-lg border border-teal-500/30 hover:bg-teal-500/20 transition-colors cursor-pointer"
                    >
                      360° Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Provenance Section (Mandatory) */}
      <VerificationProvenance />

      {/* Executive Risk Brief Modal */}
      <ExecutiveRiskBriefModal
        isOpen={isExecutiveBriefOpen}
        onClose={() => setIsExecutiveBriefOpen(false)}
      />
    </div>
  );
};
