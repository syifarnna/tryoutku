import { Competency, Institution, Major, Profile, Tryout, TryoutResult, TutoringCenter } from '../types';

export const INITIAL_COMPETENCIES: Competency[] = [
  { id: 1, code: 'PU', name: 'Penalaran Umum', description: 'Kemampuan memecahkan masalah baru dengan logika rasional.', weight: 1 },
  { id: 2, code: 'PPU', name: 'Pengetahuan & Pemahaman Umum', description: 'Kemampuan memahami kaidah dasar informasi & kebahasaan.', weight: 1 },
  { id: 3, code: 'PBM', name: 'Kemampuan Memahami Bacaan', description: 'Kemampuan membaca teks kompleks dan menarik kesimpulan kritis.', weight: 1 },
  { id: 4, code: 'PK', name: 'Pengetahuan Kuantitatif', description: 'Kemampuan berhitung, aljabar, geometri, dan statistika dasar.', weight: 1.2 },
  { id: 5, code: 'LBI', name: 'Literasi Bahasa Indonesia', description: 'Kemampuan memahami, menggunakan, & merefleksikan teks berbahasa Indonesia.', weight: 1 },
  { id: 6, code: 'LBE', name: 'Literasi Bahasa Inggris', description: 'Kemampuan memahami esai akademis & teks jurnal ilmiah berbahasa Inggris.', weight: 1.1 },
  { id: 7, code: 'PM', name: 'Penalaran Matematika', description: 'Kemampuan menganalisis masalah kontekstual kehidupan nyata secara matematis.', weight: 1.3 }
];

export const INITIAL_INSTITUTIONS: Institution[] = [
  { id: 101, name: 'Institut Teknologi Bandung (ITB)', type: 'PTN', location: 'Bandung, Jawa Barat' },
  { id: 102, name: 'Universitas Indonesia (UI)', type: 'PTN', location: 'Depok, Jawa Barat' },
  { id: 103, name: 'Universitas Gadjah Mada (UGM)', type: 'PTN', location: 'Yogyakarta, DIY' },
  { id: 104, name: 'Institut Teknologi Sepuluh Nopember (ITS)', type: 'PTN', location: 'Surabaya, Jawa Timur' },
  { id: 105, name: 'Universitas Padjadjaran (UNPAD)', type: 'PTN', location: 'Sumedang, Jawa Barat' },
  { id: 106, name: 'Universitas Airlangga (UNAIR)', type: 'PTN', location: 'Surabaya, Jawa Timur' },
  { id: 107, name: 'Universitas Brawijaya (UB)', type: 'PTN', location: 'Malang, Jawa Timur' },
  { id: 108, name: 'Institut Pertanian Bogor (IPB University)', type: 'PTN', location: 'Bogor, Jawa Barat' },
  { id: 109, name: 'Universitas Diponegoro (UNDIP)', type: 'PTN', location: 'Semarang, Jawa Tengah' },
  { id: 110, name: 'Politeknik Keuangan Negara STAN', type: 'Kedinasan', location: 'Tangerang Selatan, Banten' },
  { id: 111, name: 'Politeknik Statistika STIS', type: 'Kedinasan', location: 'Jakarta Timur, DKI Jakarta' },
  { id: 112, name: 'Telkom University', type: 'PTS', location: 'Bandung, Jawa Barat' },
  { id: 113, name: 'Universitas Bina Nusantara (BINUS)', type: 'PTS', location: 'Jakarta Barat, DKI Jakarta' }
];

