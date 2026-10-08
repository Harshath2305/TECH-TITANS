import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  Calendar,
  Building2,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { ComplianceCheck, CheckResult } from '../types';

export const ComplianceCenterView: React.FC = () => {
  const { suppliers, navigate } = useApp();
  const [resultFilter, setResultFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Collect all compliance checks
  const allChecks: Array<ComplianceCheck & { supplierName: string; supplierCode: string }> = suppliers.flatMap(
    s => s.complianceChecks.map(c => ({ ...c, supplierName: s.name, supplierCode: s.code }))
  );

  // Collect all certifications expiring soon or expired
  const allCerts = suppliers.flatMap(s =>
    s.certifications.map(c => ({ ...c, supplierName: s.name, supplierCode: s.code }))
  );
  const expiringCerts = allCerts.filter(c => c.status === 'Expiring Soon' || c.status === 'Expired');

  const filteredChecks = allChecks.filter(c => {
    const matchResult = resultFilter === 'ALL' || c.result === resultFilter;
    const matchCat = categoryFilter === 'ALL' || c.category === categoryFilter;
    const matchSearch =
      c.checkName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.evidence.toLowerCase().includes(searchTerm.toLowerCase());
    return matchResult && matchCat && matchSearch;
  });

  const passCount = allChecks.filter(c => c.result === 'PASS').length;
  const warningCount = allChecks.filter(c => c.result === 'WARNING').length;
  const failCount = allChecks.filter(c => c.result === 'FAIL').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Compliance Center & Policy Assurance
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Multi-category policy evaluation across Environmental, Labor, Carbon, Documentation, and Certification domains.
        </p>
      </div>

      {/* KPI Status Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Policy Checks
          </span>
          <div className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
            {allChecks.length}
          </div>
          <span className="text-[11px] text-slate-400">Across 5 active suppliers</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
            Passed Checks
          </span>
          <div className="text-3xl font-extrabold font-mono text-emerald-700 tabular-nums">
            {passCount}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Compliant with internal criteria</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block mb-1">
            Warnings Raised
          </span>
          <div className="text-3xl font-extrabold font-mono text-amber-700 tabular-nums">
            {warningCount}
          </div>
          <span className="text-[11px] text-amber-600 font-medium">Requires mitigation / docs</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block mb-1">
            Failures Flagged
          </span>
          <div className="text-3xl font-extrabold font-mono text-rose-700 tabular-nums">
            {failCount}
          </div>
          <span className="text-[11px] text-rose-600 font-medium">Critical non-conformance</span>
        </div>
      </div>

      {/* Upcoming Expirations Alert Box */}
      {expiringCerts.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Critical Certification Expirations Monitor ({expiringCerts.length} Standards)
            </h3>
            <span className="text-[11px] text-amber-700 font-medium">Review within 60 days</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {expiringCerts.map(cert => (
              <div key={cert.id} className="p-3 bg-white rounded-xl border border-amber-200 text-xs space-y-1">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-900">{cert.name}</span>
                  <StatusBadge status={cert.status} />
                </div>
                <div className="text-[11px] text-slate-600">{cert.supplierName} ({cert.supplierCode})</div>
                <div className="text-[11px] font-mono font-bold text-amber-800">
                  Expiry Date: {cert.expiryDate}
                </div>
                <div className="text-[10px] text-slate-500">Issuer: {cert.issuer}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters & Check Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by check name, evidence, or supplier..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Result Filter */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-medium text-[11px]">Result:</span>
              <select
                value={resultFilter}
                onChange={e => setResultFilter(e.target.value)}
                className="px-2 py-1 rounded border border-slate-200 bg-slate-50 text-slate-700 text-xs focus:outline-hidden"
              >
                <option value="ALL">All Results ({allChecks.length})</option>
                <option value="PASS">PASS ({passCount})</option>
                <option value="WARNING">WARNING ({warningCount})</option>
                <option value="FAIL">FAIL ({failCount})</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-medium text-[11px]">Category:</span>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-2 py-1 rounded border border-slate-200 bg-slate-50 text-slate-700 text-xs focus:outline-hidden"
              >
                <option value="ALL">All Categories</option>
                <option value="Environmental">Environmental</option>
                <option value="Carbon">Carbon</option>
                <option value="Labor">Labor</option>
                <option value="Documentation">Documentation</option>
                <option value="Certification">Certification</option>
                <option value="Shipment">Shipment</option>
              </select>
            </div>
          </div>
        </div>

        {/* Checks Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Evaluation Criteria</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Stored Evidentiary Basis</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredChecks.map(chk => (
                <tr key={chk.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{chk.supplierName}</div>
                    <div className="text-[10px] font-mono text-slate-400">{chk.supplierCode}</div>
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-700">
                    {chk.category}
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-900">
                    {chk.checkName}
                  </td>

                  <td className="py-3 px-4">
                    <StatusBadge status={chk.result} type="result" />
                  </td>

                  <td className="py-3 px-4">
                    <StatusBadge status={chk.severity} type="severity" />
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600 max-w-sm leading-relaxed">
                    {chk.evidence}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => navigate('supplier-detail', chk.supplierId)}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                    >
                      Audit →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
