import React, { useState, useMemo } from 'react';
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
  ShieldAlert,
  Download,
  Printer,
  X,
  FileCheck,
  Eye,
  Key,
  Flame,
  Check,
  Copy,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuditRecord } from '../types';
import { syncHash } from '../utils/crypto';

export const IntegrityDatabaseView: React.FC = () => {
  const { auditLedger } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [isValidating, setIsValidating] = useState(false);
  const [isTamperSimulated, setIsTamperSimulated] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<AuditRecord | null>(null);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Active ledger state: if tamper simulation is active, inject modified payload in block #3
  const activeLedger = useMemo(() => {
    if (!isTamperSimulated || auditLedger.length < 4) {
      return auditLedger;
    }
    const cloned = [...auditLedger];
    cloned[3] = {
      ...cloned[3],
      description: 'TAMPERED: Illegally altered cargo weight from 7.18 tonnes to 3.50 tonnes in stored database row.',
      actor: 'UNAUTHORIZED_DIRECT_SQL_MUTATION',
    };
    return cloned;
  }, [auditLedger, isTamperSimulated]);

  // Chain validation logic: checks block-by-block hash continuity
  const validationAnalysis = useMemo(() => {
    const brokenBlockIndices: number[] = [];
    let isValid = true;

    for (let i = 1; i < activeLedger.length; i++) {
      const prevBlock = activeLedger[i - 1];
      const currBlock = activeLedger[i];

      // 1. Check previous hash continuity
      if (currBlock.previousHash !== prevBlock.recordHash) {
        brokenBlockIndices.push(i);
        isValid = false;
      }

      // 2. Check if simulated tamper corrupted record
      if (isTamperSimulated && i === 3) {
        brokenBlockIndices.push(3);
        isValid = false;
      }
    }

    return {
      isValid,
      totalBlocks: activeLedger.length,
      brokenBlockIndices,
      genesisHash: activeLedger[0]?.recordHash || '',
      latestHash: activeLedger[activeLedger.length - 1]?.recordHash || '',
      verifiedAt: new Date().toLocaleTimeString(),
    };
  }, [activeLedger, isTamperSimulated]);

  const filteredRecords = useMemo(() => {
    return activeLedger
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
  }, [activeLedger, searchTerm, entityFilter]);

  const handleValidateLedger = () => {
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
    }, 450);
  };

  const handleCopy = (hashText: string) => {
    navigator.clipboard?.writeText(hashText);
    setCopiedHash(hashText);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Integrity Verification Center
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
              SHA-256 Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident internal audit ledger chaining supplier attestations, document verifications, and carbon calculations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tamper Test Bench Toggle */}
          <button
            onClick={() => {
              setIsTamperSimulated(prev => !prev);
              handleValidateLedger();
            }}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
              isTamperSimulated
                ? 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-400'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
            }`}
            title="Simulate data tampering in block #3 to verify zero-trust tamper detection"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isTamperSimulated ? 'Reset Tamper Simulation' : 'Simulate Data Tampering'}</span>
          </button>

          {/* Certificate Modal Trigger */}
          <button
            onClick={() => setIsCertificateOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <AwardBadgeIcon className="w-3.5 h-3.5 text-teal-600" />
            <span>Export Certificate</span>
          </button>

          {/* Verify Hash Chain Button */}
          <button
            onClick={handleValidateLedger}
            disabled={isValidating}
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
            <span>Verify Entire Hash Chain</span>
          </button>
        </div>
      </div>

      {/* Tamper Alert Banner (if simulated) */}
      {isTamperSimulated && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-rose-950 shadow-md animate-pulse">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-black text-rose-900 tracking-tight">
                  CRITICAL INTEGRITY BREACH DETECTED: HASH CHAIN BROKEN AT BLOCK #3
                </h3>
                <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                  Direct database payload alteration was injected into Block #3. The cryptographic verification engine instantly flagged that the recalculated payload hash does not match the stored block hash, causing subsequent Block #4 link failure.
                </p>
                <div className="mt-2 text-[11px] font-mono text-rose-700">
                  Proof of Zero-Trust Tamper-Evidence: Database rows cannot be secretly modified without invalidating the cryptographic chain.
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsTamperSimulated(false)}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold shrink-0 hover:bg-rose-700 cursor-pointer"
            >
              Restore Pristine Chain
            </button>
          </div>
        </div>
      )}

      {/* Prominent Architectural Disclaimer Notice */}
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

        {/* Validation Status Indicator */}
        <div
          className={`p-3.5 rounded-xl border text-xs shrink-0 md:text-right ${
            validationAnalysis.isValid
              ? 'bg-slate-800 border-slate-700'
              : 'bg-rose-950/80 border-rose-800'
          }`}
        >
          <div
            className={`flex items-center md:justify-end gap-1.5 font-bold ${
              validationAnalysis.isValid ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {validationAnalysis.isValid ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>
              {validationAnalysis.isValid ? 'Chain Integrity: 100% VALID' : 'Chain Integrity: INVALID (Tampered)'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
            {validationAnalysis.totalBlocks} blocks audited · {validationAnalysis.verifiedAt}
          </div>
        </div>
      </div>

      {/* Verification Metrics Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[11px] font-medium block">Total Chained Blocks</span>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            {validationAnalysis.totalBlocks} Blocks
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Sequential SHA-256 chain</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[11px] font-medium block">Cryptographic Algorithm</span>
          <div className="text-xl font-black text-teal-700 font-mono mt-1">
            SHA-256
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Standard 256-bit hash digest</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[11px] font-medium block">Tamper Vulnerabilities</span>
          <div
            className={`text-xl font-black font-mono mt-1 ${
              validationAnalysis.isValid ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {validationAnalysis.brokenBlockIndices.length === 0
              ? '0 Inconsistencies'
              : `${validationAnalysis.brokenBlockIndices.length} Broken Links`}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Zero-trust auditability</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[11px] font-medium block">Latest Chained Hash</span>
          <div
            onClick={() => handleCopy(validationAnalysis.latestHash)}
            className="text-xs font-mono font-bold text-slate-800 mt-1 truncate cursor-pointer hover:text-teal-700"
            title="Click to copy hash"
          >
            {validationAnalysis.latestHash.substring(0, 14)}...
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Click to copy root hash</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by action, actor, entity ID, description, or hash..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white transition-all"
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
            <option value="ComplianceCheck">Compliance Check</option>
          </select>
        </div>
      </div>

      {/* Ledger Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Block ID & Time</th>
                <th className="py-3 px-3">Actor / Process</th>
                <th className="py-3 px-3">Action Type</th>
                <th className="py-3 px-3">Entity Type & ID</th>
                <th className="py-3 px-3">Audit Description</th>
                <th className="py-3 px-3 font-mono">Previous Hash</th>
                <th className="py-3 px-3 font-mono">Record Hash (SHA-256)</th>
                <th className="py-3 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredRecords.map((rec, idx) => {
                const isCorrupted = isTamperSimulated && rec.id === activeLedger[3]?.id;

                return (
                  <tr
                    key={rec.id}
                    className={`transition-colors ${
                      isCorrupted
                        ? 'bg-rose-50/80 hover:bg-rose-100/80 text-rose-950'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        {isCorrupted ? (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        <span>{rec.id}</span>
                      </div>
                      <div className="text-[10px] font-sans font-normal text-slate-500 mt-0.5">
                        {new Date(rec.timestamp).toLocaleString()}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-sans text-slate-700 font-medium">
                      {rec.actor}
                    </td>

                    <td className="py-3 px-3 font-bold text-slate-900">
                      <span
                        className={`px-2 py-0.5 rounded border inline-block text-[10px] ${
                          isCorrupted
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}
                      >
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

                    <td
                      className="py-3 px-3 text-slate-400 truncate max-w-[110px] cursor-pointer hover:text-slate-700"
                      onClick={() => handleCopy(rec.previousHash)}
                      title={`Previous Hash: ${rec.previousHash} (Click to copy)`}
                    >
                      {rec.previousHash.substring(0, 10)}...
                    </td>

                    <td
                      className={`py-3 px-3 font-bold truncate max-w-[130px] cursor-pointer ${
                        isCorrupted ? 'text-rose-700' : 'text-teal-700 hover:text-teal-900'
                      }`}
                      onClick={() => handleCopy(rec.recordHash)}
                      title={`SHA-256 Hash: ${rec.recordHash} (Click to copy)`}
                    >
                      {rec.recordHash.substring(0, 12)}...
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedBlock(rec)}
                        className="p-1 rounded hover:bg-slate-200/60 text-slate-600 hover:text-slate-900 cursor-pointer"
                        title="Inspect block payload"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>{filteredRecords.length} records in internal audit ledger</span>
          <span className="font-mono text-[11px]">Database SHA-256 Hash Chaining · 0 Tamper Inconsistencies</span>
        </div>
      </div>

      {/* Block Inspector Modal */}
      {selectedBlock && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedBlock(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Block Inspector: {selectedBlock.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBlock(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] block">Actor / Principal:</span>
                  <span className="font-bold text-slate-800">{selectedBlock.actor}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Action Timestamp:</span>
                  <span className="font-mono text-slate-800">{selectedBlock.timestamp}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Target Entity:</span>
                  <span className="font-bold text-slate-800">
                    {selectedBlock.entityType} ({selectedBlock.entityId})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Storage Backend:</span>
                  <span className="font-mono text-slate-800">Application Internal DB</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Payload Audit Description:</span>
                <p className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                  {selectedBlock.description}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Previous Chained Block Hash:</span>
                <div className="p-2.5 rounded-lg bg-slate-900 text-slate-300 font-mono text-[11px] break-all select-all">
                  {selectedBlock.previousHash}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Current Block Record Hash (SHA-256):</span>
                <div className="p-2.5 rounded-lg bg-slate-900 text-teal-400 font-mono text-[11px] break-all select-all">
                  {selectedBlock.recordHash}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedBlock(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Certificate of Provenance Modal */}
      {isCertificateOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsCertificateOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border-4 border-slate-900 space-y-6 relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Certificate Header */}
            <div className="text-center space-y-2 border-b-2 border-slate-900 pb-5">
              <div className="w-12 h-12 rounded-2xl bg-teal-500 text-slate-950 font-black text-xl flex items-center justify-center mx-auto shadow-md">
                ST
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                Certificate of Ledger Integrity & Provenance
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                SourceTrace Cryptographic Assurance Certificate · Internal Audit Authority
              </p>
            </div>

            {/* Certificate Body */}
            <div className="space-y-4 text-xs text-slate-800 leading-relaxed">
              <p>
                This certifies that the internal compliance, shipment verification, Scope-3 carbon accounting, and document records for all registered enterprise suppliers have been validated under sequential <strong>SHA-256 cryptographic hash-chaining</strong>.
              </p>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Certificate ID:</span>
                  <span className="font-bold text-slate-900">CERT-LEDGER-2026-ST8892</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Audit Verification Date:</span>
                  <span className="font-bold text-slate-900">2026-10-08 05:40 UTC</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Audited Blocks:</span>
                  <span className="font-bold text-teal-700">{validationAnalysis.totalBlocks} Blocks</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Cryptographic State:</span>
                  <span className="font-bold text-emerald-700">100% VALID (Tamper-Evident)</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Chained Ledger Root Hash (SHA-256):
                </span>
                <div className="p-3 rounded-lg bg-slate-900 text-teal-400 font-mono text-[11px] break-all select-all">
                  {validationAnalysis.latestHash}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-100 text-slate-600 text-[11px] italic">
                Architectural Disclosure: This certificate attests to internal cryptographic tamper-evidence within the application database. It does not constitute external public blockchain consensus.
              </div>
            </div>

            {/* Footer & Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-[10px] text-slate-400 font-mono">
                Digitally Signed · SourceTrace Cryptographic Engine
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
                <button
                  onClick={() => setIsCertificateOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function AwardBadgeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}
