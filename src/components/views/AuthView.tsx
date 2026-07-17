import React, { useState } from 'react';
import { ArrowRight, Check, GraduationCap, Lock, Mail, ShieldCheck, Sparkles, User, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { appStore } from '../../lib/store';
import Swal from 'sweetalert2';
import { getErrorMessage } from '../../lib/utils';

export const AuthView: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [loginMethod, setLoginMethod] = useState<'email' | 'nisn'>('email');
  const [email, setEmail] = useState('');
  const [nisn, setNisn] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [remember, setRemember] = useState(true);
  const [resetSent, setResetSent] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const getStoredUrl = () => {
    try { return localStorage.getItem('supabase_url') || ''; } catch { return ''; }
  };
  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL || !!getStoredUrl();

  const switchMode = (newMode: 'login' | 'register' | 'reset') => {
    setMode(newMode);
    setResetSent(false);
    if (newMode === 'register') {
      setEmail('');
      setNisn('');
      setPassword('');
      setFullName('');
      setSchool('');
    } else if (newMode === 'login') {
      setEmail('');
      setNisn('');
      setPassword('');
    } else if (newMode === 'reset') {
      setEmail('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isSupabaseConfigured) {
      // Mock login/register for demo purposes
      setTimeout(() => {
        appStore.mockLogin(email, fullName);
        setLoading(false);
      }, 1000);
      return;
    }

    if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        Swal.fire('Gagal', getErrorMessage(error), 'error');
      } else {
        setResetSent(true);
        setTimeout(() => { setResetSent(false); switchMode('login'); }, 3000);
      }
      setLoading(false);
      return;
    }
    
    if (mode === 'register') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            nisn: nisn,
            school: school,
          }
        }
      });
      if (error) {
        if (error.message?.includes('Database error saving new user')) {
           Swal.fire('Gagal Register', 'Terjadi kesalahan database (Trigger Gagal). Harap pastikan Anda telah menjalankan ulang query DDL SQL (blueprint terbaru) di Supabase agar tabel profiles memiliki kolom nisn & is_profile_complete.', 'error');
        } else if (error.message?.includes('User already registered')) {
           Swal.fire('Gagal Register', 'Email ini sudah terdaftar. Jika sebelumnya Anda gagal register karena error SQL, profil Anda mungkin korup. Tolong gunakan Email yang berbeda.', 'error');
        } else {
           Swal.fire('Gagal Register', getErrorMessage(error), 'error');
        }
      } else if (data.session) {
        // Logged in automatically
      } else {
        Swal.fire('Sukses', 'Registrasi berhasil! Silakan langsung login (Email Auto-Confirm telah aktif jika blueprint SQL terbaru sudah dijalankan).', 'success');
        setMode('login');
      }
      setLoading(false);
      return;
    }
    
    let loginEmail = email;
    if (loginMethod === 'nisn') {
      try {
        const { data: profileEmail } = await supabase.rpc('get_email_by_nisn', { p_nisn: nisn });
        loginEmail = profileEmail || `${nisn}@peserta.com`;
      } catch {
        loginEmail = `${nisn}@peserta.com`;
      }
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password
    });

    if (error) {
      // AUTO-SYNC: jika login NISN gagal (error apapun), coba sync & retry otomatis
      if (loginMethod === 'nisn') {
        let retryEmail: string | null = null;
        try {
          const syncResult = await supabase.rpc('sync_profile_auth_user', { p_nisn: nisn });
          if (syncResult?.data?.success) {
            retryEmail = syncResult.data.email;
          } else if (syncResult?.data?.error?.includes('sudah memiliki akses')) {
            const resetResult = await supabase.rpc('reset_password_by_nisn', { p_nisn: nisn });
            if (resetResult?.data?.success) {
              retryEmail = resetResult.data.email;
            }
          }
        } catch {}

        if (retryEmail) {
          const retry = await supabase.auth.signInWithPassword({ email: retryEmail, password: 'Password123' });
          if (!retry.error) {
            setLoading(false);
            return;
          }
        }
      }

      const msg = error.message?.includes('Email not confirmed')
        ? 'Email belum dikonfirmasi. Jalankan SQL Blueprint untuk mengaktifkan Auto-Confirm Email.'
        : getErrorMessage(error);
      Swal.fire('Gagal Login', msg, 'error');
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFAFC] dark:bg-[#000000]">
      <div className="max-w-md w-full bg-white dark:bg-[#000000] rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-[#141414] animate-in zoom-in-95 duration-200">
        
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-[#FF6B6B] flex items-center justify-center text-white shadow-lg shadow-[#FF6B6B]/40">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-800 dark:text-white">
            Tryout<span className="text-[#FF6B6B]">Ku</span>
          </span>
        </div>

        {/* Title */}
        <div className="text-center mb-6 space-y-1">
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">
            {mode === 'login' && 'Portal Masuk Siswa 🎓'}
            {mode === 'register' && 'Daftar Tryout Simulasi 🚀'}
            {mode === 'reset' && 'Atur Ulang Kata Sandi 🔒'}
          </h3>
          <p className="text-xs text-slate-400">
            {mode === 'login' && 'Silakan masuk menggunakan kredensial akun Supabase Anda'}
            {mode === 'register' && 'Hanya 1 role: Peserta Siswa Tryout PTN'}
            {mode === 'reset' && 'Kami akan mengirimkan tautan reset password ke email Anda'}
          </p>
        </div>

        {/* --- SQL CONFIG BUTTON --- */}
        <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800 flex flex-col gap-2">
          <p className="text-xs text-indigo-800 dark:text-indigo-300">
            <strong>Info Admin / Kesalahan Login:</strong> Jika Anda belum menyalin blueprint SQL ke Supabase, atau tidak bisa login, klik tombol di bawah ini untuk melihat SQL Blueprint dan menjalankannya di Supabase.
          </p>
          <button
            onClick={() => {
              // Dispatch custom event that App.tsx can listen to, or simply export the modal logic.
              // Wait, we don't have the state here. Let's just create a custom event.
              window.dispatchEvent(new CustomEvent('open-sql-modal'));
            }}
            className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
          >
            Buka Konfigurasi SQL Supabase
          </button>
        </div>

        {resetSent && (
          <div className="p-4 mb-6 rounded-2xl bg-emerald-50 text-emerald-700 text-xs text-center font-semibold">
            ✓ Tautan pemulihan kata sandi telah dikirim ke {email}!
          </div>
        )}

        {!isSupabaseConfigured && (
          <div className="p-4 mb-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center font-semibold flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Supabase Belum Dikonfigurasi</span>
            </div>
            <p className="text-[10px] font-normal text-amber-700">
              Anda belum memasukkan <strong>Supabase URL</strong> dan <strong>Anon Key</strong>. Silakan klik tombol "Buka Konfigurasi SQL Supabase" di bawah untuk mengatur koneksi Anda.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'login' && (
            <div className="flex bg-slate-100 dark:bg-[#000000] rounded-xl p-1 mb-4">
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${loginMethod === 'email' ? 'bg-white dark:bg-[#000000] text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Gunakan Email
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('nisn')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${loginMethod === 'nisn' ? 'bg-white dark:bg-[#000000] text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Gunakan NISN
              </button>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nama Lengkap Siswa</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#FF6B6B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">NISN</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    placeholder="Nomor Induk Siswa Nasional"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] text-xs text-slate-800 dark:text-white font-mono focus:outline-none focus:border-[#FF6B6B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Asal Sekolah (SMA/MA/SMK)</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="Contoh: SMAN 3 Bandung"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#FF6B6B]"
                  />
                </div>
              </div>
            </>
          )}

          {loginMethod === 'email' || mode !== 'login' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Alamat Email Siswa</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@sekolah.sch.id"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#FF6B6B]"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">NISN</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  placeholder="Nomor Induk Siswa Nasional"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] text-xs text-slate-800 dark:text-white font-mono focus:outline-none focus:border-[#FF6B6B]"
                />
              </div>
            </div>
          )}

          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Kata Sandi (Password)</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchMode('reset')}
                    className="text-[11px] font-bold text-[#FF6B6B] hover:underline cursor-pointer"
                  >
                    Lupa Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#FF6B6B]"
                />
              </div>
            </div>
          )}

          {mode === 'login' && (
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-300 pt-1">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded text-[#FF6B6B] focus:ring-[#FF6B6B]"
              />
              <span>Remember Login (Ingat Sesi Saya)</span>
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-[#FF6B6B] hover:bg-[#E85D5D] disabled:opacity-70 text-white text-xs font-extrabold shadow-lg shadow-[#FF6B6B]/30 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>
              {loading ? 'Memproses...' : (
                mode === 'login' ? 'Masuk ke Dashboard' :
                mode === 'register' ? 'Daftar Akun Siswa Sekarang' :
                'Kirim Link Reset Password'
              )}
            </span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Footer switcher */}
        <div className="mt-8 text-center pt-6 border-t border-slate-100 dark:border-[#141414] text-xs text-slate-500">
          {mode === 'login' ? (
            <p>
              Belum punya akun tryout?{' '}
              <button type="button" onClick={() => switchMode('register')} className="font-bold text-[#FF6B6B] hover:underline cursor-pointer">
                Buat Akun Siswa
              </button>
            </p>
          ) : (
            <p>
              Sudah memiliki akun?{' '}
              <button type="button" onClick={() => switchMode('login')} className="font-bold text-[#FF6B6B] hover:underline cursor-pointer">
                Masuk (Login)
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
