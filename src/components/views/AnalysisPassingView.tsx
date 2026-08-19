import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Compass, 
  Download, 
  FileText, 
  GraduationCap, 
  Target, 
  TrendingUp, 
  Info,
  Sparkles
} from 'lucide-react';
import { appStore, useAppState } from '../../lib/store';
import { exportAnalysisPDF } from '../../lib/exportUtils';
import { cn } from '../../lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface AnalysisPassingViewProps {
  setActiveTab: (tab: string) => void;
}

export const AnalysisPassingView: React.FC<AnalysisPassingViewProps> = ({ setActiveTab }) => {
  const state = useAppState();

  const activeTargetMajorId = state.activeTargetMajorId || state.targetMajorIds[0] || 1;
  const summary = appStore.getAnalysis(activeTargetMajorId);

  if (!summary) {
    return (
      <div className="p-12 text-center bg-white dark:bg-card rounded-3xl border border-slate-100">
        <p className="text-sm text-slate-500">Belum ada hasil tryout yang tercatat. Silakan kerjakan tryout terlebih dahulu.</p>
        <Button 
          onClick={() => setActiveTab('tryouts')} 
          className="mt-4 px-5 py-2 h-auto rounded-xl bg-[#FF6B6B] text-white text-xs font-bold"
        >
          Mulai Tryout
        </Button>
      </div>
    );
  }

  const targetMajorsList = appStore.getTargetMajors();

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Top Target Selector & Export PDF Action */}
      <Card className="p-6 rounded-3xl ring-0 bg-white dark:bg-card border border-slate-100 dark:border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 gap-0">
        <div className="space-y-2 flex-1 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF6B6B] uppercase tracking-wider">
            <Target className="w-4 h-4" />
            <span>Pilih Program Studi Target Analisis</span>
          </div>
          <select
            value={summary?.target_major?.id || ''}
            onChange={(e) => appStore.setActiveTargetMajor(parseInt(e.target.value))}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-card border border-slate-200 dark:border-border font-bold text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#FF6B6B] shadow-2xs"
          >
            {targetMajorsList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.institution_name} (Passing Grade: {m.passing_grade_total})
              </option>
            ))}
          </select>
          <button 
            onClick={() => setActiveTab('target_majors')}
            className="text-[11px] font-bold text-[#FF6B6B] hover:underline block pt-1"
          >
            + Kelola Daftar Target Jurusan Impian Lainnya
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={() => exportAnalysisPDF(summary, state.profile.full_name)}
            className="px-5 py-3 h-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-[#FF6B6B] hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold gap-2 border border-indigo-200 dark:border-indigo-800"
          >
            <FileText className="w-4 h-4" />
            <span>Unduh PDF Analisis Lulus</span>
          </Button>
        </div>
      </Card>

      {/* Main Status Hero Card */}
      <div className={cn(
        "relative overflow-hidden rounded-3xl p-8 shadow-xl transition-all border",
        summary.is_passed_total 
          ? 'bg-linear-to-br from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-emerald-500/20' 
          : 'bg-linear-to-br from-[#111111] to-[#0A0A0A] text-white border-slate-700 shadow-slate-900/40'
      )}>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          <div className="md:col-span-2 space-y-4">
            <Badge className="inline-flex items-center gap-2 px-3.5 py-1 h-auto rounded-full bg-white/15 text-xs font-extrabold backdrop-blur-md uppercase tracking-wider text-white border-white/20">
              {summary.is_passed_total ? '🎉 Memenuhi Passing Grade' : '⚠️ Belum Memenuhi Passing Grade'}
            </Badge>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {summary.is_passed_total ? (
                <span>Selamat! Peluang Anda Sangat Besar</span>
              ) : (
                <span>Capaian Anda Masih Selisih {summary.total_gap > 0 ? '+' : ''}{summary.total_gap} Poin</span>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
              Skor total tryout terakhir Anda adalah <strong>{summary.latest_result.total_score}</strong>, sedangkan batas minimum passing grade <strong>{summary.target_major.name}</strong> adalah <strong>{summary.target_major.passing_grade_total}</strong>.
            </p>

            {!summary.is_passed_total && (
              <div className="pt-2 flex flex-wrap gap-3">
                <Button
                  onClick={() => setActiveTab('recom_alternatives')}
                  className="px-5 py-2.5 h-auto rounded-xl bg-[#FF6B6B] text-white text-xs font-bold hover:bg-[#E85D5D] shadow-lg gap-2"
                >
                  <Compass className="w-4 h-4" />
                  <span>Lihat PTN Alternatif (Passing Grade ≤ {summary.latest_result.total_score})</span>
                </Button>
                <Button
                  onClick={() => setActiveTab('recom_tutors')}
                  variant="outline"
                  className="px-5 py-2.5 h-auto rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-sm border-white/20 gap-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Solusi Bimbel Defisit</span>
                </Button>
              </div>
            )}
          </div>

          {/* Right Gauge / Skor Big Box */}
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Skor Capaian Total</span>
            <span className="text-5xl font-black mt-2 tracking-tight text-white">{summary.latest_result.total_score}</span>
            <Separator className="w-full bg-white/20 my-3" />
            <div className="flex justify-between w-full text-xs">
              <span className="text-slate-300">Passing Grade:</span>
              <span className="font-bold text-amber-300">{summary.target_major.passing_grade_total}</span>
            </div>
          </div>

        </div>

        {/* Decorative Watermark */}
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          {summary.is_passed_total ? <CheckCircle2 className="w-80 h-80" /> : <AlertTriangle className="w-80 h-80" />}
        </div>
      </div>

      {/* Gap Analysis Table per 7 Subtes (Fitur Inti) */}
      <Card className="p-6 lg:p-8 rounded-3xl ring-0 bg-white dark:bg-card border border-slate-100 dark:border-border shadow-xs gap-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-border pb-4">
          <div>
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white flex items-center gap-2.5">
              <TrendingUp className="w-5 h-5 text-[#FF6B6B]" />
              <span>Gap Analysis per Kompetensi Subtes (UTBK SNBT)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Identifikasi akurat komponen subtes mana yang menjadi titik lemah pembatal kelulusan Anda</p>
          </div>
          <Badge variant="outline" className="text-xs font-semibold h-auto px-3 py-1 rounded-xl bg-slate-100 dark:bg-card text-slate-600 dark:text-slate-300 border-slate-200 dark:border-border self-start sm:self-auto">
            Tryout: {summary.latest_result.tryout_name.split(' - ')[0]}
          </Badge>
        </div>

        <div className="space-y-4 pt-2">
          {summary.gaps.map((gapItem) => {
            const isSafe = gapItem.gap >= 0;
            const progressPercent = Math.min(100, Math.max(0, (gapItem.student_score / 900) * 100));
            const targetLinePercent = Math.min(100, Math.max(0, (gapItem.min_required / 900) * 100));

            return (
              <div key={gapItem.competency_code} className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-card border border-slate-100 dark:border-border/80 transition-all hover:border-indigo-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="outline"
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 px-0",
                        isSafe 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      )}
                    >
                      {gapItem.competency_code}
                    </Badge>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-white">{gapItem.competency_name}</h4>
                      <p className="text-[11px] text-slate-400">Target Syarat Min: <strong className="text-slate-700 dark:text-slate-200">{gapItem.min_required}</strong></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Skor Siswa:</span>
                      <span className="font-black text-base text-slate-800 dark:text-white">{gapItem.student_score}</span>
                    </div>

                    <Badge 
                      className={cn(
                        "h-auto px-3 py-1 rounded-xl text-xs font-extrabold gap-1 min-w-[80px] justify-center",
                        isSafe 
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs' 
                          : 'bg-rose-500 text-white border-rose-500 shadow-xs animate-pulse'
                      )}
                    >
                      <span>{isSafe ? '+' : ''}{gapItem.gap}</span>
                    </Badge>
                  </div>
                </div>

                {/* Progress Visualizer with Target Tick */}
                <div className="relative pt-2">
                  <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700/80 overflow-hidden relative">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-500", isSafe ? 'bg-emerald-500' : 'bg-rose-500')}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Target marker flag */}
                  <div 
                    className="absolute top-1.5 bottom-0 w-1 bg-amber-400 z-20 pointer-events-none"
                    style={{ left: `${targetLinePercent}%` }}
                    title={`Batas Syarat Minimum: ${gapItem.min_required}`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Weakest Competency Solution Banner */}
        {summary.weakest_competency && (
          <div className="p-6 rounded-3xl bg-linear-to-r from-[#FF6B6B]/10 to-[#4D5DFB]/10 border border-[#FF6B6B]/20 dark:border-[#FF6B6B]/30 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Solusi Penutup Defisit Terbesar Anda
              </span>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-white font-semibold">
                Anda mengalami defisit terbesar ({summary.weakest_competency.gap} pts) di subtes <strong className="text-[#FF6B6B]">{summary.weakest_competency.competency_name}</strong>. Ambil langkah les bimbel intensif khusus kompetensi ini sekarang.
              </p>
            </div>
            <Button
              onClick={() => setActiveTab('recom_tutors')}
              className="px-5 py-2.5 h-auto rounded-xl bg-[#FF6B6B] hover:bg-[#E85D5D] text-white text-xs font-bold shrink-0 shadow-md"
            >
              Lihat Program Les Cocok →
            </Button>
          </div>
        )}

      </Card>

    </div>
  );
};
