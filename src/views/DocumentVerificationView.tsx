import React, { useState } from 'react';
import {
  FileCheck2,
  UploadCloud,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Plus,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Document } from '../types';

export const DocumentVerificationView: React.FC = () => {
  const { suppliers, verifyDocument, addDocument, navigate } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDocDetails, setSelectedDocDetails] = useState<Document | null>(null);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadSupplierId, setUploadSupplierId] = useState(suppliers[0].id);
  const [uploadDocType, setUploadDocType] = useState<Document['documentType']>('Shipment Manifest');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadIssueDate, setUploadIssueDate] = useState('2026-10-01');
  const [uploadExpiryDate, setUploadExpiryDate] = useState('2027-10-01');

  // Flatten all documents
  const allDocs: Document[] = suppliers.flatMap(s => s.documents);

  const filteredDocs = allDocs.filter(d => {
    const matchSearch =
      d.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.documentType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchType = typeFilter === 'ALL' || d.documentType === typeFilter;
    const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;

    return matchSearch && matchType && matchStatus;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName) return;

    const targetSupplier = suppliers.find(s => s.id === uploadSupplierId) || suppliers[0];
    const newDoc: Document = {
      id: `doc-${Date.now().toString(36)}`,
      supplierId: targetSupplier.id,
      supplierName: targetSupplier.name,
      fileName: uploadFileName.endsWith('.pdf') ? uploadFileName : `${uploadFileName}.pdf`,
      documentType: uploadDocType,
      fileSize: '1.4 MB',
      issueDate: uploadIssueDate,
      expiryDate: uploadExpiryDate || undefined,
      status: 'Pending',
      extractedFields: {
        declaredIssuer: targetSupplier.name,
        verificationDigest: `SHA256-${Date.now()}`,
      },
      verificationStatus: 'Unverified',
      source: 'user_upload',
      uploadedAt: new Date().toISOString(),
    };

    addDocument(newDoc);
    setIsUploadOpen(false);
    setUploadFileName('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Document Verification & Evidence Registry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of bills of lading, ISO accreditations, and declarations. Every verification logs an immutable event.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('demo-verification')}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:text-slate-900 shadow-xs"
          >
            Demo Verification Flow
          </button>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Document</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search documents by name, supplier, or standard..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium text-[11px]">Type:</span>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-2 py-1 rounded border border-slate-200 bg-slate-50 text-slate-700 text-xs focus:outline-hidden"
            >
              <option value="ALL">All Types</option>
              <option value="Shipment Manifest">Shipment Manifest</option>
              <option value="ISO Certificate">ISO Certificate</option>
              <option value="Environmental Declaration">Environmental Declaration</option>
              <option value="Labor Audit Report">Labor Audit Report</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2 py-1 rounded border border-slate-200 bg-slate-50 text-slate-700 text-xs focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Needs Review">Needs Review</option>
              <option value="Expired">Expired</option>
              <option value="Missing">Missing</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Document File Name</th>
                <th className="py-3 px-4">Associated Supplier</th>
                <th className="py-3 px-4">Document Category</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredDocs.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold font-mono text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{doc.fileName}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      Size: {doc.fileSize} · Source: {doc.source}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{doc.supplierName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{doc.supplierId}</div>
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-700">
                    {doc.documentType}
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-600">{doc.issueDate}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{doc.expiryDate || 'N/A'}</td>

                  <td className="py-3 px-4">
                    <StatusBadge status={doc.status} />
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedDocDetails(doc)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                        title="View Extracted Fields"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {doc.status !== 'Verified' && (
                        <button
                          onClick={() => verifyDocument(doc.id)}
                          className="px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[11px] transition-colors"
                        >
                          Verify Now
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>{filteredDocs.length} documents registered in internal database</span>
          <span className="font-mono text-[11px]">Tamper-checked records</span>
        </div>
      </div>

      {/* Extracted Fields Modal */}
      {selectedDocDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Document Extracted Metadata</h4>
                <div className="text-xs font-mono text-slate-500">{selectedDocDetails.fileName}</div>
              </div>
              <button
                onClick={() => setSelectedDocDetails(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-mono"
              >
                ✕ CLOSE
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Supplier:</span>
                <span className="font-bold text-slate-900">{selectedDocDetails.supplierName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Document Type:</span>
                <span className="font-bold text-slate-900">{selectedDocDetails.documentType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Verification Status:</span>
                <StatusBadge status={selectedDocDetails.status} />
              </div>

              <div className="pt-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block mb-2">
                  Extracted Fields Dictionary:
                </span>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] space-y-1">
                  {Object.entries(selectedDocDetails.extractedFields).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-slate-500 font-sans">{k}:</span>
                      <span className="text-slate-900 font-semibold">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              {selectedDocDetails.status !== 'Verified' && (
                <button
                  onClick={() => {
                    verifyDocument(selectedDocDetails.id);
                    setSelectedDocDetails(null);
                  }}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold"
                >
                  Verify Document
                </button>
              )}
              <button
                onClick={() => setSelectedDocDetails(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Upload Compliance Document</h4>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Target Supplier</label>
                <select
                  value={uploadSupplierId}
                  onChange={e => setUploadSupplierId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Document Category</label>
                <select
                  value={uploadDocType}
                  onChange={e => setUploadDocType(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white"
                >
                  <option value="Shipment Manifest">Shipment Manifest</option>
                  <option value="ISO Certificate">ISO Certificate</option>
                  <option value="Environmental Declaration">Environmental Declaration</option>
                  <option value="Labor Audit Report">Labor Audit Report</option>
                  <option value="Customs Clearance">Customs Clearance</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Document File Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. APX_CUSTOMS_CLEARANCE_2026.pdf"
                  value={uploadFileName}
                  onChange={e => setUploadFileName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={uploadIssueDate}
                    onChange={e => setUploadIssueDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={uploadExpiryDate}
                    onChange={e => setUploadExpiryDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-[11px] leading-relaxed">
                Document will be digested and recorded into the internal integrity ledger. External authority check not performed.
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded font-bold"
                >
                  Upload & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