export const INITIAL_MAJORS: Major[] = [
  // ITB
  { id: 1, institution_id: 101, institution_name: 'Institut Teknologi Bandung (ITB)', institution_location: 'Bandung', institution_type: 'PTN', name: 'Sekolah Teknik Elektro & Informatika (STEI - Komputasi)', cluster: 'Saintek', passing_grade_total: 738.5, requirements: { PK: 720, PM: 740, PU: 700 } },
  { id: 2, institution_id: 101, institution_name: 'Institut Teknologi Bandung (ITB)', institution_location: 'Bandung', institution_type: 'PTN', name: 'Fakultas Teknik Pertambangan & Perminyakan (FTTM)', cluster: 'Saintek', passing_grade_total: 712.0, requirements: { PK: 700, PM: 710 } },
  { id: 3, institution_id: 101, institution_name: 'Institut Teknologi Bandung (ITB)', institution_location: 'Bandung', institution_type: 'PTN', name: 'Sekolah Bisnis dan Manajemen (SBM)', cluster: 'Soshum', passing_grade_total: 718.0, requirements: { PU: 710, LBE: 700 } },
  { id: 4, institution_id: 101, institution_name: 'Institut Teknologi Bandung (ITB)', institution_location: 'Bandung', institution_type: 'PTN', name: 'Fakultas Seni Rupa dan Desain (FSRD)', cluster: 'Soshum', passing_grade_total: 685.0, requirements: { PBM: 680 } },

  // UI
  { id: 5, institution_id: 102, institution_name: 'Universitas Indonesia (UI)', institution_location: 'Depok', institution_type: 'PTN', name: 'Pendidikan Dokter', cluster: 'Saintek', passing_grade_total: 754.2, requirements: { PK: 740, PM: 750, LBE: 720 } },
  { id: 6, institution_id: 102, institution_name: 'Universitas Indonesia (UI)', institution_location: 'Depok', institution_type: 'PTN', name: 'Ilmu Hukum', cluster: 'Soshum', passing_grade_total: 708.5, requirements: { PU: 700, PBM: 710, LBI: 710 } },
  { id: 7, institution_id: 102, institution_name: 'Universitas Indonesia (UI)', institution_location: 'Depok', institution_type: 'PTN', name: 'Psikologi', cluster: 'Soshum', passing_grade_total: 715.0, requirements: { PU: 720, PBM: 700 } },
  { id: 8, institution_id: 102, institution_name: 'Universitas Indonesia (UI)', institution_location: 'Depok', institution_type: 'PTN', name: 'Sistem Informasi', cluster: 'Saintek', passing_grade_total: 710.0, requirements: { PK: 700, PM: 690 } },

  // UGM
  { id: 9, institution_id: 103, institution_name: 'Universitas Gadjah Mada (UGM)', institution_location: 'Yogyakarta', institution_type: 'PTN', name: 'Teknologi Informasi', cluster: 'Saintek', passing_grade_total: 722.0, requirements: { PK: 710, PM: 720 } },
  { id: 10, institution_id: 103, institution_name: 'Universitas Gadjah Mada (UGM)', institution_location: 'Yogyakarta', institution_type: 'PTN', name: 'Kedokteran', cluster: 'Saintek', passing_grade_total: 748.0, requirements: { PK: 730, PM: 740 } },
  { id: 11, institution_id: 103, institution_name: 'Universitas Gadjah Mada (UGM)', institution_location: 'Yogyakarta', institution_type: 'PTN', name: 'Akuntansi', cluster: 'Soshum', passing_grade_total: 698.0, requirements: { PK: 680, PU: 690 } },
  { id: 12, institution_id: 103, institution_name: 'Universitas Gadjah Mada (UGM)', institution_location: 'Yogyakarta', institution_type: 'PTN', name: 'Hubungan Internasional', cluster: 'Soshum', passing_grade_total: 702.5, requirements: { LBE: 710, PBM: 690 } },

  // ITS
  { id: 13, institution_id: 104, institution_name: 'Institut Teknologi Sepuluh Nopember (ITS)', institution_location: 'Surabaya', institution_type: 'PTN', name: 'Teknik Informatika', cluster: 'Saintek', passing_grade_total: 716.0, requirements: { PK: 710, PM: 720 } },
  { id: 14, institution_id: 104, institution_name: 'Institut Teknologi Sepuluh Nopember (ITS)', institution_location: 'Surabaya', institution_type: 'PTN', name: 'Teknik Industri', cluster: 'Saintek', passing_grade_total: 689.0, requirements: { PK: 690 } },
  { id: 15, institution_id: 104, institution_name: 'Institut Teknologi Sepuluh Nopember (ITS)', institution_location: 'Surabaya', institution_type: 'PTN', name: 'Statistika', cluster: 'Saintek', passing_grade_total: 682.0, requirements: { PK: 700, PM: 690 } },

  // UNPAD
  { id: 16, institution_id: 105, institution_name: 'Universitas Padjadjaran (UNPAD)', institution_location: 'Sumedang', institution_type: 'PTN', name: 'Ilmu Komunikasi', cluster: 'Soshum', passing_grade_total: 684.0, requirements: { LBI: 690, PPU: 680 } },
  { id: 17, institution_id: 105, institution_name: 'Universitas Padjadjaran (UNPAD)', institution_location: 'Sumedang', institution_type: 'PTN', name: 'Bisnis Digital', cluster: 'Saintek', passing_grade_total: 675.5, requirements: { PK: 670, PU: 680 } },
  { id: 18, institution_id: 105, institution_name: 'Universitas Padjadjaran (UNPAD)', institution_location: 'Sumedang', institution_type: 'PTN', name: 'Farmasi', cluster: 'Saintek', passing_grade_total: 680.0, requirements: { PK: 680 } },

  // UNAIR & UB
  { id: 19, institution_id: 106, institution_name: 'Universitas Airlangga (UNAIR)', institution_location: 'Surabaya', institution_type: 'PTN', name: 'Kedokteran Gigi', cluster: 'Saintek', passing_grade_total: 705.0, requirements: { PK: 700 } },
  { id: 20, institution_id: 107, institution_name: 'Universitas Brawijaya (UB)', institution_location: 'Malang', institution_type: 'PTN', name: 'Ilmu Hukum', cluster: 'Soshum', passing_grade_total: 668.0, requirements: { PBM: 670 } },
  { id: 21, institution_id: 107, institution_name: 'Universitas Brawijaya (UB)', institution_location: 'Malang', institution_type: 'PTN', name: 'Teknik Komputer', cluster: 'Saintek', passing_grade_total: 662.5, requirements: { PK: 660 } },

  // IPB & UNDIP
  { id: 22, institution_id: 108, institution_name: 'IPB University', institution_location: 'Bogor', institution_type: 'PTN', name: 'Ilmu Komputer', cluster: 'Saintek', passing_grade_total: 694.0, requirements: { PK: 700 } },
  { id: 23, institution_id: 109, institution_name: 'Universitas Diponegoro (UNDIP)', institution_location: 'Semarang', institution_type: 'PTN', name: 'Manajemen', cluster: 'Soshum', passing_grade_total: 672.0, requirements: { PU: 670 } },

  // Kedinasan
  { id: 24, institution_id: 110, institution_name: 'Politeknik Keuangan Negara STAN', institution_location: 'Tangerang Selatan', institution_type: 'Kedinasan', name: 'D4 Akuntansi Sektor Publik', cluster: 'Campuran', passing_grade_total: 712.5, requirements: { PK: 700, PU: 710, LBE: 690 } },
  { id: 25, institution_id: 111, institution_name: 'Politeknik Statistika STIS', institution_location: 'Jakarta Timur', institution_type: 'Kedinasan', name: 'D4 Statistika Komputasi', cluster: 'Saintek', passing_grade_total: 695.0, requirements: { PK: 710, PM: 700 } },

  // PTS
  { id: 26, institution_id: 112, institution_name: 'Telkom University', institution_location: 'Bandung', institution_type: 'PTS', name: 'S1 Rekayasa Perangkat Lunak', cluster: 'Saintek', passing_grade_total: 610.0, requirements: { PK: 600 } },
  { id: 27, institution_id: 113, institution_name: 'Universitas Bina Nusantara (BINUS)', institution_location: 'Jakarta Barat', institution_type: 'PTS', name: 'Computer Science', cluster: 'Saintek', passing_grade_total: 615.0, requirements: { PK: 610 } },
  { id: 28, institution_id: 107, institution_name: 'Universitas Brawijaya (UB)', institution_location: 'Malang', institution_type: 'PTN', name: 'Agribisnis', cluster: 'Saintek', passing_grade_total: 635.0, requirements: { PU: 630 } },
  { id: 29, institution_id: 105, institution_name: 'Universitas Padjadjaran (UNPAD)', institution_location: 'Sumedang', institution_type: 'PTN', name: 'Sastra Inggris', cluster: 'Soshum', passing_grade_total: 648.0, requirements: { LBE: 680 } },
  { id: 30, institution_id: 109, institution_name: 'Universitas Diponegoro (UNDIP)', institution_location: 'Semarang', institution_type: 'PTN', name: 'Teknik Sipil', cluster: 'Saintek', passing_grade_total: 668.5, requirements: { PK: 670 } }
];

