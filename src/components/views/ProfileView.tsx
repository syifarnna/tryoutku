import React, { useState } from 'react';
import { Camera, Check, Lock, Save, Shield, User } from 'lucide-react';
import { appStore, useAppState } from '../../lib/store';
import { ClusterType } from '../../types';

export const ProfileView: React.FC = () => {
  const state = useAppState();
  
  const [name, setName] = useState(state.profile.full_name || '');
  const [nisn, setNisn] = useState(state.profile.nisn || '');
  const [email, setEmail] = useState(state.profile.email || '');
  const [phone, setPhone] = useState(state.profile.phone || '');
  const [school, setSchool] = useState(state.profile.school || '');
  const [interest, setInterest] = useState<ClusterType>(state.profile.major_interest || 'Saintek');
  const [avatar, setAvatar] = useState(state.profile.avatar_url || '');

  const [pwd, setPwd] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    appStore.updateProfile({
      full_name: name,
      nisn,
      email,
      phone,
      school,
      major_interest: interest,
      avatar_url: avatar,
      is_profile_complete: true
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl space-y-8 pb-16 animate-in fade-in duration-300">
      
      <div className="border-b border-slate-100 dark:border-[#141414] pb-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Pengaturan Profil Siswa TryoutKu</h2>
        <p className="text-xs text-slate-400 mt-0.5">Kelola identitas peserta tryout dan preferensi rumpun minat jurusan</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-white dark:bg-[#000000] border border-slate-100 dark:border-[#141414] shadow-xs space-y-8">
        
        {/* Avatar Section */}
        <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-[#141414]">
          <div className="relative">
            <img 
              src={avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${name || 'User'}`} 
              alt={name || 'User'} 
              className="w-20 h-20 rounded-full object-cover border-4 border-indigo-50 dark:border-indigo-950 shadow-md"
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">URL Foto Profil Siswa</label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] text-xs focus:outline-none focus:border-[#FF6B6B]"
            />
            <p className="text-[10px] text-slate-400">Gunakan tautan gambar JPG/PNG langsung</p>
          </div>
        </div>

        {/* Biodata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nama Lengkap Siswa</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] text-xs text-slate-800 dark:text-white font-semibold focus:outline-none focus:border-[#FF6B6B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">NISN / Nomor Peserta</label>
            <input
              type="text"
              value={nisn}
              onChange={(e) => setNisn(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] text-xs text-slate-800 dark:text-white font-mono focus:outline-none focus:border-[#FF6B6B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Alamat Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#FF6B6B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nomor WhatsApp / HP</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#FF6B6B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Asal Sekolah SMA/SMK</label>
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#FF6B6B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Rumpun Minat Jurusan</label>
            <select
              value={interest}
              onChange={(e) => setInterest(e.target.value as ClusterType)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] text-xs font-bold text-[#FF6B6B] focus:outline-none focus:border-[#FF6B6B]"
            >
              <option value="Saintek">Saintek (IPA / Komputasi / Medis)</option>
              <option value="Soshum">Soshum (IPS / Hukum / Bisnis)</option>
              <option value="Campuran">Campuran / Kedinasan STAN</option>
            </select>
          </div>
        </div>

        {/* Change password */}
        <div className="pt-4 border-t border-slate-100 dark:border-[#141414] space-y-3">
          <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500" />
            <span>Ubah Kata Sandi (Password) Baru</span>
          </h4>
          <input
            type="password"
            placeholder="Ketik password baru jika ingin mengubah..."
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="max-w-md w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-[#1C1C1C] text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#FF6B6B]"
          />
        </div>

        <div className="pt-4 flex items-center justify-between">
          <span className="text-xs text-emerald-500 font-semibold">{saved ? '✓ Profil Berhasil Disimpan!' : ''}</span>
          <button
            type="submit"
            className="px-8 py-3 rounded-2xl bg-[#FF6B6B] text-white text-xs font-bold hover:bg-[#E85D5D] shadow-lg shadow-[#FF6B6B]/30 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>

      </form>

    </div>
  );
};
