import React, { useState } from 'react';
import {
  Building2,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  ShieldCheck,
  Truck,
  CloudFog,
  FileText,
  Printer,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ComplianceScoreBadge } from '../components/common/ComplianceScoreBadge';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { RiskLevel } from '../types';

export const SuppliersView: React.FC = () => {
  const { suppliers, navigate, openPrintReport } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [countryFilter, setCountryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'score' | 'carbon' | 'name'>('score');

  // Unique countries
  const countries = Array.from(new Set(suppliers.map(s => s.country)));

  const filteredSuppliers = suppliers
    .filter(s => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRisk = riskFilter === 'ALL' || s.riskLevel === riskFilter;
      const matchStatus = statusFilter === 'ALL' || s.verificationStatus === statusFilter;
      const matchCountry = countryFilter === 'ALL' || s.country === countryFilter;

      return matchSearch && matchRisk && matchStatus && matchCountry;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.complianceScore - a.complianceScore;
      if (sortBy === 'carbon') return (b.carbonSummary?.totalEmissionsKg || 0) - (a.carbonSummary?.totalEmissionsKg || 0);
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Supplier Management Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal registry of verified tier-1 suppliers, compliance accreditations, and Scope-3 footprints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('compare')}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
          >
            Compare Suppliers
          </button>
          <button
            onClick={() => navigate('demo-verification')}
            className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            Verify New Consignment
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, code, industry, location..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-teal-500"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Risk Filter */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-medium text-[11px]">Risk:</span>
              <select
                value={riskFilter}
                onChange={e => setRiskFilter(e.target.value)}
                className="px-2 py-1 rounded border border-slate-200 bg-slate-50 text-slate-700 text-xs focus:outline-hidden"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="LOW">Low Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="HIGH">High Risk</option>
                <option value="CRITICAL">Critical Risk</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-medium text-[11px]">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-2 py-1 rounded border border-slate-200 bg-slate-50 text-slate-700 text-xs focus:outline-hidden"
              >
                <option value="ALL">All Statuses</option>
                <option value="Verified">Verified</option>
                <option value="Needs Review">Needs Review</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* Country Filter */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-medium text-[11px]">Country:</span>
              <select
                value={countryFilter}
                onChange={e => setCountryFilter(e.target.value)}
                className="px-2 py-1 rounded border border-slate-200 bg-slate-50 text-slate-700 text-xs focus:outline-hidden"
              >
                <option value="ALL">All Countries</option>
                {countries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1 ml-auto">
              <span className="text-slate-500 font-medium text-[11px]">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-2 py-1 rounded border border-slate-200 bg-slate-50 text-slate-700 text-xs focus:outline-hidden"
              >
                <option value="score">Compliance Score (High to Low)</option>
                <option value="carbon">Carbon Impact (High to Low)</option>
                <option value="name">Supplier Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Supplier & Identification</th>
                <th className="py-3 px-4">Country & Facility</th>
                <th className="py-3 px-4">Industry Sector</th>
                <th className="py-3 px-4">Compliance Score</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Active Certifications</th>
                <th className="py-3 px-4">Scope-3 Carbon</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.map(sup => (
                <tr
                  key={sup.id}
                  onClick={() => navigate('supplier-detail', sup.id)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-sm">{sup.name}</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {sup.code} · Contact: {sup.contact.name}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{sup.country}</div>
                    <div className="text-[11px] text-slate-500">{sup.location}</div>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {sup.industry}
                  </td>

                  <td className="py-3.5 px-4">
                    <ComplianceScoreBadge score={sup.complianceScore} size="md" showSubtitle={false} />
                  </td>

                  <td className="py-3.5 px-4">
                    <RiskBadge level={sup.riskLevel} size="md" />
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      {sup.certifications.slice(0, 2).map(c => (
                        <div key={c.id} className="text-[11px] font-mono text-slate-700 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                          <span>{c.name}</span>
                          {c.status === 'Expiring Soon' && (
                            <span className="text-[9px] text-amber-700 font-bold bg-amber-50 px-1 rounded">Expiring</span>
                          )}
                          {c.status === 'Expired' && (
                            <span className="text-[9px] text-rose-700 font-bold bg-rose-50 px-1 rounded">Expired</span>
                          )}
                        </div>
                      ))}
                      {sup.certifications.length > 2 && (
                        <span className="text-[10px] text-slate-400">+{sup.certifications.length - 2} more standards</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 tabular-nums">
                    {sup.carbonSummary?.totalEmissionsKg.toLocaleString()} kg CO2e
                    <div className="text-[10px] font-sans font-normal text-slate-400">
                      {sup.shipments.length} shipment{sup.shipments.length === 1 ? '' : 's'}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openPrintReport(sup.id)}
                        title="Print Compliance Summary"
                        className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate('supplier-detail', sup.id)}
                        className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>360° Audit</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Showing {filteredSuppliers.length} of {suppliers.length} registered suppliers</span>
          <span className="font-mono text-[11px]">Internal Tenant Database</span>
        </div>
      </div>
    </div>
  );
};
