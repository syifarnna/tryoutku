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
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

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
    <TooltipProvider>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-[#000000] border-r border-slate-100 dark:border-[#141414] flex flex-col transition-transform duration-300 ease-in-out shadow-xs",
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-[#141414] gap-3">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-xs">
            TK
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">
              Tryout<span className="text-primary">Ku</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              Sneat Admin
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <ScrollArea className="flex-1 py-4 px-4">
          <div className="space-y-6">
            {menuSections.map((sec, idx) => (
              <div key={idx}>
                <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {sec.title}
                </p>
                <ul className="space-y-1">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id && !item.isSpecial;

                    return (
                      <li key={item.id}>
                        <Tooltip>
                          <TooltipTrigger render={
                            <Button
                              variant="ghost"
                              onClick={() => handleNavClick(item)}
                              className={cn(
                                "w-full justify-between px-4 py-2.5 h-auto rounded-md text-sm font-medium",
                                isActive && 'bg-primary/10 text-primary font-semibold hover:bg-primary/15',
                                item.isSpecial && 'border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100/60',
                                !isActive && !item.isSpecial && 'text-muted-foreground hover:bg-muted hover:text-foreground'
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className={cn(
                                  "w-5 h-5 transition-transform group-hover:scale-105 opacity-80",
                                  isActive && 'text-primary opacity-100',
                                  item.isSpecial && 'text-amber-600 dark:text-amber-400',
                                  !isActive && !item.isSpecial && 'text-muted-foreground group-hover:text-foreground'
                                )} />
                                <span className="truncate">{item.label}</span>
                              </div>
                              {item.badge && (
                                <Badge
                                  variant={isActive ? 'default' : 'secondary'}
                                  className={cn(
                                    "text-[11px] px-2 py-0.5 rounded-md font-semibold uppercase",
                                    isActive && 'bg-primary/15 text-primary',
                                    !isActive && item.badge === 'Kritis' && 'bg-rose-100 text-[#F43F5E] dark:bg-rose-950 dark:text-rose-400',
                                    !isActive && item.badge === 'Solusi' && 'bg-[#D1FAE5] text-secondary dark:bg-emerald-950 dark:text-emerald-400',
                                    !isActive && item.badge !== 'Kritis' && item.badge !== 'Solusi' && 'bg-muted text-muted-foreground'
                                  )}
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </Button>
                          } />
                          <TooltipContent side="right">
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator />

        {/* User Card & Logout */}
        <div className="p-4 bg-slate-50/50 dark:bg-[#000000]">
          <div className="flex items-center gap-3 mb-3 px-1">
            <Avatar size="lg" className="border-2 border-primary">
              <AvatarImage 
                src={state.profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${state.profile.full_name || 'User'}`} 
                alt={state.profile.full_name || 'User'} 
              />
              <AvatarFallback>
                {(state.profile.full_name || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                {state.profile.full_name}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {state.profile.role === 'admin' ? '👑 Administrator' : '🎓 Peserta'} • {state.profile.school}
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={() => appStore.logout()}
            className="w-full justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar (Logout)
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
};
