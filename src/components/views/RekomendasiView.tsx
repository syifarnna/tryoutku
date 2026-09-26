import React, { useState } from 'react';
import { Award, Compass, GraduationCap, Layers, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '@/components/ui/badge';
import { RecomBestView } from './RecomBestView';
import { RecomAlternativesView } from './RecomAlternativesView';

interface RekomendasiViewProps {
  setActiveTab?: (tab: string) => void;
  initialTab?: 'best' | 'alt';
}

type RekomendasiTab = 'best' | 'alt';

const TABS: { id: RekomendasiTab; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'best', label: 'Rekomendasi Prodi Terbaik', desc: 'Prodi yang memenuhi nilai & rumpun minat Anda', icon: Award },
  { id: 'alt', label: 'Institut Alternatif Sesuai Skor', desc: 'Kampus cadangan dengan passing grade aman', icon: Compass },
];

export const RekomendasiView: React.FC<RekomendasiViewProps> = ({ setActiveTab, initialTab = 'best' }) => {
  const [tab, setTab] = useState<RekomendasiTab>(initialTab);
  const target = setActiveTab ?? (() => {});

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header merged */}
      <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 bg-linear-to-r from-emerald-600 via-teal-700 to-sky-700 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <Badge className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-xs border-0 text-white hover:bg-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Rekomendasi Terpadu — Nilai Tryout ⊕ Tes Minat &amp; Bakat</span>
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Rekomendasi Prodi &amp; Institut Alternatif</h2>
          <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed">
            Satu halaman untuk melihat <strong>prodi terbaik</strong> yang sesuai nilai dan minat Anda, sekaligus <strong>kampus alternatif</strong> yang passing grade-nya realistis terhadap skor tryout terakhir.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 hidden lg:flex items-center justify-center opacity-10 pointer-events-none pr-6">
          <GraduationCap className="w-72 h-72" />
        </div>
      </div>

      {/* Tab switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TABS.map(t => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3',
                isActive
                  ? 'bg-card border-primary/50 dark:border-primary/60 shadow-md ring-1 ring-primary/20'
                  : 'bg-card/50 border-slate-200 dark:border-border hover:border-primary/40 hover:bg-card'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                isActive ? 'bg-primary text-primary-foreground' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className={cn('font-bold text-sm truncate', isActive ? 'text-primary' : 'text-slate-800 dark:text-white')}>{t.label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{t.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Content per tab */}
      {tab === 'best' ? (
        <RecomBestView setActiveTab={target} />
      ) : (
        <RecomAlternativesView setActiveTab={target} />
      )}
    </div>
  );
};