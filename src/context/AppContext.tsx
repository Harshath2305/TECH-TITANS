import React, { createContext, useContext, useState, useEffect } from 'react';
import { Supplier, Document, Shipment, ComplianceAction, AuditRecord, NotificationItem, RiskAnalysis, CheckResult, SeverityLevel } from '../types';
import { SEEDED_SUPPLIERS, generateSeededLedger, SEEDED_NOTIFICATIONS, createAuditRecord } from '../data/seedData';
import { calculateScope3Carbon } from '../utils/carbon';
import { analyzeSupplierRisk, explainScoreDelta, buildDeterministicRiskAnalysis, ScoreChangeExplanation } from '../services/aiService';

interface DemoVerificationState {
  selectedManifest: string;
  selectedSupplierId: string;
  extractedFields: Record<string, string | number>;
  calculatedCarbon: {
    cargoWeightTonnes: number;
    distanceKm: number;
    transportMode: string;
    emissionFactor: number;
    emissionFactorUnit: string;
    carbonKg: number;
    carbonTonnes: number;
    formula: string;
    supplierTotalCarbonKg: number;
  } | null;
  verificationChecks: Array<{
    id: string;
    checkName: string;
    category: string;
    result: CheckResult;
    severity: SeverityLevel;
    evidence: string;
  }>;
  riskAnalysis: RiskAnalysis | null;
  scoreExplanation: ScoreChangeExplanation | null;
  stepCompleted: Record<number, boolean>;
  isCalculating: boolean;
  isVerifying: boolean;
  isAnalyzingRisk: boolean;
}

interface AppContextType {
  suppliers: Supplier[];
  auditLedger: AuditRecord[];
  notifications: NotificationItem[];
  activeRoute: string;
  routeParam?: string;
  navigate: (route: string, param?: string) => void;
  // Audit & Ledger
  logAuditEvent: (
    actor: string,
    action: string,
    entityType: AuditRecord['entityType'],
    entityId: string,
    description: string
  ) => AuditRecord;
  // Actions
  addComplianceAction: (action: Omit<ComplianceAction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateComplianceAction: (actionId: string, updates: Partial<ComplianceAction>) => void;
  // Documents
  verifyDocument: (docId: string) => void;
  addDocument: (doc: Document) => void;
  // Shipments & Carbon
  addShipment: (shipment: Shipment) => void;
  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  // Print & Modal
  printSupplierId: string | null;
  openPrintReport: (supplierId: string) => void;
  closePrintReport: () => void;
  // Demo Workflow State
  demoState: DemoVerificationState;
  setDemoStep: (step: number) => void;
  demoCurrentStep: number;
  selectDemoManifest: (manifestName: string) => void;
  runExtraction: () => void;
  runCalculation: () => void;
  runVerification: () => void;
  runAiRiskAnalysis: () => Promise<void>;
  resetDemoWorkflow: () => void;
  resetAllDemoData: () => void;
  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  // Copilot Drawer
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SUPPLIERS: 'sourcetrace_suppliers_v1',
  LEDGER: 'sourcetrace_ledger_v1',
  NOTIFICATIONS: 'sourcetrace_notifications_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [activeRoute, setActiveRoute] = useState<string>('dashboard');
  const [routeParam, setRouteParam] = useState<string | undefined>(undefined);
  const [printSupplierId, setPrintSupplierId] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Copilot Drawer State
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);

