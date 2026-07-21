import React, { useState } from 'react';
import { Award, Check, Compass, Plus, Sparkles, Target, TrendingUp, ShieldCheck } from 'lucide-react';
import { appStore, useAppState } from '../../lib/store';
import { cn } from '../../lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface RecomAlternativesViewProps {
  setActiveTab: (tab: string) => void;
}

export const RecomAlternativesView: React.FC<RecomAlternativesViewProps> = ({ setActiveTab }) => {
  const state = useAppState();
  const [addedIds, setAddedIds] = useState<number[]>([]);

  const activeTargetMajorId = state.activeTargetMajorId || state.targetMajorIds[0] || 1;
  const summary = appStore.getAnalysis(activeTargetMajorId);

  if (!summary) return null;

  const handleAddTarget = (id: number) => {
    appStore.addTargetMajor(id);
    setAddedIds([...addedIds, id]);
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Header Info */}
      <div className="p-8 rounded-3xl bg-linear-to-r from-[#1A0F2E] to-[#1D1A3E] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <Badge className="bg-white/20 text-white border-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md h-auto px-3 py-1 gap-2">
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            <span>Fitur Inti: Kalkulator Peluang Lolos Alternatif</span>
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Rekomendasi Institut Alternatif Sesuai Skor Anda
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
            Skor capaian tryout terakhir Anda adalah <strong className="text-amber-300 font-extrabold text-base">{summary.latest_result.total_score}</strong>. Sistem telah mencocokkan program studi dari PTN ternama lainnya yang passing grade-nya berada di bawah atau setara nilai Anda agar Anda memiliki cadangan pilihan 100% realistis!
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 hidden lg:flex items-center justify-center opacity-10 pointer-events-none pr-6">
          <Target className="w-72 h-72" />
        </div>
      </div>

      {/* Alternatives Grid */}
      {summary.alternative_majors.length === 0 ? (
        <Card className="p-8 text-center ring-0 bg-white dark:bg-[#000000] border border-slate-100 dark:border-[#141414] shadow-sm gap-0">
          <p className="text-slate-500 dark:text-[#777]">Belum ada alternatif prodi dengan passing grade di bawah skor Anda saat ini ({summary.latest_result.total_score}). Terus tingkatkan skor tryout Anda!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summary.alternative_majors.map((altMajor) => {
            const isAlreadyTarget = state.targetMajorIds.includes(altMajor.id);
            const isRecentlyAdded = addedIds.includes(altMajor.id);

            let chanceColor = 'bg-emerald-500 text-white';
            let chanceLabel = 'Sangat Aman';
            if (altMajor.chance_percentage < 70) {
              chanceColor = 'bg-amber-500 text-white';
              chanceLabel = 'Moderat';
            } else if (altMajor.chance_percentage < 85) {
              chanceColor = 'bg-teal-500 text-white';
              chanceLabel = 'Peluang Besar';
            }

            return (
              <Card key={altMajor.id} className="p-6 rounded-3xl ring-0 bg-white dark:bg-[#000000] border border-slate-100 dark:border-[#141414] shadow-xs flex flex-col justify-between hover:shadow-md transition-all group gap-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] font-bold h-auto px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#000000] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#1C1C1C]">
                      {altMajor.cluster}
                    </Badge>
                    <Badge className={cn("text-xs font-black h-auto px-3 py-1 rounded-full shadow-xs", chanceColor)}>
                      {altMajor.chance_percentage}% {chanceLabel}
                    </Badge>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-[#FF6B6B] block">{altMajor.institution_name}</span>
                    <h3 className="font-bold text-base text-slate-800 dark:text-white mt-0.5 group-hover:text-[#FF6B6B] transition-colors leading-snug">
                      {altMajor.name}
                    </h3>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#000000] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Passing Grade Prodi:</span>
                      <span className="font-extrabold text-slate-800 dark:text-white">{altMajor.passing_grade_total}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Surplus Skor Anda:</span>
                      <span className={cn("font-black", altMajor.gap_diff >= 0 ? 'text-emerald-500' : 'text-amber-500')}>
                        {altMajor.gap_diff >= 0 ? '+' : ''}{altMajor.gap_diff} pts
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 dark:border-[#141414]/80">
                  <Button
                    onClick={() => !isAlreadyTarget && handleAddTarget(altMajor.id)}
                    disabled={isAlreadyTarget || isRecentlyAdded}
                    className={cn(
                      "w-full py-3 px-4 h-auto rounded-2xl text-xs font-bold gap-2",
                      (isAlreadyTarget || isRecentlyAdded)
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 hover:bg-emerald-50'
                        : 'bg-[#FF6B6B] text-white hover:bg-[#E85D5D] shadow-sm'
                    )}
                  >
                    {isAlreadyTarget || isRecentlyAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Masuk Daftar Target Anda</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>+ Jadikan Target Cadangan</span>
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
};
