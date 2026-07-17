import React, { useState, useRef } from 'react';
import { useAppState, appStore } from '../../../lib/store';
import { Plus, Trash2, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Major } from '../../../types';
import * as XLSX from 'xlsx';
import { supabase } from '../../../lib/supabaseClient';
import { getErrorMessage } from '../../../lib/utils';

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
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={importLoading}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md disabled:opacity-70"
          >
            {importLoading ? <Upload className="w-4 h-4 animate-bounce" /> : <FileSpreadsheet className="w-4 h-4" />}
            Import Excel
          </button>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 bg-[#FF6B6B] text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#E85D5D] transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            Tambah Prodi Baru
          </button>
        </div>
      </div>

      {importError && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-600 text-sm font-bold flex gap-2 items-center">
          <AlertCircle className="w-5 h-5" />
          {importError}
        </div>
      )}

      {isAdding && (
        <div className="bg-white dark:bg-[#000000] rounded-2xl p-6 border border-slate-200 dark:border-[#141414] shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">Tambah Program Studi Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nama Program Studi</label>
              <input 
                type="text" 
                value={newMajor.name}
                onChange={e => setNewMajor({...newMajor, name: e.target.value})}
                className="w-full bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#FF6B6B]"
                placeholder="e.g. Teknik Informatika"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Institusi / Kampus</label>
              <select
                value={newMajor.institution_id}
                onChange={e => setNewMajor({...newMajor, institution_id: Number(e.target.value)})}
                className="w-full bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#FF6B6B]"
              >
                {state.institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Rumpun / Cluster</label>
              <select
                value={newMajor.cluster}
                onChange={e => setNewMajor({...newMajor, cluster: e.target.value as any})}
                className="w-full bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#FF6B6B]"
              >
                <option value="Saintek">Saintek</option>
                <option value="Soshum">Soshum</option>
                <option value="Campuran">Campuran</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Passing Grade Total</label>
              <input 
                type="number" 
                value={newMajor.passing_grade_total || ''}
                onChange={e => setNewMajor({...newMajor, passing_grade_total: Number(e.target.value)})}
                className="w-full bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#FF6B6B]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1C1C1C] rounded-xl text-sm font-bold transition-all"
            >
              Batal
            </button>
            <button 
              onClick={handleAdd}
              className="px-4 py-2 bg-[#FF6B6B] text-white rounded-xl text-sm font-bold hover:bg-[#E85D5D] transition-all shadow-md"
            >
              Simpan Prodi
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#000000] rounded-2xl border border-slate-200 dark:border-[#141414] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#000000] border-b border-slate-200 dark:border-[#141414] text-xs uppercase tracking-wider text-slate-500 dark:text-[#777]">
                <th className="px-6 py-4 font-semibold">Prodi & Kampus</th>
                <th className="px-6 py-4 font-semibold text-center">Rumpun</th>
                <th className="px-6 py-4 font-semibold text-center">Passing Grade Total</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {state.majors.map((m) => {
                const inst = state.institutions.find(i => i.id === m.institution_id);
                return (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1C1C1C]/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 dark:text-white text-sm">{m.name}</p>
                      <p className="text-xs text-slate-500 dark:text-[#777] mt-0.5">{inst?.name || 'Unknown'}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${m.cluster === 'Saintek' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-100 dark:border-orange-800'}`}>
                        {m.cluster}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="text-sm font-bold text-[#FF6B6B]">{m.passing_grade_total}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(m.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
