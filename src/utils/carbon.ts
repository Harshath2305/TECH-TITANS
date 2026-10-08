import { TransportMode, FuelType } from '../types';

export interface CarbonCalculationInputs {
  transportMode: TransportMode;
  cargoWeightTonnes: number;
  distanceKm: number;
  fuelType?: FuelType;
  fuelUsedLitres?: number;
  calculationType?: 'activity-based' | 'fuel-based';
}

export interface CarbonCalculationResult {
  carbonEmissionKg: number;
  carbonEmissionTonnes: number;
  emissionFactor: number;
  emissionFactorUnit: string;
  methodology: string;
  formula: string;
  activityMetric: number; // tonne-km
  calculatedAt: string;
}

// GLEC Framework v2.0 / GHG Protocol Scope 3 Cat. 4 Emission Factors
export const EMISSION_FACTORS: Record<TransportMode, { factor: number; unit: string; description: string }> = {
  'Road Freight': {
    factor: 0.096, // kg CO2e / t-km (Euro VI heavy duty freight)
    unit: 'kg CO2e / tonne-km',
    description: 'Euro VI heavy-duty tractor-trailer (average laden weight)',
  },
  'Maritime Shipping': {
    factor: 0.016, // kg CO2e / t-km (Ultra Large Container Vessel)
    unit: 'kg CO2e / tonne-km',
    description: 'Post-Panamax container vessel (>14,500 TEU, average speed)',
  },
  'Air Freight': {
    factor: 0.602, // kg CO2e / t-km (Dedicated freighter long-haul)
    unit: 'kg CO2e / tonne-km',
    description: 'Dedicated cargo wide-body freighter (including RFI multiplier)',
  },
  'Rail Freight': {
    factor: 0.028, // kg CO2e / t-km (Grid electric / diesel blend)
    unit: 'kg CO2e / tonne-km',
    description: 'Electric-diesel intermodal freight train',
  },
};

export const FUEL_EMISSION_FACTORS: Record<FuelType, { factor: number; unit: string }> = {
  Diesel: { factor: 2.68, unit: 'kg CO2e / litre' },
  'Heavy Fuel Oil': { factor: 3.11, unit: 'kg CO2e / litre' },
  'Jet A-1': { factor: 3.16, unit: 'kg CO2e / litre' },
  Electricity: { factor: 0.385, unit: 'kg CO2e / kWh' },
};

/**
 * Deterministic Scope-3 Upstream Transportation Carbon Calculation
 * Follows strict mathematical formulas.
 * Does NOT invoke AI or probabilistic models.
 */
export function calculateScope3Carbon(inputs: CarbonCalculationInputs): CarbonCalculationResult {
  const { transportMode, cargoWeightTonnes, distanceKm, fuelType, fuelUsedLitres, calculationType = 'activity-based' } = inputs;

  if (calculationType === 'fuel-based' && fuelType && fuelUsedLitres && fuelUsedLitres > 0) {
    const fuelMeta = FUEL_EMISSION_FACTORS[fuelType];
    const rawKg = fuelUsedLitres * fuelMeta.factor;
    const roundedKg = Math.round(rawKg * 100) / 100;
    return {
      carbonEmissionKg: roundedKg,
      carbonEmissionTonnes: Math.round((roundedKg / 1000) * 1000) / 1000,
      emissionFactor: fuelMeta.factor,
      emissionFactorUnit: fuelMeta.unit,
      methodology: 'GHG Protocol Scope 3 Category 4 (Fuel-Based Method)',
      formula: `${fuelUsedLitres.toLocaleString()} L × ${fuelMeta.factor} ${fuelMeta.unit} = ${roundedKg.toFixed(2)} kg CO2e`,
      activityMetric: cargoWeightTonnes * distanceKm,
      calculatedAt: new Date().toISOString(),
    };
  }

  // Activity-based: Weight (tonnes) × Distance (km) × Mode Factor (kg CO2e / t-km)
  const modeMeta = EMISSION_FACTORS[transportMode] || EMISSION_FACTORS['Road Freight'];
  const tonneKm = cargoWeightTonnes * distanceKm;
  const rawKg = tonneKm * modeMeta.factor;
  const roundedKg = Math.round(rawKg * 100) / 100;

  return {
    carbonEmissionKg: roundedKg,
    carbonEmissionTonnes: Math.round((roundedKg / 1000) * 1000) / 1000,
    emissionFactor: modeMeta.factor,
    emissionFactorUnit: modeMeta.unit,
    methodology: 'GHG Protocol Scope 3 Category 4 (Distance-Activity Method, GLEC Framework v2.0)',
    formula: `${cargoWeightTonnes} tonnes × ${distanceKm.toLocaleString()} km × ${modeMeta.factor} ${modeMeta.unit} = ${roundedKg.toFixed(2)} kg CO2e`,
    activityMetric: Math.round(tonneKm * 100) / 100,
    calculatedAt: new Date().toISOString(),
  };
}
