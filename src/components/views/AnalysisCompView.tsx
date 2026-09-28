import React, { useEffect, useState } from 'react';
import { BookOpen, ExternalLink, GraduationCap, Lightbulb, Sparkles, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { useAppState } from '../../lib/store';
import { cn } from '../../lib/utils';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const WEAK_THRESHOLD = 550;

const STUDY_GUIDE: Record<string, { tips: string; bimbel: string }> = {
  PU: {
    tips: 'Perkuat logika deduktif, silogisme, dan pola bilangan dengan latihan soal bertahap dari mudah ke sulit.',
    bimbel: 'Kelas intensif TPS/UTBK Ganesha Operation (GO)'
  },
  PPU: {
    tips: 'Rutin membaca wawasan kebangsaan, sejarah, dan isu terkini agar pemahaman umum makin luas.',
    bimbel: 'Kelas literasi Zenius (ZenCore)'
  },
  PBM: {
    tips: 'Latih membaca cepat dan kritis: ringkas setiap artikel menjadi 3 poin utama saat membaca.',
    bimbel: 'Program literasi Ruangguru'
  },
  PK: {
    tips: 'Bangun ulang aljabar, geometri, dan statistika dasar dari konsep awal per bab, lalu lanjut soal HOTS.',
    bimbel: 'Kelas intensif Matematika Pahamify'
  },
  LBI: {
    tips: 'Biasakan membaca koran/esai serta kerjakan soal ide pokok dan makna kata secara rutin.',
    bimbel: 'Program Bahasa Indonesia intensif (GO/Neutron)'
  },
  LBE: {
    tips: 'Jadwalkan latihan reading comprehension 15 menit/hari ala TOEFL: skimming lalu scanning kata kunci.',
    bimbel: 'Kelas Bahasa Inggris intensif Ruangguru'
  },
  PM: {
    tips: 'Fokus soal cerita kontekstual: baca pelan, ubah ke model matematika, lalu periksa ulang jawaban.',
    bimbel: 'Kelas intensif Penalaran Matematika Zenius'
  }
};

export const AnalysisCompView: React.FC<{ setActiveTab?: (tab: string) => void }> = ({ setActiveTab }) => {
  const state = useAppState();
  const latestResult = state.results[0];

  const [phase, setPhase] = useState<'loading' | 'ready' | 'empty'>(() =>
    state.competencies.length > 0 ? 'ready' : 'loading'
  );

  useEffect(() => {
    if (state.competencies.length > 0) {
      setPhase('ready');
      return;
    }
    const t = setTimeout(() => setPhase('empty'), 2500);
    return () => clearTimeout(t);
  }, [state.competencies.length]);

  const chartData = state.competencies.map(comp => {
    const skor = latestResult?.scores[comp.code] || 0;
    return {
      code: comp.code,
      name: comp.name,
      skor,
      nasional: 550
    };
  });

  const weakItems = state.competencies
    .map(comp => ({ comp, skor: latestResult?.scores[comp.code] || 0 }))
    .filter(x => x.skor > 0)
    .sort((a, b) => a.skor - b.skor);

  const belowThreshold = weakItems.filter(x => x.skor < WEAK_THRESHOLD).slice(0, 3);
  const studyItems = belowThreshold.length > 0 ? belowThreshold : weakItems.slice(0, 1);

  if (phase === 'loading') {
    return (
      <div className="space-y-8 pb-16 animate-in fade-in duration-300">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-muted-foreground">
          <TrendingUp className="w-4 h-4 animate-pulse" />
          Menganalisis nilai...
        </div>
        <Card className="p-6 lg:p-8 rounded-3xl ring-0 bg-card border border-slate-100 dark:border-border shadow-xs gap-6">
          <Skeleton className="h-5 w-64" />
          <div className="w-full h-80 pt-4 space-y-4">
            <Skeleton className="h-72 w-full" />
          </div>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map(i => (
            <Card key={i} className="p-5 rounded-2xl ring-0 bg-card border border-slate-100 dark:border-border shadow-2xs">
              <div className="flex items-start gap-4">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'empty' || state.competencies.length === 0) {
    return (
      <div className="space-y-8 pb-16 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Analisis Kompetensi & Pemetaan 7 Subtes</h2>
            <p className="text-xs text-slate-400 mt-0.5">Pantau kekuatan kognitif Anda dibandingkan rata-rata nasional IRT</p>
          </div>
        </div>

        <Card className="p-8 rounded-3xl ring-0 bg-card border border-slate-100 dark:border-border shadow-xs flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center">
            <Lightbulb className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-base text-slate-800 dark:text-white">Belum Ada Data Kompetensi</h3>
          <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed max-w-md">
            Statistik 7 subtes hanya bisa ditampilkan setelah Anda punya catatan hasil tryout. Masuk akun lalu lengkapi data
            nilai untuk melihat grafik dan saran belajarnya.
          </p>
          {setActiveTab ? (
            <Button onClick={() => setActiveTab('tryouts')} className="mt-1 gap-2">
              <GraduationCap className="w-4 h-4" />
              Ke Halaman Tryout
            </Button>
          ) : null}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Analisis Kompetensi & Pemetaan 7 Subtes</h2>
          <p className="text-xs text-slate-400 mt-0.5">Pantau kekuatan kognitif Anda dibandingkan rata-rata nasional IRT</p>
        </div>
      </div>

      {/* Bar Chart */}
      <Card className="p-6 lg:p-8 rounded-3xl ring-0 bg-card border border-slate-100 dark:border-border shadow-xs gap-6">
        <CardTitle className="text-base font-bold text-slate-800 dark:text-white">Skor Subtes Terakhir vs Rata-rata Nasional</CardTitle>

        <div className="w-full h-80 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.4} />
              <XAxis dataKey="code" stroke="#94a3b8" fontSize={11} fontWeight="bold" tickLine={false} />
              <YAxis domain={[0, 1000]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#111111', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
              <Bar dataKey="skor" name="Skor Saya" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.skor >= 650 ? '#2DD4BF' : entry.skor >= 550 ? '#FF6B6B' : '#FBBF24'} />
                ))}
              </Bar>
              <Bar dataKey="nasional" name="Rata-rata Nasional" fill="#cbd5e1" opacity={0.4} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Competencies Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.competencies.map(comp => {
          const skor = latestResult?.scores[comp.code] || 0;
          return (
            <Card key={comp.code} className="p-5 rounded-2xl ring-0 bg-card border border-slate-100 dark:border-border shadow-2xs flex items-start gap-4">
              <Badge
                variant="outline"
                className="w-12 h-12 rounded-2xl bg-primary/10 text-primary font-black text-sm flex items-center justify-center shrink-0 mt-0.5 border-primary/20 px-0"
              >
                {comp.code}
              </Badge>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{comp.name}</h4>
                  <span className="font-extrabold text-base text-primary">{skor}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{comp.description}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Saran Peningkatan Belajar */}
      {studyItems.length > 0 ? (
        <Card className="p-6 lg:p-8 rounded-3xl ring-0 bg-card border border-slate-100 dark:border-border shadow-xs gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-800 dark:text-white">Saran Peningkatan Belajar</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Deteksi mapel terlemah dari hasil tryout terakhir & rekomendasi bimbel/materi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {studyItems.map(({ comp, skor }) => {
              const guide = STUDY_GUIDE[comp.code] || {
                tips: 'Ulangi materi dasar subtes ini dan perbanyak latihan soal tipe UTBK.',
                bimbel: 'Kelas intensif UTBK di bimbel terdekat'
              };
              const weak = skor < WEAK_THRESHOLD;
              const matchedTcs = state.tutoringCenters
                .filter(tc => tc.focus_competency_code === comp.code && tc.link_url && tc.link_url !== '#')
                .slice(0, 2);
              return (
                <div
                  key={comp.code}
                  className={cn(
                    'p-5 rounded-2xl border flex flex-col gap-3',
                    weak
                      ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40'
                      : 'bg-slate-50 dark:bg-card border-slate-200 dark:border-border/60'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          'w-10 h-10 rounded-xl font-black text-xs items-center justify-center border px-0',
                          weak
                            ? 'bg-amber-100 text-amber-600 border-amber-200'
                            : 'bg-primary/10 text-primary border-primary/20'
                        )}
                      >
                        {comp.code}
                      </Badge>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white leading-tight">{comp.name}</h4>
                        <span className="text-[11px] font-semibold text-slate-400">Skor: {skor}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn('rounded-full text-[10px] px-2.5', weak ? 'text-amber-600 border-amber-200 bg-amber-100/60' : 'text-emerald-600 border-emerald-200 bg-emerald-100/60')}>
                      {weak ? 'Perlu Perhatian' : 'Terendah'}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <BookOpen className="inline w-3.5 h-3.5 mr-1 -mt-0.5 text-slate-400" />
                    {guide.tips}
                  </p>

                  {matchedTcs.length > 0 ? (
                    <div className="space-y-2 pt-1">
                      {matchedTcs.map(tc => (
                        <a
                          key={tc.id}
                          href={tc.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between gap-2 rounded-xl bg-card border border-slate-200 dark:border-border/70 p-3 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{tc.name}</p>
                              <p className="text-[10px] text-slate-400">
                                {tc.rating ? `★ ${tc.rating}` : ''}{tc.rating && tc.price ? ' • ' : ''}{tc.price || ''}
                              </p>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary shrink-0 transition-all group-hover:gap-2">
                            Buka
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        </a>
                      ))}
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 pt-1">
                        <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                        Rekomendasi: {guide.bimbel}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 pt-1 border-t border-slate-100 dark:border-border/60">
                      <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                      Rekomendasi: {guide.bimbel}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 mt-4 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            Sumber belajar gratis: <a href="https://www.khanacademy.org" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline underline-offset-2">Khan Academy</a> — lengkapi dengan daftar kelas intensif sesuai saran di atas.
          </p>
        </Card>
      ) : null}

    </div>
  );
};