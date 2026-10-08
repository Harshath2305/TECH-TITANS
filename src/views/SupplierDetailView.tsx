import React, { useState } from 'react';
import {
  Building2,
  ArrowLeft,
  Printer,
  ShieldCheck,
  FileText,
  Truck,
  CloudFog,
  Award,
  CheckSquare,
  History,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  PlusCircle,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Sliders,
  Grid,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ComplianceScoreBadge } from '../components/common/ComplianceScoreBadge';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { VerificationProvenance } from '../components/common/VerificationProvenance';

export const SupplierDetailView: React.FC = () => {
  const { suppliers, routeParam, navigate, openPrintReport, auditLedger, addComplianceAction } = useApp();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isCreatingAction, setIsCreatingAction] = useState(false);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionDesc, setNewActionDesc] = useState('');
  const [newActionPriority, setNewActionPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [newActionDueDate, setNewActionDueDate] = useState('2026-11-15');

  const supplier = suppliers.find(s => s.id === routeParam) || suppliers[0];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'documents', label: `Documents (${supplier.documents.length})` },
    { id: 'certifications', label: `Certifications (${supplier.certifications.length})` },
    { id: 'shipments', label: `Shipments (${supplier.shipments.length})` },
    { id: 'carbon', label: 'Carbon Accounting' },
    { id: 'compliance', label: `Compliance Checks (${supplier.complianceChecks.length})` },
    { id: 'airisk', label: 'AI Risk Advisory' },
    { id: 'actions', label: `Actions (${supplier.actions.length})` },
    { id: 'audit', label: 'Audit Trail' },
  ];

  const supplierAuditRecords = auditLedger.filter(
    r => r.entityId === supplier.code || r.description.includes(supplier.name) || r.description.includes(supplier.code)
  );

  const handleCreateActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTitle) return;

    addComplianceAction({
      supplierId: supplier.id,
      supplierName: supplier.name,
      title: newActionTitle,
      description: newActionDesc,
      priority: newActionPriority,
      status: 'Open',
      dueDate: newActionDueDate,
      owner: 'Elena Rostova (Compliance Auditor)',
      source: 'Manual',
    });

    setIsCreatingAction(false);
    setNewActionTitle('');
    setNewActionDesc('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Back button & Title header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('suppliers')}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {supplier.name}
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                {supplier.code}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {supplier.location}</span>
              <span>·</span>
              <span>{supplier.industry}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('simulator', supplier.id)}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-teal-50 hover:border-teal-300 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Model prospective changes in What-If Simulator"
          >
            <Sliders className="w-3.5 h-3.5 text-teal-600" />
            <span>What-If Simulator</span>
          </button>
          <button
            onClick={() => navigate('heatmap')}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="View on Risk Heatmap"
          >
            <Grid className="w-3.5 h-3.5 text-purple-600" />
            <span>Heatmap</span>
          </button>
          <button
            onClick={() => navigate('demo-verification')}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Verify Manifest
          </button>
          <button
            onClick={() => openPrintReport(supplier.id)}
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Compliance Summary</span>
          </button>
        </div>
      </div>

      {/* Top Identity & KPI summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Compliance Score
          </span>
          <ComplianceScoreBadge score={supplier.complianceScore} size="lg" showSubtitle={true} />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Assessed Risk Level
          </span>
          <div className="mt-1">
            <RiskBadge level={supplier.riskLevel} size="lg" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Scope-3 Logistics Carbon
          </span>
          <div className="text-xl font-extrabold font-mono text-slate-900 tabular-nums">
            {supplier.carbonSummary?.totalEmissionsKg.toLocaleString()} <span className="text-xs font-normal text-slate-500">kg CO2e</span>
          </div>
          <span className="text-[11px] text-slate-400">{supplier.shipments.length} consignments</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Open Actions / Remediation
          </span>
          <div className="text-xl font-bold font-mono text-slate-900">
            {supplier.actions.filter(a => a.status !== 'Resolved').length} Active
          </div>
          <span className="text-[11px] text-slate-400">
            {supplier.complianceChecks.filter(c => c.result === 'WARNING').length} warnings flagged
          </span>
        </div>
      </div>

      {/* 9-Tab Navigation Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-1 flex items-center gap-1 overflow-x-auto shadow-xs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Details Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Supplier Profile & Operating Entity
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block">Legal Entity Name</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{supplier.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Internal Registry Code</span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block">{supplier.code}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Headquarters / Plant Location</span>
                  <span className="text-slate-800 font-medium mt-0.5 block">{supplier.location}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Country & Jurisdiction</span>
                  <span className="text-slate-800 font-medium mt-0.5 block">{supplier.country}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Industry & Production Focus</span>
                  <span className="text-slate-800 font-medium mt-0.5 block">{supplier.industry}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Verification Status</span>
                  <div className="mt-0.5">
                    <StatusBadge status={supplier.verificationStatus} />
                  </div>
                </div>
              </div>

              {/* Primary Contact */}
              <div className="pt-4 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block mb-2">
                  Designated Compliance Liaison
                </span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900">{supplier.contact.name}</div>
                    <div className="text-slate-500 text-[11px]">{supplier.contact.role}</div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-600 font-mono text-[11px]">
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {supplier.contact.email}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {supplier.contact.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Warnings & Alerts */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Active Compliance Alerts
              </h3>

              <div className="space-y-3">
                {supplier.complianceChecks
                  .filter(c => c.result === 'WARNING' || c.result === 'FAIL')
                  .map(c => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900">{c.checkName}</span>
                        <StatusBadge status={c.severity} type="severity" />
                      </div>
                      <p className="text-amber-800 text-[11px] leading-relaxed font-mono">
                        {c.evidence}
                      </p>
                    </div>
                  ))}

                {supplier.complianceChecks.filter(c => c.result === 'WARNING' || c.result === 'FAIL').length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No active warnings or non-conformances on file.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Shipments and Certifications Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Certifications quick overview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900">Active Certifications</h4>
                <button
                  onClick={() => setActiveTab('certifications')}
                  className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-2">
                {supplier.certifications.map(c => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-slate-500">{c.standard} · #{c.certificateNumber}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[11px] text-slate-700 block">Expires {c.expiryDate}</span>
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipments quick overview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900">Recent Logistics Consignments</h4>
                <button
                  onClick={() => setActiveTab('shipments')}
                  className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-2">
                {supplier.shipments.map(s => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-slate-900">{s.shipmentNumber}</div>
                      <div className="text-[11px] text-slate-500">{s.origin} → {s.destination}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900 block tabular-nums">
                        {s.carbonEmission} kg CO2e
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {s.hasManifest ? 'Manifest verified' : 'Missing manifest'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Supplier Verified Documents ({supplier.documents.length})
            </h3>
            <button
              onClick={() => navigate('documents')}
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
            >
              Upload / Verify Document
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Filename</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Issue Date</th>
                  <th className="py-2.5 px-4">Expiry Date</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {supplier.documents.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-600" />
                      <span>{d.fileName}</span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-700">{d.documentType}</td>
                    <td className="py-3 px-4 text-slate-600">{d.issueDate}</td>
                    <td className="py-3 px-4 text-slate-600">{d.expiryDate || 'N/A'}</td>
                    <td className="py-3 px-4 font-sans">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="py-3 px-4 font-sans text-[11px] text-slate-500">{d.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CERTIFICATIONS */}
      {activeTab === 'certifications' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Accredited Quality, Environmental & Safety Standards
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {supplier.certifications.map(c => (
              <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900">{c.name}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="text-xs text-slate-600 mb-1">{c.standard}</div>
                  <div className="text-[11px] font-mono text-slate-500">Cert: #{c.certificateNumber}</div>
                  <div className="text-[11px] text-slate-500">Issuer: {c.issuer}</div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 text-xs flex justify-between text-slate-600">
                  <span>Issued: {c.issueDate}</span>
                  <span className="font-bold text-slate-800">Expires: {c.expiryDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SHIPMENTS */}
      {activeTab === 'shipments' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Upstream Shipment Registry ({supplier.shipments.length} consignments)
              </h3>
              <p className="text-xs text-slate-500">
                Sum of carbon from all shipments equals {supplier.carbonSummary?.totalEmissionsKg} kg CO2e
              </p>
            </div>
            <button
              onClick={() => navigate('carbon')}
              className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold"
            >
              Scope-3 Calculator
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Shipment #</th>
                  <th className="py-2.5 px-4">Route</th>
                  <th className="py-2.5 px-4">Mode</th>
                  <th className="py-2.5 px-4">Cargo Weight</th>
                  <th className="py-2.5 px-4">Carbon Impact</th>
                  <th className="py-2.5 px-4">Manifest Document</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {supplier.shipments.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-bold text-slate-900">{s.shipmentNumber}</td>
                    <td className="py-3 px-4 font-sans text-slate-700">
                      {s.origin} → {s.destination} ({s.distanceKm} km)
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-700">{s.transportMode}</td>
                    <td className="py-3 px-4 tabular-nums">{s.cargoWeight} tonnes</td>
                    <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">
                      {s.carbonEmission} kg CO2e
                    </td>
                    <td className="py-3 px-4 font-sans">
                      {s.hasManifest ? (
                        <span className="text-emerald-700 font-semibold">{s.manifestDocument}</span>
                      ) : (
                        <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          MISSING MANIFEST
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <StatusBadge status={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: CARBON */}
      {activeTab === 'carbon' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Deterministic Scope-3 Carbon Accounting (Category 4)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              GHG Protocol / GLEC Framework v2.0 Upstream Transportation & Distribution.
            </p>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-mono text-teal-400 font-bold uppercase tracking-wider block mb-1">
                Total Verified Scope-3 Impact
              </span>
              <div className="text-4xl font-black font-mono tabular-nums">
                {supplier.carbonSummary?.totalEmissionsKg.toLocaleString()} <span className="text-lg font-normal text-slate-300">kg CO2e</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {(supplier.carbonSummary?.totalEmissionsKg / 1000).toFixed(3)} tonnes CO2e from {supplier.shipments.length} consignments
              </div>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 text-xs space-y-1.5 md:min-w-[280px]">
              <span className="font-bold text-white block mb-1">Calculation Provenance:</span>
              <div className="text-slate-300">Method: {supplier.carbonSummary?.calculationMethod}</div>
              <div className="text-slate-300">Last Computed: {supplier.carbonSummary?.lastCalculated}</div>
              <div className="text-teal-400 font-mono text-[11px] pt-1 border-t border-slate-700">
                100% Deterministic (No AI fabrication)
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Consignment Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {supplier.shipments.map(s => (
                <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                  <div className="flex justify-between font-mono font-bold text-slate-900">
                    <span>{s.shipmentNumber}</span>
                    <span className="tabular-nums">{s.carbonEmission} kg</span>
                  </div>
                  <div className="text-slate-600">
                    {s.cargoWeight} t × {s.distanceKm} km ({s.transportMode})
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    Fuel: {s.fuelUsed} L {s.fuelType}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: COMPLIANCE */}
      {activeTab === 'compliance' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Internal Compliance Checks Matrix
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Check Title</th>
                  <th className="py-2.5 px-4">Result</th>
                  <th className="py-2.5 px-4">Severity</th>
                  <th className="py-2.5 px-4">Evidentiary Record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {supplier.complianceChecks.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-semibold text-slate-700">{c.category}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{c.checkName}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.result} type="result" />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.severity} type="severity" />
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{c.evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: AI RISK ADVISORY */}
      {activeTab === 'airisk' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Grounded AI Risk Analysis
                </h3>
                <p className="text-xs text-slate-500">
                  Evaluated strictly over stored internal database records.
                </p>
              </div>
              <span className="text-xs italic bg-slate-50 text-slate-600 px-3 py-1 rounded border border-slate-200">
                "AI-generated analysis — advisory only."
              </span>
            </div>

            {supplier.aiInsights.length > 0 ? (
              supplier.aiInsights.map((insight, idx) => (
                <div key={idx} className="space-y-6">
                  {insight.isFallback && (
                    <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>AI service temporarily unavailable — showing evidence-based fallback insights.</span>
                      </div>
                      <span className="text-[11px] font-mono text-amber-700">source: deterministic_fallback</span>
                    </div>
                  )}

                  {/* Score & Summary */}
                  <div className="p-5 rounded-xl bg-slate-900 text-white border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold font-mono text-white tabular-nums">
                          {insight.score}
                        </span>
                        <span className="text-slate-400 text-sm">/ 100</span>
                        <span className="text-xs text-teal-400 font-semibold ml-2">
                          {insight.riskLevel} RISK (Higher is better)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        Model: {insight.isFallback ? 'Evidence-based fallback analysis' : insight.model}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {insight.explanation}
                    </p>
                  </div>

                  {/* Positive & Negative Factors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 bg-emerald-50/40 space-y-2">
                      <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Positive Factors
                      </div>
                      <ul className="text-xs text-emerald-950 space-y-1.5">
                        {insight.positiveFactors.map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span>•</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-rose-50/40 space-y-2">
                      <div className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" /> Risk Penalties & Gaps
                      </div>
                      <ul className="text-xs text-rose-950 space-y-1.5">
                        {insight.negativeFactors.map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span>•</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Advisory Recommendations
                    </h4>
                    <div className="space-y-2 text-xs">
                      {insight.recommendations.map((rec, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-3"
                        >
                          <span className="text-slate-800 font-medium leading-relaxed">{rec}</span>
                          <button
                            onClick={() => {
                              addComplianceAction({
                                supplierId: supplier.id,
                                supplierName: supplier.name,
                                title: rec,
                                description: `Generated from AI Recommendation for ${supplier.name}.`,
                                priority: rec.includes('missing') ? 'HIGH' : 'MEDIUM',
                                status: 'Open',
                                dueDate: '2026-11-20',
                                owner: 'Elena Rostova',
                                source: 'AI Recommendation',
                              });
                              setActiveTab('actions');
                            }}
                            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold shrink-0"
                          >
                            Create Action
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                Run the 3-minute Demo Verification to generate a real-time explainable risk analysis.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 8: ACTIONS */}
      {activeTab === 'actions' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Supplier Compliance Remediation Actions ({supplier.actions.length})
              </h3>
              <p className="text-xs text-slate-500">
                Every action creation and status transition is recorded in the internal integrity ledger.
              </p>
            </div>
            <button
              onClick={() => setIsCreatingAction(true)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Action</span>
            </button>
          </div>

          {/* Action creation form */}
          {isCreatingAction && (
            <form onSubmit={handleCreateActionSubmit} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="font-bold text-xs text-slate-900">Create Compliance Action</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newActionTitle}
                    onChange={e => setNewActionTitle(e.target.value)}
                    placeholder="e.g. Upload missing shipment manifest for #0142"
                    className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newActionDueDate}
                    onChange={e => setNewActionDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-500 mb-1">Description / Notes</label>
                  <input
                    type="text"
                    value={newActionDesc}
                    onChange={e => setNewActionDesc(e.target.value)}
                    placeholder="Specific remediation steps required"
                    className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Priority</label>
                  <select
                    value={newActionPriority}
                    onChange={e => setNewActionPriority(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingAction(false)}
                  className="px-3 py-1 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-semibold"
                >
                  Save Action
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {supplier.actions.map(act => (
              <div
                key={act.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs text-slate-900">{act.title}</span>
                    <StatusBadge status={act.priority} type="severity" />
                    <StatusBadge status={act.status} />
                  </div>
                  <p className="text-xs text-slate-600">{act.description}</p>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                    <span>Owner: {act.owner}</span>
                    <span>·</span>
                    <span className="font-mono">Due: {act.dueDate}</span>
                    <span>·</span>
                    <span className="italic">Source: {act.source}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">ID: {act.id}</span>
                  <button
                    onClick={() => navigate('actions')}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                  >
                    Manage in Tracker →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Internal Integrity Ledger (Supplier Records)
              </h3>
              <p className="text-xs text-slate-500">
                Cryptographic hash-chain events associated with {supplier.name}.
              </p>
            </div>
            <button
              onClick={() => navigate('integrity')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700"
            >
              Full Ledger View →
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 font-mono text-[10px]">Record Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {supplierAuditRecords.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 text-slate-600 font-sans">{new Date(r.timestamp).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-sans font-medium">{r.actor}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{r.action}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-700 max-w-xs">{r.description}</td>
                    <td className="py-2.5 px-3 text-teal-600 truncate max-w-[120px]" title={r.recordHash}>
                      {r.recordHash.substring(0, 16)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mandatory Verification Provenance */}
      <VerificationProvenance />
    </div>
  );
};
