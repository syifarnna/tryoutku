import React from 'react';
import { 
  Award, 
  BarChart3, 
  BookOpen, 
  Compass, 
  GraduationCap, 
  Play, 
  Target, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
  Database
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';
import { useAppState } from '../../lib/store';
import { Tryout } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DashboardViewProps {
  onTakeTryout: (tryout: Tryout) => void;
  setActiveTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onTakeTryout, setActiveTab }) => {
  const state = useAppState();

  const activeTargetMajorId = state.activeTargetMajorId || state.targetMajorIds[0] || 1;
  const targetMajor = state.majors.find(m => m.id === activeTargetMajorId) || state.majors[0];
  const latestResult = state.results[0];

  const avgScore = state.results.length > 0 
    ? (state.results.reduce((a, b) => a + b.total_score, 0) / state.results.length).toFixed(1)
    : '0';

  const isPassedTarget = latestResult && latestResult.total_score >= targetMajor.passing_grade_total;
  const gapValue = latestResult ? (latestResult.total_score - targetMajor.passing_grade_total).toFixed(1) : '0';

  // Chart data for score progression
  const progressChartData = [...state.results].reverse().map((r, idx) => ({
    name: `TO #${idx + 1}`,
    tryout: r.tryout_name.split(' - ')[0] || `Tryout ${idx+1}`,
    skor: r.total_score,
    target: targetMajor.passing_grade_total
  }));

  // Chart data for 7 competencies of latest result
  const competencyRadarData = state.competencies.map(comp => {
    const studentSkor = latestResult?.scores[comp.code] || 0;
    const reqSkor = targetMajor.requirements?.[comp.code] || Math.round(targetMajor.passing_grade_total * 0.95);
    return {
      subject: comp.code,
      fullName: comp.name,
      siswa: studentSkor,
      passingGrade: reqSkor
    };
  });

  const completedTryoutIds = new Set(state.results.map(r => r.tryout_id));
  const availableTryouts = state.tryouts.filter(t => !completedTryoutIds.has(t.id));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Hero Welcome & Motivation Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#FF6B6B] to-[#4D5DFB] p-6 lg:p-8 text-white shadow-xl shadow-[#FF6B6B]/20">
        <div className="relative z-10 max-w-2xl space-y-3">
          <Badge className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-xs border-0 text-white hover:bg-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span>Simulasi UTBK SNBT & Ujian Mandiri 2026</span>
          </Badge>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {state.profile.full_name}! 🎓
          </h1>
          <p className="text-sm text-indigo-100 leading-relaxed">
            Target aktif Anda saat ini adalah <strong>{targetMajor.name} ({targetMajor.institution_name})</strong> dengan passing grade <strong>{targetMajor.passing_grade_total}</strong>. Terus asah kompetensi berhitung dan literasi akademis Anda!
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setActiveTab('analysis_passing')}
              className="px-5 py-2.5 rounded-xl bg-white text-[#FF6B6B] text-xs font-bold hover:bg-indigo-50 shadow-md transition-all cursor-pointer border-0"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Lihat Analisis Passing Grade</span>
            </Button>
            {state.profile.role === 'admin' && (
              <Button
                onClick={() => setActiveTab('supabase_cfg')}
                className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-xs font-extrabold hover:bg-amber-300 shadow-md transition-all cursor-pointer border-0"
              >
                <Database className="w-4 h-4" />
                <span>Supabase SQL Blueprint</span>
              </Button>
            )}
            {availableTryouts[0] && (
              <Button
                onClick={() => onTakeTryout(availableTryouts[0])}
                className="px-5 py-2.5 rounded-xl bg-[#000000]/80 text-white text-xs font-semibold hover:bg-[#000000] transition-all border border-white/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Kerjakan {availableTryouts[0].name.split(' - ')[0]}</span>
              </Button>
            )}
          </div>
        </div>
        {/* Decorative Sneat Graphic */}
        <div className="absolute right-0 bottom-0 top-0 hidden md:flex items-center justify-center opacity-15 pointer-events-none pr-8">
          <GraduationCap className="w-64 h-64 -rotate-12" />
        </div>
      </div>

      {/* 4 Sneat Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1 */}
        <Card className={cn(
          "p-5 rounded-2xl bg-white dark:bg-card border border-slate-100 dark:border-border shadow-xs flex items-center justify-between",
          "ring-0 gap-0 py-0 overflow-visible"
        )}>
          <CardContent className="px-0">
            <div className="space-y-1">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Tryout Diikuti</span>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{state.results.length} <span className="text-xs font-normal text-slate-400">Sesi</span></p>
              <p className="text-[11px] font-semibold flex items-center gap-1">
                {(() => {
                  const now = new Date();
                  const countThisMonth = state.results.filter(res => {
                    const date = new Date(res.created_at);
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                  }).length;
                  
                  if (state.results.length === 0) return <span className="text-slate-400 dark:text-slate-500">Belum ada tryout dikerjakan</span>;
                  return <span className="text-emerald-500">+{countThisMonth} tryout bulan ini</span>;
                })()}
              </p>
            </div>
          </CardContent>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-[#FF6B6B] shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
        </Card>

        {/* Card 2 */}
        <Card className={cn(
          "p-5 rounded-2xl bg-white dark:bg-card border border-slate-100 dark:border-border shadow-xs flex items-center justify-between",
          "ring-0 gap-0 py-0 overflow-visible"
        )}>
          <CardContent className="px-0">
            <div className="space-y-1">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Rata-rata Keseluruhan</span>
              <p className="text-2xl font-extrabold text-[#FF6B6B]">{avgScore}</p>
              <p className="text-[11px] text-slate-400 truncate">IRT Standar Nasional</p>
            </div>
          </CardContent>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-[#FF6B6B] shrink-0">
            <Award className="w-6 h-6" />
          </div>
        </Card>

        {/* Card 3 */}
        <Card className={cn(
          "p-5 rounded-2xl bg-white dark:bg-card border border-slate-100 dark:border-border shadow-xs flex items-center justify-between",
          "ring-0 gap-0 py-0 overflow-visible"
        )}>
          <CardContent className="px-0">
            <div className="space-y-1">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Target Institut</span>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{state.targetMajorIds.length} <span className="text-xs font-normal text-slate-400">Prodi</span></p>
              <p className="text-[11px] text-indigo-500 font-semibold truncate cursor-pointer hover:underline" onClick={() => setActiveTab('target_majors')}>
                Aktif: {targetMajor.institution_name?.split(' ')[0]}
              </p>
            </div>
          </CardContent>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-500 shrink-0">
            <Target className="w-6 h-6" />
          </div>
        </Card>

        {/* Card 4 */}
        <Card className={cn(
          "p-5 rounded-2xl bg-white dark:bg-card border border-slate-100 dark:border-border shadow-xs flex items-center justify-between",
          "ring-0 gap-0 py-0 overflow-visible"
        )}>
          <CardContent className="px-0">
            <div className="space-y-1">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Status Passing Grade</span>
              <p className="text-base font-extrabold truncate">
                {isPassedTarget ? (
                  <span className="text-emerald-500">Memenuhi Target</span>
                ) : (
                  <span className="text-rose-500">Belum Memenuhi</span>
                )}
              </p>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-[#777]">
                Gap: <span className={parseFloat(gapValue) >= 0 ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>{parseFloat(gapValue) >= 0 ? '+' : ''}{gapValue}</span> pts
              </p>
            </div>
          </CardContent>
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
            isPassedTarget ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500' : 'bg-rose-50 dark:bg-rose-950/50 text-rose-500'
          )}>
            {isPassedTarget ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>
        </Card>

      </div>

      {/* Supabase SQL Blueprint Quick Access Card (Khusus Admin) */}
      {state.profile.role === 'admin' && (
        <Card className={cn(
          "bg-linear-to-r from-[#1A0F2E] to-[#000000] text-white border border-[#FF6B6B]/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
          "ring-0 gap-4 py-6"
        )}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF6B6B] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#FF6B6B]/40">
              <Database className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <Badge className="inline-flex items-center gap-2 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-400 text-slate-950 border-0 hover:bg-emerald-400">
                ✓ Database Ready
              </Badge>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Supabase SQL Blueprint & Skema Database PTN SNBT
              </h3>
              <p className="text-xs text-slate-300">
                Kumpulan skema tabel DDL PostgreSql, seed data passing grade 2026, dan RLS security policies siap pakai.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setActiveTab('supabase_cfg')}
            className="px-5 py-3 rounded-xl bg-[#FF6B6B] hover:bg-[#E85D5D] text-white text-xs font-bold transition-all shadow-md shrink-0 w-full sm:w-auto justify-center cursor-pointer border-0"
          >
            <span>Buka SQL Editor Blueprint</span>
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </Card>
      )}

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart: Perkembangan Skor Tryout */}
        <Card className={cn(
          "lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-card border border-slate-100 dark:border-border shadow-xs space-y-4 flex flex-col",
          "ring-0 gap-4 py-6"
        )}>
          <CardHeader className="flex items-center justify-between px-0">
            <div>
              <CardTitle className="font-bold text-base text-slate-800 dark:text-white">
                Perkembangan Nilai per Tryout (Line Chart)
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Komparasi skor capaian siswa terhadap garis merah Passing Grade target
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-[#FF6B6B] hover:bg-indigo-50 dark:hover:bg-indigo-950">
              Target: {targetMajor.passing_grade_total}
            </Badge>
          </CardHeader>

          <CardContent className="px-0 flex-1 w-full h-72 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[500, 800]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111111', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                />
                <Line type="monotone" dataKey="target" stroke="#F43F5E" strokeDasharray="5 5" strokeWidth={2} name="Passing Grade Target" dot={false} />
                <Line type="monotone" dataKey="skor" stroke="#FF6B6B" strokeWidth={4} name="Skor Capaian Saya" dot={{ r: 6, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar Chart: Pemetaan 7 Subtes */}
        <Card className={cn(
          "p-6 rounded-3xl bg-white dark:bg-card border border-slate-100 dark:border-border shadow-xs space-y-4 flex flex-col",
          "ring-0 gap-4 py-6"
        )}>
          <CardHeader className="px-0">
            <CardTitle className="font-bold text-base text-slate-800 dark:text-white">
              Profil Skor Kompetensi Terakhir
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Capaian 7 Subtes vs Syarat Minimum Prodi
            </CardDescription>
          </CardHeader>

          <CardContent className="px-0 flex-1 w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius="75%" data={competencyRadarData}>
                <PolarGrid stroke="#cbd5e1" opacity={0.4} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 1000]} stroke="#cbd5e1" fontSize={9} />
                <Radar name="Passing Grade Syarat" dataKey="passingGrade" stroke="#FBBF24" fill="#FBBF24" fillOpacity={0.15} />
                <Radar name="Skor Siswa" dataKey="siswa" stroke="#FF6B6B" fill="#FF6B6B" fillOpacity={0.45} />
                <Tooltip contentStyle={{ backgroundColor: '#111111', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      {/* Gap Warning & Actionable Recommendation Widget */}
      {!isPassedTarget && latestResult && (
        <Card className={cn(
          "p-6 rounded-3xl bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900/60 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6",
          "ring-0 gap-6 py-6"
        )}>
          <div className="flex gap-4">
            <div className="p-3 rounded-2xl bg-amber-500 text-white shrink-0 shadow-md shadow-amber-500/30 h-fit">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 dark:text-white text-base">
                Rekomendasi Cerdas: Nilai Anda Masih -{Math.abs(parseFloat(gapValue))} Poin di Bawah Passing Grade!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                Berdasarkan hasil analisis tryout terakhir, kelemahan terbesar Anda berada pada kompetensi <strong>Literasi Bahasa Inggris (LBE)</strong> dan <strong>Pengetahuan Kuantitatif (PK)</strong>. Sistem telah merangkum prodi alternatif yang aman dan bimbel fokus defisit Anda.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto shrink-0">
            <Button
              variant="outline"
              onClick={() => setActiveTab('recom_alternatives')}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border hover:border-[#FF6B6B] text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-2xs justify-center gap-1.5 bg-white dark:bg-card"
            >
              <Compass className="w-4 h-4 text-[#FF6B6B]" />
              <span>Lihat PTN Alternatif</span>
            </Button>
            <Button
              onClick={() => setActiveTab('recom_tutors')}
              className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-[#FF6B6B] hover:bg-[#E85D5D] text-white text-xs font-bold shadow-md shadow-[#FF6B6B]/20 transition-all justify-center gap-1.5 border-0"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Lihat Les/Bimbel Rekomendasi</span>
            </Button>
          </div>
        </Card>
      )}

      {/* Tryouts Tersedia & Aktivitas Terakhir */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tryout Tersedia */}
        <Card className={cn(
          "p-6 rounded-3xl bg-white dark:bg-card border border-slate-100 dark:border-border shadow-xs space-y-4",
          "ring-0 gap-4 py-6"
        )}>
          <CardHeader className="flex flex-row items-center justify-between px-0">
            <CardTitle className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#FF6B6B]" />
              <span>Tryout Tersedia untuk Anda</span>
            </CardTitle>
            <Button variant="ghost" onClick={() => setActiveTab('tryouts')} className="text-xs font-bold text-[#FF6B6B] hover:bg-transparent hover:text-[#FF6B6B]/80 h-auto p-0">
              Lihat Semua →
            </Button>
          </CardHeader>

          <CardContent className="px-0 space-y-3">
            {state.tryouts.map((to) => (
              <div key={to.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-card border border-slate-100 dark:border-border/80 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-md border-0",
                      to.type === 'UTBK SNBT'
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-950'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950'
                    )}
                  >
                    {to.type}
                  </Badge>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white mt-1 truncate">{to.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{to.duration_minutes} Menit • {to.question_count} Soal</p>
                </div>

                <Button
                  onClick={() => !completedTryoutIds.has(to.id) && onTakeTryout(to)}
                  disabled={completedTryoutIds.has(to.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border-0",
                    completedTryoutIds.has(to.id)
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950'
                      : 'bg-[#FF6B6B] text-white hover:bg-[#E85D5D] shadow-sm'
                  )}
                >
                  {completedTryoutIds.has(to.id) ? '✓ Sudah Selesai' : 'Kerjakan Ujian'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Aktivitas Terakhir */}
        <Card className={cn(
          "p-6 rounded-3xl bg-white dark:bg-card border border-slate-100 dark:border-border shadow-xs space-y-4",
          "ring-0 gap-4 py-6"
        )}>
          <CardHeader className="px-0">
            <CardTitle className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span>Riwayat Aktivitas & Skor Terakhir</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="px-0 space-y-3">
            {state.results.slice(0, 3).map((res) => (
              <div key={res.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-card border border-slate-100 dark:border-border/80 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-slate-800 dark:text-white">{res.tryout_name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Selesai pada {new Date(res.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-[#FF6B6B] block">{res.total_score}</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border-0",
                      res.predicate === 'Sangat Baik' || res.predicate === 'Baik'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950'
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                    )}
                  >
                    {res.predicate}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>

    </div>
  );
};