export const INITIAL_TRYOUTS: Tryout[] = [
  { id: 1, name: 'Simulasi Akbar Nasional UTBK SNBT 2026 - Episode 1', date: '2026-05-10', type: 'UTBK SNBT', duration_minutes: 195, question_count: 155, status: 'Selesai', description: 'Simulasi resmi menguji 7 komponen subtes sesuai standar SNBT SNPMB terbaru.' },
  { id: 2, name: 'Simulasi Akbar Nasional UTBK SNBT 2026 - Episode 2', date: '2026-06-15', type: 'UTBK SNBT', duration_minutes: 195, question_count: 155, status: 'Selesai', description: 'Simulasi penguatan penalaran matematika & literasi akademis tingkat tinggi.' },
  { id: 3, name: 'Tryout Intensif Kedinasan STAN & STIS 2026', date: '2026-06-20', type: 'Ujian Kedinasan', duration_minutes: 120, question_count: 100, status: 'Tersedia', description: 'Ujian SKD & Tes Potensi Akademik khusus seleksi masuk perguruan tinggi kedinasan.' },
  { id: 4, name: 'Simulasi SIMAK UI & Ujian Mandiri ITB 2026', date: '2026-06-28', type: 'Ujian Mandiri', duration_minutes: 150, question_count: 120, status: 'Segera', description: 'Simulasi seleksi ujian mandiri PTN ternama dengan tingkat kesulitan +20%.' }
];

