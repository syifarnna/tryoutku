import React, { useState, useEffect } from 'react';
import { useAppState } from '../../lib/store';
import { appStore } from '../../lib/store';
import { cn, formatNumber } from '../../lib/utils';
import { searchMajors, getMajorsStats, getPopularMajors, MajorsStats } from '../../lib/prodiSearch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { JenjangBadge } from '@/components/ui/JenjangBadge';
import { Pagination } from '@/components/ui/Pagination';
import { Search, Target, GraduationCap, Building2, Layers, TrendingUp, AlertCircle, CheckCircle2, Clock, BookOpen, Sparkles, ArrowRight, Info, Award } from 'lucide-react';
import type { Major, ClusterType } from '../../types';

type JenjangFilter = 'SEMUA' | 'S1' | 'D4' | 'D3';
type RumpunFilter = 'SEMUA' | ClusterType;

const JENJANG_FILTERS: JenjangFilter[] = ['SEMUA', 'S1', 'D4', 'D3'];
const RUMPUN_FILTERS: RumpunFilter[] = ['SEMUA', 'Saintek', 'Soshum', 'Campuran'];

const CLUSTER_STYLE: Record<ClusterType, { badge: string; row: string; dot: string }> = {
  Saintek: {
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400 border-sky-200 dark:border-sky-900',
    row: 'hover:bg-sky-50/40 dark:hover:bg-sky-950/20',
    dot: 'bg-sky-500',
  },
  Soshum: {
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-900',
    row: 'hover:bg-amber-50/40 dark:hover:bg-amber-950/20',
    dot: 'bg-amber-500',
  },
  Campuran: {
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400 border-violet-200 dark:border-violet-900',
    row: 'hover:bg-violet-50/40 dark:hover:bg-violet-950/20',
    dot: 'bg-violet-500',
  },
};

