import React, { useState } from 'react';
import { useAppState, appStore } from '../../../lib/store';
import { Plus, Trash2, GraduationCap, Link as LinkIcon, Star } from 'lucide-react';
import { TutoringCenter } from '../../../types';

export const AdminTutorsView: React.FC = () => {
  const state = useAppState();
  const [isAdding, setIsAdding] = useState(false);
  const [newTutor, setNewTutor] = useState<Partial<TutoringCenter>>({
    name: '',
    provider_name: '',
    focus_competency_code: 'PU',
    contact_info: '',
    link_url: '',
    description: '',
    rating: 4.5,
    price: '',
    batch_start: 'Segera'
  });

  const handleAdd = () => {
    if (!newTutor.provider_name) return;
    
    appStore.addTutor({
      ...newTutor,
      id: Date.now()
    } as TutoringCenter);
    
    setIsAdding(false);
    setNewTutor({
      name: '',
      provider_name: '',
      focus_competency_code: 'PU',
      contact_info: '',
      link_url: '',
      description: '',
      rating: 4.5,
      price: '',
      batch_start: 'Segera'
    });
  };

  const handleDelete = (id: number) => {
    appStore.deleteTutor(id);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Kelola Saran Bimbel</h2>
          <p className="text-slate-500 dark:text-[#777] mt-1">Kelola data mitra bimbingan belajar yang direkomendasikan ke siswa.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-[#F43F5E] text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#e6381a] transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          Tambah Mitra Bimbel
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-[#000000] rounded-2xl p-6 border border-slate-200 dark:border-[#141414] shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">Tambah Rekomendasi Bimbel Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nama Program / Kelas</label>
              <input 
                type="text" 
                value={newTutor.name || newTutor.provider_name}
                onChange={e => setNewTutor({...newTutor, name: e.target.value, provider_name: e.target.value})}
                className="w-full bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#F43F5E]"
                placeholder="e.g. Kelas Intensif UTBK"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Fokus Kompetensi</label>
              <select
                value={newTutor.focus_competency_code}
                onChange={e => setNewTutor({...newTutor, focus_competency_code: e.target.value})}
                className="w-full bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#F43F5E]"
              >
                {state.competencies.map(comp => (
                  <option key={comp.code} value={comp.code}>{comp.name} ({comp.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Harga Paket</label>
              <input 
                type="text" 
                value={newTutor.price}
                onChange={e => setNewTutor({...newTutor, price: e.target.value})}
                className="w-full bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#F43F5E]"
                placeholder="e.g. Rp 350.000 / bulan"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Kontak / WhatsApp</label>
              <input 
                type="text" 
                value={newTutor.contact_info}
                onChange={e => setNewTutor({...newTutor, contact_info: e.target.value})}
                className="w-full bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#F43F5E]"
                placeholder="e.g. WA: 0812..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Link Website / Pendaftaran</label>
              <input 
                type="text" 
                value={newTutor.link_url}
                onChange={e => setNewTutor({...newTutor, link_url: e.target.value})}
                className="w-full bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#F43F5E]"
                placeholder="e.g. https://..."
              />
            </div>
            <div className="lg:col-span-3">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Deskripsi Singkat</label>
              <input 
                type="text" 
                value={newTutor.description}
                onChange={e => setNewTutor({...newTutor, description: e.target.value})}
                className="w-full bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#F43F5E]"
                placeholder="Jelaskan keunggulan bimbel ini..."
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
              className="px-4 py-2 bg-[#F43F5E] text-white rounded-xl text-sm font-bold hover:bg-[#e6381a] transition-all shadow-md"
            >
              Simpan Bimbel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#000000] rounded-2xl border border-slate-200 dark:border-[#141414] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#000000] border-b border-slate-200 dark:border-[#141414] text-xs uppercase tracking-wider text-slate-500 dark:text-[#777]">
                <th className="px-6 py-4 font-semibold">Nama / Program</th>
                <th className="px-6 py-4 font-semibold text-center">Fokus</th>
                <th className="px-6 py-4 font-semibold text-center">Kontak & Info</th>
                <th className="px-6 py-4 font-semibold text-center">Harga</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {state.tutors.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1C1C1C]/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{t.provider_name || t.name}</p>
                    <div className="flex items-center gap-1 mt-1 text-amber-500 text-xs">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="font-semibold">{t.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-[#141414] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1C1C1C]">
                      {t.focus_competency_code}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-xs text-slate-600 dark:text-[#777]">{t.contact_info}</p>
                    {t.link_url && (
                      <a href={t.link_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-600 mt-1">
                        <LinkIcon className="w-3 h-3" />
                        Kunjungi Web
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-sm font-semibold text-[#F43F5E]">{t.price}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(t.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {state.tutors.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-[#777]">
                    Belum ada rekomendasi bimbel.
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