export const EMPTY_PROFILE: Profile = {
  id: '',
  full_name: '',
  nisn: '',
  email: '',
  phone: '',
  school: '',
  major_interest: 'Saintek',
  avatar_url: '',
  role: 'peserta',
  is_profile_complete: false,
  must_change_password: true,
  updated_at: new Date().toISOString()
};

export const INITIAL_RESULTS: TryoutResult[] = [
  {
    id: 1001,
    student_id: 'usr-student-001',
    tryout_id: 1,
    tryout_name: 'Simulasi Akbar Nasional UTBK SNBT 2026 - Episode 1',
    tryout_type: 'UTBK SNBT',
    tryout_date: '2026-05-10',
    total_score: 642.8,
    predicate: 'Baik',
    created_at: '2026-05-10T14:30:00Z',
    scores: {
      PU: 680,
      PPU: 650,
      PBM: 670,
      PK: 610,
      LBI: 690,
      LBE: 580, // Weakest in tryout 1
      PM: 620
    }
  },
  {
    id: 1002,
    student_id: 'usr-student-001',
    tryout_id: 2,
    tryout_name: 'Simulasi Akbar Nasional UTBK SNBT 2026 - Episode 2',
    tryout_type: 'UTBK SNBT',
    tryout_date: '2026-06-15',
    total_score: 688.5,
    predicate: 'Baik',
    created_at: '2026-06-15T15:00:00Z',
    scores: {
      PU: 725,
      PPU: 710,
      PBM: 700,
      PK: 665, // Still below STEI ITB requirement (720)
      LBI: 740,
      LBE: 630, // Improved but still below target (700)
      PM: 650  // Below target (740)
    }
  }
];

