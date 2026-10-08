import React, { useState } from 'react';
import {
  CheckSquare,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Calendar,
  Building2,
  Edit2,
  Filter,
  Search,
  Database,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { ComplianceAction, ActionPriority, ActionStatus } from '../types';

export const ComplianceActionTrackerView: React.FC = () => {
  const { suppliers, addComplianceAction, updateComplianceAction } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal create state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSupplierId, setModalSupplierId] = useState(suppliers[0].id);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalPriority, setModalPriority] = useState<ActionPriority>('HIGH');
  const [modalDueDate, setModalDueDate] = useState('2026-10-25');
  const [modalOwner, setModalOwner] = useState('Elena Rostova (Compliance Auditor)');

  // Modal edit state
  const [editingAction, setEditingAction] = useState<ComplianceAction | null>(null);

  // Flatten all actions
  const allActions: ComplianceAction[] = suppliers.flatMap(s => s.actions);

  const filteredActions = allActions.filter(a => {
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchPriority = priorityFilter === 'ALL' || a.priority === priorityFilter;
    const matchSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.owner.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  const priorityCounts = {
    CRITICAL: allActions.filter(a => a.priority === 'CRITICAL' && a.status !== 'Resolved').length,
    HIGH: allActions.filter(a => a.priority === 'HIGH' && a.status !== 'Resolved').length,
    MEDIUM: allActions.filter(a => a.priority === 'MEDIUM' && a.status !== 'Resolved').length,
    LOW: allActions.filter(a => a.priority === 'LOW' && a.status !== 'Resolved').length,
  };

  const statusCounts = {
    Open: allActions.filter(a => a.status === 'Open').length,
    InProgress: allActions.filter(a => a.status === 'In Progress').length,
    Resolved: allActions.filter(a => a.status === 'Resolved').length,
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle) return;

    const sup = suppliers.find(s => s.id === modalSupplierId) || suppliers[0];
    addComplianceAction({
      supplierId: sup.id,
      supplierName: sup.name,
      title: modalTitle,
      description: modalDesc,
      priority: modalPriority,
      status: 'Open',
      dueDate: modalDueDate,
      owner: modalOwner,
      source: 'Manual',
    });

    setIsModalOpen(false);
    setModalTitle('');
    setModalDesc('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAction) return;

    updateComplianceAction(editingAction.id, {
      title: editingAction.title,
      description: editingAction.description,
      priority: editingAction.priority,
      status: editingAction.status,
      dueDate: editingAction.dueDate,
      owner: editingAction.owner,
      notes: editingAction.notes,
    });

    setEditingAction(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Compliance Action Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Actions raised from AI recommendations, executive insights, supplier comparisons or manually.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Raise New Action</span>
        </button>
      </div>

      {/* 4 Priority KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-rose-200/90 shadow-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">CRITICAL ACTIONS</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-rose-700 tabular-nums">
            {priorityCounts.CRITICAL}
          </div>
          <span className="text-[11px] text-slate-500">Requires immediate halt/CAP</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-orange-200/90 shadow-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">HIGH PRIORITY</span>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-orange-700 tabular-nums">
            {priorityCounts.HIGH}
          </div>
          <span className="text-[11px] text-slate-500">Missing manifests & audits</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/90 shadow-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">MEDIUM PRIORITY</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-700 tabular-nums">
            {priorityCounts.MEDIUM}
          </div>
          <span className="text-[11px] text-slate-500">Upcoming renewals (&lt;60d)</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">LOW PRIORITY</span>
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-800 tabular-nums">
            {priorityCounts.LOW}
          </div>
          <span className="text-[11px] text-slate-500">Routine follow-ups</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search actions by title, owner, or supplier..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2 py-1 rounded border border-slate-200 bg-slate-50 text-slate-700 text-xs focus:outline-hidden"
            >
              <option value="ALL">All Statuses ({allActions.length})</option>
              <option value="Open">Open ({statusCounts.Open})</option>
              <option value="In Progress">In Progress ({statusCounts.InProgress})</option>
              <option value="Resolved">Resolved ({statusCounts.Resolved})</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium text-[11px]">Priority:</span>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="px-2 py-1 rounded border border-slate-200 bg-slate-50 text-slate-700 text-xs focus:outline-hidden"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions List */}
      <div className="space-y-3">
        {filteredActions.map(action => (
          <div
            key={action.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-slate-900">{action.title}</span>
                <StatusBadge status={action.priority} type="severity" />
                <StatusBadge status={action.status} />
              </div>

              <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                {action.description}
              </p>

              <div className="flex items-center gap-4 text-[11px] text-slate-500 font-sans flex-wrap pt-1">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <strong>{action.supplierName}</strong>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {action.owner}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 font-mono text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Due: {action.dueDate}
                </span>
                <span>·</span>
                <span className="italic text-teal-700">Source: {action.source}</span>
              </div>
            </div>

            {/* Quick Status Toggles & Edit */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              {action.status !== 'Resolved' ? (
                <button
                  onClick={() => updateComplianceAction(action.id, { status: 'Resolved' })}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs border border-emerald-200 transition-colors cursor-pointer"
                >
                  Mark Resolved
                </button>
              ) : (
                <button
                  onClick={() => updateComplianceAction(action.id, { status: 'In Progress' })}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium text-xs border border-slate-200 transition-colors cursor-pointer"
                >
                  Reopen
                </button>
              )}

              <button
                onClick={() => setEditingAction(action)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                title="Edit Action"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Action */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Create Compliance Action</h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Target Supplier</label>
                <select
                  value={modalSupplierId}
                  onChange={e => setModalSupplierId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Action Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Upload missing shipment manifest for SHIP-APX-2026-0142"
                  value={modalTitle}
                  onChange={e => setModalTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Description & Steps</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide remediation steps and required evidence..."
                  value={modalDesc}
                  onChange={e => setModalDesc(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Priority</label>
                  <select
                    value={modalPriority}
                    onChange={e => setModalPriority(e.target.value as ActionPriority)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={modalDueDate}
                    onChange={e => setModalDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Assignee / Owner</label>
                <input
                  type="text"
                  required
                  value={modalOwner}
                  onChange={e => setModalOwner(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-[11px]">
                Creating this action will automatically generate an immutable audit record in the Internal Integrity Ledger.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded font-bold"
                >
                  Create & Record Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Action */}
      {editingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Edit Compliance Action</h4>
              <button
                onClick={() => setEditingAction(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingAction.title}
                  onChange={e => setEditingAction({ ...editingAction, title: e.target.value })}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Status</label>
                <select
                  value={editingAction.status}
                  onChange={e => setEditingAction({ ...editingAction, status: e.target.value as ActionStatus })}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Priority</label>
                  <select
                    value={editingAction.priority}
                    onChange={e => setEditingAction({ ...editingAction, priority: e.target.value as ActionPriority })}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={editingAction.dueDate}
                    onChange={e => setEditingAction({ ...editingAction, dueDate: e.target.value })}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Assignee</label>
                <input
                  type="text"
                  value={editingAction.owner}
                  onChange={e => setEditingAction({ ...editingAction, owner: e.target.value })}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Progress Notes</label>
                <textarea
                  rows={2}
                  value={editingAction.notes || ''}
                  onChange={e => setEditingAction({ ...editingAction, notes: e.target.value })}
                  placeholder="Record verification updates or supplier replies..."
                  className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAction(null)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded font-bold"
                >
                  Update & Record Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
