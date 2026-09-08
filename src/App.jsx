import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import TopHeader from './components/layout/TopHeader';
import DashboardPage from './pages/DashboardPage';
import AnalyzePage from './pages/AnalyzePage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import Footer from './components/common/Footer';
import { checkBackendHealth } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendStatus, setBackendStatus] = useState({ online: false, message: 'Checking...' });
  const [activeResultRecord, setActiveResultRecord] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Clear any lingering dark class or theme overrides
  useEffect(() => {
    try {
      document.documentElement.classList.remove('dark');
      localStorage.removeItem('trustvision_theme');
    } catch (e) {}
  }, []);

  const fetchHealth = async () => {
    const res = await checkBackendHealth();
    setBackendStatus(res);
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigateAnalyze = (tab = 'analyze') => {
    setActiveResultRecord(null);
    setActiveTab(tab);
  };

  const handleViewHistoryRecord = (record) => {
    const full = record.fullRecord || record;
    setActiveResultRecord(full);
    setActiveTab('analyze');
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900 font-sans flex flex-col">
      
      {/* Sidebar Shell */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Wrapper */}
      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen">
        
        {/* Top Header */}
        <TopHeader 
          activeTab={activeTab}
          backendStatus={backendStatus}
          onRefreshHealth={fetchHealth}
          onToggleMobile={() => setMobileOpen(true)}
        />

        {/* Main Content Pages */}
        <main className="flex-1 pb-12">
          {activeTab === 'dashboard' && (
            <DashboardPage 
              onNavigateAnalyze={() => handleNavigateAnalyze('analyze')}
              onViewHistoryRecord={handleViewHistoryRecord}
            />
          )}

          {activeTab === 'analyze' && (
            <AnalyzePage 
              initialResultData={activeResultRecord}
              onClearActiveResult={() => setActiveResultRecord(null)}
            />
          )}

          {activeTab === 'history' && (
            <HistoryPage 
              onViewRecord={handleViewHistoryRecord}
              onNavigateAnalyze={handleNavigateAnalyze}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage />
          )}
        </main>

        {/* Footer */}
        <Footer />

      </div>

    </div>
  );
}
