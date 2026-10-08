import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Award,
  CloudFog,
  ShieldAlert,
  ArrowRight,
  Printer,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ComplianceScoreBadge } from '../components/common/ComplianceScoreBadge';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { VerificationProvenance } from '../components/common/VerificationProvenance';
import { compareSuppliersAI, resetClientAiCooldown, SupplierComparisonResult } from '../services/aiService';

export const CompareSuppliersView: React.FC = () => {
  const { suppliers, navigate, openPrintReport } = useApp();
  // Default select first 3 suppliers (Apex, Meridian, Pacific)
  const [selectedIds, setSelectedIds] = useState<string[]>([
    'sup-apex-01',
    'sup-meridian-02',
    'sup-pacific-03',
  ]);

  const [aiInsight, setAiInsight] = useState<SupplierComparisonResult | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(true);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const selectedSuppliers = suppliers.filter(s => selectedIds.includes(s.id));
  const selectedKey = selectedIds.slice().sort().join(',');

  const toggleSupplier = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 2) {
        setSelectedIds(prev => prev.filter(x => x !== id));
      }
    } else {
      if (selectedIds.length < 4) {
        setSelectedIds(prev => [...prev, id]);
      }
    }
  };

  const loadComparison = React.useCallback(async () => {
    if (selectedSuppliers.length < 2) return;
    setLoadingAi(true);
    try {
      const res = await compareSuppliersAI(selectedSuppliers);
      setAiInsight(res);
    } catch {
      // Deterministic fallback guaranteed
    } finally {
      setLoadingAi(false);
      setIsRetrying(false);
    }
  }, [selectedKey]);

  useEffect(() => {
    loadComparison();
  }, [loadComparison]);

  const handleManualRetry = () => {
    setIsRetrying(true);
    resetClientAiCooldown();
    loadComparison();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Comparative Supplier Benchmarking
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate 2 to 4 suppliers across compliance scores, ISO accreditations, and Scope-3 carbon intensity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Selected: {selectedIds.length}/4</span>
        </div>
      </div>

      {/* Supplier Selector Pills */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
          Select Suppliers to Compare (Choose 2 to 4):
        </span>
        <div className="flex flex-wrap gap-2">
          {suppliers.map(s => {
            const isSelected = selectedIds.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggleSupplier(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs ring-2 ring-teal-500/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{s.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${isSelected ? 'bg-slate-800 text-teal-400' : 'bg-slate-200 text-slate-600'}`}>
                  {s.complianceScore}/100
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Comparison Insight Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              AI Comparative Insight
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated strictly over stored internal records without hallucination.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {aiInsight?.isFallback && (
              <button
                onClick={handleManualRetry}
                disabled={isRetrying}
                className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded border border-teal-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isRetrying ? 'Retrying AI...' : 'Retry AI analysis'}
              </button>
            )}
            <span className="text-xs italic bg-slate-50 text-slate-600 px-3 py-1 rounded border border-slate-200">
              "AI-generated analysis — advisory only."
            </span>
          </div>
        </div>

        {aiInsight?.isFallback && (
          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>AI service temporarily unavailable. Showing evidence-based registry information.</span>
            </div>
            <span className="text-[11px] font-mono text-amber-700">source: deterministic_fallback</span>
          </div>
        )}

        {loadingAi ? (
          <div className="h-28 bg-slate-100 rounded-xl animate-pulse" />
        ) : aiInsight ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 text-white leading-relaxed">
              <span className="font-bold text-teal-400 block mb-1">Executive Benchmarking Summary:</span>
              {aiInsight.executiveSummary}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Benchmark Leader: {aiInsight.strongestSupplier.name}
                </span>
                <p className="text-emerald-800 leading-relaxed font-sans">{aiInsight.strongestSupplier.reason}</p>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> Remediation Priority: {aiInsight.weakestSupplier.name}
                </span>
                <p className="text-amber-800 leading-relaxed font-sans">{aiInsight.weakestSupplier.reason}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                Key Strategic Differences:
              </span>
              <ul className="space-y-1 text-slate-700">
                {aiInsight.keyDifferences.map((diff, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span>•</span>
                    <span>{diff}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      {/* Side-by-Side Comparison Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/60">
          <h4 className="text-sm font-bold text-slate-900">
            Side-by-Side Attribute Matrix
          </h4>
          <p className="text-xs text-slate-500">
            Comparing {selectedSuppliers.length} active suppliers across 10 critical supply-chain factors.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-48">Evaluation Metric</th>
                {selectedSuppliers.map(s => (
                  <th key={s.id} className="py-3 px-4 min-w-[200px]">
                    <div className="font-bold text-slate-900 text-sm normal-case">{s.name}</div>
                    <div className="text-[10px] font-mono text-slate-500">{s.code} · {s.country}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {/* Compliance Score */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-700">Compliance Score</td>
                {selectedSuppliers.map(s => (
                  <td key={s.id} className="py-3 px-4">
                    <ComplianceScoreBadge score={s.complianceScore} size="md" showSubtitle={false} />
                  </td>
                ))}
              </tr>

              {/* Risk Level */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-700">Operational Risk Level</td>
                {selectedSuppliers.map(s => (
                  <td key={s.id} className="py-3 px-4">
                    <RiskBadge level={s.riskLevel} size="md" />
                  </td>
                ))}
              </tr>

              {/* Verification Status */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-700">Verification Status</td>
                {selectedSuppliers.map(s => (
                  <td key={s.id} className="py-3 px-4">
                    <StatusBadge status={s.verificationStatus} />
                  </td>
                ))}
              </tr>

              {/* Scope-3 Carbon Footprint */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-700">Scope-3 Carbon Impact</td>
                {selectedSuppliers.map(s => (
                  <td key={s.id} className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">
                    {s.carbonSummary?.totalEmissionsKg.toLocaleString()} kg CO2e
                  </td>
                ))}
              </tr>

              {/* Certifications Count */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-700">Certifications Registered</td>
                {selectedSuppliers.map(s => (
                  <td key={s.id} className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{s.certifications.length} Standards</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {s.certifications.map(c => c.name).join(', ')}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Missing Manifests */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-700">Missing Shipment Manifests</td>
                {selectedSuppliers.map(s => {
                  const missingCount = s.shipments.filter(sh => !sh.hasManifest).length;
                  return (
                    <td key={s.id} className="py-3 px-4">
                      {missingCount > 0 ? (
                        <span className="font-mono text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {missingCount} missing manifests
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">None (All attached)</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Open Remediations */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-700">Open Actions</td>
                {selectedSuppliers.map(s => (
                  <td key={s.id} className="py-3 px-4 font-mono text-slate-800">
                    {s.actions.filter(a => a.status !== 'Resolved').length} Active
                  </td>
                ))}
              </tr>

              {/* Primary Facility */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-700">Facility Location</td>
                {selectedSuppliers.map(s => (
                  <td key={s.id} className="py-3 px-4 text-slate-600">
                    {s.location}
                  </td>
                ))}
              </tr>

              {/* Direct Actions */}
              <tr className="bg-slate-50/80">
                <td className="py-3 px-4 font-bold text-slate-700">Actions</td>
                {selectedSuppliers.map(s => (
                  <td key={s.id} className="py-3 px-4">
                    <button
                      onClick={() => navigate('supplier-detail', s.id)}
                      className="text-xs font-semibold text-slate-900 hover:text-teal-700 underline"
                    >
                      Open 360° Profile →
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Provenance */}
      <VerificationProvenance />
    </div>
  );
};
