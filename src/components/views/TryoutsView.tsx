import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Award, BookOpen, Clock, Download, FileSpreadsheet, FileText, Play, CheckCircle2 } from 'lucide-react';
import { useAppState } from '../../lib/store';
import { Tryout, TryoutResult } from '../../types';
import { cn } from '../../lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RESULTS_PAGE_SIZE = 8;

interface ResultRowProps {
  res: TryoutResult;
  onBedah: (res: TryoutResult) => void;
}

const ResultRow = React.memo(({ res, onBedah }: ResultRowProps) => {
  return (
    <TableRow className="hover:bg-slate-50/80 dark:hover:bg-muted/80 transition-colors">
      <TableCell className="py-4 px-6">
        <span className="font-bold text-slate-800 dark:text-white block">{res.tryout_name}</span>
        <span className="text-[10px] text-slate-400">{res.tryout_type}</span>
      </TableCell>
      <TableCell className="py-4 px-6 text-slate-500">{new Date(res.created_at).toLocaleDateString('id-ID')}</TableCell>
      <TableCell className="py-4 px-4 text-center font-extrabold text-primary text-sm">{res.total_score}</TableCell>
      <TableCell className="py-4 px-4 text-center">
        <Badge 
          variant="outline"
          className={cn(
            "h-auto px-2.5 py-0.5 rounded-full text-[10px] font-bold",
            (res.predicate === 'Sangat Baik' || res.predicate === 'Baik')
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-100 text-amber-700 border-amber-200'
          )}
        >
          {res.predicate}
        </Badge>
      </TableCell>
      <TableCell className="py-4 px-4 text-center">{res.scores.PU || '-'}</TableCell>
      <TableCell className="py-4 px-4 text-center font-bold text-slate-800 dark:text-white">{res.scores.PK || '-'}</TableCell>
      <TableCell className="py-4 px-4 text-center">{res.scores.LBE || '-'}</TableCell>
      <TableCell className="py-4 px-4 text-center">{res.scores.PM || '-'}</TableCell>
      <TableCell className="py-4 px-6 text-right">
        <Button 
          variant="link"
          size="sm"
          onClick={() => onBedah(res)}
          className="text-xs font-bold text-primary h-auto p-0"
        >
          Bedah Nilai →
        </Button>
      </TableCell>
    </TableRow>
  );
});
ResultRow.displayName = 'ResultRow';

interface TryoutsViewProps {
  onTakeTryout: (tryout: Tryout) => void;
  defaultSubTab?: 'list' | 'history';
}

