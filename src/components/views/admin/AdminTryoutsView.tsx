import React, { useState } from 'react';
import { useAppState, appStore } from '../../../lib/store';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Tryout } from '../../../types';

export const AdminTryoutsView: React.FC = () => {
  const state = useAppState();
  const [isAdding, setIsAdding] = useState(false);
  const [newTryout, setNewTryout] = useState<Partial<Tryout>>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    type: 'UTBK SNBT',
    duration_minutes: 195,
    question_count: 155,
    description: '',
    status: 'Tersedia'
  });

  const handleAdd = () => {
    if (!newTryout.name) return;
    
    // Using a mock way to add. We need to add logic to store later.
    // For now we mutate the state directly or through a new method in store.
    appStore.addTryout({
      ...newTryout,
      id: Date.now(),
      status: 'Tersedia'
    } as Tryout);
    
    setIsAdding(false);
    setNewTryout({
      name: '',
      date: new Date().toISOString().split('T')[0],
      type: 'UTBK SNBT',
      duration_minutes: 195,
      question_count: 155,
      description: '',
      status: 'Tersedia'
    });
  };

  const handleDelete = (id: number) => {
    appStore.deleteTryout(id);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Manajemen Tryout</h2>
          <p className="text-slate-500 dark:text-[#777] mt-1">Kelola daftar tryout yang tersedia untuk peserta.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-[#FF6B6B] text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#E85D5D] transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          Tambah Tryout Baru
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-[#000000] rounded-2xl p-6 border border-slate-200 dark:border-[#141414] shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">Tambah Tryout Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nama Tryout</label>
              <input 
                type="text" 
                value={newTryout.name}
                onChange={e => setNewTryout({...newTryout, name: e.target.value})}
                className="w-full bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#FF6B6B]"
                placeholder="e.g. Tryout Akbar 2026"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tipe</label>
              <select
                value={newTryout.type}
                onChange={e => setNewTryout({...newTryout, type: e.target.value as any})}
                className="w-full bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#FF6B6B]"
              >
                <option value="UTBK SNBT">UTBK SNBT</option>
                <option value="Ujian Mandiri">Ujian Mandiri</option>
                <option value="Ujian Kedinasan">Ujian Kedinasan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tanggal Pelaksanaan</label>
              <input 
                type="date" 
                value={newTryout.date}
                onChange={e => setNewTryout({...newTryout, date: e.target.value})}
                className="w-full bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#FF6B6B]"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Durasi (Menit)</label>
                <input 
                  type="number" 
                  value={newTryout.duration_minutes}
                  onChange={e => setNewTryout({...newTryout, duration_minutes: Number(e.target.value)})}
                  className="w-full bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#FF6B6B]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Total Soal</label>
                <input 
                  type="number" 
                  value={newTryout.question_count}
                  onChange={e => setNewTryout({...newTryout, question_count: Number(e.target.value)})}
                  className="w-full bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#FF6B6B]"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Deskripsi Singkat</label>
              <input 
                type="text" 
                value={newTryout.description}
                onChange={e => setNewTryout({...newTryout, description: e.target.value})}
                className="w-full bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#FF6B6B]"
                placeholder="Deskripsi tryout..."
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
              Simpan Tryout
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#000000] rounded-2xl border border-slate-200 dark:border-[#141414] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#000000] border-b border-slate-200 dark:border-[#141414] text-xs uppercase tracking-wider text-slate-500 dark:text-[#777]">
                <th className="px-6 py-4 font-semibold">Nama Tryout</th>
                <th className="px-6 py-4 font-semibold text-center">Tipe</th>
                <th className="px-6 py-4 font-semibold text-center">Durasi & Soal</th>
                <th className="px-6 py-4 font-semibold text-center">Tanggal</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {state.tryouts.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1C1C1C]/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{t.name}</p>
                    {t.description && <p className="text-xs text-slate-500 dark:text-[#777] mt-0.5 truncate max-w-xs">{t.description}</p>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                      {t.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t.duration_minutes}m</p>
                    <p className="text-[11px] text-slate-400">{t.question_count} soal</p>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-slate-600 dark:text-slate-300">
                    {new Date(t.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(t.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {state.tryouts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-[#777]">
                    Belum ada tryout.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
