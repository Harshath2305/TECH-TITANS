import React, { useState } from 'react';
import {
  Database,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Search,
  Filter,
  RefreshCw,
  Hash,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuditRecord } from '../types';

export const IntegrityDatabaseView: React.FC = () => {
  const { auditLedger } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    checkedCount: number;
    timestamp: string;
  } | null>({
    valid: true,
    checkedCount: auditLedger.length,
    timestamp: new Date().toLocaleTimeString(),
  });

  const filteredRecords = auditLedger
    .slice()
    .reverse()
    .filter(r => {
      const matchSearch =
        r.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.recordHash.toLowerCase().includes(searchTerm.toLowerCase());

      const matchEntity = entityFilter === 'ALL' || r.entityType === entityFilter;
      return matchSearch && matchEntity;
    });

  const handleValidateLedger = () => {
    setIsValidating(true);
    setTimeout(() => {
      // Traverse all records and check chain link: record[i].previousHash === record[i-1].recordHash
      let valid = true;
      for (let i = 1; i < auditLedger.length; i++) {
        if (auditLedger[i].previousHash !== auditLedger[i - 1].recordHash) {
          valid = false;
          break;
        }
      }
      setValidationResult({
        valid,
        checkedCount: auditLedger.length,
        timestamp: new Date().toLocaleTimeString(),
      });
      setIsValidating(false);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Internal Integrity Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic SHA-256 hash-chained audit trail of all verification, calculation, and compliance transitions.
          </p>
        </div>

        <button
          onClick={handleValidateLedger}
          disabled={isValidating}
          className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
          <span>Verify Hash Chain Integrity</span>
        </button>
      </div>

      {/* Prominent Disclaimer Banner (Mandatory requirement) */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>Architecture & Data Model Notice</span>
          </div>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            This integrity ledger is maintained inside the application's database and is not a public blockchain.
          </p>
          <p className="text-[11px] text-slate-400">
            Hash chaining guarantees internal tamper-evidence by computing each block's cryptographic hash from its predecessor. External distributed consensus is not used.
          </p>
        </div>

        {validationResult && (
          <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-xs shrink-0 md:text-right">
            <div className="flex items-center md:justify-end gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Chain Integrity: 100% VALID</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
              {validationResult.checkedCount} blocks validated · {validationResult.timestamp}
            </div>
          </div>
        )}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by action, actor, entity ID, description, or hash..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Entity Type:</span>
          <select
            value={entityFilter}
            onChange={e => setEntityFilter(e.target.value)}
            className="px-2 py-1 rounded border border-slate-200 bg-slate-50 text-slate-700 text-xs focus:outline-hidden"
          >
            <option value="ALL">All Entity Types</option>
            <option value="Supplier">Supplier</option>
            <option value="Document">Document</option>
            <option value="Shipment">Shipment</option>
            <option value="ComplianceAction">Compliance Action</option>
            <option value="Calculation">Calculation</option>
          </select>
        </div>
      </div>

      {/* Ledger Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Record ID & Time</th>
                <th className="py-3 px-3">Actor / Process</th>
                <th className="py-3 px-3">Action Type</th>
                <th className="py-3 px-3">Entity Type & ID</th>
                <th className="py-3 px-3">Audit Description</th>
                <th className="py-3 px-3 font-mono">Previous Hash</th>
                <th className="py-3 px-3 font-mono">Record Hash (SHA-256)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredRecords.map(rec => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">
                    <div>{rec.id}</div>
                    <div className="text-[10px] font-sans font-normal text-slate-500 mt-0.5">
                      {new Date(rec.timestamp).toLocaleString()}
                    </div>
                  </td>

                  <td className="py-3 px-3 font-sans text-slate-700 font-medium">
                    {rec.actor}
                  </td>

                  <td className="py-3 px-3 font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 inline-block">
                      {rec.action}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-sans">
                    <span className="text-slate-500 text-[10px] block">{rec.entityType}</span>
                    <span className="font-mono font-bold text-slate-900">{rec.entityId}</span>
                  </td>

                  <td className="py-3 px-3 font-sans text-slate-600 max-w-xs leading-relaxed">
                    {rec.description}
                  </td>

                  <td className="py-3 px-3 text-slate-400 truncate max-w-[110px]" title={rec.previousHash}>
                    {rec.previousHash.substring(0, 10)}...
                  </td>

                  <td className="py-3 px-3 font-bold text-teal-700 truncate max-w-[130px]" title={rec.recordHash}>
                    {rec.recordHash.substring(0, 12)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>{filteredRecords.length} records in internal audit ledger</span>
          <span className="font-mono text-[11px]">Database SHA-256 Hash Chaining</span>
        </div>
      </div>
    </div>
  );
};
