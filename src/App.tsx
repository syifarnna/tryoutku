/**
 * @license TryoutKu - Sneat Bootstrap Admin Platform
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAppState } from './lib/store';
import { Tryout } from './types';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { SupabaseSqlModal } from './components/modals/SupabaseSqlModal';
import { TakeTryoutModal } from './components/modals/TakeTryoutModal';
import { AuthView } from './components/views/AuthView';
import { DashboardView } from './components/views/DashboardView';
import { TryoutsView } from './components/views/TryoutsView';
import { AnalysisPassingView } from './components/views/AnalysisPassingView';
import { AnalysisCompView } from './components/views/AnalysisCompView';
import { TargetMajorsView } from './components/views/TargetMajorsView';
import { RecomAlternativesView } from './components/views/RecomAlternativesView';
import { RecomTutorsView } from './components/views/RecomTutorsView';
import { ReportsView } from './components/views/ReportsView';
import { ProfileView } from './components/views/ProfileView';
import { SupabaseSqlView } from './components/views/SupabaseSqlView';
import { ChangePasswordView } from './components/views/ChangePasswordView';

import { AdminDashboardView } from './components/views/admin/AdminDashboardView';
import { AdminTryoutsView } from './components/views/admin/AdminTryoutsView';
import { AdminMajorsView } from './components/views/admin/AdminMajorsView';
import { AdminTutorsView } from './components/views/admin/AdminTutorsView';
import { AdminResultsView } from './components/views/admin/AdminResultsView';
import { AdminUsersView } from './components/views/admin/AdminUsersView';
import { TooltipProvider } from './components/ui/tooltip';

export default function App() {
  const state = useAppState();
  
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tryoutku_theme_dark') === 'true';
    }
    return false;
  });
  const [activeTryoutModal, setActiveTryoutModal] = useState<Tryout | null>(null);

  const handleSetDarkMode = (val: boolean) => {
    setIsDarkMode(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tryoutku_theme_dark', String(val));
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleOpenSqlModal = () => setIsSqlModalOpen(true);
    window.addEventListener('open-sql-modal', handleOpenSqlModal);
    return () => window.removeEventListener('open-sql-modal', handleOpenSqlModal);
  }, []);

  if (!state.isLoggedIn) {
    return (
      <TooltipProvider>
        <AuthView />
        <SupabaseSqlModal isOpen={isSqlModalOpen} onClose={() => setIsSqlModalOpen(false)} />
      </TooltipProvider>
    );
  }

  const isProfileComplete = state.profile.is_profile_complete;
  const mustChangePassword = state.profile.must_change_password;

  const handleTakeTryout = (tryout: Tryout) => {
    setActiveTryoutModal(tryout);
  };

  const renderActiveView = () => {
    if (mustChangePassword) {
      return <ChangePasswordView />;
    }
    if (!isProfileComplete) {
      return (
        <div className="pt-8 animate-in fade-in zoom-in-95 duration-500 max-w-4xl mx-auto px-4">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              ⚠️
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-800 dark:text-amber-500">Lengkapi Data Diri Anda</h4>
              <p className="text-xs text-amber-700 dark:text-amber-600">Sebelum memulai tryout, pastikan seluruh data diri dan NISN Anda telah terisi dengan benar.</p>
            </div>
          </div>
          <ProfileView />
        </div>
      );
    }
    if (state.profile.role === 'admin') {
      switch (activeTab) {
        case 'dashboard':
          return <AdminDashboardView setActiveTab={setActiveTab} />;
        case 'admin_tryouts':
          return <AdminTryoutsView />;
        case 'admin_majors':
          return <AdminMajorsView />;
        case 'admin_tutors':
          return <AdminTutorsView />;
        case 'admin_results':
          return <AdminResultsView />;
        case 'admin_users':
          return <AdminUsersView />;
        case 'profile':
          return <ProfileView />;
        case 'supabase_cfg':
          return <SupabaseSqlView />;
        default:
          return <AdminDashboardView setActiveTab={setActiveTab} />;
      }
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onTakeTryout={handleTakeTryout} setActiveTab={setActiveTab} />;
      case 'tryouts':
        return <TryoutsView onTakeTryout={handleTakeTryout} defaultSubTab="list" />;
      case 'results':
        return <TryoutsView onTakeTryout={handleTakeTryout} defaultSubTab="history" />;
      case 'analysis_passing':
        return <AnalysisPassingView setActiveTab={setActiveTab} />;
      case 'analysis_comp':
        return <AnalysisCompView />;
      case 'target_majors':
        return <TargetMajorsView />;
      case 'recom_alternatives':
        return <RecomAlternativesView setActiveTab={setActiveTab} />;
      case 'recom_tutors':
        return <RecomTutorsView />;
      case 'reports':
        return <ReportsView />;
      case 'profile':
        return <ProfileView />;
      case 'supabase_cfg':
        if (state.profile.role !== 'admin') {
          return (
            <div className="p-8 text-center bg-card dark:bg-card rounded-2xl border border-border space-y-4 max-w-lg mx-auto mt-12 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto text-xl">
                🔒
              </div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">Akses Khusus Administrator</h3>
              <p className="text-xs text-slate-500 dark:text-[#777] leading-relaxed">
                Akun Anda bertindak sebagai <span className="font-bold text-indigo-600 dark:text-indigo-400">Peserta Tryout</span>. Hak pengubahan skema SQL, eksekusi DDL, maupun konfigurasi koneksi Live Supabase dibatasi hanya untuk Administrator.
              </p>
              <button onClick={() => setActiveTab('dashboard')} className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all cursor-pointer">
                Kembali ke Dashboard
              </button>
            </div>
          );
        }
        return <SupabaseSqlView />;
      default:
        return <DashboardView onTakeTryout={handleTakeTryout} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <TooltipProvider>
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-background text-foreground' : 'bg-[#FAFAFC] text-slate-700'} font-sans selection:bg-primary selection:text-primary-foreground flex transition-colors duration-200`}>
      
      {/* Sneat Admin Sidebar */}
      {isProfileComplete && !mustChangePassword && (
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen}
          onOpenSqlModal={() => setActiveTab('supabase_cfg')}
        />
      )}

      {/* Main Page Layout Container */}
      <div className={`flex-1 ${(isProfileComplete && !mustChangePassword) ? 'lg:pl-64' : ''} flex flex-col min-w-0`}>
        
        {/* Top Sticky Navbar */}
        <Navbar 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenSqlModal={() => setActiveTab('supabase_cfg')}
          isDarkMode={isDarkMode}
          setIsDarkMode={handleSetDarkMode}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Dynamic Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>

        {/* Minimalist Footer */}
        <Footer />

      </div>

      {/* Modals */}
      <SupabaseSqlModal 
        isOpen={isSqlModalOpen} 
        onClose={() => setIsSqlModalOpen(false)} 
      />

      <TakeTryoutModal 
        tryout={activeTryoutModal} 
        isOpen={!!activeTryoutModal} 
        onClose={() => setActiveTryoutModal(null)}
        onFinished={() => {
          setActiveTryoutModal(null);
          setActiveTab('analysis_passing');
        }}
      />

    </div>
    </TooltipProvider>
  );
}

