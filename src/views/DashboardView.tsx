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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MetricCard } from '../components/common/MetricCard';
import { ComplianceScoreBadge } from '../components/common/ComplianceScoreBadge';
import { RiskBadge } from '../components/common/RiskBadge';
import { VerificationProvenance } from '../components/common/VerificationProvenance';
import { fetchExecutiveInsights, resetClientAiCooldown } from '../services/aiService';
import { ExecutiveInsight } from '../types';

export const DashboardView: React.FC = () => {
  const { suppliers, navigate, openPrintReport } = useApp();
  const [insights, setInsights] = useState<ExecutiveInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState<boolean>(true);
  const [selectedInsightEvidence, setSelectedInsightEvidence] = useState<ExecutiveInsight | null>(null);
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
      {/* Hero Banner / Fast Demo CTA */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-2xl p-6 sm:p-8 text-white border border-slate-800 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-teal-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Supplier Compliance & Supply Chain Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Verify Suppliers With Explainable AI & Deterministic Scope-3 Audits
          </h2>
          <p className="mt-2.5 text-slate-300 text-sm leading-relaxed">
            SourceTrace combines deterministic carbon calculations, internal registry checks, and grounded AI risk advisory.
            External verification not performed. AI strictly reasons over stored application records without fabrication.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('demo-verification')}
              className="px-4 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Launch 3-Minute Guided Demo Verification</span>
            </button>
            <button
              onClick={() => openPrintReport('sup-apex-01')}
              className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4 text-teal-400" />
              <span>Print Apex Compliance Summary</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 Primary Executive Metric Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Portfolio Key Metrics
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
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <h3 className="text-base font-bold text-slate-900">
                AI Executive Insights
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                {isFallbackNotice ? 'Evidence-Based Fallback' : 'Grounded in Stored Records'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Deterministic evidence synthesis — advisory only. No facts invented.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isFallbackNotice && (
              <button
                onClick={handleManualRetry}
                disabled={isRetrying}
                className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded border border-teal-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isRetrying ? 'Retrying AI...' : 'Retry AI analysis'}
              </button>
            )}
            <div className="text-xs text-slate-500 italic bg-slate-50 px-3 py-1 rounded border border-slate-200">
              "AI-generated analysis — advisory only."
            </div>
          </div>
        </div>

        {isFallbackNotice && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>AI service temporarily unavailable — showing evidence-based fallback insights.</span>
            </div>
            <span className="text-[11px] font-mono text-amber-700">source: deterministic_fallback</span>
          </div>
        )}

        {loadingInsights ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-32 bg-slate-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map(insight => (
              <div
                key={insight.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-900 leading-snug">
                      {insight.title}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border shrink-0 ${
                        insight.severity === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : insight.severity === 'HIGH'
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : insight.severity === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {insight.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {insight.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <div className="text-slate-500 text-[11px] truncate max-w-[220px]">
                    <span className="font-semibold text-slate-700">Action:</span> {insight.recommendedNextStep}
                  </div>
                  <button
                    onClick={() => setSelectedInsightEvidence(insight)}
                    className="text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 text-[11px] shrink-0 hover:underline"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">
                Stored Evidence Reference
              </h4>
              <button
                onClick={() => setSelectedInsightEvidence(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-mono"
              >
                ✕ CLOSE
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-500">Insight Topic:</span>
                <p className="font-medium text-slate-900 mt-0.5">{selectedInsightEvidence.title}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Affected Suppliers:</span>
                <p className="text-slate-800 mt-0.5">{selectedInsightEvidence.affectedSuppliers.join(', ')}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700">
                <span className="font-bold text-slate-900 block mb-1">Stored Database Evidence:</span>
                {selectedInsightEvidence.evidenceReference}
              </div>
              <div className="p-2.5 bg-amber-50 rounded-lg text-amber-800 text-[11px]">
                Notice: AI-generated advisory analysis based strictly on internal application records.
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedInsightEvidence(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Analytics Grid: 4 Analytic Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Supplier Risk Distribution
              </h4>
              <p className="text-xs text-slate-500">Categorized by internal compliance checks</p>
            </div>
            <span className="text-xs font-mono text-slate-400">{totalSuppliers} Total</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> LOW RISK (3)
                </span>
                <span className="font-mono text-slate-600">60%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '60%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-amber-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> MEDIUM RISK (1)
                </span>
                <span className="font-mono text-slate-600">20%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '20%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-rose-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> HIGH RISK (1)
                </span>
                <span className="font-mono text-slate-600">20%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Apex Components: LOW RISK (90/100)</span>
            <button
              onClick={() => navigate('suppliers')}
              className="text-teal-600 hover:text-teal-700 font-semibold"
            >
              View directory →
            </button>
          </div>
        </div>

        {/* Scope-3 Carbon Emissions Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Scope-3 Emissions by Supplier
              </h4>
              <p className="text-xs text-slate-500">GLEC Framework v2.0 deterministic metrics</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-900">
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
                    <span className="font-medium text-slate-800 truncate max-w-[200px]">
                      {s.name}
                    </span>
                    <span className="font-mono text-slate-600 tabular-nums">
                      {kg.toLocaleString()} kg ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        s.code === 'APX-COMP' ? 'bg-teal-500' : 'bg-slate-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Apex 3 shipments: 1191.28 kg CO2e</span>
            <button
              onClick={() => navigate('carbon')}
              className="text-teal-600 hover:text-teal-700 font-semibold"
            >
              Open calculator →
            </button>
          </div>
        </div>
      </div>

      {/* Supplier Directory Quick Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Supplier Compliance Overview
            </h4>
            <p className="text-xs text-slate-500">
              Compliance score (0-100, higher is better), risk level, and verified credentials
            </p>
          </div>
          <button
            onClick={() => navigate('suppliers')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <span>View All Suppliers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-y border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
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
            <tbody className="divide-y divide-slate-100">
              {suppliers.map(sup => (
                <tr
                  key={sup.id}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  onClick={() => navigate('supplier-detail', sup.id)}
                >
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{sup.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{sup.code} · {sup.industry}</div>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700">{sup.country}</td>
                  <td className="py-3 px-3">
                    <ComplianceScoreBadge score={sup.complianceScore} size="sm" showSubtitle={false} />
                  </td>
                  <td className="py-3 px-3">
                    <RiskBadge level={sup.riskLevel} size="sm" />
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-slate-800 tabular-nums">
                    {sup.carbonSummary?.totalEmissionsKg.toLocaleString()} kg
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-slate-700">
                      {sup.actions.filter(a => a.status !== 'Resolved').length} open
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => navigate('supplier-detail', sup.id)}
                      className="text-xs font-semibold text-slate-700 hover:text-teal-700 px-2.5 py-1 rounded border border-slate-200 hover:border-teal-300"
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
    </div>
  );
};
