import React, { useState } from 'react';
import { Award, BookOpen, Clock, Download, FileSpreadsheet, FileText, Play, CheckCircle2 } from 'lucide-react';
import { useAppState } from '../../lib/store';
import { Tryout } from '../../types';
import { exportResultsExcel, exportResultsPDF } from '../../lib/exportUtils';

interface TryoutsViewProps {
  onTakeTryout: (tryout: Tryout) => void;
  defaultSubTab?: 'list' | 'history';
}

export const TryoutsView: React.FC<TryoutsViewProps> = ({ onTakeTryout, defaultSubTab = 'list' }) => {
  const state = useAppState();
  const [subTab, setSubTab] = useState<'list' | 'history'>(defaultSubTab);
  const [filterType, setFilterType] = useState<string>('semua');

  const completedTryoutIds = new Set(state.results.map(r => r.tryout_id));
  const isCompleted = (to: Tryout) => completedTryoutIds.has(to.id);

  const filteredTryouts = state.tryouts.filter(t => {
    if (filterType === 'semua') return true;
    return t.type.toLowerCase().includes(filterType.toLowerCase());
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Page Title & Header Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-[#141414] pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Modul Simulasi Ujian Tryout</h2>
          <p className="text-xs text-slate-400 mt-0.5">Kerjakan ujian simulasi 7 subtes resmi dan pantau rekap skor total Anda</p>
        </div>

        <div className="flex bg-slate-100 dark:bg-[#000000] p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setSubTab('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${subTab === 'list' ? 'bg-white dark:bg-[#FF6B6B] text-[#FF6B6B] dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-700 dark:text-[#777]'}`}
          >
            📋 Daftar Tryout Tersedia ({state.tryouts.length})
          </button>
          <button
            onClick={() => setSubTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${subTab === 'history' ? 'bg-white dark:bg-[#FF6B6B] text-[#FF6B6B] dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-700 dark:text-[#777]'}`}
          >
            🏆 Hasil Tryout Saya ({state.results.length})
          </button>
        </div>
      </div>

      {subTab === 'list' ? (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-wrap gap-2">
            {['Semua', 'UTBK SNBT', 'Ujian Kedinasan', 'Ujian Mandiri'].map(ft => (
              <button
                key={ft}
                onClick={() => setFilterType(ft.toLowerCase())}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all border ${filterType === ft.toLowerCase() ? 'bg-[#FF6B6B] text-white border-[#FF6B6B] shadow-sm' : 'bg-white dark:bg-[#000000] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#1C1C1C] hover:border-[#FF6B6B]'}`}
              >
                {ft}
              </button>
            ))}
          </div>

          {/* Tryout Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTryouts.map((to) => (
              <div key={to.id} className="p-6 rounded-3xl bg-white dark:bg-[#000000] border border-slate-100 dark:border-[#141414] shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-[#FF6B6B]">
                      {to.type}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Pelaksanaan: {new Date(to.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-800 dark:text-white group-hover:text-[#FF6B6B] transition-colors">
                    {to.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-[#777] leading-relaxed">
                    {to.description}
                  </p>

                  <div className="pt-2 flex flex-wrap gap-3 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-[#000000] px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-[#FF6B6B]" /> {to.duration_minutes} Menit
                    </span>
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-[#000000] px-2.5 py-1 rounded-lg">
                      <BookOpen className="w-3.5 h-3.5 text-[#FF6B6B]" /> {to.question_count} Soal (7 Subtes)
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-[#141414]/80 mt-6 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Status Sesi:</span>
                    <span className={`font-bold text-xs ${isCompleted(to) ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {isCompleted(to) ? '✓ Sudah Dikerjakan' : 'Tersedia Sekarang'}
                    </span>
                  </div>

                  <button
                    onClick={() => onTakeTryout(to)}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 ${isCompleted(to) ? 'bg-slate-100 dark:bg-[#141414] text-slate-700 dark:text-slate-300 hover:bg-slate-200' : 'bg-[#FF6B6B] text-white hover:bg-[#E85D5D] shadow-[#FF6B6B]/30'}`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isCompleted(to) ? 'Kerjakan Ulang / Edit Skor' : 'Mulai Tryout'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Action Export Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#000000] border border-slate-100 dark:border-[#141414] shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#FF6B6B]" />
              <span className="text-xs font-bold text-slate-800 dark:text-white">Rekapitulasi Seluruh Sesi Tryout</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => exportResultsPDF(state.results, state.profile.full_name)}
                className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold transition-all flex items-center gap-2 border border-rose-200 dark:border-rose-800"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Cetak PDF Resmi</span>
              </button>
              <button
                onClick={() => exportResultsExcel(state.results, state.profile.full_name)}
                className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 text-xs font-bold transition-all flex items-center gap-2 border border-emerald-200 dark:border-emerald-800"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-[#000000] rounded-3xl border border-slate-100 dark:border-[#141414] shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#000000] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-[#141414]">
                <tr>
                  <th className="py-4 px-6">Simulasi Tryout</th>
                  <th className="py-4 px-6">Tanggal</th>
                  <th className="py-4 px-4 text-center">Skor Total (IRT)</th>
                  <th className="py-4 px-4 text-center">Predikat</th>
                  <th className="py-4 px-4 text-center">PU</th>
                  <th className="py-4 px-4 text-center">PK</th>
                  <th className="py-4 px-4 text-center">LBE</th>
                  <th className="py-4 px-4 text-center">PM</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {state.results.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/80 dark:hover:bg-[#1C1C1C]/40 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-800 dark:text-white block">{res.tryout_name}</span>
                      <span className="text-[10px] text-slate-400">{res.tryout_type}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-500">{new Date(res.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="py-4 px-4 text-center font-extrabold text-[#FF6B6B] text-sm">{res.total_score}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${res.predicate === 'Sangat Baik' || res.predicate === 'Baik' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700'}`}>
                        {res.predicate}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">{res.scores.PU || '-'}</td>
                    <td className="py-4 px-4 text-center font-bold text-slate-800 dark:text-white">{res.scores.PK || '-'}</td>
                    <td className="py-4 px-4 text-center">{res.scores.LBE || '-'}</td>
                    <td className="py-4 px-4 text-center">{res.scores.PM || '-'}</td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => {
                          const to = state.tryouts.find(t => t.id === res.tryout_id) || state.tryouts[0];
                          onTakeTryout(to);
                        }}
                        className="text-xs font-bold text-[#FF6B6B] hover:underline"
                      >
                        Bedah Nilai →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
