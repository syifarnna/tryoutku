import React, { useState } from 'react';
import { Calendar, Download, FileSpreadsheet, FileText, Filter, Printer } from 'lucide-react';
import { useAppState } from '../../lib/store';
import { exportAnalysisPDF, exportResultsExcel, exportResultsPDF } from '../../lib/exportUtils';
import { appStore } from '../../lib/store';

export const ReportsView: React.FC = () => {
  const state = useAppState();
  const [filterPeriod, setFilterPeriod] = useState('semua');

  const summary = appStore.getAnalysis();

  const filteredResults = state.results.filter(r => {
    if (filterPeriod === 'semua') return true;
    const resMonth = new Date(r.created_at).getMonth();
    const currMonth = new Date().getMonth();
    if (filterPeriod === 'bulan_ini') return resMonth === currMonth;
    return true;
  });

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      <div className="border-b border-slate-100 dark:border-[#141414] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Modul Laporan Eksekutif TryoutKu</h2>
          <p className="text-xs text-slate-400 mt-0.5">Unduh berkas resmi PDF & Excel untuk evaluasi orang tua atau guru sekolah</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#000000] p-1.5 rounded-2xl">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="bg-transparent border-none text-xs font-bold text-slate-700 dark:text-slate-200 pr-4 focus:outline-none cursor-pointer"
          >
            <option value="semua">Semua Periode Tryout</option>
            <option value="bulan_ini">Pelaksanaan Bulan Ini</option>
          </select>
        </div>
      </div>

      {/* Report Types Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Laporan Hasil Tryout */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#000000] border border-slate-100 dark:border-[#141414] shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950 flex items-center justify-center text-rose-500">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-slate-800 dark:text-white">Laporan Hasil Tryout (PDF)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Rekap nilai total IRT beserta predikat capaian siswa.</p>
          </div>
          <button
            onClick={() => exportResultsPDF(filteredResults, state.profile.full_name)}
            className="mt-6 w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>

        {/* Laporan Analisis Passing Grade */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#000000] border border-slate-100 dark:border-[#141414] shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-[#FF6B6B]">
              <Printer className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-slate-800 dark:text-white">Laporan Analisis Target (PDF)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Komparasi passing grade prodi pilihan dan gap analysis subtes.</p>
          </div>
          <button
            onClick={() => summary && exportAnalysisPDF(summary, state.profile.full_name)}
            disabled={!summary}
            className="mt-6 w-full py-2.5 rounded-xl bg-[#FF6B6B] hover:bg-[#E85D5D] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Unduh Analisis PDF
          </button>
        </div>

        {/* Laporan Perkembangan Excel */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#000000] border border-slate-100 dark:border-[#141414] shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-500">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-slate-800 dark:text-white">Rekapitulasi Nilai (Excel)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Data mentah rincian skor PU, PPU, PK, PM untuk diolah lanjut.</p>
          </div>
          <button
            onClick={() => exportResultsExcel(filteredResults, state.profile.full_name)}
            className="mt-6 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Excel (.xlsx)
          </button>
        </div>

      </div>

    </div>
  );
};
