import React, { useState } from 'react';
import {
  Layers,
  Building2,
  Award,
  FileCheck,
  Truck,
  Leaf,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Info,
  CheckCircle2,
  Clock,
  Compass,
  Lock,
  Cpu,
  MapPin,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Supplier } from '../types';

export const DigitalTwinView: React.FC = () => {
  const { suppliers, navigate, setActiveInvestigationSupplierId, openPrintReport } = useApp();

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    suppliers[0]?.id || 'sup-apex-01'
  );

  const supplier = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];

  if (!supplier) return null;

  // Active status helpers
  const activeCerts = supplier.certifications.filter(c => c.status === 'Active');
  const expiringCerts = supplier.certifications.filter(c => c.status === 'Expiring Soon');
  const expiredCerts = supplier.certifications.filter(c => c.status === 'Expired');

  const totalCarbonKg = supplier.carbonSummary?.totalEmissionsKg || 0;
  const verifiedShipments = supplier.shipments.filter(s => s.status === 'Verified');
  const missingManifestShipments = supplier.shipments.filter(s => !s.hasManifest);

  // Overall Decision recommendation
  const decisionStatus = supplier.riskLevel === 'CRITICAL' || supplier.riskLevel === 'HIGH'
    ? { title: 'Audit Escalation & Hold', badge: 'RED', tone: 'text-rose-400 bg-rose-500/10 border-rose-500/30' }
    : supplier.complianceScore >= 88 && missingManifestShipments.length === 0
    ? { title: 'Tier-1 Strategic Preferred', badge: 'GREEN', tone: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' }
    : { title: 'Conditional Supplier Approval', badge: 'AMBER', tone: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-white tracking-tight">
              Supply Chain Digital Twin
            </h2>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
              LIVE REGISTRY VIEW
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Multi-tier evidence topology connecting origin raw materials, corporate credentials, verified manifests,
            Scope-3 carbon calculations, and automated procurement governance decisions.
          </p>
        </div>

        {/* Provenance Badge & Supplier Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400 font-medium">Inspecting:</span>
            <select
              value={selectedSupplierId}
              onChange={e => setSelectedSupplierId(e.target.value)}
              className="bg-transparent font-bold text-white focus:outline-hidden cursor-pointer"
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setActiveInvestigationSupplierId(supplier.id);
              navigate('investigations');
            }}
            className="px-3.5 py-1.5 rounded-xl neo-button-primary btn-shine text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Investigate Supplier</span>
          </button>
        </div>
      </div>

      {/* Control Room Topbar: Legend & Provenance Attestation */}
      <div className="glass-panel p-3.5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-[11px]">
          <span className="font-mono text-slate-400 uppercase font-bold text-[10px]">Registry Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <span className="text-slate-300 font-medium">Verified / Healthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            <span className="text-slate-300 font-medium">Attention Required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]" />
            <span className="text-slate-300 font-medium">High Risk Signal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span className="text-slate-300 font-medium">Information Node</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-teal-300">
          <Lock className="w-3 h-3 text-teal-400" />
          <span>Data Source: SourceTrace Internal Registry · Chained Provenance</span>
        </div>
      </div>

      {/* INTERACTIVE DIGITAL TWIN GRAPH PIPELINE */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden glass-reflection space-y-8">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* TOP LEVEL: 4 Core Sequential Phases */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* NODE 1: ORIGIN / RAW MATERIAL */}
          <div className="glass-feature-card p-4.5 rounded-2xl border-white/10 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 mb-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> Origin Facility
                </span>
                <span className="w-2 h-2 rounded-full bg-slate-400" />
              </div>
              <h4 className="font-bold text-white text-sm">
                {supplier.location}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Tier-1 Production Plant & Logistics Yard in {supplier.country}.
              </p>
            </div>
            <div className="pt-2 border-t border-white/10 text-[10px] font-mono text-slate-400">
              Primary Mode: {supplier.industry}
            </div>
          </div>

          {/* NODE 2: SUPPLIER MASTER IDENTITY */}
          <div
            onClick={() => navigate('supplier-detail', supplier.id)}
            className="glass-feature-card p-4.5 rounded-2xl border-teal-500/30 cursor-pointer group hover:border-teal-400/60 transition-all space-y-3 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/10 rounded-bl-full pointer-events-none" />
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-teal-300 mb-2">
                <span className="flex items-center gap-1 font-bold">
                  <Building2 className="w-3 h-3 text-teal-400" /> Master Entity
                </span>
                <span className={`w-2.5 h-2.5 rounded-full ${supplier.riskLevel === 'LOW' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </div>
              <h4 className="font-serif font-bold text-white text-sm group-hover:text-teal-300 transition-colors flex items-center justify-between">
                <span>{supplier.name}</span>
                <ExternalLink className="w-3.5 h-3.5 text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="font-mono text-teal-400 font-bold">{supplier.complianceScore}/100</span>
                <span className="text-slate-500">·</span>
                <span className="font-mono text-slate-300">{supplier.riskLevel} Risk</span>
              </div>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Code: {supplier.code}</span>
              <span className="text-teal-400 font-semibold">Inspect 360° →</span>
            </div>
          </div>

          {/* NODE 3: CERTIFICATIONS */}
          <div
            onClick={() => navigate('compliance')}
            className="glass-feature-card p-4.5 rounded-2xl border-white/10 cursor-pointer group hover:border-teal-400/50 transition-all space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 mb-2">
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3 text-purple-400" /> Accreditations
                </span>
                <span className={`w-2.5 h-2.5 rounded-full ${expiredCerts.length > 0 ? 'bg-rose-400' : expiringCerts.length > 0 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              </div>
              <h4 className="font-bold text-white text-sm">
                {activeCerts.length} Verified Standards
              </h4>
              <div className="mt-2 space-y-1">
                {supplier.certifications.slice(0, 3).map(c => (
                  <div key={c.id} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-medium truncate max-w-[130px]">{c.name}</span>
                    <span className={`text-[10px] font-mono font-bold ${c.status === 'Active' ? 'text-emerald-400' : c.status === 'Expiring Soon' ? 'text-amber-400' : 'text-rose-400'}`}>
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>{supplier.certifications.length} Filed Records</span>
              <span className="text-purple-400 font-semibold">Compliance Center →</span>
            </div>
          </div>

          {/* NODE 4: DOCUMENTS REPOSITORY */}
          <div
            onClick={() => navigate('documents')}
            className="glass-feature-card p-4.5 rounded-2xl border-white/10 cursor-pointer group hover:border-teal-400/50 transition-all space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 mb-2">
                <span className="flex items-center gap-1">
                  <FileCheck className="w-3 h-3 text-teal-400" /> Evidence Docs
                </span>
                <span className={`w-2.5 h-2.5 rounded-full ${missingManifestShipments.length > 0 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              </div>
              <h4 className="font-bold text-white text-sm">
                {supplier.documents.length} Uploaded Files
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {missingManifestShipments.length > 0
                  ? `${missingManifestShipments.length} consignment(s) missing signed delivery manifests.`
                  : 'All manifest documents cryptographically reconciled.'}
              </p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Audit Checksum Verified</span>
              <span className="text-teal-400 font-semibold">Doc Verification →</span>
            </div>
          </div>
        </div>

        {/* Visual Connecting Stream */}
        <div className="relative py-2 flex items-center justify-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" />
          <div className="absolute px-3 py-1 rounded-full bg-slate-900 border border-teal-500/30 text-[10px] font-mono text-teal-300 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
            <span>Deterministic Evidence Flow</span>
            <ArrowRight className="w-3 h-3 text-teal-400" />
          </div>
        </div>

        {/* BOTTOM LEVEL: Shipments, Carbon, Compliance Standing, Final Decision */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* NODE 5: SHIPMENTS */}
          <div
            onClick={() => navigate('shipments')}
            className="glass-feature-card p-4.5 rounded-2xl border-white/10 cursor-pointer group hover:border-teal-400/50 transition-all space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 mb-2">
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-blue-400" /> Logistics Freight
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              </div>
              <h4 className="font-bold text-white text-sm">
                {supplier.shipments.length} Active Shipments
              </h4>
              <div className="mt-2 space-y-1 font-mono text-[11px]">
                {supplier.shipments.slice(0, 2).map(s => (
                  <div key={s.id} className="flex items-center justify-between">
                    <span className="text-slate-300 truncate max-w-[130px]">{s.shipmentNumber}</span>
                    <span className="text-blue-300">{s.carbonEmission} kg</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>{verifiedShipments.length} Verified Milestones</span>
              <span className="text-blue-400 font-semibold">Shipment Analysis →</span>
            </div>
          </div>

          {/* NODE 6: SCOPE-3 CARBON IMPACT */}
          <div
            onClick={() => navigate('carbon')}
            className="glass-feature-card p-4.5 rounded-2xl border-white/10 cursor-pointer group hover:border-teal-400/50 transition-all space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 mb-2">
                <span className="flex items-center gap-1">
                  <Leaf className="w-3 h-3 text-emerald-400" /> Scope-3 Carbon
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="text-xl font-black font-mono text-emerald-300 tabular-nums">
                {totalCarbonKg.toLocaleString()} <span className="text-xs font-normal text-slate-400">kg CO2e</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                GLEC v2.0 deterministic carbon emissions calculated across {supplier.shipments.length} consignments.
              </p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>{(totalCarbonKg / 1000).toFixed(2)} Tonnes CO2e</span>
              <span className="text-emerald-400 font-semibold">Carbon Calculator →</span>
            </div>
          </div>

          {/* NODE 7: COMPLIANCE & RISK POSTURE */}
          <div
            onClick={() => navigate('heatmap')}
            className="glass-feature-card p-4.5 rounded-2xl border-white/10 cursor-pointer group hover:border-teal-400/50 transition-all space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 mb-2">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-teal-400" /> Risk Posture
                </span>
                <span className={`w-2.5 h-2.5 rounded-full ${supplier.riskLevel === 'LOW' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </div>
              <h4 className="font-bold text-white text-sm">
                {supplier.complianceScore}/100 Compliance
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                {supplier.riskLevel} counterparty risk. Deductions applied for unmanifested consignments.
              </p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>{supplier.actions.filter(a => a.status !== 'Resolved').length} Open Actions</span>
              <span className="text-teal-400 font-semibold">Risk Heatmap →</span>
            </div>
          </div>

          {/* NODE 8: AUTOMATED GOVERNANCE DECISION */}
          <div
            onClick={() => {
              setActiveInvestigationSupplierId(supplier.id);
              navigate('investigations');
            }}
            className={`glass-feature-card p-4.5 rounded-2xl border cursor-pointer group transition-all space-y-3 flex flex-col justify-between ${decisionStatus.tone}`}
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono uppercase mb-2">
                <span className="flex items-center gap-1 font-bold">
                  <Cpu className="w-3 h-3" /> System Decision
                </span>
                <span className={`w-2.5 h-2.5 rounded-full ${decisionStatus.badge === 'GREEN' ? 'bg-emerald-400' : decisionStatus.badge === 'AMBER' ? 'bg-amber-400' : 'bg-rose-400'}`} />
              </div>
              <h4 className="font-serif font-bold text-white text-sm group-hover:text-teal-200 transition-colors">
                {decisionStatus.title}
              </h4>
              <p className="text-[11px] opacity-90 mt-1 leading-snug">
                Deterministic governance verdict derived from all 8 evidence stages.
              </p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
              <span>Autonomous Engine</span>
              <span className="font-bold underline">Launch Audit →</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Feature Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('contradictions')}
          className="glass-panel p-4 rounded-2xl cursor-pointer hover:border-teal-400/40 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Contradiction Engine</div>
              <div className="text-[11px] text-slate-400">Cross-verify invoices & manifests</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>

        <div
          onClick={() => navigate('simulator', supplier.id)}
          className="glass-panel p-4 rounded-2xl cursor-pointer hover:border-teal-400/40 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">What-If Risk Simulator</div>
              <div className="text-[11px] text-slate-400">Model prospective lever outcomes</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>

        <div
          onClick={() => openPrintReport(supplier.id)}
          className="glass-panel p-4 rounded-2xl cursor-pointer hover:border-teal-400/40 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Printable Executive Report</div>
              <div className="text-[11px] text-slate-400">Generate compliance summary PDF</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </div>
  );
};
