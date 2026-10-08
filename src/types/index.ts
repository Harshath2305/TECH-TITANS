export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type CheckResult = 'PASS' | 'WARNING' | 'FAIL';
export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ActionPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type ActionStatus = 'Open' | 'In Progress' | 'Resolved';

export type TransportMode = 'Road Freight' | 'Maritime Shipping' | 'Air Freight' | 'Rail Freight';
export type FuelType = 'Diesel' | 'Heavy Fuel Oil' | 'Jet A-1' | 'Electricity';

export interface Document {
  id: string;
  supplierId: string;
  supplierName: string;
  fileName: string;
  documentType: 'Shipment Manifest' | 'ISO Certificate' | 'Environmental Declaration' | 'Labor Audit Report' | 'Customs Clearance';
  fileSize: string;
  issueDate: string;
  expiryDate?: string;
  status: 'Verified' | 'Pending' | 'Needs Review' | 'Expired' | 'Missing';
  extractedFields: Record<string, string | number>;
  verificationStatus: 'Valid' | 'Unverified' | 'Expired' | 'Flagged';
  source: 'internal_registry' | 'demo_seed' | 'user_upload';
  uploadedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  checksum?: string;
}

export interface Certification {
  id: string;
  supplierId: string;
  name: string;
  standard: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  issuer: string;
  status: 'Active' | 'Expiring Soon' | 'Expired' | 'Pending Audit';
}

export interface Shipment {
  id: string;
  supplierId: string;
  supplierName: string;
  shipmentNumber: string;
  origin: string;
  destination: string;
  distanceKm: number;
  transportMode: TransportMode;
  fuelUsed: number;
  fuelType: FuelType;
  cargoWeight: number; // in tonnes
  carbonEmission: number; // in kg CO2e
  calculationMethod: string;
  shipmentDate: string;
  manifestDocument?: string;
  hasManifest: boolean;
  status: 'Delivered' | 'In Transit' | 'Pending Manifest' | 'Verified';
}

export interface ComplianceCheck {
  id: string;
  supplierId: string;
  category: 'Environmental' | 'Carbon' | 'Labor' | 'Documentation' | 'Certification' | 'Shipment';
  checkName: string;
  result: CheckResult;
  severity: SeverityLevel;
  evidence: string;
  source: 'internal_registry';
}

export interface RiskAnalysis {
  supplierId: string;
  score: number;
  complianceScore?: number;
  riskLevel: RiskLevel;
  summary?: string;
  positiveFactors: string[];
  negativeFactors: string[];
  missingEvidence: string[];
  explanation: string;
  recommendations: string[];
  generatedAt: string;
  model: string;
  isAdvisory: boolean;
  source?: 'gemini' | 'deterministic_fallback' | string;
  isFallback?: boolean;
  notice?: string;
  provenance?: string;
}

export interface ComplianceAction {
  id: string;
  supplierId: string;
  supplierName: string;
  title: string;
  description: string;
  priority: ActionPriority;
  status: ActionStatus;
  dueDate: string;
  owner: string;
  source: 'AI Recommendation' | 'Manual' | 'Executive Insight' | 'Supplier Comparison';
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entityType: 'Supplier' | 'Document' | 'Shipment' | 'ComplianceAction' | 'Calculation' | 'ComplianceCheck';
  entityId: string;
  description: string;
  previousHash: string;
  recordHash: string;
  source: 'internal_database';
}

export interface CarbonSummary {
  totalEmissionsKg: number;
  shipmentCount: number;
  lastCalculated: string;
  calculationMethod: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  country: string;
  location: string;
  industry: string;
  contact: {
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  status: 'Active' | 'Pending Review' | 'Flagged' | 'Suspended';
  riskLevel: RiskLevel;
  complianceScore: number;
  verificationStatus: 'Verified' | 'Pending' | 'Needs Review' | 'Partial';
  certifications: Certification[];
  documents: Document[];
  shipments: Shipment[];
  carbonSummary: CarbonSummary;
  complianceChecks: ComplianceCheck[];
  aiInsights: RiskAnalysis[];
  actions: ComplianceAction[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'alert' | 'success' | 'info';
  timestamp: string;
  read: boolean;
  linkRoute: string;
  linkParam?: string;
}

export interface RecommendationItem {
  id: string;
  title: string;
  reason: string;
  evidence: string;
  recommendedAction: string;
  priority: ActionPriority;
}

export interface ExecutiveInsight {
  id: string;
  type: 'immediate_attention' | 'expiring_certifications' | 'missing_documents' | 'carbon_hotspots' | 'high_risk';
  title: string;
  severity: SeverityLevel;
  description: string;
  affectedSuppliers: string[];
  recommendedNextStep: string;
  evidenceReference: string;
}
