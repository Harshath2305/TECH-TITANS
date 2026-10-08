import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Calculator,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  RotateCcw,
  FileText,
  Truck,
  PlusCircle,
  Database,
  ExternalLink,
  Printer,
  ChevronRight,
  FileCheck2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ComplianceScoreBadge } from '../components/common/ComplianceScoreBadge';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { VerificationProvenance } from '../components/common/VerificationProvenance';
import { resetClientAiCooldown } from '../services/aiService';

export const DemoVerificationView: React.FC = () => {
  const {
    demoState,
    demoCurrentStep,
    setDemoStep,
    selectDemoManifest,
    runExtraction,
    runCalculation,
    runVerification,
    runAiRiskAnalysis,
    resetDemoWorkflow,
    addComplianceAction,
    navigate,
    openPrintReport,
    suppliers,
  } = useApp();

  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const steps = [
    { number: 1, title: 'UPLOAD', label: 'Select Manifest' },
    { number: 2, title: 'EXTRACT', label: 'Field Parsing' },
    { number: 3, title: 'CALCULATE', label: 'Scope-3 Carbon' },
    { number: 4, title: 'VERIFY', label: 'Registry Checks' },
    { number: 5, title: 'RISK ANALYSIS', label: 'Explainable AI' },
  ];

  const handleCreateAction = (title: string, desc: string, priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW', dueDate: string) => {
    addComplianceAction({
      supplierId: demoState.selectedSupplierId,
      supplierName: 'Apex Components Ltd',
      title,
      description: desc,
      priority,
      status: 'Open',
      dueDate,
      owner: 'Elena Rostova (Lead Compliance Auditor)',
      source: 'AI Recommendation',
    });

    setActionSuccessMessage(`Compliance Action successfully created: "${title}". Recorded into Internal Integrity Ledger.`);
    setTimeout(() => setActionSuccessMessage(null), 5000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header & 3-Minute Demo Progress Stepper */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-teal-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>3-Minute Guided Audit Workflow</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Supplier Verification & Carbon Intelligence
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Deterministic calculations and internal database checks feed explainable AI risk scoring.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetDemoWorkflow}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Flow</span>
            </button>
            <button
              onClick={() => openPrintReport(demoState.selectedSupplierId)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Summary</span>
            </button>
          </div>
        </div>

        {/* The 5 Step Visual Progress Bar */}
        <div className="pt-6">
          <div className="grid grid-cols-5 gap-2 sm:gap-4 relative">
            {steps.map(step => {
              const isActive = demoCurrentStep === step.number;
              const isPast = demoCurrentStep > step.number || demoState.stepCompleted[step.number];

              return (
                <button
                  key={step.number}
                  onClick={() => setDemoStep(step.number)}
                  className={`text-left p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20 shadow-xs'
                      : isPast
                      ? 'border-slate-200 bg-slate-50/80 hover:bg-slate-100'
                      : 'border-slate-200/60 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        isActive
                          ? 'bg-teal-600 text-white'
                          : isPast
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      STEP {step.number}
                    </span>
                    {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate">{step.title}</div>
                  <div className="text-[10px] text-slate-500 truncate hidden sm:block">{step.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button
            onClick={() => navigate('actions')}
            className="font-bold underline text-emerald-900 hover:text-emerald-950 ml-3"
          >
            View in Action Tracker →
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: UPLOAD MANIFEST */}
      {/* ========================================================================= */}
      {demoCurrentStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-mono font-bold text-teal-600 uppercase tracking-wider">
              Step 1 of 5 — Ingestion & Document Selection
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Select or Upload Shipment Consignment Document
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Choose an official logistics manifest for verification. For demo mode, 3 verified sample manifests are provided.
            </p>
          </div>

          {/* Seeded Documents Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                fileName: 'APX-SHIP-2026-0155_manifest.pdf',
                supplier: 'Apex Components Ltd (APX-COMP)',
                cargo: 'Machined Transmission Sub-assemblies',
                origin: 'Stuttgart, Germany',
                dest: 'Rotterdam Hub, Netherlands',
                size: '1.8 MB',
                badge: 'Recommended for Demo',
              },
              {
                fileName: 'MRD_SHIP_2026_0071_manifest.pdf',
                supplier: 'Meridian Textiles Pvt Ltd (MRD-TEXT)',
                cargo: 'Technical Organic Knits & Fabrics',
                origin: 'Chennai Port, India',
                dest: 'Hamburg Port, Germany',
                size: '2.1 MB',
                badge: 'Maritime Freight',
              },
              {
                fileName: 'PEM_SHIP_2026_0203_manifest.pdf',
                supplier: 'Pacific Electronics Manufacturing (PEM-ELEC)',
                cargo: 'High-Speed Semiconductor Microcontrollers',
                origin: 'Da Nang, Vietnam',
                dest: 'Frankfurt Airport, Germany',
                size: '3.2 MB',
                badge: 'Air Freight',
              },
            ].map(doc => {
              const isSelected = demoState.selectedManifest === doc.fileName;
              return (
                <div
                  key={doc.fileName}
                  onClick={() => selectDemoManifest(doc.fileName)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                        {doc.badge}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{doc.size}</span>
                    </div>

                    <div className="flex items-start gap-2.5 mb-2">
                      <FileText className={`w-5 h-5 shrink-0 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
                      <div>
                        <div className="text-xs font-bold font-mono text-slate-900 break-all">
                          {doc.fileName}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1">{doc.supplier}</div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-0.5 mt-2 pt-2 border-t border-slate-100">
                      <div><span className="font-semibold text-slate-700">Route:</span> {doc.origin} → {doc.dest}</div>
                      <div><span className="font-semibold text-slate-700">Cargo:</span> {doc.cargo}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 flex items-center justify-between text-xs">
                    <span className={`font-semibold ${isSelected ? 'text-teal-700' : 'text-slate-400'}`}>
                      {isSelected ? '✓ Selected for Audit' : 'Click to select'}
                    </span>
                    <span className="text-[11px] text-slate-400">PDF / Formatted</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Selection Details & Action */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                PDF
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 font-mono">
                  {demoState.selectedManifest}
                </div>
                <div className="text-[11px] text-slate-500">
                  Ready for cryptographic checksum validation and structured metadata extraction.
                </div>
              </div>
            </div>

            <button
              onClick={() => runExtraction()}
              className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Field Extraction</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: EXTRACT FIELDS */}
      {/* ========================================================================= */}
      {demoCurrentStep === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono font-bold text-teal-600 uppercase tracking-wider">
                Step 2 of 5 — Manifest Parsing & Reconciliation
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Extracted Document Fields vs. Internal Registry Records
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Clearly distinguishing data extracted from the document from records verified in SourceTrace's internal database.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-500 px-3 py-1 bg-slate-50 rounded border border-slate-200">
              Doc: {demoState.selectedManifest}
            </div>
          </div>

          {/* Structured Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Field Attribute</th>
                  <th className="py-2.5 px-4">
                    <span className="text-teal-700">Extracted from Document</span>
                  </th>
                  <th className="py-2.5 px-4">
                    <span className="text-slate-600">Stored Registry Information</span>
                  </th>
                  <th className="py-2.5 px-4 text-right">Reconciliation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {Object.entries(demoState.extractedFields).map(([key, val]) => (
                  <tr key={key} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-4 font-semibold text-slate-700 font-sans">{key}</td>
                    <td className="py-2.5 px-4 text-teal-800 font-medium">{String(val)}</td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {key.includes('Supplier')
                        ? 'Master Registry Record APX-COMP (Verified)'
                        : key.includes('Route') || key.includes('Distance')
                        ? '654.5 km (Mapped highway corridor)'
                        : 'Matching internal logistics ledger'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-sans">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Matched
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              All 12 extracted logistics parameters match internal shipment registration schema.
            </div>

            <button
              onClick={() => runCalculation()}
              className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Calculate Scope-3 Carbon Impact</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: CALCULATE SCOPE-3 CARBON */}
      {/* ========================================================================= */}
      {demoCurrentStep === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-mono font-bold text-teal-600 uppercase tracking-wider">
              Step 3 of 5 — Deterministic Calculation
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Scope-3 Category 4 Carbon Calculation (GLEC Framework v2.0)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Deterministic calculations based on standard GHG Protocol emission factors. AI does not decide or modify carbon numbers.
            </p>
          </div>

          {/* Highlight Result Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
            <div>
              <div className="text-xs font-mono text-teal-400 font-bold uppercase tracking-wider mb-1">
                Deterministic Calculation Result
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white tabular-nums">
                {demoState.calculatedCarbon?.carbonKg.toFixed(2)} <span className="text-lg font-normal text-slate-300">kg CO2e</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Consignment SHIP-APX-2026-0155 (Road Freight)
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1.5 md:min-w-[300px]">
              <div className="flex justify-between text-slate-300">
                <span>Apex Stored Shipments:</span>
                <span className="font-mono font-bold text-white">3 active shipments</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Apex Total Carbon Impact:</span>
                <span className="font-mono font-bold text-teal-400 tabular-nums">
                  1,191.28 kg CO2e
                </span>
              </div>
              <div className="text-[10px] text-slate-400 border-t border-slate-700 pt-1 mt-1">
                450.50 kg + 380.40 kg (#0142) + 360.38 kg (#0131) = 1191.28 kg CO2e
              </div>
            </div>
          </div>

          {/* Formula and Input Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Cargo Weight
              </span>
              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                {demoState.calculatedCarbon?.cargoWeightTonnes} tonnes
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">7,180 kg net cargo</span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Distance
              </span>
              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                {demoState.calculatedCarbon?.distanceKm} km
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Stuttgart → Rotterdam</span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Emission Factor
              </span>
              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                {demoState.calculatedCarbon?.emissionFactor}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">kg CO2e / tonne-km</span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Methodology Standard
              </span>
              <span className="text-sm font-bold text-slate-900 block truncate">
                GLEC v2.0
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">GHG Scope-3 Cat. 4</span>
            </div>
          </div>

          {/* Formula Display Box */}
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-xs font-mono text-teal-900">
            <span className="font-bold font-sans uppercase tracking-wider text-[11px] text-teal-800 block mb-1">
              Mathematical Evidence Formula:
            </span>
            {demoState.calculatedCarbon?.formula}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => runVerification()}
              className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Execute Deterministic Compliance Checks</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: VERIFY REGISTRY CHECKS */}
      {/* ========================================================================= */}
      {demoCurrentStep === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono font-bold text-teal-600 uppercase tracking-wider">
                Step 4 of 5 — Deterministic Verification Engine
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Internal Registry & Policy Compliance Checks
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                System evaluates supplier records, certifications, and documentation completeness against internal criteria.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                4 PASS
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                2 WARNING
              </span>
            </div>
          </div>

          {/* Checks Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Verification Check</th>
                  <th className="py-2.5 px-4">Result</th>
                  <th className="py-2.5 px-4">Severity</th>
                  <th className="py-2.5 px-4">Stored Evidentiary Basis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {demoState.verificationChecks.map(chk => (
                  <tr key={chk.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-semibold text-slate-700">{chk.category}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{chk.checkName}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={chk.result} type="result" />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={chk.severity} type="severity" />
                    </td>
                    <td className="py-3 px-4 text-slate-600 leading-relaxed font-mono text-[11px]">
                      {chk.evidence}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Automated Check Summary for Apex Components Ltd:
            </span>
            <p>
              • Quality, environmental, and Scope-3 carbon checks <strong>PASSED</strong>.
              <br />
              • ISO 45001:2018 is active but expires on <strong>2026-11-30</strong> (WARNING: MEDIUM).
              <br />
              • Missing manifests identified for consignments <strong>SHIP-APX-2026-0142</strong> and <strong>SHIP-APX-2026-0131</strong> (WARNING: HIGH).
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => runAiRiskAnalysis()}
              className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Generate Grounded AI Risk Analysis & Recommendations</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: AI RISK ANALYSIS & SCORE EXPLAINABILITY */}
      {/* ========================================================================= */}
      {demoCurrentStep === 5 && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold text-teal-600 uppercase tracking-wider">
                  Step 5 of 5 — Explainable AI Risk & Recommendations
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Compliance Score Evolution & Evidentiary Attribution
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  The AI reasons strictly over verified stored application records without inventing evidence.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                {demoState.riskAnalysis?.isFallback && (
                  <button
                    onClick={() => {
                      resetClientAiCooldown();
                      runAiRiskAnalysis();
                    }}
                    disabled={demoState.isAnalyzingRisk}
                    className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded border border-teal-200 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {demoState.isAnalyzingRisk ? 'Retrying AI...' : 'Retry AI analysis'}
                  </button>
                )}
                <span className="text-xs italic bg-slate-50 text-slate-600 px-3 py-1 rounded border border-slate-200">
                  {demoState.riskAnalysis?.isFallback ? '"Evidence-based fallback analysis — advisory only."' : '"AI-generated analysis — advisory only."'}
                </span>
              </div>
            </div>

            {demoState.riskAnalysis?.isFallback && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>AI service temporarily unavailable. Showing evidence-based registry information.</span>
                </div>
                <span className="text-[11px] font-mono text-amber-700">source: deterministic_fallback</span>
              </div>
            )}

            {/* Score Explainability Card: Before, After, Delta */}
            <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 text-white border border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Before Verification */}
                <div className="text-center md:text-left p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                  <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Before Verification
                  </div>
                  <div className="flex items-baseline justify-center md:justify-start gap-1">
                    <span className="text-3xl font-extrabold font-mono text-slate-300 tabular-nums">
                      80
                    </span>
                    <span className="text-slate-400 text-sm">/ 100</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Baseline registry status</div>
                </div>

                {/* Score Delta */}
                <div className="text-center p-4 rounded-xl bg-teal-950/40 border border-teal-500/40">
                  <div className="text-xs font-mono text-teal-300 uppercase tracking-wider mb-1">
                    Score Improvement
                  </div>
                  <div className="text-3xl font-black font-mono text-teal-400 tabular-nums">
                    +10
                  </div>
                  <div className="text-[11px] text-teal-200/80 mt-1">
                    Primary manifest verified & carbon validated
                  </div>
                </div>

                {/* After Verification */}
                <div className="text-center md:text-right p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                  <div className="text-xs font-mono text-teal-400 uppercase tracking-wider mb-1">
                    After Verification
                  </div>
                  <div className="flex items-baseline justify-center md:justify-end gap-1">
                    <span className="text-4xl font-extrabold font-mono text-white tabular-nums">
                      90
                    </span>
                    <span className="text-slate-400 text-base">/ 100</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                    LOW RISK (Higher score is better)
                  </div>
                </div>
              </div>

              {/* Mathematical Attribution Contributors */}
              <div className="mt-6 pt-5 border-t border-slate-700/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Positive Contributors */}
                <div className="space-y-2">
                  <div className="text-teal-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Positive Score Contributors (+20 pts)
                  </div>
                  <ul className="space-y-1.5 text-slate-300">
                    <li className="flex justify-between">
                      <span>• Valid ISO 14001:2015 Environmental cert</span>
                      <span className="font-mono text-emerald-400 font-bold">+8</span>
                    </li>
                    <li className="flex justify-between">
                      <span>• Scope-3 manifest validated (450.50 kg CO2e)</span>
                      <span className="font-mono text-emerald-400 font-bold">+7</span>
                    </li>
                    <li className="flex justify-between">
                      <span>• ISO 9001:2015 Quality accreditation active</span>
                      <span className="font-mono text-emerald-400 font-bold">+5</span>
                    </li>
                  </ul>
                </div>

                {/* Negative Contributors */}
                <div className="space-y-2">
                  <div className="text-rose-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Deductions & Penalties (-10 pts)
                  </div>
                  <ul className="space-y-1.5 text-slate-300">
                    <li className="flex justify-between">
                      <span>• Missing manifest for SHIP-APX-2026-0142</span>
                      <span className="font-mono text-rose-400 font-bold">-5</span>
                    </li>
                    <li className="flex justify-between">
                      <span>• Missing manifest for SHIP-APX-2026-0131</span>
                      <span className="font-mono text-rose-400 font-bold">-3</span>
                    </li>
                    <li className="flex justify-between">
                      <span>• ISO 45001:2018 expiring 2026-11-30</span>
                      <span className="font-mono text-rose-400 font-bold">-2</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Natural Language Explanation */}
              <div className="mt-5 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 leading-relaxed font-sans">
                <span className="font-bold text-white block mb-0.5">The score changed because:</span>
                Verification of consignment manifest APX-SHIP-2026-0155 provided verified Scope-3 carbon accounting (450.50 kg CO2e) and confirmed Tier-1 logistics traceability. 
                Ten points are withheld due to missing manifests on two historical shipments (SHIP-APX-2026-0142, SHIP-APX-2026-0131) and the pending ISO 45001:2018 renewal due on 2026-11-30.
              </div>
            </div>
          </div>

          {/* AI Recommendation Center */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  AI Recommendation Center
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Actionable compliance remediations synthesized strictly from stored evidence records.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">4 Recommendations</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: 'REC-01',
                  title: 'Upload missing shipment manifest: SHIP-APX-2026-0142',
                  reason: 'Consignment marked in transit without attached bill of lading or manifest document.',
                  evidence: 'Shipment record SHIP-APX-2026-0142 missing manifest document reference.',
                  recommendedAction: 'Request bill of lading and customs manifest from freight forwarder for SHIP-APX-2026-0142.',
                  priority: 'HIGH' as const,
                  dueDate: '2026-10-18',
                },
                {
                  id: 'REC-02',
                  title: 'Upload missing shipment manifest: SHIP-APX-2026-0131',
                  reason: 'Scope-3 carbon calculation unverified due to lack of primary transport documentation.',
                  evidence: 'Shipment record SHIP-APX-2026-0131 missing manifest document reference.',
                  recommendedAction: 'Upload verified logistics manifest for SHIP-APX-2026-0131 to finalize Scope-3 audit.',
                  priority: 'HIGH' as const,
                  dueDate: '2026-10-22',
                },
                {
                  id: 'REC-03',
                  title: 'Request updated ISO 45001:2018 certificate before 2026-11-30',
                  reason: 'Occupational health & safety standard expires in under 60 days.',
                  evidence: 'Certification ISO 45001:2018 certificate #OHS-2023-889 expiry date 2026-11-30.',
                  recommendedAction: 'Initiate certificate recertification verification with TÜV SÜD or Apex compliance team.',
                  priority: 'MEDIUM' as const,
                  dueDate: '2026-11-15',
                },
                {
                  id: 'REC-04',
                  title: 'Monitor certification renewal & schedule audit follow-up',
                  reason: 'Automotive tier-1 compliance requires zero lapse in ISO accreditation.',
                  evidence: 'Supplier code APX-COMP internal compliance policy SLA.',
                  recommendedAction: 'Create calendar milestone and assign compliance officer to follow up by 2026-11-15.',
                  priority: 'LOW' as const,
                  dueDate: '2026-11-20',
                },
              ].map(rec => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-slate-900 leading-snug">
                        {rec.title}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                          rec.priority === 'HIGH'
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : rec.priority === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {rec.priority}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mb-2">{rec.reason}</p>

                    <div className="p-2 rounded bg-white border border-slate-200/80 text-[11px] font-mono text-slate-600">
                      <span className="font-bold text-slate-800">Evidence:</span> {rec.evidence}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 font-mono">Due: {rec.dueDate}</span>
                    <button
                      onClick={() => handleCreateAction(rec.title, rec.recommendedAction, rec.priority, rec.dueDate)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Create Action</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links: Ledger & Print */}
          <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-slate-700" />
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Audit Trial Recorded in Internal Integrity Ledger
                </div>
                <div className="text-[11px] text-slate-500">
                  Every calculation, verified check, and risk score is hash-chained in the application database.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('integrity')}
                className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>View Integrity Ledger</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => openPrintReport('sup-apex-01')}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Compliance Summary</span>
              </button>
            </div>
          </div>

          {/* Mandatory Provenance Panel */}
          <VerificationProvenance />
        </div>
      )}
    </div>
  );
};
