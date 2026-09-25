import React, { useState, useRef } from 'react';
import { useAppState, appStore } from '../../../lib/store';
import { Plus, Trash2, Upload, FileSpreadsheet, AlertCircle, Pencil, Search, X } from 'lucide-react';
import { Major } from '../../../types';
import * as XLSX from 'xlsx';
import { supabase } from '../../../lib/supabaseClient';
import { getErrorMessage, cn } from '../../../lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { JENJANG_OPTIONS, JenjangBadge, normalizeJenjang } from '@/components/ui/JenjangBadge';

const inferJenjang = (name?: string): string => {
  const n = (name || '').toUpperCase();
  if (/D\s*[-]?\s*4/.test(n)) return 'D4';
  if (/D\s*[-]?\s*3/.test(n)) return 'D3';
  return 'S1';
};

const EMPTY_FORM = {
  name: '',
  institution_id: 1,
  cluster: 'Saintek',
  jenjang: 'S1',
  passing_grade_total: 650,
};

export const AdminMajorsView: React.FC = () => {
  const state = useAppState();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const [jenjangFilter, setJenjangFilter] = useState<'SEMUA' | string>('SEMUA');
  const [query, setQuery] = useState('');
  const [errors, setErrors] = useState<{ name?: string; jenjang?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ ...EMPTY_FORM });

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setErrors({});
  };

  const startAdd = () => {
    setEditingId(null);
    resetForm();
    setIsAdding(true);
  };

  const startEdit = (m: Major) => {
    setEditingId(m.id);
    setIsAdding(true);
    setErrors({});
    setForm({
      name: m.name || '',
      institution_id: m.institution_id,
      cluster: m.cluster || 'Saintek',
      jenjang: m.jenjang || 'S1',
      passing_grade_total: m.passing_grade_total || 650,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = () => {
    const nextErrors: { name?: string; jenjang?: string } = {};
    if (!form.name.trim()) nextErrors.name = 'Nama jurusan wajib diisi.';
    if (!form.jenjang) nextErrors.jenjang = 'Jenjang wajib dipilih.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: Major = {
      id: editingId ?? Date.now(),
      name: form.name.trim(),
      institution_id: form.institution_id,
      cluster: form.cluster as any,
      jenjang: form.jenjang as any,
      passing_grade_total: form.passing_grade_total,
    };

    if (editingId) {
      const original = state.majors.find(m => m.id === editingId);
      appStore.updateMajor({ ...original, ...payload } as Major);
    } else {
      appStore.addMajor(payload);
    }

    setIsAdding(false);
    setEditingId(null);
    resetForm();
  };

  const handleDelete = (id: number) => {
    appStore.deleteMajor(id);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    setImportError('');
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

      if (jsonData.length === 0) {
        throw new Error('File Excel kosong');
      }

      const defaultInstitution = state.majors.length > 0
        ? state.majors[0].institution_id
        : (state.institutions?.[0]?.id || 101);

      const missingInstitution = jsonData.filter(row => {
        const iid = row.institution_id || row.id_kampus;
        return iid && !state.institutions?.some((inst: any) => inst.id === Number(iid));
      });
      if (missingInstitution.length > 0) {
        const badIds = [...new Set(missingInstitution.map((r: any) => r.institution_id || r.id_kampus))];
        throw new Error(`institution_id tidak ditemukan: ${badIds.join(', ')}. Pastikan ID kampus sesuai.`);
      }

      const majorsToInsert = jsonData.map(row => ({
        institution_id: Number(row.institution_id || row.id_kampus) || defaultInstitution,
        name: row.name || row.nama_prodi,
        cluster: row.cluster || row.rumpun || 'Campuran',
        jenjang: normalizeJenjang(row.jenjang || inferJenjang(row.name || row.nama_prodi)),
        passing_grade_total: parseFloat(row.passing_grade_total || row.passing_grade) || 600
      }));

      const { error } = await supabase.from('majors').insert(majorsToInsert);
      if (error) throw new Error(error.message);

      await appStore.fetchMasterData();

      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setImportError('Gagal import data: ' + getErrorMessage(err));
    } finally {
      setImportLoading(false);
    }
  };

  const displayedMajors = state.majors.filter(m => {
    const q = query.trim().toLowerCase();
    if (q) {
      const instName = (state.institutions.find(i => i.id === m.institution_id)?.name || '').toLowerCase();
      const matchesName = (m.name || '').toLowerCase().includes(q);
      const matchesInst = instName.includes(q);
      if (!matchesName && !matchesInst) return false;
    }
    if (jenjangFilter === 'SEMUA') return true;
    return normalizeJenjang(m.jenjang) === jenjangFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Manajemen Program Studi</h2>
          <p className="text-slate-500 dark:text-muted-foreground mt-1">Kelola data program studi dan kampus yang tersedia.</p>
        </div>

        <div className="flex gap-2">
          <input
            type="file"
            accept=".xlsx, .xls"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={importLoading}
            className="bg-emerald-600 text-white hover:bg-emerald-700 gap-2"
          >
            {importLoading ? <Upload className="w-4 h-4 animate-bounce" /> : <FileSpreadsheet className="w-4 h-4" />}
            Import Excel
          </Button>
          <Button
            onClick={startAdd}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Prodi Baru
          </Button>
        </div>
      </div>

      {importError && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-600 text-sm font-bold flex gap-2 items-center">
          <AlertCircle className="w-5 h-5" />
          {importError}
        </div>
      )}

      {isAdding && (
        <Card className="bg-card ring-0 border border-slate-200 dark:border-border shadow-sm">
          <CardContent className="space-y-4 p-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">
              {editingId ? 'Edit Program Studi' : 'Tambah Program Studi Baru'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                  Nama Jurusan <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={form.name}
                  onChange={e => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: undefined }); }}
                  className={cn('h-10', errors.name && 'border-rose-500 ring-1 ring-rose-300')}
                  placeholder="e.g. Teknik Informatika"
                />
                {errors.name && <p className="text-[11px] text-rose-600 mt-1 font-semibold">{errors.name}</p>}
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                  Jenjang <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={String(form.jenjang || '')}
                  onValueChange={(val) => { setForm({ ...form, jenjang: val }); if (errors.jenjang) setErrors({ ...errors, jenjang: undefined }); }}
                >
                  <SelectTrigger className={cn('w-full h-10', errors.jenjang && 'border-rose-500 ring-1 ring-rose-300')}>
                    <SelectValue placeholder="Pilih jenjang" />
                  </SelectTrigger>
                  <SelectContent>
                    {JENJANG_OPTIONS.map(j => (
                      <SelectItem key={j} value={j}>{j}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.jenjang && <p className="text-[11px] text-rose-600 mt-1 font-semibold">{errors.jenjang}</p>}
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-500 mb-1.5 block">Institusi / Kampus</Label>
                <Select
                  value={String(form.institution_id)}
                  onValueChange={(val) => setForm({ ...form, institution_id: Number(val) })}
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {state.institutions.map(inst => (
                      <SelectItem key={inst.id} value={String(inst.id)}>{inst.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-500 mb-1.5 block">Rumpun / Cluster</Label>
                <Select
                  value={form.cluster}
                  onValueChange={(val) => setForm({ ...form, cluster: val as any })}
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Saintek">Saintek</SelectItem>
                    <SelectItem value="Soshum">Soshum</SelectItem>
                    <SelectItem value="Campuran">Campuran</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-500 mb-1.5 block">Passing Grade Total</Label>
                <Input
                  type="number"
                  value={form.passing_grade_total || ''}
                  onChange={e => setForm({ ...form, passing_grade_total: Number(e.target.value) })}
                  className="h-10"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="ghost"
                onClick={() => { setIsAdding(false); setEditingId(null); resetForm(); }}
              >
                Batal
              </Button>
              <Button
                onClick={handleSave}
              >
                {editingId ? 'Simpan Perubahan' : 'Simpan Prodi'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-3 bg-card rounded-2xl border border-slate-200 dark:border-border p-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama jurusan atau nama kampus..."
            className="pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              title="Hapus pencarian"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={jenjangFilter}
          onChange={(e) => setJenjangFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 md:w-56"
        >
          <option value="SEMUA">Semua Jenjang</option>
          {(['S1', 'D4', 'D3'] as const).map(f => {
            const count = state.majors.filter(m => normalizeJenjang(m.jenjang) === f).length;
            return (
              <option key={f} value={f}>{f} ({count})</option>
            );
          })}
        </select>
      </div>

      <p className="text-xs font-semibold text-slate-400">
        Menampilkan <span className="text-slate-700 dark:text-white font-bold">{displayedMajors.length}</span> dari{' '}
        <span className="text-slate-700 dark:text-white font-bold">{state.majors.length}</span> prodi
      </p>

      <div className="bg-card rounded-2xl border border-slate-200 dark:border-border overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-card hover:bg-slate-50 dark:hover:bg-black border-b border-slate-200 dark:border-border">
              <TableHead className="px-6 py-4 font-semibold">Nama Jurusan</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-center">Kampus</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-center">Jenjang</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-center">Rumpun</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-center">Passing Grade Total</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedMajors.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-14 text-center">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-300">Data prodi tidak ditemukan</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Tidak ada prodi yang cocok dengan kata kunci "{query.trim()}"{jenjangFilter !== 'SEMUA' && <> dan jenjang {jenjangFilter}</>}. Coba kata kunci lain atau ubah filter.
                  </p>
                </TableCell>
              </TableRow>
            )}
            {displayedMajors.map((m) => {
              const inst = state.institutions.find(i => i.id === m.institution_id);
              return (
                <TableRow key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-muted/80">
                  <TableCell className="px-6 py-4">
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{m.name}</p>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <span className="text-xs text-slate-500 dark:text-muted-foreground">{inst?.name || 'Unknown'}</span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <JenjangBadge jenjang={m.jenjang} />
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        'rounded-md text-[11px] font-bold h-auto py-1',
                        m.cluster === 'Saintek'
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-100 dark:border-blue-800'
                          : m.cluster === 'Soshum'
                            ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border-orange-100 dark:border-orange-800'
                            : 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 border-violet-100 dark:border-violet-800'
                      )}
                    >
                      {m.cluster}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <p className="text-sm font-bold text-primary">{m.passing_grade_total}</p>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="inline-flex gap-1.5">
                      <Button variant="outline" size="icon-xs" onClick={() => startEdit(m)} title="Edit Prodi">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="icon-xs" onClick={() => handleDelete(m.id)} title="Hapus Prodi">
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