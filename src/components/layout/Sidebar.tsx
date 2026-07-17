import React from 'react';
import { 
  BarChart3, 
  BookOpen, 
  Compass, 
  FileText, 
  GraduationCap, 
  LayoutDashboard, 
  LogOut, 
  Settings, 
  Target, 
  TrendingUp, 
  Award,
  Database,
  Users
} from 'lucide-react';
import { appStore, useAppState } from '../../lib/store';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onOpenSqlModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isOpen, 
  setIsOpen,
  onOpenSqlModal 
}) => {
  const state = useAppState();

  const menuSections = state.profile.role === 'admin' ? [
    {
      title: 'MENU UTAMA ADMIN',
      items: [
        { id: 'dashboard', label: 'Dashboard Admin', icon: LayoutDashboard, badge: '' }
      ]
    },
    {
      title: 'MANAJEMEN UJIAN',
      items: [
        { id: 'admin_tryouts', label: 'Kelola Tryout', icon: BookOpen, badge: '' }
      ]
    },
    {
      title: 'MANAJEMEN DATA',
      items: [
        { id: 'admin_users', label: 'Daftar Pengguna', icon: Users, badge: '' },
        { id: 'admin_majors', label: 'Kelola Prodi / Kampus', icon: Target, badge: '' },
        { id: 'admin_tutors', label: 'Kelola Saran Bimbel', icon: BookOpen, badge: '' },
        { id: 'admin_results', label: 'Leaderboard Nasional', icon: Award, badge: '' }
      ]
    },
    {
      title: 'PENGATURAN SYSTEM',
      items: [
        { id: 'profile', label: 'Profil Admin', icon: Settings, badge: '' },
        { id: 'supabase_cfg', label: 'Supabase SQL Blueprint', icon: Database, badge: 'SQL', isSpecial: true }
      ]
    }
  ] : [
    {
      title: 'MENU UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: '' }
      ]
    },
    {
      title: 'SIMULASI UJIAN',
      items: [
        { id: 'tryouts', label: 'Daftar Tryout', icon: BookOpen, badge: 'Baru' },
        { id: 'results', label: 'Hasil Tryout Saya', icon: Award, badge: `${state.results.length}` }
      ]
    },
    {
      title: 'ANALISIS NILAI (INTI)',
      items: [
        { id: 'analysis_passing', label: 'Perbandingan Passing Grade', icon: TrendingUp, badge: 'Kritis' },
        { id: 'analysis_comp', label: 'Analisis Kompetensi', icon: BarChart3, badge: '' }
      ]
    },
    {
      title: 'TARGET & REKOMENDASI',
      items: [
        { id: 'target_majors', label: 'Target Institut Saya', icon: Target, badge: `${state.targetMajorIds.length}` },
        { id: 'recom_alternatives', label: 'Rekomendasi Alternatif', icon: Compass, badge: 'Aman' },
        { id: 'recom_tutors', label: 'Rekomendasi Les/Bimbel', icon: GraduationCap, badge: 'Solusi' }
      ]
    },
    {
      title: 'LAPORAN',
      items: [
        { id: 'reports', label: 'Laporan Komprehensif', icon: FileText, badge: 'PDF' }
      ]
    },
    {
      title: 'PENGATURAN',
      items: [
        { id: 'profile', label: 'Profil Siswa', icon: Settings, badge: '' }
      ]
    }
  ];

  const handleNavClick = (item: any) => {
    setActiveTab(item.id);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-[#000000] border-r border-slate-100 dark:border-[#141414] flex flex-col transition-transform duration-300 ease-in-out shadow-xs
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-[#141414] gap-3">
          <div className="w-8 h-8 rounded-md bg-[#FF6B6B] flex items-center justify-center text-white font-bold shadow-xs">
            TK
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">
              Tryout<span className="text-[#FF6B6B]">Ku</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              Sneat Admin
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
          {menuSections.map((sec, idx) => (
            <div key={idx}>
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-[#a1acb8] mb-2">
                {sec.title}
              </p>
              <ul className="space-y-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id && !item.isSpecial;

                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleNavClick(item)}
                        className={`
                          w-full flex items-center justify-between px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-150 group
                          ${isActive 
                            ? 'bg-[#FFE0E0] dark:bg-[#FF6B6B]/20 text-[#FF6B6B] font-semibold' 
                            : 'text-[#566a7f] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1C1C1C]/80'}
                          ${item.isSpecial ? 'border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100/60' : ''}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 opacity-80 ${isActive ? 'text-[#FF6B6B] opacity-100' : item.isSpecial ? 'text-amber-600 dark:text-amber-400' : 'text-[#a1acb8] group-hover:text-[#566a7f]'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`
                            text-[11px] px-2 py-0.5 rounded-md font-semibold uppercase
                            ${isActive 
                              ? 'bg-[#FF6B6B]/15 text-[#FF6B6B]' 
                              : item.badge === 'Kritis' 
                                ? 'bg-rose-100 text-[#F43F5E] dark:bg-rose-950 dark:text-rose-400' 
                                : item.badge === 'Solusi'
                                  ? 'bg-[#D1FAE5] text-[#4D5DFB] dark:bg-emerald-950 dark:text-emerald-400'
                                  : 'bg-slate-100 text-[#566a7f] dark:bg-[#141414] dark:text-slate-300'}
                          `}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-[#141414] bg-slate-50/50 dark:bg-[#000000]">
          <div className="flex items-center gap-3 mb-3 px-1">
            <img 
              src={state.profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${state.profile.full_name || 'User'}`} 
              alt={state.profile.full_name || 'User'} 
              className="w-10 h-10 rounded-full object-cover border-2 border-[#FF6B6B]" 
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                {state.profile.full_name}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {state.profile.role === 'admin' ? '👑 Administrator' : '🎓 Peserta'} • {state.profile.school}
              </p>
            </div>
          </div>
          <button
            onClick={() => appStore.logout()}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar (Logout)
          </button>
        </div>
      </aside>
    </>
  );
};
