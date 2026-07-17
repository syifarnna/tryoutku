import React, { useState } from 'react';
import { KeyRound, ShieldCheck, AlertCircle, ArrowRight, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { appStore } from '../../lib/store';
import Swal from 'sweetalert2';
import { getErrorMessage } from '../../lib/utils';

export const ChangePasswordView: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 8) {
      Swal.fire('Gagal', 'Password baru harus minimal 8 karakter.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire('Gagal', 'Konfirmasi password tidak cocok.', 'error');
      return;
    }

    setLoading(true);

    try {
      const state = appStore.getState();
      const userId = state.profile.id;

      // 1. Update auth user password
      const { error: passErr } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (passErr) {
        throw new Error(`Gagal mengubah password: ${getErrorMessage(passErr)}`);
      }

      // 2. Update profiles table flag
      const { error: flagErr } = await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', userId);

      if (flagErr) {
        throw new Error(`Gagal memperbarui status akun: ${getErrorMessage(flagErr)}`);
      }

      setSuccess(true);
      
      setTimeout(() => {
        appStore.updateProfileLocally({ must_change_password: false });
      }, 2000);

    } catch (err: any) {
      Swal.fire('Gagal Mengubah Password', getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pt-8 animate-in fade-in zoom-in-95 duration-500 max-w-xl mx-auto px-4">
        <div className="bg-white dark:bg-[#000000] rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-[#141414] text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">Berhasil!</h2>
          <p className="text-sm text-slate-500 dark:text-[#777]">
            Password Anda telah berhasil diperbarui. Mengalihkan Anda ke Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-8 animate-in fade-in zoom-in-95 duration-500 max-w-xl mx-auto px-4">
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-5 rounded-2xl mb-8 flex items-start gap-4 shadow-sm">
        <div className="w-10 h-10 shrink-0 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mt-1">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-800 dark:text-amber-500 mb-1">Ganti Password Wajib</h4>
          <p className="text-xs text-amber-700 dark:text-amber-600 leading-relaxed">
            Demi keamanan akun Anda, Anda diwajibkan untuk mengganti password bawaan saat pertama kali login ke sistem. Silakan buat kata sandi baru yang kuat (minimal 8 karakter).
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#000000] rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-[#141414]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Buat Password Baru</h3>
          </div>
          <button
            onClick={() => appStore.logout()}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-[#777] dark:hover:text-slate-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Password Baru</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Konfirmasi Password Baru</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-[#FF6B6B] hover:bg-[#E85D5D] disabled:opacity-70 text-white text-sm font-bold shadow-lg shadow-[#FF6B6B]/30 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            <span>{loading ? 'Menyimpan...' : 'Simpan & Lanjutkan'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
