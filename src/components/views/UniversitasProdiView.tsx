import React, { useState, useEffect } from 'react';
import { Search, Building2, GraduationCap, Target, Layers, Loader2 } from 'lucide-react';
import { useAppState } from '../../lib/store';
import { appStore } from '../../lib/store';
import { cn } from '../../lib/utils';
import { searchMajors, getMajorsStats, useDebouncedValue, MajorsStats } from '../../lib/prodiSearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Pagination } from '@/components/ui/Pagination';
import { JenjangBadge } from '@/components/ui/JenjangBadge';
import type { ClusterType, Major } from '../../types';

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

const PAGE_SIZE = 50;

const EMPTY_STATS: MajorsStats = {
  universitas: 0,
  totalProdi: 0,
  s1: 0,
  d4: 0,
  d3: 0,
  saintek: 0,
  soshum: 0,
  campuran: 0,
};

export const UniversitasProdiView: React.FC = () => {
  const state = useAppState();
  const [search, setSearch] = useState('');
  const [jenjang, setJenjang] = useState<JenjangFilter>('SEMUA');
  const [rumpun, setRumpun] = useState<RumpunFilter>('SEMUA');
  const [sortBy, setSortBy] = useState<'name' | 'pg'>('pg');
  const [page, setPage] = useState(1);

  // Server-side state
  const debouncedSearch = useDebouncedValue(search, 500);
  const [rows, setRows] = useState<Major[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<MajorsStats>(EMPTY_STATS);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, jenjang, rumpun, sortBy]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await searchMajors({
          search: debouncedSearch,
          jenjang: jenjang === 'SEMUA' ? '' : jenjang,
          rumpun: rumpun === 'SEMUA' ? '' : rumpun,
          sort: sortBy,
          page,
          pageSize: PAGE_SIZE,
        });
        if (cancelled) return;
        setRows(res.data);
        setTotal(res.total);
      } catch (e) {
        if (!cancelled) {
          setRows([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, jenjang, rumpun, sortBy, page]);

  useEffect(() => {
    let cancelled = false;
    getMajorsStats()
      .then(s => {
        if (!cancelled && s) setStats(s);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const fmt = (n?: number | null) =>
    n == null ? '—' : n.toLocaleString('id-ID');

  const jenjangCounts: Record<string, number> = {
    'S1': stats.s1,
    'D4': stats.d4,
    'D3': stats.d3,
  };
  const rumpunCounts: Record<ClusterType, number> = {
    Saintek: stats.saintek,
    Soshum: stats.soshum,
    Campuran: stats.campuran,
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 dark:border-border pb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Browser Universitas & Program Studi 2025</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Data passing grade UTBK-SNBT 2025 • {fmt(stats.totalProdi)} prodi dari {fmt(stats.universitas)} PTN
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Prodi', value: stats.totalProdi, icon: GraduationCap, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' },
          { label: 'Universitas', value: stats.universitas, icon: Building2, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40' },
          { label: 'Jenjang S1', value: stats.s1, icon: Layers, color: 'text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40' },
          { label: 'Jenjang D3', value: stats.d3, icon: Layers, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
          { label: 'Jenjang D4', value: stats.d4, icon: Layers, color: 'text-sky-400 bg-sky-50 dark:bg-sky-950/40' },
        ].map((s, i) => (
          <Card key={i} className="p-4 rounded-2xl flex items-center gap-3 border-slate-200/70 dark:border-border">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', s.color)}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{fmt(s.value)}</p>
              <p className="text-[11px] font-medium text-slate-400 truncate">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <Card className="p-4 rounded-2xl border-slate-200/70 dark:border-border space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari nama kampus, program studi, atau kode (mis. ITB, Hukum, 611001)..."
              className="pl-9"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as 'name' | 'pg'); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="pg">Urut: Passing Grade Tertinggi</option>
            <option value="name">Urut: Nama Kampus A-Z</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Jenjang:</span>
          {JENJANG_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => { setJenjang(f); setPage(1); }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer',
                jenjang === f
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background text-muted-foreground border-border hover:bg-muted'
              )}
            >
              {f === 'SEMUA' ? f : `${f}: ${fmt(jenjangCounts[f])}`}
            </button>
          ))}
          <span className="ml-auto text-xs font-semibold text-slate-400">
            {loading ? 'Memuat...' : `Ditemukan ${fmt(total)} data`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rumpun:</span>
          {RUMPUN_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => { setRumpun(f); setPage(1); }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer',
                rumpun === f
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background text-muted-foreground border-border hover:bg-muted'
              )}
            >
              {f === 'SEMUA' ? f : `${f} ${fmt(rumpunCounts[f])}`}
            </button>
          ))}
        </div>
      </Card>

      {/* Table */}
      <Card className={cn('rounded-2xl overflow-hidden border-slate-200/70 dark:border-border transition-opacity', loading && rows.length > 0 && 'opacity-60')}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-slate-100 dark:border-border bg-slate-50/60 dark:bg-slate-900/40">
                <th className="px-4 py-3">Kode</th>
                <th className="px-4 py-3">Kampus</th>
                <th className="px-4 py-3">Program Studi</th>
                <th className="px-4 py-3">Rumpun</th>
                <th className="px-4 py-3">Jenjang</th>
                <th className="px-4 py-3 text-right">Daya</th>
                <th className="px-4 py-3 text-right">Peminat</th>
                <th className="px-4 py-3 text-right">P. Grade</th>
                <th className="px-4 py-3 text-right">%</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Tidak ada hasil untuk pencarian ini.
                  </td>
                </tr>
              )}
              {loading && rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto opacity-50" />
                    <span className="text-xs">Memuat data prodi...</span>
                  </td>
                </tr>
              )}
              {rows.map((m) => {
                const isTarget = state.targetMajorIds.includes(m.id);
                const cs = CLUSTER_STYLE[m.cluster === 'Saintek' || m.cluster === 'Soshum' || m.cluster === 'Campuran' ? m.cluster : 'Campuran'];
                return (
                  <tr key={m.id} className={cn('border-b border-slate-50 dark:border-border/50 transition-colors', cs.row)}>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{m.code || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-bold text-slate-800 dark:text-white whitespace-nowrap">{m.institution_name || '—'}</div>
                      <div className="text-[11px] text-slate-400">{m.institution_location || ''}</div>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-300">{m.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant="secondary" className={cn('text-[10px] font-bold gap-1.5 border', cs.badge)}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', cs.dot)} />
                        {m.cluster || '—'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <JenjangBadge jenjang={m.jenjang} />
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">{fmt(m.daya_tampung)}</td>
                    <td className="px-4 py-3 text-right text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">{fmt(m.peminat)}</td>
                    <td className="px-4 py-3 text-right text-xs font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{m.passing_grade_total != null ? m.passing_grade_total : '—'}</td>
                    <td className="px-4 py-3 text-right text-xs text-slate-500 whitespace-nowrap">
                      {m.passing_grade_percentage != null ? `${m.passing_grade_percentage}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isTarget ? (
                        <Badge className="text-[10px] font-bold gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0">
                          <Target className="w-3 h-3" /> Target
                        </Badge>
                      ) : (
                        <button
                          onClick={() => !isTarget && appStore.addTargetMajor(m.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all cursor-pointer"
                        >
                          <Target className="w-3.5 h-3.5" /> Set Target
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-border gap-3 flex-wrap">
          <p className="text-xs text-slate-400">
            Halaman {Math.min(page, totalPages)} dari {totalPages} • {fmt(total)} prodi
          </p>
          <Pagination page={Math.min(page, totalPages)} totalPages={totalPages} onChange={setPage} />
        </div>
      </Card>
    </div>
  );
};