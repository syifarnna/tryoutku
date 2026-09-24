import React, { useMemo, useState } from 'react';
import { Building2, CheckCircle2, GraduationCap, Plus, ShieldCheck, Sparkles, Target, TrendingUp, Zap } from 'lucide-react';
import { appStore, useAppState } from '../../lib/store';
import { Major } from '../../types';
import { cn } from '../../lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface EvaluatedResult {
  campusId: number;
  campusGrade: number | null;
  met: boolean;
  delta: number;
}

const DEFAULT_ALTERNATIVE_LIMIT = 3;

export const MantepView: React.FC = () => {
  const state = useAppState();

  const [score, setScore] = useState<string>(() => {
    try { return localStorage.getItem('tryoutku_mantep_v1') ? JSON.parse(localStorage.getItem('tryoutku_mantep_v1')!).score : ''; } catch { return ''; }
  });
  const [selectedCampusId, setSelectedCampusId] = useState<string>(() => {
    try {
      const raw = localStorage.getItem('tryoutku_mantep_v1');
      if (raw) return JSON.parse(raw).campusId || '';
    } catch {}
    return '';
  });
  const [result, setResult] = useState<EvaluatedResult | null>(null);
  const [insist, setInsist] = useState(false);

  const campuses = useMemo(
    () => [...state.institutions].sort((a, b) => a.name.localeCompare(b.name)),
    [state.institutions]
  );

  const campusGradeOf = (id: number): number | null => {
    const inst = state.institutions.find(i => i.id === id);
    if (inst?.grade != null) return inst.grade;
    const pgs = state.majors.filter(m => m.institution_id === id && m.passing_grade_total != null).map(m => m.passing_grade_total);
    if (pgs.length === 0) return null;
    pgs.sort((a, b) => a - b);
    return pgs[Math.floor(pgs.length / 2)];
  };

  const selectedCampus = useMemo(
    () => state.institutions.find(i => i.id === Number(selectedCampusId)) || null,
    [state.institutions, selectedCampusId]
  );

  const evaluate = () => {
    const scoreNum = Number(score);
    if (!selectedCampus || !score || Number.isNaN(scoreNum)) return;
    const grade = campusGradeOf(selectedCampus.id);
    const met = grade != null && scoreNum >= grade;
    setResult({ campusId: selectedCampus.id, campusGrade: grade, met, delta: grade != null ? Math.round((grade - scoreNum) * 10) / 10 : 0 });
    try {
      localStorage.setItem('tryoutku_mantep_v1', JSON.stringify({ score: score, campusId: selectedCampus.id }));
    } catch {}
  };

  const scoreNum = Number(score);
  const campusMajors = useMemo(() => {
    if (!result) return [];
    return state.majors
      .filter(m => m.institution_id === result.campusId)
      .sort((a, b) => (a.passing_grade_total || 0) - (b.passing_grade_total || 0));
  }, [state.majors, result]);

  const alternativeCampuses = useMemo(() => {
    if (!result || result.met) return [];
    return state.institutions
      .filter(i => {
        if (i.id === result.campusId) return false;
        const g = campusGradeOf(i.id);
        return g != null && scoreNum >= g;
      })
      .map(i => ({ inst: i, grade: campusGradeOf(i.id) as number }))
      .sort((a, b) => b.grade - a.grade)
      .slice(0, DEFAULT_ALTERNATIVE_LIMIT);
  }, [state.institutions, result, scoreNum]);

  const altMajorsOf = (instId: number): Major[] =>
    state.majors
      .filter(m => m.institution_id === instId && m.passing_grade_total != null && m.passing_grade_total <= scoreNum)
      .sort((a, b) => (b.passing_grade_total || 0) - (a.passing_grade_total || 0))
      .slice(0, DEFAULT_ALTERNATIVE_LIMIT);

  const fmt = (n?: number | null) => n == null ? '—' : n;

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-linear-to-r from-sky-600 to-indigo-700 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <Badge className="bg-white/15 text-white border-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md h-auto px-3 py-1 gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-300" /> Jalur 1 — Saya Mantep
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Input Nilai &amp; Cek Kampus Impian Anda</h2>
          <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
            Masukkan skor UTBK Anda lalu pilih <strong>kampus impian</strong>. Sistem akan mengevaluasi terhadap <strong>Grade Campus</strong> &amp; passing grade prodi, lalu menampilkan jurusan yang sesuai — atau menyarankan kampus/jurusan alternatif yang realistis.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 hidden lg:flex items-center justify-center opacity-10 pointer-events-none pr-6">
          <GraduationCap className="w-72 h-72" />
        </div>
      </div>

      {/* Input Form */}
      <Card className="p-6 lg:p-8 rounded-3xl ring-0 bg-card border border-slate-100 dark:border-border shadow-xs gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">1. Skor UTBK / Nilai Anda (0 – 1000)</Label>
            <div className="relative">
              <TrendingUp className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="number"
                min={0}
                max={1000}
                value={score}
                onChange={(e) => { setScore(e.target.value); if (result) setResult(null); }}
                placeholder="contoh: 672.5"
                className="pl-10 h-12 text-base font-bold"
              />
            </div>
            <p className="text-[11px] text-slate-400">Gunakan skor total UTBK SNBT terbaru Anda.</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">2. Kampus Impian</Label>
            <select
              value={selectedCampusId}
              onChange={(e) => { setSelectedCampusId(e.target.value); if (result) setResult(null); }}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-card border border-slate-200 dark:border-border text-sm focus:outline-none focus:border-primary dark:text-white h-12"
            >
              <option value="">-- Pilih Kampus Impian --</option>
              {campuses.map(c => {
                const g = campusGradeOf(c.id);
                return (
                  <option key={c.id} value={c.id}>
                    {c.name}{g != null ? ` (Grade ${g})` : ' (grade belum diatur)'}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-border">
          <p className="text-xs text-slate-400">
            {selectedCampus ? (
              selectedCampus.grade != null
                ? <span>Grade Campus <strong className="text-primary">{selectedCampus.grade}</strong> • Range nilai {fmt(selectedCampus.range_min)} – {fmt(selectedCampus.range_max)}</span>
                : <span className="text-amber-500">Grade campus belum diatur admin. Evaluasi memakai median passing grade prodi.</span>
            ) : 'Pilih kampus impian untuk melihat gradanya.'}
          </p>
          <Button onClick={evaluate} disabled={!selectedCampus || !score} className="px-6 py-3 h-auto rounded-xl bg-primary text-white hover:bg-primary/90 text-sm font-bold shadow-md gap-2">
            <Target className="w-4 h-4" /> Evaluasi Kampus Impian
          </Button>
        </div>
      </Card>

      {/* Hasil Evaluasi */}
      {result && (() => {
        const campus = state.institutions.find(i => i.id === result.campusId);
        if (!campus) return null;

        if (result.met) {
          return (
            <Card className="p-6 lg:p-8 rounded-3xl ring-0 bg-card border border-slate-100 dark:border-border shadow-xs gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Selamat, Anda <span className="text-emerald-600 dark:text-emerald-400">Terkualifikasi</span> di {campus.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Skor Anda <strong className="text-slate-800 dark:text-white">{scoreNum}</strong> memenuhi Grade Campus <strong>{result.campusGrade}</strong>. Berikut jurusan di {campus.name} yang diurutkan berdasarkan Passing Grade:
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jurusan di Kampus Impian ({campusMajors.length}) — urut grade naik</p>
                {campusMajors.length === 0 && (
                  <p className="text-sm text-slate-400 py-6 text-center border-2 border-dashed border-slate-200 dark:border-border rounded-2xl">Belum ada data prodi untuk kampus ini.</p>
                )}
                {campusMajors.map((m, i) => {
                  const pass = m.passing_grade_total != null && m.passing_grade_total <= scoreNum;
                  return (
                    <div key={m.id} className={cn(
                      'p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 transition-colors',
                      pass
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
                        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-border'
                    )}>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">{i + 1}</span>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{m.name}</p>
                          <p className="text-[11px] text-slate-400">PG {fmt(m.passing_grade_total)} • {m.cluster}</p>
                        </div>
                      </div>
                      <Badge className={cn(
                        'rounded-full text-[10px] font-bold h-auto px-2.5 py-1',
                        pass ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      )}>
                        {pass ? '✓ Lolos' : 'Belum Lolos'}
                      </Badge>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => state.targetMajorIds.includes(campusMajors[0]?.id) ? null : (campusMajors[0] && appStore.addTargetMajor(campusMajors[0].id))} className="gap-2">
                  <Plus className="w-4 h-4" /> Jadikan Target Prodi Teratas
                </Button>
              </div>
            </Card>
          );
        }

        const gapToTip = result.campusGrade != null ? result.campusGrade - scoreNum : null;
        return (
          <div className="space-y-8">
            {/* Belum terpenuhi */}
            <Card className="p-6 lg:p-8 rounded-3xl ring-0 bg-card border border-rose-200 dark:border-rose-900/60 shadow-xs gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Skor Anda <span className="text-rose-500">Belum Mencapai</span> Grade {campus.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Score Anda <strong className="text-slate-800 dark:text-white">{scoreNum}</strong> masih perlu{' '}
                    <strong className="text-rose-500">{gapToTip != null && gapToTip > 0 ? gapToTip : 0} poin</strong>{' '}
                    untuk Grade Campus <strong>{result.campusGrade}</strong>. Jangan khawatir — berikut kami siapkan kampus &amp; jurusan alternatif yang sesuai nilainya.
                  </p>
                </div>
              </div>
            </Card>

            {/* Rekomendasi alternatif */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-extrabold text-base text-slate-800 dark:text-white">Rekomendasi Kampus &amp; Jurusan Alternatif (Grade ≤ {scoreNum})</h3>
              </div>
              {alternativeCampuses.length === 0 && (
                <Card className="p-8 text-center bg-card border border-slate-100 dark:border-border rounded-3xl">
                  <p className="text-sm text-slate-500">Belum ada kampus lain dengan Grade Campus ≤ skor Anda saat ini. Raih skor lebih tinggi di tryout berikutnya!</p>
                </Card>
              )}
              <div className="space-y-6">
                {alternativeCampuses.map(({ inst, grade }) => (
                  <Card key={inst.id} className="p-5 rounded-3xl bg-card border border-slate-100 dark:border-border shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800 dark:text-white">{inst.name}</p>
                          <p className="text-[11px] text-slate-400">{inst.location || ''}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                        Grade {grade}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jurusan yang realistis:</p>
                      {altMajorsOf(inst.id).map(m => (
                        <div key={m.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-border flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{m.name}</p>
                            <p className="text-[10px] text-slate-400">PG {fmt(m.passing_grade_total)} • {m.cluster}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => !state.targetMajorIds.includes(m.id) && appStore.addTargetMajor(m.id)}
                            disabled={state.targetMajorIds.includes(m.id)}
                            className="text-[11px] font-bold text-primary h-auto"
                          >
                            {state.targetMajorIds.includes(m.id) ? '✓ Target' : '+ Target'}
                          </Button>
                        </div>
                      ))}
                      {altMajorsOf(inst.id).length === 0 && (
                        <p className="text-xs text-slate-400">Belum ada prodi yang passing grade-nya ≤ skor Anda di kampus ini.</p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Masih pada pendirian -> Bimbel */}
            <div className="rounded-3xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/20 p-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={insist}
                  onChange={(e) => setInsist(e.target.checked)}
                  className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm font-bold text-slate-800 dark:text-white">
                  Saya tetap pada pendirian — tidak mau pindah kampus impian.
                </span>
              </label>
              <p className="text-xs text-slate-500 mt-1 pl-8">
                Jika tetap pada pendirian, kami tampilkan <strong>Rekomendasi Bimbel</strong> untuk mengejar selisih skor {gapToTip != null && gapToTip > 0 ? gapToTip : 0} poin menuju Grade {result.campusGrade}.
              </p>

              {insist && (
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {state.tutoringCenters.length === 0 && (
                    <p className="col-span-full text-sm text-slate-500 text-center py-4">Belum ada data bimbel dari database.</p>
                  )}
                  {state.tutoringCenters.map(tc => (
                    <Card key={tc.id} className="p-5 rounded-2xl bg-card border border-slate-100 dark:border-border shadow-xs flex flex-col justify-between gap-0">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Badge className="rounded-full text-[10px] font-bold bg-amber-500 text-white border-0">★ {tc.rating ?? '—'}</Badge>
                          <span className="text-[10px] font-bold text-primary">{tc.price}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white">{tc.name}</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{tc.description || ''}</p>
                        {tc.focus_competency_code && (
                          <Badge variant="outline" className="rounded-md text-[10px] font-bold text-slate-500">
                            Fokus: {tc.focus_competency_code}
                          </Badge>
                        )}
                      </div>
                      <div className="pt-4 mt-3 border-t border-slate-100 dark:border-border">
                        <Button variant="outline" size="sm" className="w-full rounded-xl text-[11px] font-bold" onClick={() => { if (tc.link_url && tc.link_url !== '#') window.open(tc.link_url, '_blank'); }}>
                          Hubungi Bimbel {tc.contact_info ? `• ${tc.contact_info}` : ''}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};