export const DashboardView: React.FC<{ onTakeTryout: (t: any) => void; setActiveTab: (tab: string) => void }> = ({ onTakeTryout, setActiveTab }) => {
  const state = useAppState();
  const [stats, setStats] = useState<MajorsStats | null>(null);
  const [popular, setPopular] = useState<Major[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [jenjang, setJenjang] = useState<JenjangFilter>('SEMUA');
  const [rumpun, setRumpun] = useState<RumpunFilter>('SEMUA');
  const [searchResults, setSearchResults] = useState<Major[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const targetMajors = state.getTargetMajors ? state.getTargetMajors() : state.targetMajorIds.map(id => state.majors.find(m => m.id === id)).filter(Boolean);

  useEffect(() => {
    let cancelled = false;
    getMajorsStats().then(s => { if (!cancelled && s) setStats(s); }).catch(() => {});
    getPopularMajors(8).then(p => { if (!cancelled) setPopular(p); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setSearchTotal(0);
        return;
      }
      setSearchLoading(true);
      try {
        const res = await searchMajors({ search: searchQuery, jenjang: jenjang === 'SEMUA' ? '' : jenjang, rumpun: rumpun === 'SEMUA' ? '' : rumpun, page: 1, pageSize: 10 });
        setSearchResults(res.data);
        setSearchTotal(res.total);
      } catch {
        setSearchResults([]);
        setSearchTotal(0);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery, jenjang, rumpun]);

  const fmt = (n?: number | null) => n == null ? '—' : formatNumber(n);
  const activeTargetMajorId = state.activeTargetMajorId || state.targetMajorIds[0];
  const targetMajor = activeTargetMajorId ? state.majors.find(m => m.id === activeTargetMajorId) : undefined;
  const latestResult = state.results[0];
  const avgScore = state.results.length > 0 ? (state.results.reduce((a, b) => a + b.total_score, 0) / state.results.length).toFixed(1) : '0';
  const isPassedTarget = latestResult && targetMajor && latestResult.total_score >= targetMajor.passing_grade_total;
  const gapValue = latestResult && targetMajor ? (latestResult.total_score - targetMajor.passing_grade_total).toFixed(1) : '0';
  const completedTryoutIds = new Set(state.results.map(r => r.tryout_id));
  const availableTryouts = state.tryouts.filter(t => !completedTryoutIds.has(t.id));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">

      {/* SECTION 1: Personal Welcome & Status Bar */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary to-secondary p-6 lg:p-8 text-white shadow-xl shadow-primary/20">
        <div className="relative z-10 max-w-2xl space-y-3">
          <Badge className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-xs border-0 text-white hover:bg-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span>Simulasi UTBK SNBT & Ujian Mandiri 2026</span>
          </Badge>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Selamat Datang, {state.profile.full_name}! 🎓</h1>
          <p className="text-sm text-indigo-100 leading-relaxed">
            Target aktif Anda saat ini adalah <strong>{targetMajor?.name || 'Belum dipilih'} ({targetMajor?.institution_name || '—'})</strong> dengan passing grade <strong>{targetMajor?.passing_grade_total ?? '—'}</strong>. Terus asah kompetensi berhitung dan literasi akademis Anda!
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button onClick={() => setActiveTab('analysis_passing')} className="px-5 py-2.5 rounded-xl bg-white text-primary text-xs font-bold hover:bg-indigo-50 shadow-md transition-all cursor-pointer border-0">
              <TrendingUp className="w-4 h-4" /><span>Lihat Analisis Passing Grade</span>
            </Button>
            {availableTryouts[0] && (
              <Button onClick={() => onTakeTryout(availableTryouts[0])} className="px-5 py-2.5 rounded-xl bg-black/80 text-white text-xs font-semibold hover:bg-black transition-all border border-white/20">
                <BookOpen className="w-3.5 h-3.5 fill-current" /><span>Kerjakan {availableTryouts[0].name.split(' - ')[0]}</span>
              </Button>
            )}
          </div>
        </div>
        <div className="absolute right-0 bottom-0 top-0 hidden md:flex items-center justify-center opacity-15 pointer-events-none pr-8">
          <GraduationCap className="w-64 h-64 -rotate-12" />
        </div>
      </div>

      {/* Status badges row */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900">
          <Clock className="w-3.5 h-3.5" /> Jalur Aktif: SNBT 2026
        </Badge>
        <Badge variant="secondary" className={cn("gap-1.5", targetMajors.length > 0 ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900")}>
          {targetMajors.length > 0 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />} Pilihan Prodi: {targetMajors.length}/2
        </Badge>
      </div>

      {/* SECTION 2: Ringkasan Analisis Pilihan Saya */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> Ringkasan Pilihan Prodi Anda</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1].map(idx => {
            const m = targetMajors[idx];
            if (!m) {
              return (
                <Card key={idx} className="p-5 rounded-2xl border border-dashed border-slate-300 dark:border-border bg-card/50 flex flex-col items-center justify-center text-center min-h-[180px]">
                  <Target className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Belum Ada Pilihan #{idx + 1}</p>
                  <p className="text-xs text-slate-400 mt-1 mb-3">Cari & pilih prodi impian Anda sekarang</p>
                  <Button size="sm" onClick={() => setActiveTab('target_majors')} className="gap-1.5 text-xs">
                    <Search className="w-3.5 h-3.5" /> Cari Prodi
                  </Button>
                </Card>
              );
            }
            const inst = state.institutions.find(i => i.id === m.institution_id);
            const cs = CLUSTER_STYLE[m.cluster === 'Saintek' || m.cluster === 'Soshum' || m.cluster === 'Campuran' ? m.cluster : 'Campuran'];
            const keketatan = m.passing_grade_percentage != null ? `${m.passing_grade_percentage}%` : '—';
            return (
              <Card key={m.id} className={cn("p-5 rounded-2xl border border-slate-200 dark:border-border shadow-xs flex flex-col gap-3", cs.row)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{m.name}</p>
                    <p className="text-xs text-slate-500 dark:text-muted-foreground">{inst?.name || '—'}</p>
                  </div>
                  <JenjangBadge jenjang={m.jenjang} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className={cn("text-[10px] font-bold gap-1.5 border", cs.badge)}><span className={cn("w-1.5 h-1.5 rounded-full", cs.dot)} />{m.cluster}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-slate-400">Daya:</span> <span className="font-bold text-slate-700 dark:text-white">{fmt(m.daya_tampung)}</span></div>
                  <div><span className="text-slate-400">Peminat:</span> <span className="font-bold text-slate-700 dark:text-white">{fmt(m.peminat)}</span></div>
                  <div><span className="text-slate-400">Keketatan:</span> <span className="font-bold text-indigo-600 dark:text-indigo-400">{keketatan}</span></div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-border">
                  <span className="text-[10px] text-slate-400">PG: <span className="font-bold text-primary">{m.passing_grade_total ?? '—'}</span></span>
                  <Button size="sm" variant="ghost" onClick={() => { appStore.setActiveTargetMajor(m.id); setActiveTab('target_majors'); }} className="text-xs gap-1.5 h-auto">
                    Lihat Detail <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Quick Search & Filter Prodi */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2"><Search className="w-5 h-5 text-primary" /> Eksplorasi Prodi Cepat</h2>
        <Card className="p-4 rounded-2xl border-slate-200/70 dark:border-border space-y-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari nama prodi atau kampus..." className="pl-9" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Jenjang:</span>
            {JENJANG_FILTERS.map(f => (
              <button key={f} onClick={() => setJenjang(f)} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer", jenjang === f ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background text-muted-foreground border-border hover:bg-muted")}>{f}</button>
            ))}
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-2">Rumpun:</span>
            {RUMPUN_FILTERS.map(f => (
              <button key={f} onClick={() => setRumpun(f)} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer", rumpun === f ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background text-muted-foreground border-border hover:bg-muted")}>{f}</button>
            ))}
          </div>
          {searchQuery.trim() && (
            <p className="text-xs text-slate-400">Ditemukan <span className="font-bold text-slate-700 dark:text-white">{formatNumber(searchTotal)}</span> hasil untuk "{searchQuery.trim()}"</p>
          )}
        </Card>

        {(searchResults.length > 0 || (!searchQuery.trim() && popular.length > 0)) && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {(searchQuery.trim() ? searchResults : popular.slice(0, 8)).map(m => {
              const inst = state.institutions.find(i => i.id === m.institution_id);
              const cs = CLUSTER_STYLE[m.cluster === 'Saintek' || m.cluster === 'Soshum' || m.cluster === 'Campuran' ? m.cluster : 'Campuran'];
              return (
                <Card key={m.id} className={cn("p-4 rounded-xl border border-slate-200 dark:border-border shadow-xs flex flex-col gap-2", cs.row)}>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-800 dark:text-white truncate">{m.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-muted-foreground truncate">{inst?.name || '—'}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <JenjangBadge jenjang={m.jenjang} />
                    <Badge variant="secondary" className={cn("text-[10px] font-bold border", cs.badge)}>{m.cluster}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[10px]">
                    <div><span className="text-slate-400">Daya:</span> <span className="font-bold">{fmt(m.daya_tampung)}</span></div>
                    <div><span className="text-slate-400">Peminat:</span> <span className="font-bold">{fmt(m.peminat)}</span></div>
                    <div><span className="text-slate-400">%:</span> <span className="font-bold text-indigo-600 dark:text-indigo-400">{m.passing_grade_percentage != null ? `${m.passing_grade_percentage}%` : '—'}</span></div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        {searchLoading && <p className="text-xs text-slate-400 text-center py-4">Mencari...</p>}
        {!searchLoading && searchQuery.trim() && searchResults.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Tidak ada hasil untuk "{searchQuery.trim()}"</p>}
      </div>

      {/* SECTION 4: Widget Statistik & Distribusi Data */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2"><Layers className="w-5 h-5 text-primary" /> Statistik Sistem</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Prodi', value: stats?.totalProdi ?? 0, icon: GraduationCap, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' },
            { label: 'Total PTN', value: stats?.universitas ?? 0, icon: Building2, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40' },
            { label: 'Rata-rata Keketatan', value: stats ? `${((stats.saintek * 100 + stats.soshum * 100) / (stats.saintek + stats.soshum || 1)).toFixed(1)}%` : '—', icon: TrendingUp, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
            { label: 'Tryout Selesai', value: state.results.length, icon: Award, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
          ].map((s, i) => (
            <Card key={i} className="p-4 rounded-2xl flex items-center gap-3 border-slate-200/70 dark:border-border">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", s.color)}><s.icon className="w-5 h-5" /></div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{fmt(typeof s.value === 'string' ? undefined : s.value)}</p>
                <p className="text-[11px] font-medium text-slate-400 truncate">{typeof s.value === 'string' ? s.value : s.label}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* SECTION 5: Papan Informasi & Panduan */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2"><Info className="w-5 h-5 text-primary" /> Panduan & Informasi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5 rounded-2xl border border-slate-200 dark:border-border space-y-2">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> Ketentuan Pemilihan Prodi</h3>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Pilihan 1 & 2 wajib berbeda rumpun (Saintek/Soshum).</li>
              <li>Jenjang S1: 4 tahun, D4: 4 tahun (vokasi), D3: 3 tahun (vokasi).</li>
              <li>Pastikan skor passing grade memenuhi minimum prodi target.</li>
            </ul>
          </Card>
          <Card className="p-5 rounded-2xl border border-slate-200 dark:border-border space-y-2">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Tips Pendaftaran</h3>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Daftar akun sebelum batas waktu pendaftaran ditutup.</li>
              <li>Lengkapi profil & riwayat tryout untuk rekomendasi akurat.</li>
              <li>Pantau pengumuman resmi SNBP/SNBT di situs LTMPT.</li>
            </ul>
          </Card>
        </div>
      </div>

    </div>
  );
};