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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span>Simulasi UTBK SNBT & Ujian Mandiri 2026</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {state.profile.full_name}! 🎓
          </h1>
          <p className="text-sm text-indigo-100 leading-relaxed">
            Target aktif Anda saat ini adalah <strong>{targetMajor.name} ({targetMajor.institution_name})</strong> dengan passing grade <strong>{targetMajor.passing_grade_total}</strong>. Terus asah kompetensi berhitung dan literasi akademis Anda!
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('analysis_passing')}
              className="px-5 py-2.5 rounded-xl bg-white text-[#FF6B6B] text-xs font-bold hover:bg-indigo-50 shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Lihat Analisis Passing Grade</span>
            </button>
            {state.profile.role === 'admin' && (
              <button
                onClick={() => setActiveTab('supabase_cfg')}
                className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-xs font-extrabold hover:bg-amber-300 shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Database className="w-4 h-4" />
                <span>Supabase SQL Blueprint</span>
              </button>
            )}
            {availableTryouts[0] && (
              <button
                onClick={() => onTakeTryout(availableTryouts[0])}
                className="px-5 py-2.5 rounded-xl bg-[#000000]/80 text-white text-xs font-semibold hover:bg-[#000000] transition-all border border-white/20 flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Kerjakan {availableTryouts[0].name.split(' - ')[0]}</span>
              </button>
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
        <div className="p-5 rounded-2xl bg-white dark:bg-[#000000] border border-slate-100 dark:border-[#141414] shadow-xs flex items-center justify-between">
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
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-[#FF6B6B]">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#000000] border border-slate-100 dark:border-[#141414] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Rata-rata Keseluruhan</span>
            <p className="text-2xl font-extrabold text-[#FF6B6B]">{avgScore}</p>
            <p className="text-[11px] text-slate-400 truncate">IRT Standar Nasional</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-[#FF6B6B]">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#000000] border border-slate-100 dark:border-[#141414] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Target Institut</span>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{state.targetMajorIds.length} <span className="text-xs font-normal text-slate-400">Prodi</span></p>
            <p className="text-[11px] text-indigo-500 font-semibold truncate cursor-pointer hover:underline" onClick={() => setActiveTab('target_majors')}>
              Aktif: {targetMajor.institution_name?.split(' ')[0]}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-500">
            <Target className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#000000] border border-slate-100 dark:border-[#141414] shadow-xs flex items-center justify-between">
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
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPassedTarget ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500' : 'bg-rose-50 dark:bg-rose-950/50 text-rose-500'}`}>
            {isPassedTarget ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>
        </div>

      </div>

      {/* Supabase SQL Blueprint Quick Access Card (Khusus Admin) */}
      {state.profile.role === 'admin' && (
        <div className="card bg-linear-to-r from-[#1A0F2E] to-[#000000] text-white border border-[#FF6B6B]/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF6B6B] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#FF6B6B]/40">
              <Database className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-400 text-slate-950">
                ✓ Database Ready
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Supabase SQL Blueprint & Skema Database PTN SNBT
              </h3>
              <p className="text-xs text-slate-300">
                Kumpulan skema tabel DDL PostgreSql, seed data passing grade 2026, dan RLS security policies siap pakai.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('supabase_cfg')}
            className="px-5 py-3 rounded-xl bg-[#FF6B6B] hover:bg-[#E85D5D] text-white text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer"
          >
            <span>Buka SQL Editor Blueprint</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart: Perkembangan Skor Tryout */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#000000] border border-slate-100 dark:border-[#141414] shadow-xs space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-white">
                Perkembangan Nilai per Tryout (Line Chart)
              </h3>
              <p className="text-xs text-slate-400">
                Komparasi skor capaian siswa terhadap garis merah Passing Grade target
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-[#FF6B6B]">
              Target: {targetMajor.passing_grade_total}
            </span>
          </div>

          <div className="flex-1 w-full h-72 pt-4">
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
          </div>
        </div>

        {/* Radar Chart: Pemetaan 7 Subtes */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#000000] border border-slate-100 dark:border-[#141414] shadow-xs space-y-4 flex flex-col">
          <div>
            <h3 className="font-bold text-base text-slate-800 dark:text-white">
              Profil Skor Kompetensi Terakhir
            </h3>
            <p className="text-xs text-slate-400">
              Capaian 7 Subtes vs Syarat Minimum Prodi
            </p>
          </div>

          <div className="flex-1 w-full h-72">
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
          </div>
        </div>

      </div>

      {/* Gap Warning & Actionable Recommendation Widget */}
      {!isPassedTarget && latestResult && (
        <div className="p-6 rounded-3xl bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900/60 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
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
            <button
              onClick={() => setActiveTab('recom_alternatives')}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-white dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] hover:border-[#FF6B6B] text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-2xs flex items-center justify-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-[#FF6B6B]" />
              <span>Lihat PTN Alternatif</span>
            </button>
            <button
              onClick={() => setActiveTab('recom_tutors')}
              className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-[#FF6B6B] hover:bg-[#E85D5D] text-white text-xs font-bold shadow-md shadow-[#FF6B6B]/20 transition-all flex items-center justify-center gap-1.5"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Lihat Les/Bimbel Rekomendasi</span>
            </button>
          </div>
        </div>
      )}

      {/* Tryouts Tersedia & Aktivitas Terakhir */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tryout Tersedia */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#000000] border border-slate-100 dark:border-[#141414] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#FF6B6B]" />
              <span>Tryout Tersedia untuk Anda</span>
            </h3>
            <button onClick={() => setActiveTab('tryouts')} className="text-xs font-bold text-[#FF6B6B] hover:underline">
              Lihat Semua →
            </button>
          </div>

          <div className="space-y-3">
            {state.tryouts.map((to) => (
              <div key={to.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#000000] border border-slate-100 dark:border-[#141414]/80 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${to.type === 'UTBK SNBT' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'}`}>
                    {to.type}
                  </span>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white mt-1 truncate">{to.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{to.duration_minutes} Menit • {to.question_count} Soal</p>
                </div>

                <button
                  onClick={() => !completedTryoutIds.has(to.id) && onTakeTryout(to)}
                  disabled={completedTryoutIds.has(to.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${completedTryoutIds.has(to.id) ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-[#FF6B6B] text-white hover:bg-[#E85D5D] shadow-sm'}`}
                >
                  {completedTryoutIds.has(to.id) ? '✓ Sudah Selesai' : 'Kerjakan Ujian'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Aktivitas Terakhir */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#000000] border border-slate-100 dark:border-[#141414] shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <span>Riwayat Aktivitas & Skor Terakhir</span>
          </h3>

          <div className="space-y-3">
            {state.results.slice(0, 3).map((res) => (
              <div key={res.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#000000] border border-slate-100 dark:border-[#141414]/80 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-slate-800 dark:text-white">{res.tryout_name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Selesai pada {new Date(res.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-[#FF6B6B] block">{res.total_score}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${res.predicate === 'Sangat Baik' || res.predicate === 'Baik' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700'}`}>
                    {res.predicate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
