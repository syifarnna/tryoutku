import React, { useState } from 'react';
import { Award, CheckCircle2, Clock, Play, Sparkles, X } from 'lucide-react';
import { Tryout } from '../../types';
import { appStore, useAppState } from '../../lib/store';
import { cn } from '../../lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface TakeTryoutModalProps {
  tryout: Tryout | null;
  isOpen: boolean;
  onClose: () => void;
  onFinished: () => void;
}

export const TakeTryoutModal: React.FC<TakeTryoutModalProps> = ({ tryout, isOpen, onClose, onFinished }) => {
  const state = useAppState();
  const [activeTab, setActiveTab] = useState<'quick' | 'quiz'>('quick');
  
  const [scores, setScores] = useState<Record<string, number>>({
    PU: 715,
    PPU: 680,
    PBM: 690,
    PK: 645,
    LBI: 720,
    LBE: 610,
    PM: 635
  });

  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  if (!tryout) return null;

  const sampleQuestions = [
    {
      id: 1,
      comp: 'PU',
      compName: 'Penalaran Umum',
      q: 'Semua ilmuwan memiliki rasa ingin tahu yang tinggi. Sebagian mahasiswa adalah ilmuwan. Simpulan yang tepat adalah...',
      options: [
        'Semua mahasiswa memiliki rasa ingin tahu yang tinggi.',
        'Sebagian mahasiswa memiliki rasa ingin tahu yang tinggi.',
        'Tidak ada mahasiswa yang menjadi ilmuwan.',
        'Semua yang memiliki rasa ingin tahu adalah mahasiswa.'
      ],
      correct: 1
    },
    {
      id: 2,
      comp: 'PK',
      compName: 'Pengetahuan Kuantitatif',
      q: 'Jika 3x - 5 = 16, maka nilai dari 2x + 7 adalah...',
      options: ['19', '21', '23', '25'],
      correct: 1
    },
    {
      id: 3,
      comp: 'LBE',
      compName: 'Literasi Bahasa Inggris',
      q: 'What is the primary implication of adopting renewable energy sources in urban areas according to environmental economists?',
      options: [
        'Immediate doubling of electricity tariffs.',
        'Significant reduction in carbon footprints over a 10-year period.',
        'Complete elimination of public transportation needs.',
        'Unavoidable decrease in industrial production.'
      ],
      correct: 1
    },
    {
      id: 4,
      comp: 'PM',
      compName: 'Penalaran Matematika',
      q: 'Sebuah tangki air berbentuk tabung dengan jari-jari 1 meter diisi air dengan debit 100 liter/menit. Berapa menit waktu yang dibutuhkan untuk mengisi tangki hingga ketinggian 2 meter? (π ≈ 3.14)',
      options: ['42.8 menit', '52.4 menit', '62.8 menit', '72.1 menit'],
      correct: 2
    }
  ];

  const handleScoreChange = (code: string, val: number) => {
    setScores(prev => ({ ...prev, [code]: Math.max(0, Math.min(1000, val)) }));
  };

  const handleSubmitResult = (e: React.FormEvent) => {
    e.preventDefault();
    appStore.submitResult(tryout.id, scores);
    onFinished();
  };

  const handleQuizFinish = () => {
    const newScores = {
      PU: quizAnswers[1] === 1 ? 760 : 610,
      PPU: 695,
      PBM: 710,
      PK: quizAnswers[2] === 1 ? 730 : 590,
      LBI: 740,
      LBE: quizAnswers[3] === 1 ? 710 : 580,
      PM: quizAnswers[4] === 2 ? 725 : 605
    };
    appStore.submitResult(tryout.id, newScores);
    onFinished();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent 
        showCloseButton={false}
        className="sm:max-w-2xl rounded-3xl p-0 gap-0 ring-0 bg-white dark:bg-card border border-slate-100 dark:border-border shadow-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-border flex items-center justify-between bg-[#FF6B6B] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-white/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                Simulasi Ujian: {tryout.name}
              </h3>
              <p className="text-xs text-indigo-100 flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {tryout.duration_minutes} Menit</span>
                <span>• 7 Subtes Resmi UTBK</span>
              </p>
            </div>
          </div>
          <DialogClose render={<Button variant="ghost" size="icon-sm" className="text-white hover:bg-white/20" />}>
            <X className="w-5 h-5" />
          </DialogClose>
        </div>

        {/* Tab Selection */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'quick' | 'quiz')}>
          <TabsList className="border-b border-slate-100 dark:border-border px-6 pt-3 bg-slate-50 dark:bg-card rounded-none p-0 h-auto w-full justify-start gap-0">
            <TabsTrigger value="quick" className="pb-3 px-4 text-xs font-bold rounded-none data-active:text-[#FF6B6B] data-active:bg-transparent data-active:shadow-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#FF6B6B] after:rounded-t-full">
              <span>⚡ Input Cepat Skor Tryout</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="pb-3 px-4 text-xs font-bold rounded-none data-active:text-[#FF6B6B] data-active:bg-transparent data-active:shadow-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#FF6B6B] after:rounded-t-full">
              <span>📝 Mini Ujian Interaktif (4 Soal)</span>
            </TabsTrigger>
          </TabsList>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            
            <TabsContent value="quick" className="mt-0">
              <form onSubmit={handleSubmitResult} className="space-y-6">
                <p className="text-xs text-slate-500 dark:text-[#777] leading-relaxed">
                  Jika Anda sudah mengikuti tryout di lembaga lain (GO, NF, Brain Academy, Zenius, dll), ketikkan nilai skor IRT Anda di bawah ini agar sistem menghitung peluang lolos secara otomatis:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {state.competencies.map((comp) => (
                    <div key={comp.code} className="p-3.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card/50 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-slate-800 dark:text-white block">{comp.code}</span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[140px] block">{comp.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          min="0"
                          max="1000"
                          value={scores[comp.code] || 0}
                          onChange={(e) => handleScoreChange(comp.code, parseInt(e.target.value) || 0)}
                          className="w-20 h-auto px-2.5 py-1.5 rounded-xl bg-white dark:bg-card border-slate-300 dark:border-border text-xs font-bold text-center text-[#FF6B6B] focus:border-[#FF6B6B] focus:ring-[#FF6B6B]"
                        />
                        <span className="text-[10px] text-slate-400">/1000</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">Estimasi Rata-rata Skor Total:</span>
                    <span className="text-xl font-extrabold text-[#FF6B6B]">
                      {((Object.values(scores) as number[]).reduce((a, b) => a + b, 0) / 7).toFixed(1)}
                    </span>
                  </div>
                  <Button
                    type="submit"
                    className="px-6 py-3 h-auto rounded-2xl bg-[#FF6B6B] text-white text-xs font-bold hover:bg-[#E85D5D] shadow-lg shadow-[#FF6B6B]/30 gap-2"
                  >
                    <Award className="w-4 h-4" />
                    <span>Simpan & Analisis Passing Grade</span>
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="quiz" className="mt-0">
              <div className="space-y-6">
                {/* Quiz Progress */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                  <span>Soal {quizStep + 1} dari {sampleQuestions.length}</span>
                  <Badge variant="outline" className="text-[#FF6B6B] h-auto px-2.5 py-1 rounded-full bg-[#FF6B6B]/10 border-[#FF6B6B]/20">
                    Subtes: {sampleQuestions[quizStep].compName}
                  </Badge>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#141414] overflow-hidden mb-6">
                  <div 
                    className="h-full bg-[#FF6B6B] transition-all duration-300"
                    style={{ width: `${((quizStep + 1) / sampleQuestions.length) * 100}%` }}
                  />
                </div>

                {/* Question Card */}
                <Card className="p-5 rounded-2xl ring-0 bg-slate-50 dark:bg-card border border-slate-200 dark:border-border/80 gap-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white leading-relaxed mb-6">
                    {sampleQuestions[quizStep].q}
                  </p>

                  <div className="space-y-3">
                    {sampleQuestions[quizStep].options.map((opt, idx) => {
                      const isSelected = quizAnswers[sampleQuestions[quizStep].id] === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setQuizAnswers({ ...quizAnswers, [sampleQuestions[quizStep].id]: idx })}
                          className={cn(
                            "w-full p-4 rounded-xl text-left text-xs font-medium transition-all flex items-center gap-3 border",
                            isSelected 
                              ? 'bg-[#FF6B6B] text-white border-[#FF6B6B] shadow-md shadow-[#FF6B6B]/20 font-bold' 
                              : 'bg-white dark:bg-card text-slate-700 dark:text-slate-200 border-slate-200 dark:border-border hover:border-[#FF6B6B]'
                          )}
                        >
                          <span className={cn(
                            "w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0",
                            isSelected ? 'bg-white text-[#FF6B6B]' : 'bg-slate-100 dark:bg-[#141414] text-slate-500'
                          )}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </Card>

                {/* Navigation Actions */}
                <div className="flex justify-between items-center pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={quizStep === 0}
                    onClick={() => setQuizStep(quizStep - 1)}
                    className="px-5 py-2.5 h-auto rounded-xl bg-slate-100 dark:bg-[#141414] text-slate-600 dark:text-slate-300 text-xs font-semibold disabled:opacity-40 border-slate-200 dark:border-border"
                  >
                    Sebelumnya
                  </Button>

                  {quizStep < sampleQuestions.length - 1 ? (
                    <Button
                      type="button"
                      onClick={() => setQuizStep(quizStep + 1)}
                      className="px-6 py-2.5 h-auto rounded-xl bg-[#FF6B6B] text-white text-xs font-bold hover:bg-[#E85D5D] shadow-sm gap-1.5"
                    >
                      <span>Selanjutnya</span>
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleQuizFinish}
                      className="px-6 py-3 h-auto rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30 gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Selesai Ujian & Lihat Analisis Lulus</span>
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

          </div>
        </Tabs>

      </DialogContent>
    </Dialog>
  );
};