export const TryoutsView: React.FC<TryoutsViewProps> = ({ onTakeTryout, defaultSubTab = 'list' }) => {
  const state = useAppState();
  const [subTab, setSubTab] = useState<'list' | 'history'>(defaultSubTab);
  const [filterType, setFilterType] = useState<string>('semua');
  const [page, setPage] = useState(1);
  const [handlingExport, setHandlingExport] = useState<'none' | 'pdf' | 'excel'>('none');

  useEffect(() => {
    setPage(1);
  }, [subTab]);

  const completedTryoutIds = useMemo(
    () => new Set(state.results.map(r => r.tryout_id)),
    [state.results]
  );
  const isCompleted = (to: Tryout) => completedTryoutIds.has(to.id);

  const filteredTryouts = useMemo(() => {
    return state.tryouts.filter(t => {
      if (filterType === 'semua') return true;
      return t.type.toLowerCase().includes(filterType.toLowerCase());
    });
  }, [state.tryouts, filterType]);

  const totalPages = Math.max(1, Math.ceil(state.results.length / RESULTS_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * RESULTS_PAGE_SIZE;
  const pageResults = useMemo(
    () => state.results.slice(pageStart, pageStart + RESULTS_PAGE_SIZE),
    [state.results, pageStart]
  );

  const handleBedah = useCallback((res: TryoutResult) => {
    const to = state.tryouts.find(t => t.id === res.tryout_id) || state.tryouts[0];
    if (to) onTakeTryout(to);
  }, [state.tryouts, onTakeTryout]);

  const handleExportPDF = useCallback(async () => {
    if (handlingExport !== 'none') return;
    setHandlingExport('pdf');
    try {
      const { exportResultsPDF } = await import('../../lib/exportUtils');
      await exportResultsPDF(state.results, state.profile.full_name);
    } catch (e) {
      console.warn('Gagal export PDF:', e);
    } finally {
      setHandlingExport('none');
    }
  }, [handlingExport, state.results, state.profile.full_name]);

  const handleExportExcel = useCallback(async () => {
    if (handlingExport !== 'none') return;
    setHandlingExport('excel');
    try {
      const { exportResultsExcel } = await import('../../lib/exportUtils');
      await exportResultsExcel(state.results, state.profile.full_name);
    } catch (e) {
      console.warn('Gagal export Excel:', e);
    } finally {
      setHandlingExport('none');
    }
  }, [handlingExport, state.results, state.profile.full_name]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Page Title & Header Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Modul Simulasi Ujian Tryout</h2>
          <p className="text-xs text-slate-400 mt-0.5">Kerjakan ujian simulasi 7 subtes resmi dan pantau rekap skor total Anda</p>
        </div>

        <Tabs value={subTab} onValueChange={(v) => setSubTab(v as 'list' | 'history')}>
          <TabsList className="bg-slate-100 dark:bg-card p-1 rounded-2xl shrink-0 h-auto">
            <TabsTrigger value="list" className="px-4 py-2 rounded-xl text-xs font-bold data-active:bg-white dark:data-active:bg-primary data-active:text-primary dark:data-active:text-white data-active:shadow-xs">
              📋 Daftar Tryout Tersedia ({state.tryouts.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="px-4 py-2 rounded-xl text-xs font-bold data-active:bg-white dark:data-active:bg-primary data-active:text-primary dark:data-active:text-white data-active:shadow-xs">
              🏆 Hasil Tryout Saya ({state.results.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {subTab === 'list' ? (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-wrap gap-2">
            {['Semua', 'UTBK SNBT', 'Ujian Kedinasan', 'Ujian Mandiri'].map(ft => (
              <Button
                key={ft}
                variant="outline"
                size="sm"
                onClick={() => setFilterType(ft.toLowerCase())}
                className={cn(
                  "px-4 py-1.5 h-auto rounded-xl text-xs font-semibold",
                  filterType === ft.toLowerCase()
                    ? 'bg-primary text-white border-primary shadow-sm hover:bg-primary'
                    : 'bg-card text-slate-600 dark:text-slate-300 border-slate-200 dark:border-border hover:border-primary'
                )}
              >
                {ft}
              </Button>
            ))}
          </div>

          {/* Tryout Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTryouts.map((to) => (
              <Card key={to.id} className="p-6 rounded-3xl ring-0 bg-card border border-slate-100 dark:border-border shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group gap-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] font-bold h-auto px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-primary border-indigo-200 dark:border-indigo-800">
                      {to.type}
                    </Badge>
                    <span className="text-xs text-slate-400 font-medium">
                      Pelaksanaan: {new Date(to.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-800 dark:text-white group-hover:text-primary transition-colors">
                    {to.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed">
                    {to.description}
                  </p>

                  <div className="pt-2 flex flex-wrap gap-3 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-card px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-primary" /> {to.duration_minutes} Menit
                    </span>
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-card px-2.5 py-1 rounded-lg">
                      <BookOpen className="w-3.5 h-3.5 text-primary" /> {to.question_count} Soal (7 Subtes)
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-border/80 mt-6 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Status Sesi:</span>
                    <span className={cn("font-bold text-xs", isCompleted(to) ? 'text-emerald-500' : 'text-amber-500')}>
                      {isCompleted(to) ? '✓ Sudah Dikerjakan' : 'Tersedia Sekarang'}
                    </span>
                  </div>

                  <Button
                    onClick={() => onTakeTryout(to)}
                    className={cn(
                      "px-6 py-2.5 h-auto rounded-xl text-xs font-bold shadow-md gap-2",
                      isCompleted(to)
                        ? 'bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        : 'bg-primary text-white hover:bg-primary/90 shadow-primary/30'
                    )}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isCompleted(to) ? 'Kerjakan Ulang / Edit Skor' : 'Mulai Tryout'}</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Action Export Bar */}
          <Card className="p-4 rounded-2xl ring-0 bg-card border border-slate-100 dark:border-border shadow-2xs flex flex-wrap items-center justify-between gap-4 gap-0">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <span className="text-xs font-bold text-slate-800 dark:text-white">Rekapitulasi Seluruh Sesi Tryout</span>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={handlingExport !== 'none' || state.results.length === 0}
                className="rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold gap-2 border border-rose-200 dark:border-rose-800 disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{handlingExport === 'pdf' ? 'Membuat...' : 'Cetak PDF Resmi'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                disabled={handlingExport !== 'none' || state.results.length === 0}
                className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 text-xs font-bold gap-2 border border-emerald-200 dark:border-emerald-800 disabled:opacity-50"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{handlingExport === 'excel' ? 'Membuat...' : 'Export Excel'}</span>
              </Button>
            </div>
          </Card>

          {/* Table */}
          <Card className="rounded-3xl ring-0 bg-card border border-slate-100 dark:border-border shadow-xs overflow-hidden gap-0">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-card">
                <TableRow className="border-b border-slate-100 dark:border-border hover:bg-transparent">
                  <TableHead className="py-4 px-6 text-slate-400 font-bold uppercase tracking-wider text-xs">Simulasi Tryout</TableHead>
                  <TableHead className="py-4 px-6 text-slate-400 font-bold uppercase tracking-wider text-xs">Tanggal</TableHead>
                  <TableHead className="py-4 px-4 text-center text-slate-400 font-bold uppercase tracking-wider text-xs">Skor Total (IRT)</TableHead>
                  <TableHead className="py-4 px-4 text-center text-slate-400 font-bold uppercase tracking-wider text-xs">Predikat</TableHead>
                  <TableHead className="py-4 px-4 text-center text-slate-400 font-bold uppercase tracking-wider text-xs">PU</TableHead>
                  <TableHead className="py-4 px-4 text-center text-slate-400 font-bold uppercase tracking-wider text-xs">PK</TableHead>
                  <TableHead className="py-4 px-4 text-center text-slate-400 font-bold uppercase tracking-wider text-xs">LBE</TableHead>
                  <TableHead className="py-4 px-4 text-center text-slate-400 font-bold uppercase tracking-wider text-xs">PM</TableHead>
                  <TableHead className="py-4 px-6 text-right text-slate-400 font-bold uppercase tracking-wider text-xs">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {pageResults.map((res) => (
                  <ResultRow key={res.id} res={res} onBedah={handleBedah} />
                ))}
              </TableBody>
            </Table>
            {state.results.length === 0 ? (
              <div className="py-16 px-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-primary flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-white">Belum ada hasil tryout</p>
                <p className="text-xs text-slate-400 mt-1">Kerjakan tryout pertama Anda untuk melihat rekapitulasi skor di sini.</p>
              </div>
            ) : totalPages > 1 ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-border bg-slate-50/50 dark:bg-muted/20">
                <span className="text-xs font-semibold text-slate-400">
                  Menampilkan {pageStart + 1}-{Math.min(pageStart + RESULTS_PAGE_SIZE, state.results.length)} dari {state.results.length} hasil
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage <= 1}
                    onClick={() => setPage(Math.max(1, safePage - 1))}
                    className="h-8 px-3 text-xs font-bold cursor-pointer disabled:opacity-40"
                  >
                    ← Prev
                  </Button>
                  <Badge variant="outline" className="h-8 px-3 rounded-lg text-xs font-bold">
                    Halaman {safePage} / {totalPages}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                    className="h-8 px-3 text-xs font-bold cursor-pointer disabled:opacity-40"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      )}

    </div>
  );
};
