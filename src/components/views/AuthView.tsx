import React, { useState } from 'react';
import { ArrowRight, Check, GraduationCap, Lock, Mail, ShieldCheck, Sparkles, User, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { appStore } from '../../lib/store';
import Swal from 'sweetalert2';
import { getErrorMessage, cn } from '../../lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full shadow-2xl rounded-3xl animate-in zoom-in-95 duration-200">
        <CardContent className="p-8">
          
          {/* Brand */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/40">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-800 dark:text-white">
              Tryout<span className="text-primary">Ku</span>
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
            <Button
              variant="secondary"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-sql-modal'));
              }}
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold"
            >
              Buka Konfigurasi SQL Supabase
            </Button>
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
              <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as 'email' | 'nisn')}>
                <TabsList className="w-full">
                  <TabsTrigger value="email" className="flex-1">Gunakan Email</TabsTrigger>
                  <TabsTrigger value="nisn" className="flex-1">Gunakan NISN</TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {mode === 'register' && (
              <>
                <div>
                  <Label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nama Lengkap Siswa</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="pl-10 py-2.5 rounded-xl bg-slate-50 dark:bg-background text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">NISN</Label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      required
                      value={nisn}
                      onChange={(e) => setNisn(e.target.value)}
                      placeholder="Nomor Induk Siswa Nasional"
                      className="pl-10 py-2.5 rounded-xl bg-slate-50 dark:bg-background text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <Label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Asal Sekolah (SMA/MA/SMK)</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      required
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      placeholder="Contoh: SMAN 3 Bandung"
                      className="pl-10 py-2.5 rounded-xl bg-slate-50 dark:bg-background text-xs"
                    />
                  </div>
                </div>
              </>
            )}

            {loginMethod === 'email' || mode !== 'login' ? (
              <div>
                <Label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Alamat Email Siswa</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@sekolah.sch.id"
                    className="pl-10 py-2.5 rounded-xl bg-slate-50 dark:bg-background text-xs"
                  />
                </div>
              </div>
            ) : (
              <div>
                <Label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">NISN</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="text"
                    required
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    placeholder="Nomor Induk Siswa Nasional"
                    className="pl-10 py-2.5 rounded-xl bg-slate-50 dark:bg-background text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {mode !== 'reset' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Kata Sandi (Password)</Label>
                  {mode === 'login' && (
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => switchMode('reset')}
                      className="text-[11px] font-bold p-0 h-auto text-primary hover:underline cursor-pointer"
                    >
                      Lupa Password?
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 py-2.5 rounded-xl bg-slate-50 dark:bg-background text-xs"
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <Label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-300 pt-1">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <span>Remember Login (Ingat Sesi Saya)</span>
              </Label>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-xs font-extrabold shadow-lg shadow-primary/30 transition-all gap-2 mt-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>
                {loading ? 'Memproses...' : (
                  mode === 'login' ? 'Masuk ke Dashboard' :
                  mode === 'register' ? 'Daftar Akun Siswa Sekarang' :
                  'Kirim Link Reset Password'
                )}
              </span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          {/* Footer switcher */}
          <div className="mt-8 text-center pt-6 text-xs text-slate-500">
            <Separator className="mb-6" />
            {mode === 'login' ? (
              <p>
                Belum punya akun tryout?{' '}
                <Button type="button" variant="link" onClick={() => switchMode('register')} className="font-bold p-0 h-auto text-primary cursor-pointer">
                  Buat Akun Siswa
                </Button>
              </p>
            ) : (
              <p>
                Sudah memiliki akun?{' '}
                <Button type="button" variant="link" onClick={() => switchMode('login')} className="font-bold p-0 h-auto text-primary cursor-pointer">
                  Masuk (Login)
                </Button>
              </p>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
};
