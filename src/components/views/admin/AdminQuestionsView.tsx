import React, { useState } from 'react';
import { useAppState, appStore } from '../../../lib/store';
import { ListChecks, Plus, Power, Trash2, X } from 'lucide-react';
import { ClusterType, PenjurusanQuestion } from '../../../types';
import { cn } from '../../../lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const CLUSTERS: ClusterType[] = ['Saintek', 'Soshum', 'Campuran'];

const clusterStyle: Record<ClusterType, string> = {
  Saintek: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400 border-sky-200 dark:border-sky-900',
  Soshum: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-900',
  Campuran: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400 border-violet-200 dark:border-violet-900',
};

interface OptionRow { text: string; cluster: ClusterType; weight: number; }

interface QuestionForm { question: string; options: OptionRow[]; }

const WEIGHTS = [1, 2, 3, 4, 5];

const emptyForm: QuestionForm = {
  question: '',
  options: [
    { text: '', cluster: 'Saintek', weight: 1 },
    { text: '', cluster: 'Soshum', weight: 1 },
    { text: '', cluster: 'Saintek', weight: 1 },
    { text: '', cluster: 'Soshum', weight: 1 },
  ],
};

export const AdminQuestionsView: React.FC = () => {
  const state = useAppState();
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<QuestionForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [isActiveFilter, setIsActiveFilter] = useState<'SEMUA' | boolean>('SEMUA');

  const activeQuestions = state.questions.filter(q => q.is_active).length;
  const displayed = state.questions.filter(q => {
    if (isActiveFilter === 'SEMUA') return true;
    return q.is_active === isActiveFilter;
  });

  const resetForm = () => { setForm(emptyForm); setIsAdding(false); };

  const updateOption = (i: number, patch: Partial<OptionRow>) => {
    const next = form.options.map((o, idx) => idx === i ? { ...o, ...patch } : o);
    setForm({ ...form, options: next });
  };

  const handleSave = async () => {
    if (!form.question.trim() || form.options.some(o => !o.text.trim())) return;
    setSaving(true);
    const payload = {
      question: form.question.trim(),
      option_a: form.options[0].text.trim(), cluster_a: form.options[0].cluster, weight_a: form.options[0].weight,
      option_b: form.options[1].text.trim(), cluster_b: form.options[1].cluster, weight_b: form.options[1].weight,
      option_c: form.options[2].text.trim(), cluster_c: form.options[2].cluster, weight_c: form.options[2].weight,
      option_d: form.options[3].text.trim(), cluster_d: form.options[3].cluster, weight_d: form.options[3].weight,
      is_active: true,
    };
    await appStore.addQuestion(payload as any);
    setSaving(false);
    resetForm();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ListChecks className="w-6 h-6 text-primary" /> Bank Soal Tes Penjurusan
          </h2>
          <p className="text-slate-500 dark:text-muted-foreground mt-1">
            Kelola pertanyaan yang akan dikerjakan siswa pada <strong>Tes Minat dan Bakat</strong>.&nbsp;
            <span className="font-bold text-primary">{state.questions.length} soal ({activeQuestions} aktif)</span>.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsAdding(true); }} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Tambah Pertanyaan
        </Button>
      </div>

      {isAdding && (
        <Card className="bg-card ring-0 border border-slate-200 dark:border-border shadow-sm">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">Tambah Pertanyaan Penjurusan</h3>
              <button onClick={resetForm} className="p-1.5 rounded-lg text-slate-400 hover:bg-muted hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-500 mb-1.5 block">Pertanyaan</Label>
              <textarea
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                className="w-full min-h-[80px] px-4 py-2.5 rounded-xl bg-background dark:bg-slate-900 border border-input text-sm text-foreground focus:outline-none focus:border-primary resize-y"
                placeholder="contoh: Saat belajar mandiri, kegiatan mana yang paling Anda nikmati?"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {form.options.map((opt, i) => (
                <div key={i} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-border space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Opsi {String.fromCharCode(65 + i)}
                  </Label>
                  <Input
                    type="text"
                    value={opt.text}
                    onChange={(e) => updateOption(i, { text: e.target.value })}
                    className="h-9"
                    placeholder={`Teks pilihan ${String.fromCharCode(65 + i)}`}
                  />
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <Select value={opt.cluster} onValueChange={(v) => updateOption(i, { cluster: v as ClusterType })}>
                      <SelectTrigger className="w-full h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CLUSTERS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={String(opt.weight)} onValueChange={(v) => updateOption(i, { weight: Number(v) })}>
                      <SelectTrigger className="w-28 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WEIGHTS.map(w => <SelectItem key={w} value={String(w)}>Bobot {w}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              Setiap opsi dipetakan ke rumpun minat dengan <strong>bobot 1–5</strong> (semakin besar, semakin kuat sinyal minat terhadap rumpun). Skor tertinggi per rumpun menjadi acuan rekomendasi jurusan.
            </p>
            <div className="flex justify-end gap-3 mt-2">
              <Button variant="ghost" onClick={resetForm}>Batal</Button>
              <Button onClick={handleSave} disabled={saving || !form.question.trim() || form.options.some(o => !o.text.trim())}>
                {saving ? 'Menyimpan...' : 'Simpan Pertanyaan'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2 bg-card rounded-2xl border border-slate-200 dark:border-border p-3 shadow-sm">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Filter:</span>
        {([
          { label: 'Semua', value: 'SEMUA' },
          { label: `Aktif (${activeQuestions})`, value: true },
          { label: `Non-aktif (${state.questions.length - activeQuestions})`, value: false },
        ] as const).map((f) => (
          <button
            key={String(f.value)}
            type="button"
            onClick={() => setIsActiveFilter(f.value as any)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer',
              isActiveFilter === f.value
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-background text-muted-foreground border-border hover:bg-muted'
            )}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs font-semibold text-slate-400">{displayed.length} soal</span>
      </div>

      <div className="bg-card rounded-2xl border border-slate-200 dark:border-border overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-card hover:bg-slate-50 dark:hover:bg-black border-b border-slate-200 dark:border-border">
              <TableHead className="px-6 py-4 font-semibold w-12 text-center">#</TableHead>
              <TableHead className="px-6 py-4 font-semibold">Pertanyaan & Opsi</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-center">Status</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayed.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">
                  <ListChecks className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  Belum ada pertanyaan. Tambahkan bank soal di atas agar siswa dapat mengerjakan Tes Penjurusan.
                </TableCell>
              </TableRow>
            )}
            {displayed.map((q, idx) => (
              <TableRow key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-muted/80 align-top">
                <TableCell className="px-6 py-4 text-center font-mono text-sm text-slate-400">{idx + 1}</TableCell>
                <TableCell className="px-6 py-4">
                  <p className="font-bold text-sm text-slate-800 dark:text-white">{q.question}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-3">
                    {(['a', 'b', 'c', 'd'] as const).map((k) => {
                      const opt = q[`option_${k}`];
                      const cl = q[`cluster_${k}` as keyof PenjurusanQuestion] as ClusterType;
                      const w = (q[`weight_${k}` as keyof PenjurusanQuestion] as number) ?? 1;
                      return (
                        <div key={k} className="flex items-center gap-2 text-xs">
                          <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-500 text-[10px] shrink-0 uppercase">
                            {k}
                          </span>
                          <span className="flex-1 text-slate-600 dark:text-slate-300">{opt}</span>
                          <span className="text-[9px] font-bold text-slate-400 shrink-0">×{w}</span>
                          <Badge variant="outline" className={cn('rounded-md text-[9px] font-bold h-auto px-1.5 py-0 shrink-0', clusterStyle[cl || 'Campuran'])}>
                            {cl || 'Campuran'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-center">
                  <button
                    type="button"
                    onClick={() => appStore.toggleQuestionActive(q.id, !q.is_active)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border cursor-pointer transition-all',
                      q.is_active
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    )}
                  >
                    <Power className="w-3 h-3" />
                    {q.is_active ? 'Aktif' : 'Non-aktif'}
                  </button>
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <Button variant="destructive" size="icon-xs" onClick={() => appStore.deleteQuestion(q.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};