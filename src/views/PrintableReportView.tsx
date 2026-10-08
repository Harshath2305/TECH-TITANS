import React from 'react';
import { Printer, ArrowLeft, Download, ShieldCheck, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ComplianceScoreBadge } from '../components/common/ComplianceScoreBadge';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';

export const PrintableReportView: React.FC = () => {
  const { suppliers, routeParam, navigate, closePrintReport } = useApp();
  const supplierId = routeParam || 'sup-apex-01';
  const supplier = suppliers.find(s => s.id === supplierId) || suppliers[0];

  const handlePrint = () => {
    window.print();
  };

  const missingShipments = supplier.shipments.filter(s => !s.hasManifest);

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Action Bar (Hidden on print) */}
      <div className="flex items-center justify-between gap-4 mb-6 no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <button
          onClick={closePrintReport}
          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Application</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            A4 Optimized Printable Layout
          </span>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Compliance Summary</span>
          </button>
        </div>
      </div>

      {/* The Printable Document Page */}
      <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none text-slate-900 font-sans space-y-6">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
          <div>
            <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 flex items-center gap-2">
              SOURCE TRACE AI
            </div>
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mt-0.5">
              Supplier Compliance Summary & Scope-3 Audit Report
            </div>
          </div>
          <div className="text-right text-[11px] font-mono text-slate-500">
            <div>Report Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
            <div>Registry ID: ST-AUD-{supplier.code}</div>
            <div className="text-slate-400">Database Ledger SHA-256 Validated</div>
          </div>
        </div>

        {/* Identity & High-Level Compliance Posture */}
        <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Supplier Identification
            </span>
            <div className="font-extrabold text-slate-900 text-sm mt-0.5">{supplier.name}</div>
            <div className="text-xs text-slate-600 font-mono mt-0.5">{supplier.code} · {supplier.country}</div>
            <div className="text-[11px] text-slate-500">{supplier.location}</div>
          </div>

          <div className="text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Compliance Score
            </span>
            <div className="text-3xl font-black font-mono text-slate-950 mt-0.5 tabular-nums">
              {supplier.complianceScore} <span className="text-sm font-normal text-slate-500">/ 100</span>
            </div>
            <div className="text-[10px] font-semibold text-teal-700">Higher is better</div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Assessed Risk & Status
            </span>
            <div className="text-sm font-bold text-slate-900 mt-1">
              {supplier.riskLevel} RISK
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              Status: {supplier.verificationStatus}
            </div>
            <div className="text-[11px] text-slate-500">{supplier.industry}</div>
          </div>
        </div>

        {/* Scope-3 Carbon & Logistics Summary */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] block mb-1">
              Scope-3 Logistics Carbon Impact
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
              {supplier.carbonSummary?.totalEmissionsKg.toLocaleString()} kg CO2e
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Deterministic calculation across {supplier.shipments.length} consignments ({supplier.carbonSummary?.calculationMethod}).
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] block mb-1">
              Manifest Attachment Status
            </span>
            <div className={`text-base font-bold font-mono ${missingShipments.length > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {missingShipments.length > 0
                ? `${missingShipments.length} Missing Shipment Manifests`
                : 'All Manifests Verified'}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {missingShipments.length > 0
                ? `Missing: ${missingShipments.map(s => s.shipmentNumber).join(', ')}`
                : 'Primary transport declarations attached'}
            </p>
          </div>
        </div>

        {/* Certifications Table */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            Accredited Quality & Environmental Certifications
          </h4>
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 font-semibold text-[10px] uppercase">
              <tr>
                <th className="py-2 px-3">Standard</th>
                <th className="py-2 px-3">Certificate Number</th>
                <th className="py-2 px-3">Issuer</th>
                <th className="py-2 px-3">Expiry Date</th>
                <th className="py-2 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {supplier.certifications.map(c => (
                <tr key={c.id}>
                  <td className="py-2 px-3 font-bold font-sans text-slate-900">{c.name}</td>
                  <td className="py-2 px-3">{c.certificateNumber}</td>
                  <td className="py-2 px-3 font-sans text-slate-600">{c.issuer}</td>
                  <td className="py-2 px-3 font-bold text-slate-800">{c.expiryDate}</td>
                  <td className="py-2 px-3 text-right font-sans">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      c.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-800'
                        : c.status === 'Expiring Soon'
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-rose-50 text-rose-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Compliance Checks Matrix */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            Compliance Policy Evaluation Checks
          </h4>
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 font-semibold text-[10px] uppercase">
              <tr>
                <th className="py-2 px-3">Domain</th>
                <th className="py-2 px-3">Check Title</th>
                <th className="py-2 px-3">Result</th>
                <th className="py-2 px-3">Evidentiary Record Basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[11px]">
              {supplier.complianceChecks.map(chk => (
                <tr key={chk.id}>
                  <td className="py-1.5 px-3 font-semibold text-slate-700">{chk.category}</td>
                  <td className="py-1.5 px-3 font-bold text-slate-900">{chk.checkName}</td>
                  <td className="py-1.5 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      chk.result === 'PASS'
                        ? 'bg-emerald-50 text-emerald-800'
                        : chk.result === 'WARNING'
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-rose-50 text-rose-800'
                    }`}>
                      {chk.result}
                    </span>
                  </td>
                  <td className="py-1.5 px-3 font-mono text-slate-600 text-[10px]">{chk.evidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AI Recommendations & Open Actions */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] block">
              AI Advisory Recommendations
            </span>
            <ul className="space-y-1 text-slate-700 text-[11px]">
              {supplier.aiInsights[0]?.recommendations?.slice(0, 3).map((r, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span>•</span>
                  <span>{r}</span>
                </li>
              )) || (
                <>
                  <li>• Upload missing shipment manifests (SHIP-APX-2026-0142, SHIP-APX-2026-0131)</li>
                  <li>• Request updated ISO 45001:2018 certificate before 2026-11-30</li>
                </>
              )}
            </ul>
            <span className="text-[9px] text-slate-500 italic block pt-1">
              "AI-generated analysis — advisory only. Based on internal records."
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] block">
              Active Compliance Remediations ({supplier.actions.filter(a => a.status !== 'Resolved').length})
            </span>
            <ul className="space-y-1 text-slate-700 text-[11px]">
              {supplier.actions.slice(0, 3).map(a => (
                <li key={a.id} className="flex justify-between">
                  <span className="truncate max-w-[240px]">• {a.title}</span>
                  <span className="font-mono text-[10px] text-slate-500">Due: {a.dueDate}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mandatory Verification Provenance Statement (Crucial for Section 20 & 21) */}
        <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-[10px] space-y-1 leading-relaxed border border-slate-800">
          <div className="font-bold text-teal-400 uppercase tracking-wider text-[11px]">
            Verification Provenance Disclosure
          </div>
          <p>
            <strong>1. Internal Registry Check:</strong> Reads SourceTrace's tenant supplier, document, certification, shipment, and compliance records.
            <br />
            <strong>2. AI-Generated Analysis:</strong> Language-model advisory synthesis strictly based on stored records. Not verification evidence.
            <br />
            <strong>3. Demo / Sample Data:</strong> Data source: <code className="font-mono text-teal-300">demo_seed</code>.
            <br />
            <strong>4. External Verification:</strong> NOT PERFORMED. No certification body, government, customs, or external authority was queried.
          </p>
          <div className="text-slate-400 italic pt-1 border-t border-slate-800 text-[9px]">
            The internal integrity ledger is an application database feature and not a public blockchain.
          </div>
        </div>
      </div>
    </div>
  );
};
