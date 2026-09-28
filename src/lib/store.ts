import { useState, useEffect } from 'react';
import {
  AnalysisSummary, 
  ClusterType,
  Competency, 
  GapAnalysisItem, 
  Institution, 
  Major, 
  PenjurusanQuestion,
  Profile, 
  TargetInstitution, 
  Tryout, 
  TryoutResult,
  TutoringCenter
} from '../types';
import { 
  INITIAL_COMPETENCIES, 
  INITIAL_INSTITUTIONS, 
  INITIAL_MAJORS, 
  EMPTY_PROFILE, 
  INITIAL_RESULTS, 
  INITIAL_TRYOUTS 
} from './mockData';
import { supabase } from './supabaseClient';

export interface AppState {
  isLoggedIn: boolean;
  rememberMe: boolean;
  profile: Profile;
  institutions: Institution[];
  majors: Major[];
  competencies: Competency[];
  tryouts: Tryout[];
  results: TryoutResult[];
  targetMajorIds: number[]; 
  activeTargetMajorId: number | null; 
  useRealSupabase: boolean; // Keep for compatibility but it's always true now
  questions: PenjurusanQuestion[];
  tutoringCenters: TutoringCenter[];
}

const DEFAULT_STATE: AppState = {
  isLoggedIn: false, // Default to false, wait for Supabase Auth
  rememberMe: true,
  profile: EMPTY_PROFILE,
  institutions: [],
  majors: [],
  competencies: [],
  tryouts: [],
  results: [],
  targetMajorIds: [], 
  activeTargetMajorId: null, 
  useRealSupabase: true,
  questions: [],
  tutoringCenters: []
};

class AppStore {
  private state: AppState;
  private listeners: Set<() => void> = new Set();
  private _masterDataAuthed = false;

  constructor() {
    this.state = { ...DEFAULT_STATE };
    this.hydrateTargetsFromStorage();
    this.initAuth();
  }

  private persistTargetsSnapshot() {
    try {
      const snapshot = {
        version: 1,
        targetMajorIds: this.state.targetMajorIds,
        activeTargetMajorId: this.state.activeTargetMajorId || null,
        majors: this.getTargetMajors().map((m) => ({
          id: m.id,
          institution_id: m.institution_id,
          institution_name: m.institution_name,
          name: m.name,
          cluster: m.cluster,
          passing_grade_total: m.passing_grade_total,
        })),
      };
      localStorage.setItem('tryoutku_targets_v1', JSON.stringify(snapshot));
    } catch (e) {
      console.warn('Gagal menyimpan target prodi ke localStorage:', e);
    }
  }

  private hydrateTargetsFromStorage() {
    try {
      const raw = localStorage.getItem('tryoutku_targets_v1');
      if (!raw) return;
      const snap = JSON.parse(raw);
      if (!snap || snap.version !== 1 || !Array.isArray(snap.targetMajorIds)) return;
      this.state.targetMajorIds = snap.targetMajorIds;
      if (snap.activeTargetMajorId != null) {
        this.state.activeTargetMajorId = snap.activeTargetMajorId;
      }
      if (Array.isArray(snap.majors)) {
        snap.majors.forEach((m: Major) => {
          if (!this.state.majors.find((x) => x.id === m.id)) {
            this.state.majors = [...this.state.majors, m];
          }
        });
      }
    } catch (e) {
      console.warn('Gagal memuat target prodi dari localStorage:', e);
    }
  }

