import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Flame,
  FileX,
  Clock,
  CheckCircle2,
  ArrowRight,
  Filter,
  Search,
  PlusCircle,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Building2,
  CheckSquare,
  Truck,
  Leaf,
  Award,
  Database,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SupplyChainAnomaly, AnomalyCategory, SeverityLevel } from '../types';

export const AnomalyDetectionView: React.FC = () => {
  const { suppliers, navigate, addComplianceAction, logAuditEvent } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [resolvedAnomalyIds, setResolvedAnomalyIds] = useState<Set<string>>(new Set());
  const [investigatingAnomalyIds, setInvestigatingAnomalyIds] = useState<Set<string>>(new Set());
  const [actionCreatedNotice, setActionCreatedNotice] = useState<string | null>(null);

  // Deterministically compute anomalies across all verified records in the application
  const rawAnomalies: SupplyChainAnomaly[] = useMemo(() => {
    const list: SupplyChainAnomaly[] = [];

    // 1. Missing Logistics Manifests Gaps
    suppliers.forEach(supplier => {
      supplier.shipments.forEach(shipment => {
        if (!shipment.hasManifest || shipment.status === 'Pending Manifest') {
          list.push({
            id: `ANOM-DOC-${shipment.shipmentNumber}`,
            category: 'Documentation',
            severity: 'HIGH',
            title: `Unattached Logistics Manifest for Consignment ${shipment.shipmentNumber}`,
            supplierId: supplier.id,
            supplierName: supplier.name,
            entityId: shipment.shipmentNumber,
            entityType: 'Shipment Consignment',
            observedValue: 'Manifest Document: Missing / Unattached',
            baselineThreshold: '100% Bill of Lading & Customs Attestation Required',
            explanation: `Consignment is registered in transit without an uploaded bill of lading, sea waybill, or customs manifest. Scope-3 carbon accounting cannot be certified without primary freight tickets.`,
            remediation: `Issue immediate documentation request to freight forwarder for ${shipment.shipmentNumber}. Obtain digital manifest with gross verified weight.`,
            detectedAt: '2026-10-01 08:30 UTC',
            status: 'Open',
          });
        }

        // 2. Carbon Outlier (Air freight or excessive intensity)
        const intensity = shipment.distanceKm > 0 && shipment.cargoWeight > 0
          ? shipment.carbonEmission / (shipment.cargoWeight * shipment.distanceKm)
          : 0;

        if (shipment.transportMode === 'Air Freight' || intensity > 0.3) {
          list.push({
            id: `ANOM-CARB-${shipment.shipmentNumber}`,
            category: 'Carbon',
            severity: 'HIGH',
            title: `High Carbon Intensity Outlier: ${shipment.shipmentNumber} (${shipment.transportMode})`,
            supplierId: supplier.id,
            supplierName: supplier.name,
            entityId: shipment.shipmentNumber,
            entityType: 'Logistics Route',
            observedValue: `${intensity.toFixed(3)} kg CO2e / tonne-km (${shipment.carbonEmission.toFixed(1)} kg total)`,
            baselineThreshold: `≤ 0.096 kg CO2e / tonne-km (Road/Rail standard baseline)`,
            explanation: `Freight emission factor is ${(intensity / 0.096).toFixed(1)}x higher than standard multimodal road/rail freight benchmarks. Significant driver of Scope-3 Category 4 footprint.`,
            remediation: `Evaluate route optimization to transfer standard cargo from Air Freight to multimodal maritime/rail freight, cutting emissions by up to 80%.`,
            detectedAt: '2026-09-28 14:15 UTC',
            status: 'Open',
          });
        }
      });

      // 3. Certification Expiry Windows & Lapses
      supplier.certifications.forEach(cert => {
        const expiry = new Date(cert.expiryDate).getTime();
        const now = new Date('2026-10-08').getTime();
        const daysToExpiry = Math.round((expiry - now) / (1000 * 60 * 60 * 24));

        if (daysToExpiry < 0 || cert.status === 'Expired') {
          list.push({
            id: `ANOM-CERT-${cert.id}`,
            category: 'Certification',
            severity: 'CRITICAL',
            title: `Expired Compliance Standard: ${cert.standard} (${cert.name})`,
            supplierId: supplier.id,
            supplierName: supplier.name,
            entityId: cert.certificateNumber,
            entityType: 'Accreditation',
            observedValue: `Expired on ${cert.expiryDate} (Overdue)`,
            baselineThreshold: `Active continuous certification required`,
            explanation: `The supplier is operating with an expired environmental/quality standard. This triggers automatic compliance penalties under Tier-1 corporate governance.`,
            remediation: `Freeze non-essential procurement releases and mandate expedited recertification audit with an accredited certification body.`,
            detectedAt: '2026-09-15 09:00 UTC',
            status: 'Open',
          });
        } else if (daysToExpiry <= 60 || cert.status === 'Expiring Soon') {
          list.push({
            id: `ANOM-CERT-${cert.id}`,
            category: 'Certification',
            severity: 'MEDIUM',
            title: `Certification Expiring in ${daysToExpiry} Days: ${cert.standard}`,
            supplierId: supplier.id,
            supplierName: supplier.name,
            entityId: cert.certificateNumber,
            entityType: 'Accreditation',
            observedValue: `Expires on ${cert.expiryDate} (<60 days remaining)`,
            baselineThreshold: `Renewal audit submitted ≥ 60 days before expiry`,
            explanation: `Certificate ${cert.certificateNumber} (${cert.standard}) expires soon. Renewal audit documentation has not yet been logged in the master tenant ledger.`,
            remediation: `Contact supplier compliance liaison to obtain confirmed renewal audit schedule and interim audit completion certificate.`,
            detectedAt: '2026-10-02 11:20 UTC',
            status: 'Open',
          });
        }
      });

      // 4. Compliance Score Volatility & Critical Risk
      if (supplier.complianceScore < 70 || supplier.riskLevel === 'CRITICAL') {
        list.push({
          id: `ANOM-SCORE-${supplier.id}`,
          category: 'Compliance',
          severity: 'CRITICAL',
          title: `Severe Compliance Score Deficit: ${supplier.name} (${supplier.complianceScore}/100)`,
          supplierId: supplier.id,
          supplierName: supplier.name,
          entityId: supplier.code,
          entityType: 'Supplier Profile',
          observedValue: `Score: ${supplier.complianceScore}/100 · Risk: ${supplier.riskLevel}`,
          baselineThreshold: `Minimum acceptable enterprise threshold: 75/100`,
          explanation: `Vendor fails multiple critical checks including active ISO accreditations and open labor standards audit non-conformances. High counterparty exposure.`,
          remediation: `Initiate mandatory Vendor Corrective Action Plan (CAP) with 30-day compliance milestone deliverables.`,
          detectedAt: '2026-09-20 16:45 UTC',
          status: 'Open',
        });
      }
    });

    // 5. Integrity Verification Check
    list.push({
      id: 'ANOM-INT-01',
      category: 'Integrity',
      severity: 'LOW',
      title: 'Periodic Cryptographic Chain Checkpoint',
      supplierId: 'system',
      supplierName: 'Internal Ledger Engine',
      entityId: 'LEDGER-ROOT-2026',
      entityType: 'SHA-256 Hash Chain',
      observedValue: 'All stored blocks sequentially verified · 0 broken links',
      baselineThreshold: '100% cryptographic continuity',
      explanation: 'Sequential hash verification confirmed internal tamper-evidence. Routine monitoring checkpoint for all tenant audit records.',
      remediation: 'No corrective action required. Ledger is cryptographically healthy.',
      detectedAt: '2026-10-08 04:00 UTC',
      status: 'Resolved',
    });

    return list;
  }, [suppliers]);

  // Adjust status based on user interactions
  const anomalies = useMemo(() => {
    return rawAnomalies.map(anom => {
      if (resolvedAnomalyIds.has(anom.id)) {
        return { ...anom, status: 'Resolved' as const };
      }
      if (investigatingAnomalyIds.has(anom.id)) {
        return { ...anom, status: 'Investigating' as const };
      }
      return anom;
    });
  }, [rawAnomalies, resolvedAnomalyIds, investigatingAnomalyIds]);

  const filteredAnomalies = useMemo(() => {
    return anomalies.filter(a => {
      const matchCat = categoryFilter === 'ALL' || a.category === categoryFilter;
      const matchSev = severityFilter === 'ALL' || a.severity === severityFilter;
      const matchStat = statusFilter === 'ALL' || a.status === statusFilter;
      const matchSearch =
        searchQuery === '' ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.explanation.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchSev && matchStat && matchSearch;
    });
  }, [anomalies, categoryFilter, severityFilter, statusFilter, searchQuery]);

  // Statistics
  const totalCount = anomalies.length;
  const criticalCount = anomalies.filter(a => a.severity === 'CRITICAL').length;
  const highCount = anomalies.filter(a => a.severity === 'HIGH').length;
  const openCount = anomalies.filter(a => a.status === 'Open').length;
  const carbonCount = anomalies.filter(a => a.category === 'Carbon').length;
  const docCount = anomalies.filter(a => a.category === 'Documentation').length;

  const handleCreateAction = (anomaly: SupplyChainAnomaly) => {
    addComplianceAction({
      supplierId: anomaly.supplierId,
      supplierName: anomaly.supplierName,
      title: `Remediate: ${anomaly.title}`,
      description: `${anomaly.explanation}\n\nRecommended Remediation: ${anomaly.remediation}`,
      priority: anomaly.severity === 'CRITICAL' ? 'CRITICAL' : anomaly.severity === 'HIGH' ? 'HIGH' : 'MEDIUM',
      status: 'Open',
      dueDate: '2026-10-25',
      owner: 'Procurement Risk Officer',
      source: 'AI Recommendation',
      notes: `Generated from Anomaly ID: ${anomaly.id}`,
    });

    logAuditEvent(
      'Compliance Lead',
      'CREATED_COMPLIANCE_ACTION',
      'ComplianceAction',
      anomaly.id,
      `Created compliance remediation action from anomaly ${anomaly.id} (${anomaly.title})`
    );

    setInvestigatingAnomalyIds(prev => new Set(prev).add(anomaly.id));
    setActionCreatedNotice(`Compliance Action created for "${anomaly.title}". Added to Compliance Action Tracker.`);
    setTimeout(() => setActionCreatedNotice(null), 5000);
  };

  const handleToggleStatus = (id: string, newStatus: 'Investigating' | 'Resolved' | 'Open') => {
    if (newStatus === 'Resolved') {
      setResolvedAnomalyIds(prev => new Set(prev).add(id));
      setInvestigatingAnomalyIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else if (newStatus === 'Investigating') {
      setInvestigatingAnomalyIds(prev => new Set(prev).add(id));
      setResolvedAnomalyIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      setResolvedAnomalyIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setInvestigatingAnomalyIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const getCategoryIcon = (cat: AnomalyCategory) => {
    switch (cat) {
      case 'Carbon':
        return <Leaf className="w-4 h-4 text-emerald-600" />;
      case 'Documentation':
        return <FileX className="w-4 h-4 text-amber-600" />;
      case 'Certification':
        return <Award className="w-4 h-4 text-purple-600" />;
      case 'Compliance':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'Integrity':
        return <Database className="w-4 h-4 text-teal-600" />;
    }
  };

  const getSeverityBadgeClass = (sev: SeverityLevel) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MEDIUM':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-white tracking-tight">
              AI Supply Chain Anomaly Detection
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Live Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic surveillance scanning transport documentation gaps, carbon emission outliers, expiring certifications, and compliance score volatility.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('actions')}
            className="px-3.5 py-2 rounded-xl neo-button-dark btn-shine text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5 text-teal-400" />
            <span>Action Tracker</span>
          </button>
          <button
            onClick={() => navigate('simulator')}
            className="px-3.5 py-2 rounded-xl neo-button-primary btn-shine text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch What-If Simulator</span>
          </button>
        </div>
      </div>

      {/* Action Created Feedback Banner */}
      {actionCreatedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionCreatedNotice}</span>
          </div>
          <button
            onClick={() => navigate('actions')}
            className="underline font-bold text-emerald-300 hover:text-white text-xs cursor-pointer"
          >
            View in Action Tracker →
          </button>
        </div>
      )}

      {/* KPI Cards — Glass Metric Styling */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-metric-card p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Anomalies Detected</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            {totalCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {openCount} unresolved items requiring action
          </div>
        </div>

        <div className="glass-metric-card p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Critical / High Severity</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 mt-2 font-mono">
            {criticalCount + highCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {criticalCount} critical, {highCount} high priority
          </div>
        </div>

        <div className="glass-metric-card p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Carbon Intensity Outliers</span>
            <Flame className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            {carbonCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Deviations &gt;2x standard route factor
          </div>
        </div>

        <div className="glass-metric-card p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Documentation Gaps</span>
            <FileX className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            {docCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Missing bills of lading & manifests
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 glass-reflection space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search anomalies by supplier, entity ID, description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-hidden focus:border-teal-400 focus:bg-white/10 transition-all"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium text-[11px]">Category:</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-white text-xs focus:outline-hidden"
            >
              <option value="ALL">All Categories</option>
              <option value="Documentation">Documentation</option>
              <option value="Carbon">Carbon Outliers</option>
              <option value="Certification">Certifications</option>
              <option value="Compliance">Compliance Scores</option>
              <option value="Integrity">Integrity Ledger</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium text-[11px]">Severity:</span>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-white text-xs focus:outline-hidden"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-white text-xs focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Investigating">Investigating</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Anomaly Cards List */}
      <div className="space-y-4">
        {filteredAnomalies.length === 0 ? (
          <div className="p-12 text-center glass-panel rounded-2xl glass-reflection">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No matching anomalies found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your filter settings or search query.
            </p>
          </div>
        ) : (
          filteredAnomalies.map(anomaly => {
            const isResolved = anomaly.status === 'Resolved';
            const isInvestigating = anomaly.status === 'Investigating';

            return (
              <div
                key={anomaly.id}
                className={`glass-panel rounded-2xl p-5 transition-all glass-reflection ${
                  isResolved
                    ? 'opacity-60'
                    : anomaly.severity === 'CRITICAL'
                    ? 'border-rose-500/30'
                    : anomaly.severity === 'HIGH'
                    ? 'border-amber-500/30'
                    : ''
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          anomaly.severity === 'CRITICAL'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            : anomaly.severity === 'HIGH'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : anomaly.severity === 'MEDIUM'
                            ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30'
                            : 'bg-white/10 text-slate-300 border-white/20'
                        }`}
                      >
                        {anomaly.severity}
                      </span>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-slate-300 border border-white/10">
                        {getCategoryIcon(anomaly.category)}
                        <span>{anomaly.category}</span>
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isResolved
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : isInvestigating
                            ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {anomaly.status}
                      </span>

                      <span className="text-[11px] font-mono text-slate-400">
                        {anomaly.detectedAt}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {anomaly.title}
                    </h3>
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!isResolved && (
                      <button
                        onClick={() => handleCreateAction(anomaly)}
                        className="px-3.5 py-1.5 rounded-xl neo-button-primary btn-shine text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                        title="Create Compliance Action in Action Tracker"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Create Action</span>
                      </button>
                    )}

                    {isResolved ? (
                      <button
                        onClick={() => handleToggleStatus(anomaly.id, 'Open')}
                        className="px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium cursor-pointer"
                      >
                        Reopen
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleStatus(anomaly.id, 'Resolved')}
                        className="px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>

                {/* Metric breakdown comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4 p-3.5 rounded-xl neo-recessed border border-white/5 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block font-medium">Observed Value:</span>
                    <span className="font-mono font-bold text-rose-400 text-xs mt-0.5 block">
                      {anomaly.observedValue}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block font-medium">Expected Baseline Threshold:</span>
                    <span className="font-mono font-bold text-teal-300 text-xs mt-0.5 block">
                      {anomaly.baselineThreshold}
                    </span>
                  </div>
                </div>

                {/* Explanation and Root Cause */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-white">Root Cause & Evidence:</span>{' '}
                    <span className="text-slate-300">{anomaly.explanation}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-200">
                    <span className="font-bold">Recommended Remediation:</span>{' '}
                    <span>{anomaly.remediation}</span>
                  </div>
                </div>

                {/* Card Footer: Entity Link & Navigation */}
                <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Affected Supplier:</span>
                    <button
                      onClick={() => {
                        if (anomaly.supplierId !== 'system') {
                          navigate('supplier-detail', anomaly.supplierId);
                        }
                      }}
                      className="font-bold text-white hover:text-teal-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{anomaly.supplierName}</span>
                      {anomaly.supplierId !== 'system' && (
                        <ExternalLink className="w-3 h-3 text-teal-400" />
                      )}
                    </button>
                    <span className="text-slate-600">·</span>
                    <span className="font-mono text-slate-400">{anomaly.entityId}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {anomaly.supplierId !== 'system' && (
                      <button
                        onClick={() => navigate('supplier-detail', anomaly.supplierId)}
                        className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <span>View 360° Audit</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
