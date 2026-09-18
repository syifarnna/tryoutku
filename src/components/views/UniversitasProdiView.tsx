import React, { useState, useMemo } from 'react';
import { Search, Building2, GraduationCap, Target, Layers } from 'lucide-react';
import { useAppState } from '../../lib/store';
import { appStore } from '../../lib/store';
import { cn } from '../../lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

type JenjangFilter = 'SEMUA' | 'S1' | 'D-III' | 'D-IV';

const JENJANG_FILTERS: JenjangFilter[] = ['SEMUA', 'S1', 'D-III', 'D-IV'];

const PAGE_SIZE = 50;

export const UniversitasProdiView: React.FC = () => {
  const state = useAppState();

  const [search, setSearch] = useState('');
  const [jenjang, setJenjang] = useState<JenjangFilter>('SEMUA');
  const [sortBy, setSortBy] = useState<'name' | 'pg'>('pg');
  const [page, setPage] = useState(1);

  const stats = useMemo(() => {
    const majors = state.majors;
    return {
      universitas: new Set(majors.map(m => m.institution_id)).size,
      prodi: majors.length,
      s1: majors.filter(m => m.jenjang === 'S1').length,
      d3: majors.filter(m => m.jenjang === 'D-III').length,
      d4: majors.filter(m => m.jenjang === 'D-IV').length,
    };
  }, [state.majors]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = state.majors;

    if (jenjang !== 'SEMUA') {
      rows = rows.filter(m => m.jenjang === jenjang);
    }

    if (q) {
      rows = rows.filter(m =>
        (m.name || '').toLowerCase().includes(q) ||
        (m.institution_name || '').toLowerCase().includes(q) ||
        (m.code || '').toLowerCase().includes(q)
      );
    }

    if (sortBy === 'name') {
      rows = [...rows].sort((a, b) => (a.institution_name || '').localeCompare(b.institution_name || '') || (a.name || '').localeCompare(b.name || ''));
    } else {
      rows = [...rows].sort((a, b) => (b.passing_grade_total || 0) - (a.passing_grade_total || 0));
    }

    return rows;
  }, [state.majors, search, jenjang, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetPage = () => setPage(1);

  const fmt = (n?: number | null) =>
    n == null ? '—' : n.toLocaleString('id-ID');

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 dark:border-border pb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Browser Universitas & Program Studi 2025</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Data passing grade UTBK-SNBT 2025 • {fmt(stats.prodi)} prodi dari {fmt(stats.universitas)} PTN
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Prodi', value: stats.prodi, icon: GraduationCap, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' },
          { label: 'Universitas', value: stats.universitas, icon: Building2, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40' },
          { label: 'Jenjang S1', value: stats.s1, icon: Layers, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
          { label: 'Jenjang D-III', value: stats.d3, icon: Layers, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
          { label: 'Jenjang D-IV', value: stats.d4, icon: Layers, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' },
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
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              placeholder="Cari nama kampus, program studi, atau kode (mis. ITB, Hukum, 611001)..."
              className="pl-9"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as 'name' | 'pg'); resetPage(); }}
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
              onClick={() => { setJenjang(f); resetPage(); }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer',
                jenjang === f
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background text-muted-foreground border-border hover:bg-muted'
              )}
            >
              {f}
            </button>
          ))}
          <span className="ml-auto text-xs font-semibold text-slate-400">
            {fmt(filtered.length)} hasil
          </span>
        </div>
      </Card>

      {/* Table */}
      <Card className="rounded-2xl overflow-hidden border-slate-200/70 dark:border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-slate-100 dark:border-border bg-slate-50/60 dark:bg-slate-900/40">
                <th className="px-4 py-3">Kode</th>
                <th className="px-4 py-3">Kampus</th>
                <th className="px-4 py-3">Program Studi</th>
                <th className="px-4 py-3">Jenjang</th>
                <th className="px-4 py-3 text-right">Daya</th>
                <th className="px-4 py-3 text-right">Peminat</th>
                <th className="px-4 py-3 text-right">P. Grade</th>
                <th className="px-4 py-3 text-right">%</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Tidak ada hasil untuk pencarian ini.
                  </td>
                </tr>
              )}
              {pageRows.map((m) => {
                const isTarget = state.targetMajorIds.includes(m.id);
                return (
                  <tr key={m.id} className="border-b border-slate-50 dark:border-border/50 hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{m.code || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-bold text-slate-800 dark:text-white whitespace-nowrap">{m.institution_name || '—'}</div>
                      <div className="text-[11px] text-slate-400">{m.institution_location || ''}</div>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-300">{m.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant="secondary" className="text-[10px] font-bold">{m.jenjang || '—'}</Badge>
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-border gap-3 flex-wrap">
            <p className="text-xs text-slate-400">
              Halaman {safePage} dari {totalPages} • {fmt(filtered.length)} prodi
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setPage(safePage + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};