export const INITIAL_TUTORS: TutoringCenter[] = [
  {
    id: 501,
    name: 'Master Kuantitatif & Aljabar UTBK',
    focus_competency_code: 'PK',
    contact_info: 'WhatsApp: 0811-2233-4455',
    link_url: 'https://wa.me/6281122334455?text=Halo%20saya%20mau%20daftar%20Master%20PK',
    description: 'Bimbel intensif khusus mendongkrak skor Pengetahuan Kuantitatif dari <600 menjadi >720 dalam 4 minggu.',
    rating: 4.9,
    price: 'Rp 450.000 / bulan',
    batch_start: 'Mulai Setiap Senin'
  },
  {
    id: 502,
    name: 'Supercamp English Academic Literacy',
    focus_competency_code: 'LBE',
    contact_info: 'WhatsApp: 0812-9988-7766',
    link_url: 'https://wa.me/6281299887766?text=Daftar%20Supercamp%20LBE',
    description: 'Klinik bedah teks jurnal ilmiah & reading comprehension UTBK Bahasa Inggris dengan metode pemindaian cepat.',
    rating: 4.8,
    price: 'Rp 380.000 / bulan',
    batch_start: 'Batch 5: 1 Juli 2026'
  },
  {
    id: 503,
    name: 'Penalaran Matematika & Konteks Nyata Camp',
    focus_competency_code: 'PM',
    contact_info: 'Telegram: @pm_master_utbk',
    link_url: 'https://t.me/pm_master_utbk',
    description: 'Latihan soal literasi matematika kontekstual standar PISA/SNBT untuk menembus prodi favorit Saintek.',
    rating: 4.9,
    price: 'Rp 500.000 / paket',
    batch_start: 'Segera Dibuka'
  },
  {
    id: 504,
    name: 'Logika & Penalaran Umum Ganesha',
    focus_competency_code: 'PU',
    contact_info: 'WhatsApp: 0813-4455-6677',
    link_url: 'https://wa.me/6281344556677',
    description: 'Bimbel penalaran silogisme, logika analitis, dan pemecahan masalah kritis dengan tentor alumni ITB.',
    rating: 4.7,
    price: 'Rp 350.000 / bulan',
    batch_start: 'Tersedia Kelas Malam'
  },
  {
    id: 505,
    name: 'Bahasa Indonesia Kritis Academy',
    focus_competency_code: 'PBM',
    contact_info: 'Line: @pbm_kritis',
    link_url: 'https://line.me/ti/p/@pbm_kritis',
    description: 'Strategi anti-terjebak pilihan jawaban mirip pada subtes Kemampuan Memahami Bacaan & Menulis.',
    rating: 4.8,
    price: 'Rp 300.000 / bulan',
    batch_start: 'Setiap Sabtu & Minggu'
  },
  {
    id: 506,
    name: 'Klinik Pemahaman Dasar PPU',
    focus_competency_code: 'PPU',
    contact_info: 'WhatsApp: 0815-6677-8899',
    link_url: 'https://wa.me/6281566778899',
    description: 'Bedah tuntas sinonim, antonim, majas, struktur kalimat efektif, dan ide pokok paragraf dengan mudah.',
    rating: 4.6,
    price: 'Rp 280.000 / bulan',
    batch_start: 'Akses Rekaman Video 24 Jam'
  },
  {
    id: 507,
    name: 'Sanggar Literasi Bahasa Nusantara',
    focus_competency_code: 'LBI',
    contact_info: 'WhatsApp: 0819-8877-6655',
    link_url: 'https://wa.me/6281988776655',
    description: 'Pemantapan pemahaman bacaan literasi sastra dan informasi umum untuk meraih skor >750.',
    rating: 4.8,
    price: 'Rp 320.000 / bulan',
    batch_start: 'Kelas Live Zoom'
  }
];

