import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import TopHeader from './components/layout/TopHeader';
import DashboardPage from './pages/DashboardPage';
import AnalyzePage from './pages/AnalyzePage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import AIAssistantDrawer from './components/assistant/AIAssistantDrawer';
import Footer from './components/common/Footer';
import { checkBackendHealth, getStoredSession, clearSession } from './services/api';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const session = getStoredSession();
    return Boolean(session && session.user);
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const session = getStoredSession();
    return session?.user || null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendStatus, setBackendStatus] = useState({ online: false, message: 'Checking...' });
  const [activeResultRecord, setActiveResultRecord] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Enforce clean light/white theme across the app
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

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    clearSession();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const handleNavigateAnalyze = (tab = 'analyze') => {
    setActiveResultRecord(null);
    setActiveTab(tab);
  };

  const handleViewHistoryRecord = (record) => {
    const full = record.fullRecord || record;
    setActiveResultRecord(full);
    setActiveTab('analyze');
  };

  // If user is unauthenticated, render full screen LoginPage
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900 font-sans flex flex-col relative">

      
      {/* Sidebar Shell */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Wrapper */}
      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen">
        
        {/* Top Header */}
        <TopHeader 
          activeTab={activeTab}
          backendStatus={backendStatus}
          onRefreshHealth={fetchHealth}
          onToggleMobile={() => setMobileOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenAssistant={() => setIsAssistantOpen(true)}
        />

        {/* Main Content Pages */}
        <main className="flex-1 pb-12">
          {activeTab === 'dashboard' && (
            <DashboardPage 
              onNavigateAnalyze={() => handleNavigateAnalyze('analyze')}
              onViewHistoryRecord={handleViewHistoryRecord}
              onOpenAssistant={() => setIsAssistantOpen(true)}
            />
          )}

          {activeTab === 'analyze' && (
            <AnalyzePage 
              initialResultData={activeResultRecord}
              onClearActiveResult={() => setActiveResultRecord(null)}
              onOpenAssistant={() => setIsAssistantOpen(true)}
              onUpdateCurrentRecord={(rec) => setActiveResultRecord(rec)}
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

        {/* Uiverse.io Styled Floating Quick Trigger for AI Investigator */}
        <button
          onClick={() => setIsAssistantOpen(true)}
          title="Open Trust Vision AI Investigator"
          className="fixed bottom-6 right-6 z-40 uiverse-ai-btn"
        >
          <div className="button-outer">
            <div className="button-inner">
              <span>
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="hidden sm:inline">✨ AI Investigator</span>
              </span>
            </div>
          </div>
        </button>


        {/* AI Assistant Drawer Component */}
        <AIAssistantDrawer 
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
          currentRecord={activeResultRecord}
        />

        {/* Footer */}
        <Footer />

      </div>

    </div>
  );
}


