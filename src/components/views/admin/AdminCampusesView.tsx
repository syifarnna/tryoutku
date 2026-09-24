import React, { useState, useMemo } from 'react';
import { useAppState, appStore } from '../../../lib/store';
import { Building2, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { Institution, InstitutionType } from '../../../types';
import { cn } from '../../../lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const TYPE_OPTIONS: InstitutionType[] = ['PTN', 'PTS', 'Kedinasan'];

const typeColor: Record<string, string> = {
  PTN: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400 border-sky-200 dark:border-sky-900',
  PTS: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400 border-violet-200 dark:border-violet-900',
  Kedinasan: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-900',
};

interface CampusForm {
  name: string;
  type: InstitutionType;
  location: string;
  grade: string;
  range_min: string;
  range_max: string;
}

const emptyForm: CampusForm = { name: '', type: 'PTN', location: '', grade: '', range_min: '', range_max: '' };

export const AdminCampusesView: React.FC = () => {
  const state = useAppState();
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<CampusForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return state.institutions;
    return state.institutions.filter(i =>
      i.name.toLowerCase().includes(q) || i.location.toLowerCase().includes(q)
    );
  }, [state.institutions, search]);

  const campusProdiCount = (id: number) => state.majors.filter(m => m.institution_id === id).length;

  const resetForm = () => { setForm(emptyForm); setIsAdding(false); setEditingId(null); };

  const startEdit = (inst: Institution) => {
    setEditingId(inst.id);
    setIsAdding(true);
    setForm({
      name: inst.name,
      type: inst.type,
      location: inst.location || '',
      grade: inst.grade != null ? String(inst.grade) : '',
      range_min: inst.range_min != null ? String(inst.range_min) : '',
      range_max: inst.range_max != null ? String(inst.range_max) : '',
    });
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      type: form.type,
      location: form.location.trim(),
      grade: form.grade ? Number(form.grade) : null,
      range_min: form.range_min ? Number(form.range_min) : null,
      range_max: form.range_max ? Number(form.range_max) : null,
    };
    if (editingId != null) {
      await appStore.updateInstitution({ ...payload, id: editingId } as Institution);
    } else {
      await appStore.addInstitution(payload as any);
    }
    setSaving(false);
    resetForm();
  };

  const numCampus = state.institutions.length;
  const numWithGrade = state.institutions.filter(i => i.grade != null).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Manajemen Kampus & Grade Campus</h2>
          <p className="text-slate-500 dark:text-muted-foreground mt-1">
            Kelola data kampus/PTN beserta <strong>Grade Campus</strong> (batas nilai masuk) dan <strong>Range Nilai</strong> (rentang passing grade prodi di kampus).&nbsp;
            <span className="font-bold text-primary">{numCampus} kampus di database ({numWithGrade} sudah memiliki grade)</span>.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsAdding(true); }} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Tambah Kampus
        </Button>
      </div>

      {isAdding && (
        <Card className="bg-card ring-0 border border-slate-200 dark:border-border shadow-sm">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                {editingId != null ? 'Ubah Data Kampus' : 'Tambah Kampus Baru'}
              </h3>
              <button onClick={resetForm} className="p-1.5 rounded-lg text-slate-400 hover:bg-muted hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Label className="text-xs font-semibold text-slate-500 mb-1.5 block">Nama Kampus / PTN</Label>
                <Input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-10" placeholder="contoh: Universitas Indonesia (UI)" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-500 mb-1.5 block">Tipe</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as InstitutionType })}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-500 mb-1.5 block">Lokasi</Label>
                <Input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="h-10" placeholder="contoh: Bandung, Jawa Barat" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-500 mb-1.5 block">Grade Campus (batas nilai masuk)</Label>
                <Input type="number" step="0.1" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} className="h-10" placeholder="contoh: 645.5" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-500 mb-1.5 block">Range Nilai Min</Label>
                <Input type="number" step="0.1" value={form.range_min} onChange={e => setForm({ ...form, range_min: e.target.value })} className="h-10" placeholder="contoh: 580" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-500 mb-1.5 block">Range Nilai Max</Label>
                <Input type="number" step="0.1" value={form.range_max} onChange={e => setForm({ ...form, range_max: e.target.value })} className="h-10" placeholder="contoh: 754.2" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="ghost" onClick={resetForm}>Batal</Button>
              <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
                {saving ? 'Menyimpan...' : editingId != null ? 'Simpan Perubahan' : 'Simpan Kampus'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2 bg-card rounded-2xl border border-slate-200 dark:border-border p-3 shadow-sm">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama kampus atau lokasi..." className="pl-9 h-9" />
        </div>
        <span className="ml-auto text-xs font-semibold text-slate-400">{filtered.length} kampus tampil</span>
      </div>

      <div className="bg-card rounded-2xl border border-slate-200 dark:border-border overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-card hover:bg-slate-50 dark:hover:bg-black border-b border-slate-200 dark:border-border">
              <TableHead className="px-6 py-4 font-semibold">Kampus</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-center">Tipe</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-center">Grade Campus</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-center">Range Nilai Min–Max</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-center">Jml. Prodi</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                  Tidak ada kampus ditemukan untuk pencarian ini.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((inst) => {
              const prodiCount = campusProdiCount(inst.id);
              return (
                <TableRow key={inst.id} className="hover:bg-slate-50/50 dark:hover:bg-muted/80">
                  <TableCell className="px-6 py-4">
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{inst.name}</p>
                    <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">{inst.location || '—'}</p>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Badge variant="outline" className={cn('rounded-md text-[11px] font-bold h-auto py-1', typeColor[inst.type] || typeColor.PTN)}>
                      {inst.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    {inst.grade != null ? (
                      <p className="text-sm font-extrabold text-primary">{inst.grade}</p>
                    ) : (
                      <p className="text-xs text-slate-400">—</p>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center text-sm text-slate-600 dark:text-slate-300">
                    {inst.range_min != null && inst.range_max != null
                      ? `${inst.range_min} – ${inst.range_max}`
                      : '—'}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Badge variant="outline" className="rounded-full text-[11px] font-bold h-auto px-2.5 py-0.5">
                      {prodiCount} prodi
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="inline-flex gap-1.5">
                      <Button variant="outline" size="icon-xs" onClick={() => startEdit(inst)} className="cursor-pointer">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="icon-xs" onClick={() => appStore.deleteInstitution(inst.id)} className="cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};