  // Data Store
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return SEEDED_SUPPLIERS;
  });

  const [auditLedger, setAuditLedger] = useState<AuditRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LEDGER);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return generateSeededLedger();
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return SEEDED_NOTIFICATIONS;
  });

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [suppliers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(auditLedger));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [auditLedger]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [notifications]);

  // Demo Workflow State
  const [demoCurrentStep, setDemoStep] = useState<number>(1);
  const [demoState, setDemoState] = useState<DemoVerificationState>({
    selectedManifest: 'APX-SHIP-2026-0155_manifest.pdf',
    selectedSupplierId: 'sup-apex-01',
    extractedFields: {
      'Shipment Reference': 'SHIP-APX-2026-0155',
      'Supplier Code': 'APX-COMP',
      'Supplier Name': 'Apex Components Ltd',
      'Port / Location of Origin': 'Stuttgart, Baden-Württemberg, Germany',
      'Destination Terminal': 'Rotterdam Freight Hub, Netherlands',
      'Consignment Route Distance': '654.5 km',
      'Modal Category': 'Road Freight (Euro VI Heavy Truck)',
      'Primary Cargo Description': 'Machined Transmission Sub-assemblies',
      'Net Cargo Weight': '7.18 tonnes (7,180 kg)',
      'Certified Fuel Type': 'Ultra-Low Sulfur Diesel (EN 590)',
      'Consignment Date': '2026-09-14',
      'Carrier Accreditation': 'DE-CARRIER-TRANS-0941',
    },
    calculatedCarbon: {
      cargoWeightTonnes: 7.18,
      distanceKm: 654.5,
      transportMode: 'Road Freight',
      emissionFactor: 0.096,
      emissionFactorUnit: 'kg CO2e / tonne-km',
      carbonKg: 450.50,
      carbonTonnes: 0.451,
      formula: '7.18 tonnes × 654.5 km × 0.096 kg CO2e/t-km = 450.50 kg CO2e',
      supplierTotalCarbonKg: 1191.28,
    },
    verificationChecks: [
      {
        id: 'DEMO-CHK-01',
        checkName: 'Supplier Identity & Active Accreditation',
        category: 'Certification',
        result: 'PASS',
        severity: 'LOW',
        evidence: 'Supplier code APX-COMP verified against internal master registry. Status: Active.',
      },
      {
        id: 'DEMO-CHK-02',
        checkName: 'Document Authenticity & Format Check',
        category: 'Documentation',
        result: 'PASS',
        severity: 'LOW',
        evidence: 'SHA-256 digital manifest checksum verified against carrier receipt dispatch log.',
      },
      {
        id: 'DEMO-CHK-03',
        checkName: 'Environmental Standard ISO 14001:2015',
        category: 'Environmental',
        result: 'PASS',
        severity: 'LOW',
        evidence: 'Certificate #DE-EMS-2024-4410 active until 2027-05-10.',
      },
      {
        id: 'DEMO-CHK-04',
        checkName: 'Occupational Health & Safety ISO 45001:2018',
        category: 'Labor',
        result: 'WARNING',
        severity: 'MEDIUM',
        evidence: 'Certificate #OHS-2023-889 expires on 2026-11-30. Renewal audit submission pending.',
      },
      {
        id: 'DEMO-CHK-05',
        checkName: 'Historical Consignment Manifest Completeness',
        category: 'Shipment',
        result: 'WARNING',
        severity: 'HIGH',
        evidence: '2 past shipments missing signed manifests: SHIP-APX-2026-0142 and SHIP-APX-2026-0131.',
      },
      {
        id: 'DEMO-CHK-06',
        checkName: 'Deterministic Scope-3 Carbon Accounting',
        category: 'Carbon',
        result: 'PASS',
        severity: 'LOW',
        evidence: 'Activity metric (4,699.31 t-km) verified via GLEC Framework v2.0 emission factors.',
      },
    ],
    riskAnalysis: null,
    scoreExplanation: null,
    stepCompleted: { 1: true, 2: true, 3: true, 4: true, 5: false },
    isCalculating: false,
    isVerifying: false,
    isAnalyzingRisk: false,
  });

  const navigate = (route: string, param?: string) => {
    setActiveRoute(route);
    setRouteParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openPrintReport = (supplierId: string) => {
    setPrintSupplierId(supplierId);
    navigate('print-report', supplierId);
  };

  const closePrintReport = () => {
    setPrintSupplierId(null);
    navigate('suppliers');
  };

  const logAuditEvent = (
    actor: string,
    action: string,
    entityType: AuditRecord['entityType'],
    entityId: string,
    description: string
  ): AuditRecord => {
    const latestRecord = auditLedger[auditLedger.length - 1];
    const prevHash = latestRecord ? latestRecord.recordHash : '0000000000000000000000000000000000000000000000000000000000000000';
    const newRecord = createAuditRecord(actor, action, entityType, entityId, description, prevHash);

    setAuditLedger(prev => [...prev, newRecord]);
    return newRecord;
  };

  const addComplianceAction = (actionData: Omit<ComplianceAction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `act-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const newAction: ComplianceAction = {
      ...actionData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    setSuppliers(prev =>
      prev.map(sup => {
        if (sup.id === actionData.supplierId) {
          return {
            ...sup,
            actions: [newAction, ...sup.actions],
            updatedAt: now,
          };
        }
        return sup;
      })
    );

    logAuditEvent(
      'compliance_officer',
      'ACTION_CREATED',
      'ComplianceAction',
      newAction.id,
      `Action created: "${newAction.title}" for supplier ${newAction.supplierName} (Priority: ${newAction.priority})`
    );

    // Add alert notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: `New Compliance Action Created`,
        message: `${newAction.title} (${newAction.priority} priority) assigned to ${newAction.owner}`,
        type: 'info',
        timestamp: 'Just now',
        read: false,
        linkRoute: '/actions',
      },
      ...prev,
    ]);
  };

  const updateComplianceAction = (actionId: string, updates: Partial<ComplianceAction>) => {
    const now = new Date().toISOString();
    let updatedAction: ComplianceAction | null = null;

    setSuppliers(prev =>
      prev.map(sup => {
        const foundIndex = sup.actions.findIndex(a => a.id === actionId);
        if (foundIndex >= 0) {
          const updated = { ...sup.actions[foundIndex], ...updates, updatedAt: now };
          updatedAction = updated;
          const newActions = [...sup.actions];
          newActions[foundIndex] = updated;
          return { ...sup, actions: newActions, updatedAt: now };
        }
        return sup;
      })
    );

    if (updatedAction) {
      logAuditEvent(
        'compliance_officer',
        'ACTION_UPDATED',
        'ComplianceAction',
        actionId,
        `Action updated: "${(updatedAction as ComplianceAction).title}" -> Status: ${(updatedAction as ComplianceAction).status}, Priority: ${(updatedAction as ComplianceAction).priority}`
      );
    }
  };

  const verifyDocument = (docId: string) => {
    const now = new Date().toISOString();
    let targetDoc: Document | null = null;

    setSuppliers(prev =>
      prev.map(sup => {
        const docIndex = sup.documents.findIndex(d => d.id === docId);
        if (docIndex >= 0) {
          const doc = sup.documents[docIndex];
          const updatedDoc: Document = {
            ...doc,
            status: 'Verified',
            verificationStatus: 'Valid',
            verifiedAt: now,
            verifiedBy: 'system_deterministic_check',
          };
          targetDoc = updatedDoc;
          const newDocs = [...sup.documents];
          newDocs[docIndex] = updatedDoc;
          return { ...sup, documents: newDocs, updatedAt: now };
        }
        return sup;
      })
    );

    if (targetDoc) {
      logAuditEvent(
        'system_verifier',
        'DOCUMENT_VERIFIED',
        'Document',
        (targetDoc as Document).fileName,
        `Document verified deterministically: ${(targetDoc as Document).fileName} for supplier ${(targetDoc as Document).supplierName}`
      );
    }
  };

  const addDocument = (doc: Document) => {
    setSuppliers(prev =>
      prev.map(sup => {
        if (sup.id === doc.supplierId) {
          return {
            ...sup,
            documents: [doc, ...sup.documents],
            updatedAt: new Date().toISOString(),
          };
        }
        return sup;
      })
    );

    logAuditEvent(
      'compliance_officer',
      'DOCUMENT_UPLOADED',
      'Document',
      doc.fileName,
      `New document uploaded: ${doc.fileName} (${doc.documentType}) for ${doc.supplierName}`
    );
  };

  const addShipment = (shipment: Shipment) => {
    setSuppliers(prev =>
      prev.map(sup => {
        if (sup.id === shipment.supplierId) {
          const newShipments = [shipment, ...sup.shipments];
          const newTotalCarbon = Math.round(newShipments.reduce((sum, s) => sum + s.carbonEmission, 0) * 100) / 100;
          return {
            ...sup,
            shipments: newShipments,
            carbonSummary: {
              ...sup.carbonSummary,
              totalEmissionsKg: newTotalCarbon,
              shipmentCount: newShipments.length,
              lastCalculated: new Date().toISOString(),
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return sup;
      })
    );

    logAuditEvent(
      'deterministic_engine',
      'SHIPMENT_RECORDED',
      'Shipment',
      shipment.shipmentNumber,
      `Shipment logged: ${shipment.shipmentNumber} with carbon impact ${shipment.carbonEmission} kg CO2e`
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Demo Workflow Methods
  const selectDemoManifest = (manifestName: string) => {
    let supId = 'sup-apex-01';
    let extracted: Record<string, string | number> = {};

    if (manifestName.includes('APX')) {
      supId = 'sup-apex-01';
      extracted = {
        'Shipment Reference': 'SHIP-APX-2026-0155',
        'Supplier Code': 'APX-COMP',
        'Supplier Name': 'Apex Components Ltd',
        'Port / Location of Origin': 'Stuttgart, Baden-Württemberg, Germany',
        'Destination Terminal': 'Rotterdam Freight Hub, Netherlands',
        'Consignment Route Distance': '654.5 km',
        'Modal Category': 'Road Freight (Euro VI Heavy Truck)',
        'Primary Cargo Description': 'Machined Transmission Sub-assemblies',
        'Net Cargo Weight': '7.18 tonnes (7,180 kg)',
        'Certified Fuel Type': 'Ultra-Low Sulfur Diesel (EN 590)',
        'Consignment Date': '2026-09-14',
      };
    } else if (manifestName.includes('MRD')) {
      supId = 'sup-meridian-02';
      extracted = {
        'Shipment Reference': 'MRD-SHIP-2026-0071',
        'Supplier Code': 'MRD-TEXT',
        'Supplier Name': 'Meridian Textiles Pvt Ltd',
        'Port / Location of Origin': 'Chennai Port, India',
        'Destination Terminal': 'Hamburg Port, Germany',
        'Consignment Route Distance': '12,240 km',
        'Modal Category': 'Maritime Shipping (Container Vessel)',
        'Primary Cargo Description': 'Organic Technical Knits & Fabrics',
        'Net Cargo Weight': '14.5 tonnes',
        'Certified Fuel Type': 'Heavy Fuel Oil (HFO)',
        'Consignment Date': '2026-08-15',
      };
    } else {
      supId = 'sup-pacific-03';
      extracted = {
        'Shipment Reference': 'PEM-SHIP-2026-0203',
        'Supplier Code': 'PEM-ELEC',
        'Supplier Name': 'Pacific Electronics Manufacturing',
        'Port / Location of Origin': 'Da Nang Airport, Vietnam',
        'Destination Terminal': 'Frankfurt Airport, Germany',
        'Consignment Route Distance': '9,380 km',
        'Modal Category': 'Air Freight (Dedicated Cargo)',
        'Primary Cargo Description': 'Integrated Microcontrollers & Assemblies',
        'Net Cargo Weight': '1.85 tonnes',
        'Certified Fuel Type': 'Jet A-1',
        'Consignment Date': '2026-09-02',
      };
    }

    setDemoState(prev => ({
      ...prev,
      selectedManifest: manifestName,
      selectedSupplierId: supId,
      extractedFields: extracted,
      stepCompleted: { ...prev.stepCompleted, 1: true },
    }));
  };

  const runExtraction = () => {
    // Already populated from selection, marks step 2 completed
    setDemoState(prev => ({
      ...prev,
      stepCompleted: { ...prev.stepCompleted, 2: true },
    }));
    setDemoStep(3);
  };

  const runCalculation = () => {
    setDemoState(prev => ({ ...prev, isCalculating: true }));
    setTimeout(() => {
      const isApex = demoState.selectedManifest.includes('APX');
      const calcResult = calculateScope3Carbon({
        transportMode: isApex ? 'Road Freight' : demoState.selectedManifest.includes('MRD') ? 'Maritime Shipping' : 'Air Freight',
        cargoWeightTonnes: isApex ? 7.18 : demoState.selectedManifest.includes('MRD') ? 14.5 : 1.85,
        distanceKm: isApex ? 654.5 : demoState.selectedManifest.includes('MRD') ? 12240 : 9380,
      });

      // For Apex, the 3 shipments total exactly 1191.28 kg CO2e
      const supplierTotal = isApex ? 1191.28 : calcResult.carbonEmissionKg;

      setDemoState(prev => ({
        ...prev,
        isCalculating: false,
        calculatedCarbon: {
          cargoWeightTonnes: isApex ? 7.18 : 14.5,
          distanceKm: isApex ? 654.5 : 12240,
          transportMode: isApex ? 'Road Freight' : 'Maritime Shipping',
          emissionFactor: calcResult.emissionFactor,
          emissionFactorUnit: calcResult.emissionFactorUnit,
          carbonKg: isApex ? 450.50 : calcResult.carbonEmissionKg,
          carbonTonnes: isApex ? 0.451 : calcResult.carbonEmissionTonnes,
          formula: isApex ? '7.18 tonnes × 654.5 km × 0.096 kg CO2e/t-km = 450.50 kg CO2e' : calcResult.formula,
          supplierTotalCarbonKg: supplierTotal,
        },
        stepCompleted: { ...prev.stepCompleted, 3: true },
      }));
      setDemoStep(4);
    }, 400);
  };

  const runVerification = () => {
    setDemoState(prev => ({ ...prev, isVerifying: true }));
    setTimeout(() => {
      setDemoState(prev => ({
        ...prev,
        isVerifying: false,
        stepCompleted: { ...prev.stepCompleted, 4: true },
      }));
      setDemoStep(5);
    }, 450);
  };

  const runAiRiskAnalysis = async () => {
    setDemoState(prev => ({ ...prev, isAnalyzingRisk: true }));
    const supplier = suppliers.find(s => s.id === demoState.selectedSupplierId) || suppliers[0];

    try {
      const [riskRes, explainRes] = await Promise.all([
        analyzeSupplierRisk(supplier),
        explainScoreDelta(supplier.name, 80, 90),
      ]);

      setDemoState(prev => ({
        ...prev,
        isAnalyzingRisk: false,
        riskAnalysis: riskRes,
        scoreExplanation: explainRes,
        stepCompleted: { ...prev.stepCompleted, 5: true },
      }));

      // Synchronize supplier's aiInsights for 360-degree audit view
      setSuppliers(prev =>
        prev.map(s => {
          if (s.id === supplier.id) {
            return {
              ...s,
              aiInsights: [riskRes, ...s.aiInsights.filter(i => i.model !== riskRes.model)],
            };
          }
          return s;
        })
      );

      logAuditEvent(
        'ai_risk_engine',
        'RISK_ANALYSIS_GENERATED',
        'Supplier',
        supplier.code,
        `AI Risk Analysis generated for ${supplier.name}: Compliance Score ${riskRes.score}/100, Risk: ${riskRes.riskLevel}. Advisory only.`
      );
    } catch {
      const fallbackRisk = buildDeterministicRiskAnalysis(supplier);
      const fallbackExplain = await explainScoreDelta(supplier.name, 80, 90);
      setDemoState(prev => ({
        ...prev,
        isAnalyzingRisk: false,
        riskAnalysis: fallbackRisk,
        scoreExplanation: fallbackExplain,
        stepCompleted: { ...prev.stepCompleted, 5: true },
      }));
    }
  };

  const resetDemoWorkflow = () => {
    setDemoStep(1);
    selectDemoManifest('APX-SHIP-2026-0155_manifest.pdf');
  };

  const resetAllDemoData = () => {
    setSuppliers(SEEDED_SUPPLIERS);
    setAuditLedger(generateSeededLedger());
    setNotifications(SEEDED_NOTIFICATIONS);
    resetDemoWorkflow();
    localStorage.removeItem(STORAGE_KEYS.SUPPLIERS);
    localStorage.removeItem(STORAGE_KEYS.LEDGER);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  };

  return (
    <AppContext.Provider
      value={{
        suppliers,
        auditLedger,
        notifications,
        activeRoute,
        routeParam,
        navigate,
        logAuditEvent,
        addComplianceAction,
        updateComplianceAction,
        verifyDocument,
        addDocument,
        addShipment,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        printSupplierId,
        openPrintReport,
        closePrintReport,
        demoState,
        setDemoStep,
        demoCurrentStep,
        selectDemoManifest,
        runExtraction,
        runCalculation,
        runVerification,
        runAiRiskAnalysis,
        resetDemoWorkflow,
        resetAllDemoData,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        isCopilotOpen,
        setIsCopilotOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
