import React, { useMemo, useState } from 'react';
import { BookOpen, Brain, CheckCircle2, Compass, HelpCircle, Loader2, Plus, RotateCcw, Save, Sparkles, Target, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { appStore, useAppState } from '../../lib/store';
import { ClusterType, Institution, PenjurusanQuestion } from '../../types';
import { cn } from '../../lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const CLUSTERS: ClusterType[] = ['Saintek', 'Soshum', 'Campuran'];

const clusterStyle: Record<ClusterType, { label: string; bar: string; badge: string; desc: string }> = {
  Saintek: {
    label: 'Saintek',
    bar: 'bg-sky-500',
    badge: 'bg-sky-500 text-white',
    desc: 'Senang pada sains & teknologi — cocok untuk rumpun Matematika & IPA (MIPA), Teknik, Kedokteran.',
  },
  Soshum: {
    label: 'Soshum',
    bar: 'bg-amber-500',
    badge: 'bg-amber-500 text-white',
    desc: 'Senang pada sosial & humaniora — cocok untuk rumpun Sosial & Humaniora (Soshum).',
  },
  Campuran: {
    label: 'Campuran / Multidisiplin',
    bar: 'bg-violet-500',
    badge: 'bg-violet-500 text-white',
    desc: 'Minatmu seimbang lintas rumpun — cocok untuk jurusan multidisiplin.',
  },
};

type Tally = Record<ClusterType, number>;

const emptyTally = (): Tally => ({ Saintek: 0, Soshum: 0, Campuran: 0 });

export const BingungView: React.FC = () => {
  const state = useAppState();

  const [phase, setPhase] = useState<'idle' | 'running' | 'result'>('idle');
  const [step, setStep] = useState(0);
  const [tally, setTally] = useState<Tally>(emptyTally());
  const [savingInterest, setSavingInterest] = useState(false);

  const questions = useMemo(() => state.questions.filter(q => q.is_active), [state.questions]);

  const total = questions.length;

  const showToast = (icon: 'success' | 'error', title: string) => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  };

  const handleSaveInterest = async (cluster: ClusterType, label: string) => {
    if (savingInterest) return;
    setSavingInterest(true);
    const ok = await appStore.saveInterest(cluster);
    setSavingInterest(false);
    if (ok) showToast('success', `Minat "${label}" tersimpan di profil Anda`);
    else showToast('error', 'Gagal menyimpan minat. Coba lagi.');
  };

  const handleClearInterest = async (cluster: ClusterType, label: string) => {
    const res = await Swal.fire({
      icon: 'question',
      title: 'Hapus minat saya?',
      text: `Rumpun "${label}" tidak akan tersimpan sebagai minat di profil Anda.`,
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#e11d48',
    });
    if (!res.isConfirmed) return;
    const ok = await appStore.clearInterest();
    if (ok) showToast('success', `Minat "${label}" telah dihapus`);
    else showToast('error', 'Gagal menghapus minat. Coba lagi.');
  };

  const lastResult = useMemo<{ dominant: ClusterType; tally: Tally } | null>(() => {
    try {
      const raw = localStorage.getItem('tryoutku_penjurusan_v1');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, []);

  const start = () => { if (total === 0) return; setPhase('running'); setStep(0); setTally(emptyTally()); };

  const pick = (cluster: ClusterType) => {
    setTally(t => ({ ...t, [cluster]: t[cluster] + 1 }));
    if (step + 1 >= total) {
      const next = { ...tally, [cluster]: tally[cluster] + 1 };
      setTally(next);
      const dominant = dominantOf(next);
      setPhase('result');
      try {
        localStorage.setItem('tryoutku_penjurusan_v1', JSON.stringify({ dominant, tally: next }));
      } catch {}
    } else {
      setStep(step + 1);
    }
  };

  const dominantOf = (t: Tally): ClusterType => {
    const entries = CLUSTERS.map(c => ({ c, n: t[c] }));
    entries.sort((a, b) => b.n - a.n);
    const top = entries[0].n;
    const winners = entries.filter(e => e.n === top);
    if (winners.length >= 2) return 'Campuran';
    return entries[0].c;
  };

  const recommendedMajors = useMemo(() => {
    const dom = phase === 'result' ? dominantOf(tally) : lastResult?.dominant;
    if (!dom) return [];
    if (dom === 'Campuran') {
      const mix: typeof state.majors = [];
      for (const cl of ['Saintek', 'Soshum'] as ClusterType[]) {
        mix.push(...state.majors
          .filter(m => m.cluster === cl)
          .sort((a, b) => (a.passing_grade_total || 0) - (b.passing_grade_total || 0))
          .slice(0, 4));
      }
      return mix.sort((a, b) => (a.passing_grade_total || 0) - (b.passing_grade_total || 0)).slice(0, 6);
    }
    return state.majors
      .filter(m => m.cluster === dom)
      .sort((a, b) => (a.passing_grade_total || 0) - (b.passing_grade_total || 0))
      .slice(0, 6);
  }, [state.majors, phase, tally, lastResult]);

  const maxCount = Math.max(1, ...CLUSTERS.map(c => (phase === 'result' ? tally[c] : (lastResult?.tally?.[c] ?? 0))));

  const renderResult = (dominant: ClusterType) => {
    const s = clusterStyle[dominant];
    const isLive = phase === 'result';
    const tallyData = isLive ? tally : lastResult?.tally ?? emptyTally();
    const campuses = Array.from(new Set(recommendedMajors.map(m => m.institution_id)))
      .map(id => state.institutions.find(i => i.id === id))
      .filter((c): c is Institution => !!c);

    return (
      <div className="space-y-6">
        {/* Dominant card */}
        <Card className="p-6 lg:p-8 rounded-3xl ring-0 bg-card border border-slate-100 dark:border-border shadow-xs">
          <div className="flex items-center gap-4">
            <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md', s.badge)}>
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <Badge className="rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground h-auto px-2.5 py-1">Hasil Tes Penjurusan</Badge>
              <h3 className="font-extrabold text-xl text-slate-800 dark:text-white mt-1">
                Kecenderungan Anda: <span className="text-primary">{s.label}</span>
              </h3>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">{s.desc}</p>

          <div className="mt-6 space-y-3">
            {CLUSTERS.map(c => {
              const n = tallyData[c] ?? 0;
              const pct = Math.round((n / (total || 1)) * 100);
              return (
                <div key={c} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs font-bold text-slate-500 dark:text-slate-400">{c}</span>
                  <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className={cn('h-3 rounded-full transition-all duration-700', clusterStyle[c].bar)} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-14 text-right text-xs font-black text-slate-700 dark:text-slate-200">{n}/{total} soal</span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-border">
            {state.profile.major_interest !== dominant ? (
              <Button
                onClick={() => handleSaveInterest(dominant, s.label)}
                disabled={savingInterest}
                className={cn('gap-2', savingInterest && 'opacity-70')}
              >
                {savingInterest ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                ) : (
                  <><Save className="w-4 h-4" /> Simpan sebagai Minat Saya ({s.label})</>
                )}
              </Button>
            ) : (
              <>
                <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-5 py-2.5 text-sm font-bold shadow-sm">
                  <CheckCircle2 className="w-4 h-4" /> Tersimpan di Minat Saya ({s.label})
                </span>
                <Button
                  variant="outline"
                  className="gap-2 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900"
                  onClick={() => handleClearInterest(dominant, s.label)}
                >
                  <Trash2 className="w-4 h-4" /> Hapus dari Minat
                </Button>
              </>
            )}
            <Button variant="outline" onClick={start} className="gap-2">
              <RotateCcw className="w-4 h-4" /> Ulangi Tes
            </Button>
          </div>
        </Card>

        {/* Recommended majors */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-extrabold text-base text-slate-800 dark:text-white">Rekomendasi Jurusan untuk Anda ({s.label})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedMajors.map(m => {
              const inst = state.institutions.find(i => i.id === m.institution_id);
              return (
                <Card key={m.id} className="p-5 rounded-2xl bg-card border border-slate-100 dark:border-border shadow-xs flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <Badge className={cn('rounded-md text-[10px] font-bold text-white border-0', clusterStyle[m.cluster as ClusterType]?.badge || 'bg-primary')}>
                      {m.cluster}
                    </Badge>
                    <span className="text-[10px] font-black text-slate-400">PG {m.passing_grade_total ?? '—'}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white mt-3">{m.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 flex-1">{inst?.name || '—'}{inst?.location ? ` • ${inst.location}` : ''}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{m.jenjang || '—'}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => !state.targetMajorIds.includes(m.id) && appStore.addTargetMajor(m.id)}
                    disabled={state.targetMajorIds.includes(m.id)}
                    className="mt-3 text-[11px] font-bold text-primary h-auto"
                  >
                    {state.targetMajorIds.includes(m.id) ? '✓ Sudah Jadi Target' : <><Plus className="w-3.5 h-3.5" /> Jadikan Target Prodi</>}
                  </Button>
                </Card>
              );
            })}
          </div>
          {campuses.length > 0 && (
            <p className="text-xs text-slate-500 mt-4">
              Rekomendasi di atas tersebar di {campuses.length} kampus PTN ({campuses.map(c => c.name).join(', ')}).
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-linear-to-r from-violet-600 to-fuchsia-700 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <Badge className="bg-white/15 text-white border-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md h-auto px-3 py-1 gap-2">
            <Brain className="w-3.5 h-3.5 text-fuchsia-300" /> Jalur 2 — Tes Minat dan Bakat
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Temukan Jurusan Dengan Tes Penjurusan</h2>
          <p className="text-xs sm:text-sm text-violet-100 leading-relaxed">
            Belum menentukan arah studi? Kerjakan <strong>{total} pertanyaan minat &amp; bakat</strong> singkat — sistem akan menghitung kecenderungan rumpun Anda lalu merekomendasikan jurusan &amp; kampus yang paling sesuai.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 hidden lg:flex items-center justify-center opacity-10 pointer-events-none pr-6">
          <BookOpen className="w-72 h-72" />
        </div>
      </div>

      {total === 0 && (
        <Card className="p-10 text-center bg-card border border-slate-100 dark:border-border rounded-3xl">
          <HelpCircle className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-white">Belum ada soal penjurusan</h3>
          <p className="text-sm text-slate-400 mt-1">Admin belum menambahkan bank soal. Silakan hubungi admin untuk mengaktifkan jalur ini.</p>
        </Card>
      )}

      {total > 0 && phase !== 'running' && state.profile.major_interest && (
        <Card className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            Minat tersimpan: <strong>{clusterStyle[state.profile.major_interest]?.label ?? state.profile.major_interest}</strong>.
            {lastResult && ` Hasil terakhir: ${clusterStyle[lastResult.dominant].label}.`}
          </p>
        </Card>
      )}

      {phase === 'idle' && total > 0 && (
        <Card className="p-6 lg:p-10 rounded-3xl bg-card border border-slate-100 dark:border-border shadow-xs text-center max-w-3xl mx-auto gap-0">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-linear-to-br from-violet-500 to-fuchsia-600 text-white flex items-center justify-center shadow-lg mb-4">
            <Brain className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Siap Menemukan Arah?</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Tes terdiri dari <strong>{total} soal</strong>. Jawab sesuai insting Anda — tidak ada jawaban benar atau salah. Butuh sekitar 2 menit.
          </p>
          <Button onClick={start} size="lg" className="mt-6 px-8 py-3 h-auto rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-600 text-white font-bold shadow-lg gap-2">
            <Target className="w-4 h-4" /> Mulai Tes Penjurusan
          </Button>

          {lastResult && (
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-border">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Lihat hasil terakhir Anda</p>
              {renderResult(lastResult.dominant)}
            </div>
          )}
        </Card>
      )}

      {phase === 'running' && questions[step] && (
        <Card className="p-6 lg:p-10 rounded-3xl bg-card border border-slate-100 dark:border-border shadow-xs max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="rounded-full text-[11px] font-bold text-slate-500">
              Soal {step + 1} / {total}
            </Badge>
            <span className="text-[11px] font-bold text-primary">{Math.round(((step + 1) / total) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-6">
            <div className="h-2 rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 transition-all duration-300" style={{ width: `${((step + 1) / total) * 100}%` }} />
          </div>

          <h3 className="font-extrabold text-base sm:text-lg text-slate-800 dark:text-white leading-relaxed">
            {questions[step].question}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            {(['a', 'b', 'c', 'd'] as const).map((k, i) => {
              const opt = questions[step][`option_${k}`];
              const cl = questions[step][`cluster_${k}` as keyof PenjurusanQuestion] as ClusterType;
              if (!opt) return null;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => pick(cl)}
                  className="group p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-border hover:border-violet-500 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/30 text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-border font-black text-violet-600 dark:text-violet-400 text-xs flex items-center justify-center shrink-0 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600 transition-all">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-200 font-semibold leading-snug">{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {phase === 'result' && (() => {
        const dom = dominantOf(tally);
        return renderResult(dom);
      })()}
    </div>
  );
};