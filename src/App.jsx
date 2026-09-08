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
  const [btnPos, setBtnPos] = useState(null);

  const isDraggingRef = React.useRef(false);
  const dragStartRef = React.useRef({ x: 0, y: 0 });
  const initialPosRef = React.useRef({ x: 0, y: 0 });
  const hasMovedRef = React.useRef(false);
  const buttonRef = React.useRef(null);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const elem = buttonRef.current;
    if (!elem) return;

    const rect = elem.getBoundingClientRect();
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPosRef.current = { x: rect.left, y: rect.top };

    const onMouseMove = (ev) => {
      if (!isDraggingRef.current) return;
      const dx = ev.clientX - dragStartRef.current.x;
      const dy = ev.clientY - dragStartRef.current.y;

      if (Math.hypot(dx, dy) > 4) {
        hasMovedRef.current = true;
      }

      let newX = initialPosRef.current.x + dx;
      let newY = initialPosRef.current.y + dy;

      const width = rect.width || 170;
      const height = rect.height || 48;
      const maxX = window.innerWidth - width - 12;
      const maxY = window.innerHeight - height - 12;

      newX = Math.max(12, Math.min(newX, maxX));
      newY = Math.max(12, Math.min(newY, maxY));

      setBtnPos({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const elem = buttonRef.current;
    if (!elem) return;

    const rect = elem.getBoundingClientRect();
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    initialPosRef.current = { x: rect.left, y: rect.top };

    const onTouchMove = (ev) => {
      if (!isDraggingRef.current || ev.touches.length !== 1) return;
      const t = ev.touches[0];
      const dx = t.clientX - dragStartRef.current.x;
      const dy = t.clientY - dragStartRef.current.y;

      if (Math.hypot(dx, dy) > 4) {
        hasMovedRef.current = true;
      }

      let newX = initialPosRef.current.x + dx;
      let newY = initialPosRef.current.y + dy;

      const width = rect.width || 170;
      const height = rect.height || 48;
      const maxX = window.innerWidth - width - 12;
      const maxY = window.innerHeight - height - 12;

      newX = Math.max(12, Math.min(newX, maxX));
      newY = Math.max(12, Math.min(newY, maxY));

      setBtnPos({ x: newX, y: newY });
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
  };

  const handleButtonClick = (e) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setIsAssistantOpen(true);
  };

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

        {/* Movable & Draggable Uiverse.io Styled Floating Quick Trigger for AI Investigator */}
        <button
          ref={buttonRef}
          style={
            btnPos
              ? { left: `${btnPos.x}px`, top: `${btnPos.y}px`, bottom: 'auto', right: 'auto' }
              : {}
          }
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={handleButtonClick}
          title="Drag to move anywhere, click to open AI Investigator"
          className={`uiverse-ai-btn fixed z-40 ${!btnPos ? 'bottom-6 right-6' : ''}`}
        >
          <div className="button-outer">
            <div className="button-inner">
              <div className="button-text">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>AI Investigator</span>
              </div>
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