export const SUPABASE_SQL_BLUEPRINT = `-- =========================================================================
-- SYNC CSV PROFILES -> SUPABASE AUTH USERS + FIX SCHEMA
-- Jalankan ini SETELAH import CSV ke public.profiles
-- =========================================================================

-- 1) Pastikan ekstensi pgcrypto tersedia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Bersihkan data: trim spasi dari nisn, auth_uid = id
UPDATE public.profiles SET nisn = TRIM(nisn::text) WHERE nisn IS DISTINCT FROM TRIM(nisn::text);
UPDATE public.profiles SET auth_uid = id WHERE auth_uid IS NULL OR auth_uid::text = '';

-- 3) Isi email kosong (nisn@peserta.com)
UPDATE public.profiles SET email = nisn::text || '@peserta.com' WHERE (email IS NULL OR email = '') AND nisn IS NOT NULL;

-- 4) Perbaiki schema auth.users (tambah kolom yang mungkin hilang)
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS is_sso_user boolean DEFAULT false;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS is_anonymous boolean DEFAULT false;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS phone_change text;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS phone_change_token text;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS phone_change_sent_at timestamptz;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS email_change_confirm_status smallint DEFAULT 0;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS banned_until timestamptz;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS reauthentication_token text;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS reauthentication_sent_at timestamptz;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS is_super_admin boolean;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- 5) Perbaiki schema auth.identities (tambah kolom yang mungkin hilang)
ALTER TABLE auth.identities ADD COLUMN IF NOT EXISTS updated_at timestamptz;
ALTER TABLE auth.identities ADD COLUMN IF NOT EXISTS last_sign_in_at timestamptz;

-- 6) Hapus trigger bermasalah (auto_confirm_email) jika ada
DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;
DROP FUNCTION IF EXISTS public.auto_confirm_email;

-- 7) RPC: cari email berdasarkan NISN
CREATE OR REPLACE FUNCTION public.get_email_by_nisn(p_nisn text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN (SELECT email FROM public.profiles WHERE nisn::text = p_nisn LIMIT 1);
END;
$$;

-- 8) RPC: buat akun auth users + identities untuk profile yang belum punya
CREATE OR REPLACE FUNCTION public.sync_profile_auth_user(p_nisn text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, auth, extensions
AS $$
DECLARE
  v_id text; v_auth_uid text; v_full_name text; v_email text; v_nisn text;
  v_new_auth_uid uuid;
BEGIN
  SELECT id::text, auth_uid::text, full_name, email, nisn::text
    INTO v_id, v_auth_uid, v_full_name, v_email, v_nisn
    FROM public.profiles WHERE nisn::text = p_nisn LIMIT 1;
  IF v_id IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'NISN tidak ditemukan'); END IF;
  IF v_auth_uid IS NOT NULL AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = v_auth_uid::uuid) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Akun ini sudah memiliki akses login');
  END IF;
  v_new_auth_uid := gen_random_uuid();
  UPDATE public.profiles SET auth_uid = v_new_auth_uid::text WHERE id = v_id;
  IF v_email IS NULL OR TRIM(v_email) = '' THEN v_email := v_nisn || '@peserta.com'; UPDATE public.profiles SET email = v_email WHERE id = v_id; END IF;
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
  VALUES ('00000000-0000-0000-0000-000000000000', v_new_auth_uid, 'authenticated', 'authenticated', v_email, crypt('Password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', v_full_name, 'nisn', v_nisn), '', '', '', '');
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), v_new_auth_uid, jsonb_build_object('sub', v_new_auth_uid::text, 'email', v_email), 'email', v_new_auth_uid::text, now(), now(), now());
  UPDATE public.profiles SET must_change_password = true WHERE id = v_id;
  RETURN jsonb_build_object('success', true, 'email', v_email);
END;
$$;

-- 9) RPC: reset password profile yang sudah punya auth user
CREATE OR REPLACE FUNCTION public.reset_password_by_nisn(p_nisn text, p_new_password text DEFAULT 'Password123')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, auth, extensions
AS $$
DECLARE v_auth_uid text; v_email text;
BEGIN
  SELECT auth_uid::text, email INTO v_auth_uid, v_email FROM public.profiles WHERE nisn::text = p_nisn LIMIT 1;
  IF v_auth_uid IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'NISN tidak ditemukan'); END IF;
  IF NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = v_auth_uid::uuid) THEN RETURN jsonb_build_object('success', false, 'error', 'Akun auth belum dibuat'); END IF;
  UPDATE auth.users u SET encrypted_password = crypt(p_new_password, gen_salt('bf')), email_confirmed_at = COALESCE(u.email_confirmed_at, now()), updated_at = now() FROM public.profiles p WHERE u.id = p.auth_uid::uuid AND p.nisn::text = p_nisn;
  UPDATE public.profiles SET must_change_password = true WHERE nisn::text = p_nisn;
  RETURN jsonb_build_object('success', true, 'email', v_email);
END;
$$;

-- 10) HAPUS & BUAT ULANG auth user untuk NISN tertentu (ganti NISN sesuai kebutuhan)
-- ========== UNCOMMENT & JALANKAN untuk reset user tertentu ==========
-- DO $$
-- DECLARE v_auth_uid text; v_email text; v_nisn text := '8921971441';
-- BEGIN
--   SELECT auth_uid::text, email INTO v_auth_uid, v_email FROM public.profiles WHERE nisn::text = v_nisn;
--   IF v_auth_uid IS NOT NULL THEN
--     DELETE FROM auth.identities WHERE user_id = v_auth_uid::uuid;
--     DELETE FROM auth.users WHERE id = v_auth_uid::uuid;
--     UPDATE public.profiles SET auth_uid = gen_random_uuid()::text WHERE nisn::text = v_nisn;
--   END IF;
-- END $$;
-- SELECT public.sync_profile_auth_user('8921971441');
-- ================================================================

-- 11) Batch insert auth.users (skip existing)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
SELECT '00000000-0000-0000-0000-000000000000', p.auth_uid::uuid, 'authenticated', 'authenticated', p.email, crypt('Password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', p.full_name, 'nisn', p.nisn), '', '', '', ''
FROM public.profiles p
WHERE p.email IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.auth_uid::uuid)
  AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.email = p.email);

-- 12) Batch insert auth.identities (skip existing)
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
SELECT gen_random_uuid(), p.auth_uid::uuid, jsonb_build_object('sub', p.auth_uid, 'email', p.email), 'email', p.auth_uid, now(), now(), now()
FROM public.profiles p
WHERE p.email IS NOT NULL
  AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.auth_uid::uuid)
  AND NOT EXISTS (SELECT 1 FROM auth.identities i WHERE i.user_id = p.auth_uid::uuid AND i.provider = 'email');

-- 13) Confirm email
UPDATE auth.users SET email_confirmed_at = COALESCE(email_confirmed_at, now()) WHERE email_confirmed_at IS NULL;

-- 14) Hapus trigger handle_new_user jika bermasalah
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

-- 15) Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- 16) RPC: leaderboard (dukung filter per tipe TO)
CREATE OR REPLACE FUNCTION public.get_leaderboard(p_type text DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE result JSONB;
BEGIN
  WITH filtered AS (
    SELECT * FROM tryout_results
    WHERE (p_type IS NULL OR tryout_type = p_type)
  ),
  ranked AS (
    SELECT DISTINCT ON (r.user_id::text)
      r.id, r.user_id, r.student_id, r.total_score, r.predicate,
      r.created_at, r.tryout_name, r.tryout_type, r.tryout_date, r.scores,
      jsonb_build_object(
        'full_name', p.full_name,
        'nisn', p.nisn,
        'school', p.school,
        'email', p.email
      ) AS profiles
    FROM filtered r
    LEFT JOIN profiles p ON p.id::text = r.user_id::text OR p.auth_uid::text = r.user_id::text
    ORDER BY r.user_id::text, r.total_score DESC
  )
  SELECT jsonb_agg(sub) INTO result FROM (SELECT * FROM ranked ORDER BY total_score DESC) sub;
  RETURN COALESCE(result, '[]'::JSONB);
END;
$$;
`;

