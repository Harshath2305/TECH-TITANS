import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Truck,
  Building2,
  CheckSquare,
  Award,
  Leaf,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CopilotMessage, CopilotCitation } from '../../types';
import { queryCopilot } from '../../services/aiService';

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_PROMPTS = [
  'Which supplier has the highest risk?',
  'Show missing shipment manifests',
  'Explain Apex compliance score',
  'Summarize Scope-3 impact',
  'Which certifications expire soon?',
  'Compare Apex Components and GreenCore',
  'What compliance actions are currently open?',
];

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({ isOpen, onClose }) => {
  const { suppliers, auditLedger, navigate } = useApp();
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Hello! I am **SourceTrace Copilot**, your enterprise supply-chain intelligence assistant.\n\nI reason strictly over verified tenant records including supplier compliance scores, certifications, logistics manifests, Scope-3 carbon totals, and open compliance actions.\n\nSelect a prompt below or ask any question about your verified supply-chain data.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'deterministic_fallback',
      model: 'Verified Registry Grounding',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || isLoading) return;

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build focused, grounded context strictly from current application state
      const qLower = q.toLowerCase();
      let targetedSuppliers = suppliers;
      if (qLower.includes('apex')) {
        targetedSuppliers = suppliers.filter(s => s.code === 'APX-COMP' || s.name.includes('Apex'));
      } else if (qLower.includes('greencore')) {
        targetedSuppliers = suppliers.filter(s => s.name.includes('GreenCore'));
      } else if (qLower.includes('nova')) {
        targetedSuppliers = suppliers.filter(s => s.name.includes('Nova'));
      }

      const contextPayload = {
        suppliers: targetedSuppliers.map(s => ({
          id: s.id,
          name: s.name,
          code: s.code,
          country: s.country,
          complianceScore: s.complianceScore,
          riskLevel: s.riskLevel,
          certifications: s.certifications.map(c => ({
            name: c.name,
            standard: c.standard,
            expiryDate: c.expiryDate,
            status: c.status,
          })),
          shipments: s.shipments.map(sh => ({
            shipmentNumber: sh.shipmentNumber,
            origin: sh.origin,
            destination: sh.destination,
            transportMode: sh.transportMode,
            carbonEmissionKg: sh.carbonEmission,
            hasManifest: sh.hasManifest,
            status: sh.status,
          })),
          carbonSummary: s.carbonSummary,
          openActions: s.actions.filter(a => a.status !== 'Resolved'),
        })),
        recentLedgerRecords: auditLedger.slice(-5).map(r => ({
          id: r.id,
          action: r.action,
          entityId: r.entityId,
          timestamp: r.timestamp,
        })),
      };

      const result = await queryCopilot(q, contextPayload);

      const botMsg: CopilotMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: result.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: result.citations,
        source: result.source,
        isFallback: result.isFallback,
        model: result.model || (result.isFallback ? 'Evidence-based fallback analysis' : 'gemini-3.8-flash'),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          content: 'I could not retrieve an answer at this time. Please select one of the suggested verified queries above.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isFallback: true,
          source: 'deterministic_fallback',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCitationClick = (citation: CopilotCitation) => {
    navigate(citation.route, citation.param);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const getCitationIcon = (type: string) => {
    switch (type) {
      case 'Supplier':
        return <Building2 className="w-3 h-3 text-teal-600" />;
      case 'Shipment':
        return <Truck className="w-3 h-3 text-blue-600" />;
      case 'Certification':
        return <Award className="w-3 h-3 text-amber-600" />;
      case 'ComplianceAction':
        return <CheckSquare className="w-3 h-3 text-purple-600" />;
      case 'Carbon':
        return <Leaf className="w-3 h-3 text-emerald-600" />;
      default:
        return <FileText className="w-3 h-3 text-slate-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile & Desktop Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel — Strong Glass Surface */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] lg:w-[540px] glass-copilot shadow-2xl flex flex-col text-slate-100 animate-in slide-in-from-right duration-250 glass-reflection"
        role="dialog"
        aria-label="SourceTrace AI Copilot"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-slate-950/60 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-md ring-1 ring-white/20 relative group">
              <Bot className="w-5 h-5" />
              {/* Subtle animated AI status pulse */}
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-sm sm:text-base font-semibold tracking-tight text-white">
                  SOURCE TRACE COPILOT
                </h2>
                <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30 tracking-wider">
                  GROUNDED IN INTERNAL REGISTRY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Ask questions about your verified supply-chain data.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Close Copilot"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Advisory & Grounding Notice Banner */}
        <div className="bg-white/5 border-b border-white/10 px-4 py-2 flex items-center justify-between text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="font-medium text-slate-200">Grounded in Tenant Master Records</span>
          </div>
          <span className="text-slate-400 font-mono text-[10px]">Deterministic Calculations</span>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-transparent">
          {messages.map(msg => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-md ${
                    isUser
                      ? 'bg-teal-600 text-slate-950 font-semibold rounded-tr-xs'
                      : 'neo-raised border border-white/10 text-slate-200 rounded-tl-xs'
                  }`}
                >
                  {/* Fallback Notice for Assistant */}
                  {!isUser && msg.isFallback && (
                    <div className="mb-2.5 p-2 rounded-lg bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>AI service temporarily unavailable. Showing evidence-based registry information.</span>
                    </div>
                  )}

                  {/* Message Content with simple bold/list rendering */}
                  <div className="whitespace-pre-wrap space-y-2">
                    {msg.content.split('\n\n').map((block, idx) => {
                      // Parse bold and bullets
                      const formatted = block.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                      return (
                        <p
                          key={idx}
                          dangerouslySetInnerHTML={{ __html: formatted }}
                          className="leading-relaxed"
                        />
                      );
                    })}
                  </div>

                  {/* Citations / Provenance Badges */}
                  {!isUser && msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Verified Evidence Citations:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.citations.map(cit => (
                          <button
                            key={cit.id}
                            onClick={() => handleCitationClick(cit)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-teal-50 hover:border-teal-300 border border-slate-200 text-slate-700 hover:text-teal-900 text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            {getCitationIcon(cit.entityType)}
                            <span>{cit.label}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Footer Info & Actions */}
                  <div className="mt-2.5 pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100/60">
                    <div className="flex items-center gap-1.5">
                      <span>{msg.timestamp}</span>
                      {!isUser && msg.model && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-[9px] text-slate-500">{msg.model}</span>
                        </>
                      )}
                    </div>

                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3 text-xs text-slate-500 shadow-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                <span>Consulting verified supply-chain records...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-t border-white/10">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Verified Query Prompts</span>
            {messages.length > 1 && (
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: 'msg-welcome',
                      role: 'assistant',
                      content: `Conversation reset. Select a prompt or type your compliance question.`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      source: 'deterministic_fallback',
                    },
                  ])
                }
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset Chat</span>
              </button>
            )}
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white/5 hover:bg-teal-500/20 hover:border-teal-400/40 border border-white/10 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-slate-950/60 border-t border-white/10">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about suppliers, missing manifests, Scope-3 carbon, expiring certs..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-hidden focus:border-teal-400 focus:bg-white/10 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl neo-button-primary btn-shine text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <p className="text-[10px] text-slate-400 text-center mt-2">
            Advisory intelligence grounded in SourceTrace master registry. Verified audit records cannot be overwritten.
          </p>
        </div>
      </div>
    </>
  );
};
