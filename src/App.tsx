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

const MainContent: React.FC = () => {
  const { activeRoute, navigate } = useApp();
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
      case 'print-report':
        return <PrintableReportView />;
      default:
        return <DashboardView />;
    }
  };

  const isPrintMode = activeRoute === 'print-report';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans selection:bg-teal-500 selection:text-white">
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
