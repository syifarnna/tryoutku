import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Database, 
  Menu, 
  Moon, 
  Search, 
  Sun, 
  User, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { useAppState } from '../../lib/store';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenSqlModal: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenSqlModal,
  isDarkMode,
  setIsDarkMode,
  activeTab,
  setActiveTab
}) => {
  const state = useAppState();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const notifications = [
    {
      id: 1,
      title: 'Analisis Passing Grade Diperbarui',
      desc: 'Skor simulasi Episode 2 telah dikomparasi dengan STEI ITB.',
      time: '10 menit lalu',
      type: 'info'
    },
    {
      id: 2,
      title: 'Defisit Skor Literasi Inggris',
      desc: 'Anda butuh +70 poin di LBE untuk aman di Kedokteran UI.',
      time: '2 jam lalu',
      type: 'warning'
    },
    {
      id: 3,
      title: 'Rekomendasi Les Baru Tersedia',
      desc: 'Supercamp English Batch 5 cocok untuk menutup gap Anda.',
      time: '1 hari lalu',
      type: 'success'
    }
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-8 bg-white/80 dark:bg-[#000000]/80 backdrop-blur-md border-b border-slate-100 dark:border-[#141414] shadow-2xs">
      {/* Left section: Mobile menu & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button 
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1C1C1C] lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari tryout, universitas target, passing grade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-[#000000] border border-transparent focus:border-[#FF6B6B] dark:focus:border-[#FF6B6B] rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right section: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-3.5 ms-4">
        {/* Supabase Status Trigger (Khusus Admin) */}
        {state.profile.role === 'admin' && (
          <button
            onClick={onOpenSqlModal}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors text-xs font-semibold cursor-pointer"
            title="Konfigurasi Supabase Authentication & Database SQL"
          >
            <Database className="w-3.5 h-3.5 text-[#FF6B6B]" />
            <span>{state.useRealSupabase ? 'Supabase Connected' : 'Supabase (Demo Mode)'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1C1C1C] transition-colors relative"
          title={isDarkMode ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1C1C1C] transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#000000] rounded-2xl shadow-xl border border-slate-100 dark:border-[#141414] py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100 dark:border-[#141414]">
                <span className="font-bold text-sm text-slate-800 dark:text-white">Pemberitahuan Analisis</span>
                <span className="text-[10px] bg-[#FF6B6B]/10 text-[#FF6B6B] font-bold px-2 py-0.5 rounded-full">3 Baru</span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/50">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-4 hover:bg-slate-50 dark:hover:bg-[#1C1C1C]/50 transition-colors cursor-pointer" onClick={() => { setActiveTab('analysis_passing'); setShowNotifications(false); }}>
                    <div className="flex gap-3">
                      <div className={`mt-0.5 p-2 rounded-xl h-fit ${notif.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'}`}>
                        {notif.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-white mb-0.5">{notif.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-[#777] leading-relaxed mb-1">{notif.desc}</p>
                        <span className="text-[10px] text-slate-400">{notif.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            className="flex items-center gap-2.5 p-1 rounded-full hover:ring-2 hover:ring-[#FF6B6B]/40 transition-all"
          >
            <img 
              src={state.profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${state.profile.full_name || 'User'}`} 
              alt={state.profile.full_name || 'User'} 
              className="w-9 h-9 rounded-full object-cover border-2 border-[#FFE0E0] dark:border-[#FF6B6B]" 
            />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#000000] rounded-2xl shadow-xl border border-slate-100 dark:border-[#141414] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-[#141414] mb-1">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{state.profile.full_name}</p>
                <p className="text-[11px] text-slate-400 truncate mb-1.5">{state.profile.email}</p>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase ${state.profile.role === 'admin' ? 'bg-[#FF6B6B]/15 text-[#FF6B6B]' : 'bg-slate-100 dark:bg-[#141414] text-slate-600 dark:text-slate-300'}`}>
                  {state.profile.role === 'admin' ? '👑 Administrator' : '🎓 Peserta Siswa'}
                </span>
              </div>
              <button
                onClick={() => { setActiveTab('profile'); setShowProfileMenu(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1C1C1C] cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                Profil Saya & Pengaturan
              </button>
              {state.profile.role === 'admin' && (
                <button
                  onClick={() => { onOpenSqlModal(); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1C1C1C] cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-[#FF6B6B]" />
                  Supabase SQL Blueprint
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