  private async initAuth() {
    // Initial fetch of master data so it's ready even before login
    this.fetchMasterData();
    
    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        this.state.isLoggedIn = true;
        this.state.profile.email = session.user.email || '';
        this.syncFromSupabase(session.user.id);
        // Re-fetch master data dengan sesi yang sudah ter-authenticated.
        // Login pertama kadang fetch awal (anon) difilter RLS hingga prodi kosong.
        if (!this._masterDataAuthed) {
          this._masterDataAuthed = true;
          this.fetchMasterData();
        }
      } else {
        this.state.isLoggedIn = false;
        this.state.profile = { ...EMPTY_PROFILE };
        this.state.results = [];
        this.state.targetMajorIds = [];
        this._masterDataAuthed = false;
        try { localStorage.removeItem('tryoutku_targets_v1'); } catch (e) {}
        this.notify();
      }
    });
  }

  public getState(): AppState {
    return this.state;
  }

  public updateProfileLocally(updates: Partial<Profile>) {
    this.state.profile = { ...this.state.profile, ...updates };
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public notify() {
    this.listeners.forEach(l => l());
  }

  public async logout() {
    if (!import.meta.env.VITE_SUPABASE_URL) {
      this.state.isLoggedIn = false;
      this.state.profile = { ...EMPTY_PROFILE };
      this.notify();
      return;
    }
    await supabase.auth.signOut();
  }

  public mockLogin(email: string, name?: string) {
    this.state.isLoggedIn = true;
    this.state.profile = {
      ...EMPTY_PROFILE,
      id: 'demo-user-id',
      email: email,
      full_name: name || email.split('@')[0],
    };
    this.notify();
  }

  public async updateProfile(updated: Partial<Profile>) {
    this.state.profile = { ...this.state.profile, ...updated, updated_at: new Date().toISOString() };
    this.notify();
    try {
      const { error } = await supabase.from('profiles').upsert(this.state.profile);
      if (error) {
        console.warn('Sync profil ditolak:', error.message);
      }
    } catch (err) {
      console.warn('Supabase sync warning:', err);
    }
  }

  // Target Majors
  public syncMajorToState(major: Major) {
    if (!this.state.majors.find(m => m.id === major.id)) {
      this.state.majors = [...this.state.majors, major];
      this.notify();
    }
  }

  public async addTargetMajor(majorId: number) {
    if (!this.state.targetMajorIds.includes(majorId)) {
      this.state.targetMajorIds = [...this.state.targetMajorIds, majorId];
      if (!this.state.activeTargetMajorId) {
        this.state.activeTargetMajorId = majorId;
      }
      this.notify();
      this.persistTargetsSnapshot();
      
      try {
        const { data: sData } = await supabase.auth.getUser();
        const uid = sData?.user?.id || this.state.profile.id;
        await supabase.from('target_institutions').insert({
          user_id: uid,
          student_id: uid,
          major_id: majorId,
          priority: this.state.targetMajorIds.length
        });
      } catch (e) { console.warn('Supabase sync error', e); }
    }
  }

  public async removeTargetMajor(majorId: number) {
    this.state.targetMajorIds = this.state.targetMajorIds.filter(id => id !== majorId);
    if (this.state.activeTargetMajorId === majorId) {
      this.state.activeTargetMajorId = this.state.targetMajorIds[0] || null;
    }
    this.notify();
    this.persistTargetsSnapshot();

    try {
      const { data: sData } = await supabase.auth.getUser();
      const uid = sData?.user?.id || this.state.profile.id;
      await supabase.from('target_institutions')
        .delete()
        .match({ user_id: uid, major_id: majorId });
    } catch (e) { console.warn('Supabase sync error', e); }
  }

  public setActiveTargetMajor(majorId: number) {
    this.state.activeTargetMajorId = majorId;
    this.notify();
    this.persistTargetsSnapshot();
  }

  public async saveInterest(cluster: ClusterType): Promise<boolean> {
    this.state.profile = { ...this.state.profile, major_interest: cluster };
    this.notify();
    try {
      const { error } = await supabase.from('profiles').update({ major_interest: cluster }).eq('id', this.state.profile.id);
      if (error) {
        console.warn('Gagal simpan minat ke Supabase:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Gagal simpan minat ke Supabase:', e);
      return false;
    }
  }

  public async clearInterest(): Promise<boolean> {
    this.state.profile = { ...this.state.profile, major_interest: null };
    this.notify();
    try {
      const { error } = await supabase.from('profiles').update({ major_interest: null }).eq('id', this.state.profile.id);
      if (error) {
        console.warn('Gagal hapus minat di Supabase:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Gagal hapus minat di Supabase:', e);
      return false;
    }
  }

  // Tryout Results
  public async submitResult(tryoutId: number, scores: Record<string, number>) {
    const tr = this.state.tryouts.find(t => t.id === tryoutId) || INITIAL_TRYOUTS[0];
    const codes = Object.keys(scores);
    const sum = codes.reduce((acc, code) => {
      const comp = this.state.competencies.find(c => c.code === code);
      const weight = comp ? comp.weight : 1;
      return acc + (scores[code] * weight);
    }, 0);
    
    const totalWeight = codes.reduce((acc, code) => {
      const comp = this.state.competencies.find(c => c.code === code);
      return acc + (comp ? comp.weight : 1);
    }, 0) || 1;

    const finalTotal = Math.round((sum / totalWeight) * 10) / 10;
    
    let pred: TryoutResult['predicate'] = 'Kurang';
    if (finalTotal >= 710) pred = 'Sangat Baik';
    else if (finalTotal >= 660) pred = 'Baik';
    else if (finalTotal >= 600) pred = 'Cukup';

    const newResult: TryoutResult = {
      id: Date.now(), // temp id
      student_id: this.state.profile.id,
      tryout_id: tr.id,
      tryout_name: tr.name,
      tryout_type: tr.type,
      tryout_date: new Date().toISOString().split('T')[0],
      total_score: finalTotal,
      predicate: pred,
      created_at: new Date().toISOString(),
      scores
    };

    try {
      const { data, error } = await supabase.from('tryout_results').insert({
        user_id: this.state.profile.id,
        student_id: this.state.profile.id,
        tryout_id: tr.id,
        tryout_name: tr.name,
        tryout_type: tr.type,
        tryout_date: newResult.tryout_date,
        total_score: finalTotal,
        predicate: pred,
        scores
      }).select().single();
      
      if (error) {
        console.warn('Gagal simpan hasil ke Supabase:', error.message);
      } else if (data) {
        newResult.id = data.id;
      }
    } catch (err) {
      console.warn('Supabase sync error:', err);
    }
    
    this.state.results = [newResult, ...this.state.results];
    this.notify();
    return newResult;
  }

  // Analysis & Recommendation Engine
  public getAnalysis(targetMajorId?: number | null, specificResultId?: number): AnalysisSummary | null {
    const majorId = targetMajorId ?? this.state.activeTargetMajorId ?? this.state.targetMajorIds[0] ?? null;
    if (majorId == null) return null;
    const major = this.state.majors.find(m => m.id === majorId);
    if (!major) return null;
    
    const result = specificResultId 
      ? this.state.results.find(r => r.id === specificResultId) 
      : this.state.results[0];

    if (!result) return null;

    const isPassedTotal = result.total_score >= major.passing_grade_total;
    const totalGap = Math.round((result.total_score - major.passing_grade_total) * 10) / 10;

    const gaps: GapAnalysisItem[] = this.state.competencies.map(comp => {
      const score = result.scores[comp.code] || 0;
      const minReq = major.requirements && major.requirements[comp.code] 
        ? major.requirements[comp.code] 
        : Math.round(major.passing_grade_total * 0.95);
      
      const gap = Math.round((score - minReq) * 10) / 10;
      let status: GapAnalysisItem['status'] = 'Aman';
      if (gap < -50) status = 'Kritis';
      else if (gap < 0) status = 'Defisit';

      return {
        competency_code: comp.code,
        competency_name: comp.name,
        student_score: score,
        min_required: minReq,
        gap,
        status
      };
    });

    const deficitGaps = gaps.filter(g => g.gap < 0).sort((a, b) => a.gap - b.gap);
    const weakest = deficitGaps[0] || null;

    const userInterest = this.state.profile?.major_interest || 'Campuran';
    const alternatives = this.state.majors
      .filter(m => m.id !== major.id && m.passing_grade_total <= result.total_score)
      .map(m => {
        const diff = result.total_score - m.passing_grade_total;
        let chance = Math.min(100, Math.round((result.total_score / m.passing_grade_total) * 100));

        // Boost for matching cluster
        let matchScore = 0;
        if (m.cluster === userInterest || userInterest === 'Campuran') matchScore = 1;

        return {
          ...m,
          chance_percentage: chance,
          gap_diff: Math.round(diff * 10) / 10,
          _matchScore: matchScore
        };
      })
      .sort((a, b) => {
        if (b._matchScore !== a._matchScore) return b._matchScore - a._matchScore;
        if (a.gap_diff !== b.gap_diff) return a.gap_diff - b.gap_diff; // sort by closest gap from below
        return (a.name || '').localeCompare(b.name || ''); // tie breaker
      })
      .slice(0, 6);
      
    console.log('Alternatives count:', alternatives.length, 'total majors:', this.state.majors.length, 'result score:', result.total_score);

    return {
      target_major: major,
      latest_result: result,
      is_passed_total: isPassedTotal,
      total_gap: totalGap,
      gaps,
      weakest_competency: weakest,
      alternative_majors: alternatives
    };
  }

  public setSupabaseCfg(url: string, key: string, enable: boolean) {
    // Legacy method for compatibility with SupabaseSqlView component
  }

  public async forceSeedDemoData(): Promise<{ success: boolean; text: string }> {
     return { success: false, text: "Silakan seed menggunakan SQL Blueprint di dashboard Supabase." };
  }
  
  public async fetchMasterData() {
    try {
      const { data: tryoutsData } = await supabase.from('tryouts').select('*').order('id', { ascending: false });
      if (tryoutsData && tryoutsData.length > 0) this.state.tryouts = tryoutsData;

      const { data: instData } = await supabase.from('institutions').select('*').order('name', { ascending: true }).limit(5000);
      if (instData && instData.length > 0) this.state.institutions = instData;

      const { data: majorsData, error: majorsErr } = await supabase.from('majors').select('*, institutions(name, location, type)').order('id', { ascending: false }).limit(10000);
      if (majorsErr) {
        console.warn('Error fetching majors master:', majorsErr);
        // Fallback to simple select without join
        const { data: fallbackMajors } = await supabase.from('majors').select('*').order('id', { ascending: false }).limit(10000);
        if (fallbackMajors && fallbackMajors.length > 0) {
          this.state.majors = fallbackMajors;
        }
      } else if (majorsData && majorsData.length > 0) {
        this.state.majors = majorsData.map((m: any) => ({
          ...m,
          institution_name: m.institutions?.name,
          institution_location: m.institutions?.location,
          institution_type: m.institutions?.type
        }));
      }

      const { data: questionsData } = await supabase.from('penjurusan_questions').select('*').order('id', { ascending: true });
      if (questionsData && questionsData.length > 0) {
        this.state.questions = questionsData;
      }

      const { data: tutoringData } = await supabase.from('tutoring_centers').select('*').order('id', { ascending: true });
      if (tutoringData && tutoringData.length > 0) {
        this.state.tutoringCenters = tutoringData;
      }

      const { data: compData } = await supabase.from('competencies').select('*').order('code', { ascending: true });
      if (compData && compData.length > 0) {
        this.state.competencies = compData;
      }

      // fetch ini MENGGANTI state.majors, sehingga resolve target yang berjalan lebih
      // awal saat login bisa tertimpa. Reconcile ulang di akhir agar prodi target
      // selalu hadir (dan dashboard tidak kosong sampai membuka halaman Target).
      if (this.state.isLoggedIn && this.state.targetMajorIds.length > 0) {
        await this.resolveTargetMajors();
      }

      this.notify();
    } catch (err) {
      console.warn('Gagal memuat data master dari Supabase:', err);
    }
  }

  public async syncFromSupabase(authUserId?: string) {
    try {
      const targetAuthId = authUserId || this.state.profile.id;
      
      // Query profiles by auth_uid OR id just in case we already have the real id
      let profData;
      const { data: profByAuth, error: pErr1 } = await supabase.from('profiles').select('*').eq('auth_uid', targetAuthId).limit(1);
      
      if (!pErr1 && profByAuth && profByAuth.length > 0) {
        profData = profByAuth[0];
      } else {
        // Fallback to query by id (if no auth_uid match)
        const { data: profById, error: pErr2 } = await supabase.from('profiles').select('*').eq('id', targetAuthId).limit(1);
        if (!pErr2 && profById && profById.length > 0) {
          profData = profById[0];
        }
      }

      if (profData) {
        this.state.profile = { 
          ...this.state.profile, 
          ...profData
        };
      }

      const { data: res, error: rErr } = await supabase.from('tryout_results').select('*').eq('user_id', targetAuthId).order('created_at', { ascending: false });
      if (!rErr && res) {
        this.state.results = res;
      }

      await this.ensureTargetMajorsLoaded();

      this.notify();
    } catch (err) {
      console.warn('Gagal sinkron data Live Supabase:', err);
    }
  }

  public getTargetMajors(): Major[] {
    return this.state.targetMajorIds
      .map(id => this.state.majors.find(m => m.id === id))
      .filter((m): m is Major => !!m);
  }

  // Pastikan semua prodi yang terdaftar sebagai target tersedia di state global.
  // Diperlukan karena badge di Navbar membaca targetMajorIds (sejak awal), sedangkan
  // daftar Halaman Target bergantung pada resolution terhadap state.majors yang bisa
  // tertinggal karena timing fetch master data (anon vs authenticated) / RLS.
  public async resolveTargetMajors(): Promise<void> {
    const ids = [...this.state.targetMajorIds];
    if (ids.length === 0) return;
    const missingIds = ids.filter(id => !this.state.majors.some(m => m.id === id));
    if (missingIds.length === 0) return;
    try {
      const { data, error } = await supabase
        .from('majors')
        .select('*, institutions(name, location, type)')
        .in('id', missingIds)
        .limit(500);
      if (error) {
        console.warn('Gagal menyelesaikan prodi target dari Supabase:', error.message);
        return;
      }
      if (!data || data.length === 0) return;
      const mapped: Major[] = data.map((m: any) => ({
        ...m,
        institution_name: m.institutions?.name,
        institution_location: m.institutions?.location,
        institution_type: m.institutions?.type,
      }));
      const known = new Set(this.state.majors.map(x => x.id));
      const merged = mapped.filter(x => !known.has(x.id));
      if (merged.length > 0) {
        this.state.majors = [...this.state.majors, ...merged];
        this.notify();
      }
    } catch (err) {
      console.warn('Gagal menyelesaikan prodi target dari Supabase:', err);
    }
  }

  // Muat data Target Institut (target_institutions) + resolve prodi target ke state.
  // Dipanggil di syncFromSupabase saat login dan dipicu ulang dari DashboardView
  // agar ringkasan "Pilihan Prodi Anda" langsung terisi tanpa membuka halaman Target.
  // Query memakai auth uid agar konsisten dengan RLS (own_select membandingkan
  // user_id dengan auth.uid(); profile.id bisa berbeda dari auth.uid).
  public async ensureTargetMajorsLoaded(): Promise<void> {
    try {
      let ownerUid = this.state.profile.id;
      try {
        const { data: sData } = await supabase.auth.getUser();
        if (sData?.user?.id) ownerUid = sData.user.id;
      } catch { /* backend non-supabase */ }

      if (ownerUid) {
        const { data: targetsData } = await supabase.from('target_institutions')
          .select('*')
          .eq('user_id', ownerUid)
          .order('priority', { ascending: true });
        if (targetsData && targetsData.length > 0) {
          this.state.targetMajorIds = targetsData.map(t => t.major_id);
          if (!this.state.activeTargetMajorId && this.state.targetMajorIds.length > 0) {
            this.state.activeTargetMajorId = this.state.targetMajorIds[0];
          }
        }
      }

      // Pastikan row prodi target sudah ada di state sebelum snapshot & render.
      await this.resolveTargetMajors();
      this.persistTargetsSnapshot();
      this.notify();
    } catch (err) {
      console.warn('Gagal memuat target institut dari Supabase:', err);
    }
  }

  // Admin Management Methods
  public async addTryout(tryout: Tryout) {
    this.state.tryouts = [tryout, ...this.state.tryouts];
    this.notify();
    try { await supabase.from('tryouts').insert(tryout); } catch (e) {}
  }

  public async deleteTryout(id: number) {
    this.state.tryouts = this.state.tryouts.filter(t => t.id !== id);
    this.notify();
    try { await supabase.from('tryouts').delete().eq('id', id); } catch (e) {}
  }

  public async addMajor(major: Major) {
    const { id, ...majorWithoutId } = major as any;
    const { data, error } = await supabase.from('majors').insert(majorWithoutId).select().single();
    if (!error && data) {
      this.state.majors = [data, ...this.state.majors];
      this.notify();
    }
  }

  public async deleteMajor(id: number) {
    const { error } = await supabase.from('majors').delete().eq('id', id);
    if (!error) {
      this.state.majors = this.state.majors.filter(m => m.id !== id);
      this.notify();
    }
  }

  public async updateMajor(major: Major) {
    this.state.majors = this.state.majors.map(m => (m.id === major.id ? { ...major } : m));
    this.notify();
    try {
      const { id, institution_name, institution_location, institution_type, ...rest } = major as any;
      const { error } = await supabase.from('majors').update(rest).eq('id', id);
      if (error) console.warn('Gagal update prodi:', error.message);
    } catch (e) {
      console.warn('Gagal update prodi:', e);
    }
  }

  // Load prodi untuk satu kampus (dipanggil saat kampus tujuan dipilih di Jalur 1).
  // Mengembalikan daftar prodi lengkap kampus tsb & menggabungkannya ke state global (dedup).
  public async loadMajorsForInstitution(institutionId: number): Promise<Major[]> {
    try {
      const { data, error } = await supabase
        .from('majors')
        .select('*, institutions(name, location, type)')
        .eq('institution_id', institutionId)
        .order('passing_grade_total', { ascending: true, nullsFirst: true })
        .limit(2000);
      if (error) {
        console.warn('Gagal memuat prodi kampus:', error.message);
        return this.state.majors.filter(m => m.institution_id === institutionId);
      }
      const existing = this.state.majors.filter(m => m.institution_id === institutionId);
      if (!data || data.length === 0) return existing;
      const mapped: Major[] = data.map((m: any) => ({
        ...m,
        institution_name: m.institutions?.name,
        institution_location: m.institutions?.location,
        institution_type: m.institutions?.type,
      }));
      const known = new Set(this.state.majors.map(x => x.id));
      const merged = mapped.filter(x => !known.has(x.id));
      if (merged.length > 0) {
        this.state.majors = [...this.state.majors, ...merged];
        this.notify();
      }
      return mapped;
    } catch (err) {
      console.warn('Gagal memuat prodi kampus:', err);
      return this.state.majors.filter(m => m.institution_id === institutionId);
    }
  }

  // Admin: Kelola Kampus & Grade Campus / Range Nilai
  public async addInstitution(inst: Omit<Institution, 'id'> & { id?: number }) {
    const { id: _ignored, ...payload } = inst as any;
    const { data, error } = await supabase.from('institutions').insert(payload).select().single();
    if (!error && data) {
      this.state.institutions = [...this.state.institutions, data];
      this.notify();
      return data;
    }
    if (error) console.warn('Gagal tambah kampus:', error.message);
    return null;
  }

  public async updateInstitution(inst: Institution) {
    const { data, error } = await supabase.from('institutions')
      .update({
        name: inst.name,
        type: inst.type,
        location: inst.location,
        grade: inst.grade ?? null,
        range_min: inst.range_min ?? null,
        range_max: inst.range_max ?? null,
      })
      .eq('id', inst.id)
      .select()
      .single();
    if (!error && data) {
      this.state.institutions = this.state.institutions.map(i => i.id === data.id ? data : i);
      this.notify();
    }
    if (error) console.warn('Gagal update kampus:', error.message);
  }

  public async deleteInstitution(id: number) {
    const { error } = await supabase.from('institutions').delete().eq('id', id);
    if (!error) {
      this.state.institutions = this.state.institutions.filter(i => i.id !== id);
      this.notify();
    }
    if (error) console.warn('Gagal hapus kampus:', error.message);
  }

  // Admin: Bank Soal Penjurusan
  public async addQuestion(q: Omit<PenjurusanQuestion, 'id' | 'created_at'> & { id?: number }) {
    const { id: _ignored, created_at: __ignored, ...payload } = q as any;
    const { data, error } = await supabase.from('penjurusan_questions').insert(payload).select().single();
    if (!error && data) {
      this.state.questions = [...this.state.questions, data];
      this.notify();
      return data;
    }
    if (error) console.warn('Gagal tambah soal:', error.message);
    return null;
  }

  public async toggleQuestionActive(id: number, isActive: boolean) {
    const { error } = await supabase.from('penjurusan_questions').update({ is_active: isActive }).eq('id', id);
    if (!error) {
      this.state.questions = this.state.questions.map(q => q.id === id ? { ...q, is_active: isActive } : q);
      this.notify();
    }
  }

  public async deleteQuestion(id: number) {
    const { error } = await supabase.from('penjurusan_questions').delete().eq('id', id);
    if (!error) {
      this.state.questions = this.state.questions.filter(q => q.id !== id);
      this.notify();
    }
    if (error) console.warn('Gagal hapus soal:', error.message);
  }
}

export const appStore = new AppStore();

export function useAppState() {
  const [state, setState] = useState<AppState>(appStore.getState());
  useEffect(() => {
    return appStore.subscribe(() => {
      setState({ ...appStore.getState() });
    });
  }, []);
  return state;
}
