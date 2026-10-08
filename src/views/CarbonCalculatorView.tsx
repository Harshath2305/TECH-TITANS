import React, { useState } from 'react';
import {
  Calculator,
  RotateCcw,
  PlusCircle,
  History,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateScope3Carbon, EMISSION_FACTORS, FUEL_EMISSION_FACTORS } from '../utils/carbon';
import { TransportMode, FuelType } from '../types';

interface CalcHistoryItem {
  id: string;
  timestamp: string;
  mode: TransportMode;
  cargoWeight: number;
  distance: number;
  resultKg: number;
  formula: string;
}

export const CarbonCalculatorView: React.FC = () => {
  const { suppliers, addShipment, logAuditEvent } = useApp();

  // Inputs
  const [transportMode, setTransportMode] = useState<TransportMode>('Road Freight');
  const [cargoWeightTonnes, setCargoWeightTonnes] = useState<number>(7.18);
  const [distanceKm, setDistanceKm] = useState<number>(654.5);
  const [calculationType, setCalculationType] = useState<'activity-based' | 'fuel-based'>('activity-based');
  const [fuelType, setFuelType] = useState<FuelType>('Diesel');
  const [fuelUsedLitres, setFuelUsedLitres] = useState<number>(168.1);

  // Result state
  const [result, setResult] = useState(() =>
    calculateScope3Carbon({
      transportMode: 'Road Freight',
      cargoWeightTonnes: 7.18,
      distanceKm: 654.5,
      calculationType: 'activity-based',
    })
  );

  // History state
  const [history, setHistory] = useState<CalcHistoryItem[]>([
    {
      id: 'CALC-HIST-01',
      timestamp: '2026-09-14 10:15',
      mode: 'Road Freight',
      cargoWeight: 7.18,
      distance: 654.5,
      resultKg: 450.50,
      formula: '7.18 t × 654.5 km × 0.096 kg CO2e/t-km = 450.50 kg CO2e',
    },
    {
      id: 'CALC-HIST-02',
      timestamp: '2026-08-28 14:20',
      mode: 'Road Freight',
      cargoWeight: 6.34,
      distance: 625.0,
      resultKg: 380.40,
      formula: '6.34 t × 625 km × 0.096 kg CO2e/t-km = 380.40 kg CO2e',
    },
    {
      id: 'CALC-HIST-03',
      timestamp: '2026-08-10 09:30',
      mode: 'Road Freight',
      cargoWeight: 17.71,
      distance: 212.0,
      resultKg: 360.38,
      formula: '17.71 t × 212 km × 0.096 kg CO2e/t-km = 360.38 kg CO2e',
    },
  ]);

  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  const handleCompute = (e: React.FormEvent) => {
    e.preventDefault();
    const res = calculateScope3Carbon({
      transportMode,
      cargoWeightTonnes,
      distanceKm,
      calculationType,
      fuelType,
      fuelUsedLitres,
    });
    setResult(res);

    const newItem: CalcHistoryItem = {
      id: `CALC-HIST-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      mode: transportMode,
      cargoWeight: cargoWeightTonnes,
      distance: distanceKm,
      resultKg: res.carbonEmissionKg,
      formula: res.formula,
    };
    setHistory(prev => [newItem, ...prev.slice(0, 9)]);
  };

  const handleLogToLedger = () => {
    logAuditEvent(
      'compliance_officer',
      'SCOPE3_CARBON_CALCULATED',
      'Calculation',
      `CALC-${Date.now().toString(36)}`,
      `Deterministic carbon calculated: ${result.carbonEmissionKg} kg CO2e for ${transportMode} (${cargoWeightTonnes} t, ${distanceKm} km). Methodology: ${result.methodology}`
    );
    setSavedSuccess(`Calculation successfully recorded into the Internal Integrity Ledger.`);
    setTimeout(() => setSavedSuccess(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-teal-600 text-xs font-bold uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Strictly Deterministic Scope-3 Engine</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Scope-3 Category 4 Carbon Calculator
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Pure mathematical calculations according to the GLEC Framework v2.0 and GHG Protocol. AI does not decide or modify carbon values.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{savedSuccess}</span>
        </div>
      )}

      {/* Main Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Consignment Transport Parameters
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-semibold border border-teal-200">
              Deterministic calculation
            </span>
          </div>

          <form onSubmit={handleCompute} className="space-y-4 text-xs">
            {/* Calculation Method Selection */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Accounting Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCalculationType('activity-based')}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                    calculationType === 'activity-based'
                      ? 'border-teal-500 bg-teal-50/60 text-teal-900 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-semibold">Distance-Activity Based</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Cargo weight (t) × Distance (km)</div>
                </button>
                <button
                  type="button"
                  onClick={() => setCalculationType('fuel-based')}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                    calculationType === 'fuel-based'
                      ? 'border-teal-500 bg-teal-50/60 text-teal-900 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-semibold">Direct Fuel-Based</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Fuel quantity (L) × Fuel factor</div>
                </button>
              </div>
            </div>

            {/* Transport Mode */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Transport Mode</label>
              <select
                value={transportMode}
                onChange={e => setTransportMode(e.target.value as TransportMode)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
              >
                <option value="Road Freight">Road Freight (Euro VI Heavy Truck - 0.096 kg/t-km)</option>
                <option value="Maritime Shipping">Maritime Shipping (Container Ship - 0.016 kg/t-km)</option>
                <option value="Air Freight">Air Freight (Cargo Jet Freighter - 0.602 kg/t-km)</option>
                <option value="Rail Freight">Rail Freight (Electric/Diesel Hybrid - 0.028 kg/t-km)</option>
              </select>
            </div>

            {/* Cargo Weight & Distance */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Net Cargo Weight (tonnes)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={cargoWeightTonnes}
                  onChange={e => setCargoWeightTonnes(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Route Distance (km)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={distanceKm}
                  onChange={e => setDistanceKm(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                />
              </div>
            </div>

            {/* If Fuel-based */}
            {calculationType === 'fuel-based' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Fuel Type</label>
                  <select
                    value={fuelType}
                    onChange={e => setFuelType(e.target.value as FuelType)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white"
                  >
                    <option value="Diesel">Diesel (2.68 kg CO2e / L)</option>
                    <option value="Heavy Fuel Oil">Heavy Fuel Oil (3.11 kg CO2e / L)</option>
                    <option value="Jet A-1">Jet A-1 (3.16 kg CO2e / L)</option>
                    <option value="Electricity">Electricity (0.385 kg CO2e / kWh)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Fuel Quantity Consumed (Litres)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fuelUsedLitres}
                    onChange={e => setFuelUsedLitres(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>
            )}

            {/* Recalculate Button */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setTransportMode('Road Freight');
                  setCargoWeightTonnes(7.18);
                  setDistanceKm(654.5);
                  setCalculationType('activity-based');
                }}
                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Apex Sample (7.18t, 654.5km)</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                <span>Calculate CO2e</span>
              </button>
            </div>
          </form>
        </div>

        {/* Output Results Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-sm space-y-4">
            <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider block">
              Calculated Scope-3 Emissions
            </span>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono text-white tabular-nums tracking-tight">
                {result.carbonEmissionKg.toFixed(2)}
              </span>
              <span className="text-slate-400 text-base font-semibold">kg CO2e</span>
            </div>

            <div className="text-xs text-slate-300 font-mono">
              Equivalent to: <span className="text-teal-300 font-bold">{result.carbonEmissionTonnes.toFixed(3)} tonnes CO2e</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-2">
              <span className="font-bold text-white block text-[11px] uppercase tracking-wider">
                Mathematical Proof:
              </span>
              <p className="font-mono text-teal-300 text-xs break-words">
                {result.formula}
              </p>
              <div className="text-[10px] text-slate-400 border-t border-slate-700 pt-1.5 flex justify-between">
                <span>Methodology:</span>
                <span className="text-slate-300">{result.methodology}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleLogToLedger}
                className="w-full py-2.5 px-3 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Record Calculation to Internal Ledger</span>
              </button>
            </div>
          </div>

          {/* Reference Notice */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              Standard GLEC Emission Factors:
            </span>
            <p className="text-[11px] leading-relaxed text-slate-500">
              • Road Freight: 0.096 kg CO2e / tonne-km
              <br />• Maritime Shipping: 0.016 kg CO2e / tonne-km
              <br />• Air Freight: 0.602 kg CO2e / tonne-km
              <br />• Rail Freight: 0.028 kg CO2e / tonne-km
            </p>
          </div>
        </div>
      </div>

      {/* Calculation History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            Deterministic Calculation History
          </h4>
          <span className="text-xs font-mono text-slate-400">{history.length} recent calculations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2 px-3">Calculation ID</th>
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Mode</th>
                <th className="py-2 px-3">Cargo (t)</th>
                <th className="py-2 px-3">Distance (km)</th>
                <th className="py-2 px-3">Calculated Result</th>
                <th className="py-2 px-3">Formula</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {history.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{item.id}</td>
                  <td className="py-2.5 px-3 text-slate-500 font-sans">{item.timestamp}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-800">{item.mode}</td>
                  <td className="py-2.5 px-3 tabular-nums">{item.cargoWeight} t</td>
                  <td className="py-2.5 px-3 tabular-nums">{item.distance} km</td>
                  <td className="py-2.5 px-3 font-bold text-teal-800 tabular-nums">{item.resultKg.toFixed(2)} kg CO2e</td>
                  <td className="py-2.5 px-3 text-slate-500 text-[10px] max-w-xs truncate">{item.formula}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
