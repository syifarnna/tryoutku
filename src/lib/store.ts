import { useState, useEffect } from 'react';
import { 
  AnalysisSummary, 
  Competency, 
  GapAnalysisItem, 
  Institution, 
  Major, 
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
  INITIAL_TRYOUTS, 
  INITIAL_TUTORS 
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
  tutors: TutoringCenter[];
  targetMajorIds: number[]; 
  activeTargetMajorId: number; 
  useRealSupabase: boolean; // Keep for compatibility but it's always true now
}

const DEFAULT_STATE: AppState = {
  isLoggedIn: false, // Default to false, wait for Supabase Auth
  rememberMe: true,
  profile: EMPTY_PROFILE,
  institutions: INITIAL_INSTITUTIONS,
  majors: INITIAL_MAJORS,
  competencies: INITIAL_COMPETENCIES,
  tryouts: INITIAL_TRYOUTS,
  results: [],
  tutors: INITIAL_TUTORS,
  targetMajorIds: [], 
  activeTargetMajorId: 1, 
  useRealSupabase: true
};

class AppStore {
  private state: AppState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = { ...DEFAULT_STATE };
    this.initAuth();
  }

  private async initAuth() {
    // Initial fetch of master data so it's ready even before login
    this.fetchMasterData();
    
    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        this.state.isLoggedIn = true;
        this.state.profile.email = session.user.email || '';
        this.syncFromSupabase(session.user.id);
      } else {
        this.state.isLoggedIn = false;
        this.state.profile = { ...EMPTY_PROFILE };
        this.state.results = [];
        this.state.targetMajorIds = [];
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
      
      try {
        await supabase.from('target_institutions').insert({
          user_id: this.state.profile.id,
          student_id: this.state.profile.id,
          major_id: majorId,
          priority: this.state.targetMajorIds.length
        });
      } catch (e) { console.warn('Supabase sync error', e); }
    }
  }

  public async removeTargetMajor(majorId: number) {
    this.state.targetMajorIds = this.state.targetMajorIds.filter(id => id !== majorId);
    if (this.state.activeTargetMajorId === majorId) {
      this.state.activeTargetMajorId = this.state.targetMajorIds[0] || INITIAL_MAJORS[0].id;
    }
    this.notify();

    try {
      await supabase.from('target_institutions')
        .delete()
        .match({ user_id: this.state.profile.id, major_id: majorId });
    } catch (e) { console.warn('Supabase sync error', e); }
  }

  public setActiveTargetMajor(majorId: number) {
    this.state.activeTargetMajorId = majorId;
    this.notify();
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
  public getAnalysis(targetMajorId?: number, specificResultId?: number): AnalysisSummary | null {
    const majorId = targetMajorId || this.state.activeTargetMajorId || 1;
    const major = this.state.majors.find(m => m.id === majorId) || INITIAL_MAJORS[0];
    
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
      
    let recommendedTutors = this.state.tutors;
    if (weakest) {
      const match = this.state.tutors.filter(t => t.focus_competency_code === weakest.competency_code);
      const others = this.state.tutors.filter(t => t.focus_competency_code !== weakest.competency_code);
      recommendedTutors = [...match, ...others].slice(0, 4);
    } else {
      recommendedTutors = this.state.tutors.slice(0, 4);
    }

    return {
      target_major: major,
      latest_result: result,
      is_passed_total: isPassedTotal,
      total_gap: totalGap,
      gaps,
      weakest_competency: weakest,
      alternative_majors: alternatives,
      recommended_tutors: recommendedTutors
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

      const { data: majorsData, error: majorsErr } = await supabase.from('majors').select('*, institutions(name)').order('id', { ascending: false }).limit(10000);
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
          institution_name: m.institutions?.name
        }));
      }

      const { data: tutorsData } = await supabase.from('tutoring_centers').select('*').order('id', { ascending: false });
      if (tutorsData && tutorsData.length > 0) this.state.tutors = tutorsData;
      
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

      const { data: res, error: rErr } = await supabase.from('tryout_results').select('*').eq('user_id', this.state.profile.id).order('created_at', { ascending: false });
      if (!rErr && res) {
        this.state.results = res;
      }

      const { data: targetsData } = await supabase.from('target_institutions')
        .select('*')
        .eq('user_id', this.state.profile.id)
        .order('priority', { ascending: true });
      if (targetsData && targetsData.length > 0) {
        this.state.targetMajorIds = targetsData.map(t => t.major_id);
        if (!this.state.activeTargetMajorId && this.state.targetMajorIds.length > 0) {
          this.state.activeTargetMajorId = this.state.targetMajorIds[0];
        }
      }

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
    this.state.majors = [major, ...this.state.majors];
    this.notify();
    try { await supabase.from('majors').insert(major); } catch (e) {}
  }

  public async deleteMajor(id: number) {
    this.state.majors = this.state.majors.filter(m => m.id !== id);
    this.notify();
    try { await supabase.from('majors').delete().eq('id', id); } catch (e) {}
  }

  public async addTutor(tutor: TutoringCenter) {
    this.state.tutors = [tutor, ...this.state.tutors];
    this.notify();
    try { await supabase.from('tutoring_centers').insert(tutor); } catch (e) {}
  }

  public async deleteTutor(id: number) {
    this.state.tutors = this.state.tutors.filter(t => t.id !== id);
    this.notify();
    try { await supabase.from('tutoring_centers').delete().eq('id', id); } catch (e) {}
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
