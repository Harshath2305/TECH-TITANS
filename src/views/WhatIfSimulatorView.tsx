import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sliders,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Building2,
  FileCheck,
  Award,
  Truck,
  Leaf,
  ShieldCheck,
  CheckSquare,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SimulationScenario, SimulationResult } from '../types';
import { simulateSupplierScenario } from '../services/aiService';

export const WhatIfSimulatorView: React.FC = () => {
  const { suppliers, routeParam, addComplianceAction, logAuditEvent, navigate } = useApp();

  // Selected supplier (default to Apex Components Ltd if available)
  const defaultSupplier = suppliers.find(s => s.id === (routeParam || 'sup-apex-01')) || suppliers[0];
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(defaultSupplier.id);

  const supplier = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];

  // Simulation lever states
  const [scenario, setScenario] = useState<SimulationScenario>({
    supplierId: supplier.id,
    resolveMissingManifests: true,
    renewExpiringCerts: true,
    lowCarbonFreight: false,
    resolveOpenNonConformances: false,
    simulateAdverseEvent: false,
  });

  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [actionsAppliedNotice, setActionsAppliedNotice] = useState<string | null>(null);

  // Update supplier ID in scenario when supplier changes
  useEffect(() => {
    setScenario(prev => ({
      ...prev,
      supplierId: supplier.id,
    }));
  }, [supplier.id]);

  // Recalculate simulation whenever scenario or supplier changes
  useEffect(() => {
    let isCancelled = false;
    setIsSimulating(true);

    simulateSupplierScenario(scenario, supplier)
      .then(res => {
        if (!isCancelled) {
          setSimResult(res);
          setIsSimulating(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setIsSimulating(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [scenario, supplier]);

  const handleResetLevers = () => {
    setScenario({
      supplierId: supplier.id,
      resolveMissingManifests: false,
      renewExpiringCerts: false,
      lowCarbonFreight: false,
      resolveOpenNonConformances: false,
      simulateAdverseEvent: false,
    });
  };

  const handleApplyActionPlan = () => {
    if (!simResult || !simResult.remediationPlan.length) return;

    simResult.remediationPlan.forEach((task, idx) => {
      addComplianceAction({
        supplierId: supplier.id,
        supplierName: supplier.name,
        title: `Remediation Plan: ${task.substring(0, 50)}...`,
        description: `Generated from What-If Simulator Scenario for ${supplier.name}:\n${task}`,
        priority: 'HIGH',
        status: 'Open',
        dueDate: `2026-11-${10 + (idx * 5)}`,
        owner: 'Procurement Risk Officer',
        source: 'AI Recommendation',
        notes: `Simulated Target Score: ${simResult.afterScore}/100`,
      });
    });

    logAuditEvent(
      'Compliance Lead',
      'APPLIED_SIMULATION_PLAN',
      'Supplier',
      supplier.id,
      `Applied What-If simulation remediation plan (${simResult.remediationPlan.length} actions) targeting score ${simResult.afterScore}/100 for ${supplier.name}`
    );

    setActionsAppliedNotice(`Successfully applied ${simResult.remediationPlan.length} remediation actions to the Compliance Action Tracker!`);
    setTimeout(() => setActionsAppliedNotice(null), 6000);
  };

  const handleCopyMemo = () => {
    if (!simResult) return;
    navigator.clipboard?.writeText(simResult.strategicMemo);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              What-If Compliance Risk Simulator
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
              Deterministic Sandbox
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Model the score, risk rating, and carbon impact of prospective operational decisions before committing audit resources.
          </p>
        </div>

        {/* Supplier Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Target Supplier:</span>
          <select
            value={selectedSupplierId}
            onChange={e => setSelectedSupplierId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800 shadow-xs focus:outline-hidden focus:border-teal-500"
          >
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code} · {s.complianceScore}/100)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applied Notice Banner */}
      {actionsAppliedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{actionsAppliedNotice}</span>
          </div>
          <button
            onClick={() => navigate('actions')}
            className="underline font-bold text-emerald-800 hover:text-emerald-950 text-xs cursor-pointer"
          >
            View in Action Tracker →
          </button>
        </div>
      )}

      {/* Main Grid: Levers (Left) + Projected Outcomes (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEVERS COLUMN (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Simulation Levers & Variables
                </h3>
              </div>
              <button
                onClick={handleResetLevers}
                className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Current Supplier Baseline Info */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">{supplier.name}</span>
                <span className="font-mono text-slate-500 text-[11px]">{supplier.code}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Baseline Score:</span>
                <span className="font-mono font-bold text-slate-900">{supplier.complianceScore}/100</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Logistics Carbon:</span>
                <span className="font-mono text-slate-900">
                  {supplier.carbonSummary?.totalEmissionsKg.toFixed(1) || '1,191.3'} kg CO2e
                </span>
              </div>
            </div>

            {/* Levers List */}
            <div className="space-y-3.5">
              {/* Lever 1: Upload Missing Manifests */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                  scenario.resolveMissingManifests
                    ? 'border-teal-400 bg-teal-50/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={scenario.resolveMissingManifests}
                  onChange={e =>
                    setScenario(prev => ({
                      ...prev,
                      resolveMissingManifests: e.target.checked,
                    }))
                  }
                  className="mt-0.5 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-teal-600" />
                      Attach Missing Consignment Manifests
                    </span>
                    <span className="text-teal-700 font-mono text-[11px]">+6 pts</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Upload verified bills of lading for unmanifested shipments (e.g. SHIP-APX-2026-0142 & 0131), resolving documentation non-conformances.
                  </p>
                </div>
              </label>

              {/* Lever 2: Renew Expiring Certifications */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                  scenario.renewExpiringCerts
                    ? 'border-teal-400 bg-teal-50/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={scenario.renewExpiringCerts}
                  onChange={e =>
                    setScenario(prev => ({
                      ...prev,
                      renewExpiringCerts: e.target.checked,
                    }))
                  }
                  className="mt-0.5 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-purple-600" />
                      Early Recertification Renewal
                    </span>
                    <span className="text-teal-700 font-mono text-[11px]">+4 pts</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Submit verified recertification audit (e.g. ISO 45001:2018 expiring on 2026-11-30), extending validity window through 2029.
                  </p>
                </div>
              </label>

              {/* Lever 3: Low Carbon Multimodal Route */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                  scenario.lowCarbonFreight
                    ? 'border-teal-400 bg-teal-50/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={scenario.lowCarbonFreight}
                  onChange={e =>
                    setScenario(prev => ({
                      ...prev,
                      lowCarbonFreight: e.target.checked,
                    }))
                  }
                  className="mt-0.5 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                      Multimodal Low-Carbon Freight Shift
                    </span>
                    <span className="text-emerald-700 font-mono text-[11px]">-40% CO2e</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Shift regional highway transport to electrified intermodal rail and Euro VI-e routes, cutting logistics emissions significantly.
                  </p>
                </div>
              </label>

              {/* Lever 4: Resolve Open Non-Conformances */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                  scenario.resolveOpenNonConformances
                    ? 'border-teal-400 bg-teal-50/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={scenario.resolveOpenNonConformances}
                  onChange={e =>
                    setScenario(prev => ({
                      ...prev,
                      resolveOpenNonConformances: e.target.checked,
                    }))
                  }
                  className="mt-0.5 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                      Close All Open Compliance Actions
                    </span>
                    <span className="text-teal-700 font-mono text-[11px]">+3 pts</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Verify and resolve open corrective action items with approved sign-off.
                  </p>
                </div>
              </label>

              {/* Lever 5: Simulate Adverse Stress Event */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                  scenario.simulateAdverseEvent
                    ? 'border-rose-400 bg-rose-50/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={scenario.simulateAdverseEvent}
                  onChange={e =>
                    setScenario(prev => ({
                      ...prev,
                      simulateAdverseEvent: e.target.checked,
                    }))
                  }
                  className="mt-0.5 w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between font-bold text-rose-950">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Simulate Adverse Audit Non-Conformance
                    </span>
                    <span className="text-rose-700 font-mono text-[11px]">-15 pts</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Stress-test risk exposure if an unannounced audit reveals a major quality non-conformance or certification lapse.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* PROJECTED IMPACT COLUMN (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top Score Comparison Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Projected Impact Simulation
              </span>
              {simResult && simResult.scoreDelta !== 0 && (
                <div
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold ${
                    simResult.scoreDelta > 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {simResult.scoreDelta > 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {simResult.scoreDelta > 0 ? `+${simResult.scoreDelta}` : simResult.scoreDelta} Points
                  </span>
                </div>
              )}
            </div>

            {/* Score Delta Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Baseline */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-slate-400 text-[11px] block font-medium">
                  Current Baseline Score
                </span>
                <div className="text-3xl font-black text-slate-700 font-mono mt-1">
                  {supplier.complianceScore}
                  <span className="text-sm font-normal text-slate-400">/100</span>
                </div>
                <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                  {supplier.riskLevel} Risk
                </span>
              </div>

              {/* Projected */}
              <div
                className={`p-4 rounded-xl border text-center transition-all ${
                  simResult && simResult.afterScore >= supplier.complianceScore
                    ? 'bg-teal-50/70 border-teal-200'
                    : 'bg-rose-50/70 border-rose-200'
                }`}
              >
                <span className="text-slate-500 text-[11px] block font-medium">
                  Projected Simulated Score
                </span>
                <div
                  className={`text-4xl font-black font-mono mt-1 ${
                    simResult && simResult.afterScore >= 85
                      ? 'text-teal-700'
                      : simResult && simResult.afterScore >= 70
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  {simResult ? simResult.afterScore : supplier.complianceScore}
                  <span className="text-sm font-normal text-slate-400">/100</span>
                </div>
                <span
                  className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                    simResult && simResult.afterRisk === 'LOW'
                      ? 'bg-emerald-100 text-emerald-800'
                      : simResult && simResult.afterRisk === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {simResult ? simResult.afterRisk : supplier.riskLevel} Risk Projected
                </span>
              </div>
            </div>

            {/* Metrics Breakdown Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Scope-3 Carbon Saved:</span>
                <span className="font-mono font-bold text-emerald-600 text-sm mt-0.5 block">
                  {simResult?.carbonSavedKg ? `${simResult.carbonSavedKg.toFixed(1)} kg CO2e` : '0 kg'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Procurement Status:</span>
                <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                  {simResult?.tierStatusAfter || 'Tier-1 Approved'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Audit Frequency:</span>
                <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                  {simResult?.auditFrequencyAfter || 'Bi-annual Audit'}
                </span>
              </div>
            </div>
          </div>

          {/* AI Executive Impact Memo */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Executive Simulation Assessment Memo
                </h3>
              </div>
              <button
                onClick={handleCopyMemo}
                className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                title="Copy strategic memo"
              >
                {copiedMemo ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Memo</span>
                  </>
                )}
              </button>
            </div>

            {isSimulating ? (
              <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                <span>Simulating scenarios with verified rules engine...</span>
              </div>
            ) : (
              <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/70 whitespace-pre-line space-y-2">
                {simResult?.strategicMemo}
              </div>
            )}

            {/* Remediation Plan Items */}
            {simResult && simResult.remediationPlan.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Actionable Steps to Realize this Score:
                </span>
                <div className="space-y-1.5">
                  {simResult.remediationPlan.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2 rounded-lg bg-teal-50/50 text-[11px] text-teal-950 border border-teal-100"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Apply Action Plan Button */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                Deterministic simulation does not mutate master tenant data until applied.
              </span>
              <button
                onClick={handleApplyActionPlan}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Apply Scenario to Action Tracker</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
