import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Building2, FileText, Truck, ShieldCheck, CheckSquare, ArrowRight, Bot, AlertTriangle, Sliders, Grid, Database, ShieldAlert, Cpu } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RiskBadge } from './RiskBadge';
import { ComplianceScoreBadge } from './ComplianceScoreBadge';

export const GlobalSearchModal: React.FC = () => {
  const { suppliers, isSearchOpen, setIsSearchOpen, navigate, setIsCopilotOpen } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const query = searchTerm.toLowerCase().trim();

  // Matched Suppliers
  const matchedSuppliers = suppliers.filter(
    s =>
      s.name.toLowerCase().includes(query) ||
      s.code.toLowerCase().includes(query) ||
      s.industry.toLowerCase().includes(query) ||
      s.country.toLowerCase().includes(query)
  );

  // Matched Documents
  const allDocs = suppliers.flatMap(s => s.documents);
  const matchedDocs = allDocs.filter(
    d =>
      d.fileName.toLowerCase().includes(query) ||
      d.documentType.toLowerCase().includes(query) ||
      d.supplierName.toLowerCase().includes(query)
  );

  // Matched Shipments
  const allShipments = suppliers.flatMap(s => s.shipments);
  const matchedShipments = allShipments.filter(
    sh =>
      sh.shipmentNumber.toLowerCase().includes(query) ||
      sh.origin.toLowerCase().includes(query) ||
      sh.destination.toLowerCase().includes(query) ||
      sh.supplierName.toLowerCase().includes(query)
  );

  // Matched Actions
  const allActions = suppliers.flatMap(s => s.actions);
  const matchedActions = allActions.filter(
    a =>
      a.title.toLowerCase().includes(query) ||
      a.description.toLowerCase().includes(query) ||
      a.supplierName.toLowerCase().includes(query)
  );

  // Matched Certifications
  const allCerts = suppliers.flatMap(s => s.certifications);
  const matchedCerts = allCerts.filter(
    c =>
      c.name.toLowerCase().includes(query) ||
      c.standard.toLowerCase().includes(query) ||
      c.certificateNumber.toLowerCase().includes(query)
  );

  const hasResults =
    matchedSuppliers.length > 0 ||
    matchedDocs.length > 0 ||
    matchedShipments.length > 0 ||
    matchedActions.length > 0 ||
    matchedCerts.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/70 backdrop-blur-md">
      <div className="glass-modal rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150 glass-reflection text-slate-100">
        {/* Input Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-3 bg-white/5">
          <Search className="w-5 h-5 text-teal-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search suppliers, documents, shipments, certifications, actions..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full text-base bg-transparent text-white placeholder:text-slate-400 focus:outline-hidden"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-slate-400 hover:text-white rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-xs font-mono px-2 py-1 rounded-md bg-white/10 text-slate-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-6">
          {!query && (
            <div className="space-y-4">
              <div className="text-center py-3 text-slate-400 text-xs">
                <p className="font-semibold text-white mb-0.5 font-serif text-sm">Global Intelligence Search</p>
                <p className="text-slate-400">Search suppliers (e.g. Apex), consignments, certificates, or jump to intelligent tools:</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setIsCopilotOpen(true);
                  }}
                  className="p-3 rounded-xl border border-white/10 hover:border-teal-400/40 bg-white/5 hover:bg-teal-500/10 text-left transition-colors flex items-center gap-2.5 cursor-pointer neo-raised"
                >
                  <Bot className="w-4 h-4 text-teal-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Supply Chain Copilot</span>
                    <span className="text-[10px] text-slate-400">Ask questions with AI</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    navigate('anomalies');
                  }}
                  className="p-3 rounded-xl border border-white/10 hover:border-amber-400/40 bg-white/5 hover:bg-amber-500/10 text-left transition-colors flex items-center gap-2.5 cursor-pointer neo-raised"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Anomaly Detection</span>
                    <span className="text-[10px] text-slate-400">Live surveillance engine</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    navigate('simulator');
                  }}
                  className="p-3 rounded-xl border border-white/10 hover:border-teal-400/40 bg-white/5 hover:bg-teal-500/10 text-left transition-colors flex items-center gap-2.5 cursor-pointer neo-raised"
                >
                  <Sliders className="w-4 h-4 text-teal-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">What-If Simulator</span>
                    <span className="text-[10px] text-slate-400">Interactive scenario model</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    navigate('contradictions');
                  }}
                  className="p-3 rounded-xl border border-white/10 hover:border-rose-400/40 bg-white/5 hover:bg-rose-500/10 text-left transition-colors flex items-center gap-2.5 cursor-pointer neo-raised"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Evidence Contradictions</span>
                    <span className="text-[10px] text-slate-400">Cross-record discrepancies</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    navigate('investigations');
                  }}
                  className="p-3 rounded-xl border border-white/10 hover:border-teal-400/40 bg-white/5 hover:bg-teal-500/10 text-left transition-colors flex items-center gap-2.5 cursor-pointer neo-raised"
                >
                  <Cpu className="w-4 h-4 text-teal-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Autonomous Investigation</span>
                    <span className="text-[10px] text-slate-400">8-gate root cause audit</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {query && !hasResults && (
            <div className="text-center py-8 text-slate-400 text-sm">
              No records found matching "{searchTerm}"
            </div>
          )}

          {/* Suppliers */}
          {matchedSuppliers.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Suppliers ({matchedSuppliers.length})
              </div>
              <div className="space-y-1.5">
                {matchedSuppliers.map(s => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigate('supplier-detail', s.id);
                    }}
                    className="p-3 rounded-xl border border-white/10 hover:border-teal-400/50 bg-white/5 hover:bg-white/10 cursor-pointer flex items-center justify-between transition-colors neo-raised"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">{s.name}</div>
                      <div className="text-xs text-slate-400">
                        {s.code} · {s.location} · {s.industry}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ComplianceScoreBadge score={s.complianceScore} size="sm" showSubtitle={false} />
                      <RiskBadge level={s.riskLevel} size="sm" />
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {matchedDocs.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Documents ({matchedDocs.length})
              </div>
              <div className="space-y-1.5">
                {matchedDocs.map(d => (
                  <div
                    key={d.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigate('documents');
                    }}
                    className="p-3 rounded-xl border border-white/10 hover:border-teal-400/50 bg-white/5 hover:bg-white/10 cursor-pointer flex items-center justify-between transition-colors neo-raised"
                  >
                    <div>
                      <div className="text-sm font-medium text-teal-300 font-mono">{d.fileName}</div>
                      <div className="text-xs text-slate-400">
                        {d.documentType} · {d.supplierName} · {d.status}
                      </div>
                    </div>
                    <span className="text-xs text-teal-400 font-medium">View in repository</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipments */}
          {matchedShipments.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" /> Shipments ({matchedShipments.length})
              </div>
              <div className="space-y-1.5">
                {matchedShipments.map(sh => (
                  <div
                    key={sh.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigate('shipments');
                    }}
                    className="p-3 rounded-xl border border-white/10 hover:border-teal-400/50 bg-white/5 hover:bg-white/10 cursor-pointer flex items-center justify-between transition-colors neo-raised"
                  >
                    <div>
                      <div className="text-sm font-semibold font-mono text-white">{sh.shipmentNumber}</div>
                      <div className="text-xs text-slate-400">
                        {sh.origin} → {sh.destination} · {sh.transportMode}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                        {sh.carbonEmission} kg CO2e
                      </div>
                      <div className="text-[10px] text-slate-400">{sh.hasManifest ? 'Manifest attached' : 'Missing manifest'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {matchedActions.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5" /> Compliance Actions ({matchedActions.length})
              </div>
              <div className="space-y-1.5">
                {matchedActions.map(a => (
                  <div
                    key={a.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigate('actions');
                    }}
                    className="p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900">{a.title}</div>
                      <div className="text-xs text-slate-500">
                        {a.supplierName} · Priority: {a.priority} · Status: {a.status}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">{a.dueDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {matchedCerts.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Certifications ({matchedCerts.length})
              </div>
              <div className="space-y-1.5">
                {matchedCerts.map(c => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigate('compliance');
                    }}
                    className="p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{c.name}</div>
                      <div className="text-xs text-slate-500">
                        {c.standard} · #{c.certificateNumber} · {c.issuer}
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-600">Expires {c.expiryDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>Search reads internal database records</span>
          <span className="font-mono text-[11px]">SourceTrace AI v2.6</span>
        </div>
      </div>
    </div>
  );
};
