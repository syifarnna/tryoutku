import React, { useState } from 'react';
import { Copy, Check, Database, X, Terminal, ShieldCheck, AlertCircle } from 'lucide-react';
import { SUPABASE_SQL_BLUEPRINT } from '../../lib/mockData';
import { appStore, useAppState } from '../../lib/store';

interface SupabaseSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({ isOpen, onClose }) => {
  const state = useAppState();
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState((state as any).supabaseUrl || '');
  const [key, setKey] = useState((state as any).supabaseAnonKey || '');
  const [enable, setEnable] = useState((state as any).useRealSupabase || false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_BLUEPRINT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    appStore.setSupabaseCfg(url, key, enable);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#000000] rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 dark:border-[#141414] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-[#141414] flex items-center justify-between bg-slate-50/50 dark:bg-[#000000]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FF6B6B]/10 text-[#FF6B6B]">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                Supabase SQL Blueprint & Koneksi Database
              </h3>
              <p className="text-xs text-slate-400">
                Struktur relasi lengkap untuk VPS aaPanel / Cloud Supabase Anda
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-[#1C1C1C] text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
          
          {/* Info Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#FF6B6B] shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
              <p className="font-bold">Mode Live Demo Siap Pakai</p>
              <p className="text-indigo-700 dark:text-indigo-300 leading-relaxed">
                Aplikasi TryoutKu saat ini berjalan dengan <strong>Local Instant Engine</strong> yang sudah diisi puluhan universitas, passing grade real, dan 7 kompetensi SNBT. Anda tidak wajib mengisi kredensial API untuk mencoba seluruh fitur analisis!
              </p>
            </div>
          </div>

          {/* Supabase Connection Form */}
          <form onSubmit={handleSaveConfig} className="p-5 rounded-2xl border border-slate-200 dark:border-[#1C1C1C]/80 bg-slate-50/40 dark:bg-[#000000]/50 space-y-4">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <span>Konfigurasi API Supabase Client (Opsional)</span>
              {savedSuccess && <span className="text-xs text-emerald-500 font-normal ml-2 animate-bounce">✓ Tersimpan!</span>}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#777] mb-1.5">
                  Supabase Project URL
                </label>
                <input 
                  type="url" 
                  placeholder="https://xyzxyz.supabase.co" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#FF6B6B]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#777] mb-1.5">
                  Supabase Anon Public Key
                </label>
                <input 
                  type="password" 
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..." 
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#FF6B6B]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input 
                  type="checkbox" 
                  checked={enable} 
                  onChange={(e) => setEnable(e.target.checked)}
                  className="w-4 h-4 rounded-md border-slate-300 text-[#FF6B6B] focus:ring-[#FF6B6B]"
                />
                <span>Aktifkan query langsung ke Supabase Server</span>
              </label>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#FF6B6B] text-white text-xs font-semibold hover:bg-[#E85D5D] shadow-sm transition-all"
              >
                Simpan Kredensial
              </button>
            </div>
          </form>

          {/* SQL Blueprint Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white">
                <Terminal className="w-4 h-4 text-[#FF6B6B]" />
                <span>SQL Database DDL Blueprint (Supabase PostgreSql)</span>
              </div>
              <button
                type="button"
                onClick={handleCopySql}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#141414] hover:bg-slate-200 dark:hover:bg-[#1C1C1C] text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Berhasil Disalin!' : 'Salin Semua SQL'}</span>
              </button>
            </div>

            <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 overflow-x-auto font-mono text-[11px] text-slate-300 leading-relaxed max-h-80">
              <pre>{SUPABASE_SQL_BLUEPRINT}</pre>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-[#141414] bg-slate-50 dark:bg-[#000000] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
