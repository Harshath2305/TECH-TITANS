import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

// Views
import { DashboardView } from './views/DashboardView';
import { DemoVerificationView } from './views/DemoVerificationView';
import { SuppliersView } from './views/SuppliersView';
import { SupplierDetailView } from './views/SupplierDetailView';
import { CompareSuppliersView } from './views/CompareSuppliersView';
import { DocumentVerificationView } from './views/DocumentVerificationView';
import { ShipmentAnalysisView } from './views/ShipmentAnalysisView';
import { CarbonCalculatorView } from './views/CarbonCalculatorView';
import { ComplianceCenterView } from './views/ComplianceCenterView';
import { ComplianceActionTrackerView } from './views/ComplianceActionTrackerView';
import { IntegrityDatabaseView } from './views/IntegrityDatabaseView';
import { PrintableReportView } from './views/PrintableReportView';
import { AnomalyDetectionView } from './views/AnomalyDetectionView';
import { WhatIfSimulatorView } from './views/WhatIfSimulatorView';
import { SupplierRiskHeatmapView } from './views/SupplierRiskHeatmapView';
import { EvidenceContradictionsView } from './views/EvidenceContradictionsView';
import { DigitalTwinView } from './views/DigitalTwinView';
import { AutonomousInvestigationView } from './views/AutonomousInvestigationView';
import { CopilotDrawer } from './components/copilot/CopilotDrawer';
import { ExecutiveRiskBriefModal } from './components/common/ExecutiveRiskBriefModal';

const MainContent: React.FC = () => {
  const { activeRoute, navigate, isCopilotOpen, setIsCopilotOpen, isExecutiveBriefOpen, setIsExecutiveBriefOpen } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync hash routing with app navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash) {
        const parts = hash.split('/');
        navigate(parts[0], parts[1]);
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when activeRoute changes
  useEffect(() => {
    const targetHash = `#/${activeRoute}`;
    if (window.location.hash !== targetHash) {
      window.history.replaceState(null, '', targetHash);
    }
  }, [activeRoute]);

  const renderActiveView = () => {
    switch (activeRoute) {
      case 'dashboard':
        return <DashboardView />;
      case 'demo-verification':
        return <DemoVerificationView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'supplier-detail':
        return <SupplierDetailView />;
      case 'compare':
        return <CompareSuppliersView />;
      case 'documents':
        return <DocumentVerificationView />;
      case 'shipments':
        return <ShipmentAnalysisView />;
      case 'carbon':
        return <CarbonCalculatorView />;
      case 'compliance':
        return <ComplianceCenterView />;
      case 'actions':
        return <ComplianceActionTrackerView />;
      case 'integrity':
        return <IntegrityDatabaseView />;
      case 'anomalies':
        return <AnomalyDetectionView />;
      case 'simulator':
        return <WhatIfSimulatorView />;
      case 'heatmap':
        return <SupplierRiskHeatmapView />;
      case 'contradictions':
        return <EvidenceContradictionsView />;
      case 'digital-twin':
        return <DigitalTwinView />;
      case 'investigations':
        return <AutonomousInvestigationView />;
      case 'print-report':
        return <PrintableReportView />;
      default:
        return <DashboardView />;
    }
  };

  const isPrintMode = activeRoute === 'print-report';

  return (
    <div className="min-h-screen dark-enterprise-bg text-slate-100 flex font-sans selection:bg-teal-500 selection:text-white relative overflow-x-hidden">
      {/* Background ambient light orbs for depth */}
      <div className="fixed top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed top-[30%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-500/4 blur-[130px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/3 blur-[140px] pointer-events-none -z-10" />

      {/* Sidebar (Hidden when printing) */}
      {!isPrintMode && (
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Container */}
      <div className={`flex-1 flex flex-col min-w-0 ${!isPrintMode ? 'lg:pl-64' : ''}`}>
        {/* Topbar (Hidden when printing) */}
        {!isPrintMode && (
          <Topbar onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />
        )}

        {/* View Content Viewport */}
        <main className={`flex-1 ${!isPrintMode ? 'p-4 sm:p-6 lg:p-8' : 'p-4 print:p-0'}`}>
          {renderActiveView()}
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal />

      {/* Enterprise Supply Chain Copilot Drawer */}
      <CopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />

      {/* Global Executive Risk Brief Modal */}
      <ExecutiveRiskBriefModal
        isOpen={isExecutiveBriefOpen}
        onClose={() => setIsExecutiveBriefOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
