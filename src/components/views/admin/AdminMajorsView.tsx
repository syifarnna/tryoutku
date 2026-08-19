import React, { useState, useRef } from 'react';
import { useAppState, appStore } from '../../../lib/store';
import { Plus, Trash2, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Major } from '../../../types';
import * as XLSX from 'xlsx';
import { supabase } from '../../../lib/supabaseClient';
import { getErrorMessage, cn } from '../../../lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const AdminMajorsView: React.FC = () => {
  const state = useAppState();
  const [isAdding, setIsAdding] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newMajor, setNewMajor] = useState<Partial<Major>>({
    name: '',
    institution_id: 101, 
    cluster: 'Saintek',
    passing_grade_total: 650
  });

  const handleAdd = () => {
    if (!newMajor.name) return;
    
    appStore.addMajor({
      ...newMajor,
      id: Date.now()
    } as Major);
    
    setIsAdding(false);
    setNewMajor({
      name: '',
      institution_id: 1,
      cluster: 'Saintek',
      passing_grade_total: 650
    });
  };

  const handleDelete = (id: number) => {
    appStore.deleteMajor(id);
  }

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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Manajemen Program Studi</h2>
          <p className="text-slate-500 dark:text-[#777] mt-1">Kelola data program studi dan kampus yang tersedia.</p>
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
            onClick={() => setIsAdding(!isAdding)}
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
        <Card className="bg-white dark:bg-card ring-0 border border-slate-200 dark:border-border shadow-sm">
          <CardContent className="space-y-4 p-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Tambah Program Studi Baru</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Label className="text-xs font-semibold text-slate-500 mb-1.5 block">Nama Program Studi</Label>
                <Input 
                  type="text" 
                  value={newMajor.name}
                  onChange={e => setNewMajor({...newMajor, name: e.target.value})}
                  className="h-10"
                  placeholder="e.g. Teknik Informatika"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-500 mb-1.5 block">Institusi / Kampus</Label>
                <Select 
                  value={String(newMajor.institution_id)} 
                  onValueChange={(val) => setNewMajor({...newMajor, institution_id: Number(val)})}
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
                  value={newMajor.cluster} 
                  onValueChange={(val) => setNewMajor({...newMajor, cluster: val as any})}
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
                  value={newMajor.passing_grade_total || ''}
                  onChange={e => setNewMajor({...newMajor, passing_grade_total: Number(e.target.value)})}
                  className="h-10"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button 
                variant="ghost"
                onClick={() => setIsAdding(false)}
              >
                Batal
              </Button>
              <Button 
                onClick={handleAdd}
              >
                Simpan Prodi
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-border overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-card hover:bg-slate-50 dark:hover:bg-[#000000] border-b border-slate-200 dark:border-border">
              <TableHead className="px-6 py-4 font-semibold">Prodi & Kampus</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-center">Rumpun</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-center">Passing Grade Total</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.majors.map((m) => {
              const inst = state.institutions.find(i => i.id === m.institution_id);
              return (
                <TableRow key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1C1C1C]/30">
                  <TableCell className="px-6 py-4">
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{m.name}</p>
                    <p className="text-xs text-slate-500 dark:text-[#777] mt-0.5">{inst?.name || 'Unknown'}</p>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'rounded-md text-[11px] font-bold h-auto py-1',
                        m.cluster === 'Saintek' 
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-100 dark:border-blue-800' 
                          : 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border-orange-100 dark:border-orange-800'
                      )}
                    >
                      {m.cluster}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <p className="text-sm font-bold text-primary">{m.passing_grade_total}</p>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Button variant="destructive" size="icon-xs" onClick={() => handleDelete(m.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
