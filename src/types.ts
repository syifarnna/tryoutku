export type ClusterType = 'Saintek' | 'Soshum' | 'Campuran';
export type InstitutionType = 'PTN' | 'PTS' | 'Kedinasan';

export interface Profile {
  id: string;
  full_name: string;
  nisn: string;
  email: string;
  phone: string;
  school: string;
  major_interest: ClusterType;
  avatar_url?: string;
  role?: 'admin' | 'peserta';
  is_profile_complete?: boolean;
  must_change_password?: boolean;
  updated_at: string;
}

export interface Institution {
  id: number;
  name: string;
  type: InstitutionType;
  location: string;
  logo?: string;
}

export interface Major {
  id: number;
  institution_id: number;
  institution_name?: string;
  institution_location?: string;
  institution_type?: InstitutionType;
  name: string;
  cluster: ClusterType;
  passing_grade_total: number; // e.g. 685.5
  requirements?: Record<string, number>; // min score per competency code e.g. { PU: 650, PK: 700 }
}

export interface Competency {
  id: number;
  code: string; // PU, PPU, PBM, PK, LBI, LBE, PM
  name: string;
  description: string;
  weight: number;
}

export interface Tryout {
  id: number;
  name: string;
  date: string;
  type: 'UTBK SNBT' | 'Ujian Mandiri' | 'Ujian Kedinasan';
  duration_minutes: number;
  question_count: number;
  status: 'Tersedia' | 'Selesai' | 'Segera';
  description?: string;
}

export interface TryoutResult {
  id: number;
  user_id?: string;
  student_id: string;
  tryout_id: number;
  tryout_name: string;
  tryout_type: string;
  tryout_date: string;
  total_score: number;
  predicate: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  created_at: string;
  scores: Record<string, number>; // { PU: 710, PK: 640, ... }
}

export interface LeaderboardEntry {
  id: number;
  user_id: string;
  student_id: string;
  total_score: number;
  predicate: string;
  created_at: string;
  tryout_name: string;
  tryout_type: string;
  tryout_date: string;
  scores: Record<string, number>;
  profiles: {
    full_name: string;
    nisn: string;
    school: string;
    email: string;
  };
}

export interface TargetInstitution {
  id: number;
  student_id: string;
  major_id: number;
  major: Major;
  priority: number; // 1, 2, 3...
}

export interface TutoringCenter {
  id: number;
  name: string;
  focus_competency_code: string;
  contact_info: string;
  link_url: string;
  description: string;
  rating: number;
  price: string;
  batch_start?: string;
}

export interface GapAnalysisItem {
  competency_code: string;
  competency_name: string;
  student_score: number;
  min_required: number;
  gap: number;
  status: 'Aman' | 'Defisit' | 'Kritis';
}

export interface AnalysisSummary {
  target_major: Major;
  latest_result: TryoutResult;
  is_passed_total: boolean;
  total_gap: number;
  gaps: GapAnalysisItem[];
  weakest_competency: GapAnalysisItem | null;
  alternative_majors: Array<Major & { chance_percentage: number; gap_diff: number }>;
  recommended_tutors: TutoringCenter[];
}
