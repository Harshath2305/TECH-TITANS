import { Supplier, SupplyChainAnomaly } from '../types';

export function computeRawAnomalies(suppliers: Supplier[]): SupplyChainAnomaly[] {
  const list: SupplyChainAnomaly[] = [];

  suppliers.forEach(supplier => {
    // 1. Missing Logistics Manifests Gaps
    supplier.shipments.forEach(shipment => {
      if (!shipment.hasManifest || shipment.status === 'Pending Manifest') {
        list.push({
          id: `ANOM-DOC-${shipment.shipmentNumber}`,
          category: 'Documentation',
          severity: 'HIGH',
          title: `Unattached Logistics Manifest for Consignment ${shipment.shipmentNumber}`,
          supplierId: supplier.id,
          supplierName: supplier.name,
          entityId: shipment.shipmentNumber,
          entityType: 'Shipment Consignment',
          observedValue: 'Manifest Document: Missing / Unattached',
          baselineThreshold: '100% Bill of Lading & Customs Attestation Required',
          explanation: `Consignment is registered in transit without an uploaded bill of lading, sea waybill, or customs manifest. Scope-3 carbon accounting cannot be certified without primary freight tickets.`,
          remediation: `Issue immediate documentation request to freight forwarder for ${shipment.shipmentNumber}. Obtain digital manifest with gross verified weight.`,
          detectedAt: '2026-10-01 08:30 UTC',
          status: 'Open',
        });
      }

      // 2. High Carbon Intensity Anomalies (> 250 g CO2e / tonne-km or Air freight dominance)
      if (shipment.transportMode === 'Air Freight' || shipment.carbonEmission > 1500) {
        list.push({
          id: `ANOM-CARB-${shipment.shipmentNumber}`,
          category: 'Carbon',
          severity: shipment.transportMode === 'Air Freight' ? 'MEDIUM' : 'HIGH',
          title: `Disproportionate Scope-3 Logistics Intensity: ${shipment.shipmentNumber}`,
          supplierId: supplier.id,
          supplierName: supplier.name,
          entityId: shipment.shipmentNumber,
          entityType: 'Scope-3 Consignment',
          observedValue: `${shipment.carbonEmission.toLocaleString()} kg CO2e (${shipment.transportMode})`,
          baselineThreshold: '< 500 kg CO2e modal corridor',
          explanation: `Consignment uses high-emission air freight or heavy highway transport resulting in elevated Scope-3 logistics footprint. Accounting adheres to GLEC Framework v2.0 factors.`,
          remediation: `Evaluate modal shift to maritime shipping or electrified rail corridor for subsequent replenishments.`,
          detectedAt: '2026-10-02 11:15 UTC',
          status: 'Open',
        });
      }
    });

    // 3. Approaching Certification Expiry Windows (< 60 days)
    supplier.certifications.forEach(cert => {
      if (cert.status === 'Expiring Soon') {
        list.push({
          id: `ANOM-CERT-${cert.id}`,
          category: 'Certification',
          severity: 'HIGH',
          title: `Critical Certification Expiry Approaching: ${cert.name}`,
          supplierId: supplier.id,
          supplierName: supplier.name,
          entityId: cert.certificateNumber,
          entityType: 'Accreditation Standard',
          observedValue: `Expires: ${cert.expiryDate} (< 60 days)`,
          baselineThreshold: 'Renewal confirmation required >= 60 days prior to expiry',
          explanation: `Accreditation standard ${cert.name} is approaching its scheduled lapse date without a validated recertification audit report in internal records.`,
          remediation: `Contact certification liaison (${supplier.contact.name}) to verify concluded renewal audit or issue conditional vendor hold.`,
          detectedAt: '2026-10-03 09:00 UTC',
          status: 'Open',
        });
      } else if (cert.status === 'Expired') {
        list.push({
          id: `ANOM-CERT-EXP-${cert.id}`,
          category: 'Certification',
          severity: 'CRITICAL',
          title: `Expired Accreditation Active in Production: ${cert.name}`,
          supplierId: supplier.id,
          supplierName: supplier.name,
          entityId: cert.certificateNumber,
          entityType: 'Accreditation Standard',
          observedValue: `Expired on ${cert.expiryDate}`,
          baselineThreshold: 'Zero tolerance for expired ESG standards',
          explanation: `Certificate lapsed without renewal documentation. Counterparty compliance score downgraded.`,
          remediation: `Issue immediate corrective action notice and request valid renewal certificate.`,
          detectedAt: '2026-10-03 09:10 UTC',
          status: 'Open',
        });
      }
    });
  });

  return list;
}
