import React, { useState } from 'react';
import {
  Truck,
  CloudFog,
  Search,
  Filter,
  Eye,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MapPin,
  Calculator,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Shipment } from '../types';

export const ShipmentAnalysisView: React.FC = () => {
  const { suppliers, navigate } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState('ALL');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  // Flatten all shipments
  const allShipments: Shipment[] = suppliers.flatMap(s => s.shipments);

  const filteredShipments = allShipments.filter(s => {
    const matchSearch =
      s.shipmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.destination.toLowerCase().includes(searchTerm.toLowerCase());

    const matchMode = modeFilter === 'ALL' || s.transportMode === modeFilter;
    return matchSearch && matchMode;
  });

  const totalCarbon = allShipments.reduce((sum, s) => sum + s.carbonEmission, 0);

  // Emissions by Transport Mode
  const modeTotals = allShipments.reduce((acc, s) => {
    acc[s.transportMode] = (acc[s.transportMode] || 0) + s.carbonEmission;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Upstream Shipment Logistics Analysis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Scope-3 Category 4 transportation data calculated using GLEC Framework v2.0 emission factors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('carbon')}
            className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Calculator className="w-4 h-4" />
            <span>Open Carbon Calculator</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Upstream Emissions
          </span>
          <div className="text-3xl font-black font-mono text-slate-900 tabular-nums">
            {totalCarbon.toLocaleString()} <span className="text-sm font-normal text-slate-500">kg CO2e</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across {allShipments.length} audited freight consignments
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Apex Components Impact
          </span>
          <div className="text-3xl font-black font-mono text-teal-700 tabular-nums">
            1,191.28 <span className="text-sm font-normal text-slate-500">kg CO2e</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            3 shipments (450.50 kg + 380.40 kg + 360.38 kg)
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Manifest Completeness
          </span>
          <div className="text-3xl font-black font-mono text-slate-900 tabular-nums">
            {allShipments.filter(s => s.hasManifest).length} / {allShipments.length}
          </div>
          <div className="text-xs text-rose-600 font-semibold mt-1">
            {allShipments.filter(s => !s.hasManifest).length} consignments missing manifests
          </div>
        </div>
      </div>

      {/* Modal distribution cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Emissions Breakdown by Transport Mode
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          {Object.entries(modeTotals).map(([mode, kg]) => {
            const pct = Math.round((kg / totalCarbon) * 100);
            return (
              <div key={mode} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[11px] block font-sans font-medium">{mode}</span>
                <span className="text-lg font-bold text-slate-900 block tabular-nums mt-0.5">
                  {kg.toLocaleString()} kg
                </span>
                <span className="text-[10px] text-teal-600 font-bold">{pct}% of portfolio</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Shipments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search shipment ID, origin, destination, or supplier..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Mode:</span>
            <select
              value={modeFilter}
              onChange={e => setModeFilter(e.target.value)}
              className="px-2 py-1 rounded border border-slate-200 bg-slate-50 text-slate-700 text-xs focus:outline-hidden"
            >
              <option value="ALL">All Modes</option>
              <option value="Road Freight">Road Freight</option>
              <option value="Maritime Shipping">Maritime Shipping</option>
              <option value="Air Freight">Air Freight</option>
              <option value="Rail Freight">Rail Freight</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Shipment Number</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Origin → Destination</th>
                <th className="py-3 px-4">Transport Mode</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Cargo Weight</th>
                <th className="py-3 px-4">Carbon Impact</th>
                <th className="py-3 px-4">Manifest Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredShipments.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{s.shipmentNumber}</td>
                  <td className="py-3 px-4 font-sans text-slate-800 font-medium">{s.supplierName}</td>
                  <td className="py-3 px-4 font-sans text-slate-600">
                    {s.origin} → {s.destination}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-700">{s.transportMode}</td>
                  <td className="py-3 px-4 tabular-nums">{s.distanceKm} km</td>
                  <td className="py-3 px-4 tabular-nums">{s.cargoWeight} tonnes</td>
                  <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">
                    {s.carbonEmission} kg CO2e
                  </td>
                  <td className="py-3 px-4 font-sans">
                    {s.hasManifest ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Attached
                      </span>
                    ) : (
                      <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block">
                        Missing Manifest
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-sans">
                    <button
                      onClick={() => setSelectedShipment(s)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipment Details Drawer */}
      {selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Shipment Consignment Audit</h4>
                <div className="text-xs font-mono text-slate-500">{selectedShipment.shipmentNumber}</div>
              </div>
              <button
                onClick={() => setSelectedShipment(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-mono"
              >
                ✕ CLOSE
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Supplier:</span>
                <span className="font-bold text-slate-900">{selectedShipment.supplierName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Route Corridor:</span>
                <span className="font-semibold text-slate-800">{selectedShipment.origin} → {selectedShipment.destination}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Distance:</span>
                <span className="font-mono text-slate-900">{selectedShipment.distanceKm} km</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Transport Mode:</span>
                <span className="font-semibold text-slate-800">{selectedShipment.transportMode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Cargo Weight:</span>
                <span className="font-mono text-slate-900">{selectedShipment.cargoWeight} tonnes</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Fuel Used / Type:</span>
                <span className="font-mono text-slate-900">{selectedShipment.fuelUsed} L {selectedShipment.fuelType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 bg-teal-50 p-2 rounded">
                <span className="text-teal-900 font-bold">Scope-3 Calculated Carbon:</span>
                <span className="font-mono font-black text-teal-900 text-sm">{selectedShipment.carbonEmission} kg CO2e</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Manifest Document Status:</span>
                <span className={selectedShipment.hasManifest ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                  {selectedShipment.hasManifest ? selectedShipment.manifestDocument : 'UNATTACHED — MISSING MANIFEST'}
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedShipment(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
