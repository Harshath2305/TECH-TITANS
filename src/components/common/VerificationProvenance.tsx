import React from 'react';
import { Database, Sparkles, AlertCircle, FileCheck2, ShieldAlert } from 'lucide-react';

interface VerificationProvenanceProps {
  compact?: boolean;
}

export const VerificationProvenance: React.FC<VerificationProvenanceProps> = ({ compact = false }) => {
  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-teal-400" />
          <h4 className="text-sm font-semibold tracking-wide text-white uppercase">
            Verification Provenance & Evidentiary Standard
          </h4>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          SourceTrace Core Guarantee
        </span>
      </div>

      <div className={`grid gap-4 ${compact ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
        {/* Tier 1: Internal Registry Check */}
        <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60">
          <div className="flex items-center gap-2 text-teal-400 mb-1.5">
            <Database className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">1. Internal Registry Check</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Reads SourceTrace's own supplier, document, certification, shipment, and compliance records stored in the tenant database.
          </p>
          <div className="mt-2 text-[10px] font-mono text-teal-300/80">
            Status: Deterministic registry match
          </div>
        </div>

        {/* Tier 2: AI-Generated Analysis */}
        <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60">
          <div className="flex items-center gap-2 text-amber-400 mb-1.5">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">2. AI-Generated Analysis</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Language-model analysis reasoning strictly over verified stored records. Advisory only. AI does not invent or substitute verification evidence.
          </p>
          <div className="mt-2 text-[10px] font-mono text-amber-300/80">
            Notice: Advisory only — Not legal proof
          </div>
        </div>

        {/* Tier 3: Demo / Sample Data */}
        <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60">
          <div className="flex items-center gap-2 text-sky-400 mb-1.5">
            <FileCheck2 className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">3. Demo / Sample Data</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Seeded evaluation dataset (<code className="font-mono text-sky-300">demo_seed</code>) provided for demonstration and calibration testing.
          </p>
          <div className="mt-2 text-[10px] font-mono text-sky-300/80">
            Source: demo_seed
          </div>
        </div>

        {/* Tier 4: External Verification */}
        <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60">
          <div className="flex items-center gap-2 text-rose-400 mb-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">4. External Verification</span>
          </div>
          <p className="text-xs text-rose-200 font-medium leading-relaxed">
            EXTERNAL VERIFICATION NOT PERFORMED. No certification body, government customs, or public authority was queried.
          </p>
          <div className="mt-2 text-[10px] font-mono text-rose-300/80">
            Status: Unconnected external API
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-400">
        <span className="italic">
          Important: The internal integrity ledger is an application database feature and not a public blockchain.
        </span>
        <span className="font-mono text-[11px] text-slate-500">
          Algorithm: SHA-256 Chained Hash Ledger
        </span>
      </div>
    </div>
  );
};
