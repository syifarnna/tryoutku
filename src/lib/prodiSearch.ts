import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import type { Major } from '../types';

export interface SearchMajorsParams {
  search?: string;
  jenjang?: string;
  rumpun?: string;
  institutionId?: number | null;
  sort?: 'pg' | 'name';
  page?: number;
  pageSize?: number;
}

export interface SearchMajorsResult {
  data: Major[];
  total: number;
}

export interface MajorsStats {
  universitas: number;
  totalProdi: number;
  s1: number;
  d4: number;
  d3: number;
  saintek: number;
  soshum: number;
  campuran: number;
}

// Server-side search + pagination via RPC search_majors.
// total dikembalikan oleh RPC (count seluruh baris yang cocok sebelum offset).
export async function searchMajors(p: SearchMajorsParams = {}): Promise<SearchMajorsResult> {
  const { data, error } = await supabase.rpc('search_majors', {
    p_search: p.search?.trim() ?? '',
    p_jenjang: p.jenjang ?? '',
    p_rumpun: p.rumpun ?? '',
    p_institution_id: p.institutionId ?? null,
    p_sort: p.sort ?? 'pg',
    p_page: p.page ?? 1,
    p_page_size: p.pageSize ?? 25,
  });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as any[];
  const total = rows.length > 0 ? Number(rows[0].total) : 0;
  const majors: Major[] = rows.map((r: any) => {
    const { total: _t, ...rest } = r;
    return rest as Major;
  });
  return { data: majors, total };
}

// Statistik agregat global via RPC stats_majors.
export async function getMajorsStats(): Promise<MajorsStats | null> {
  const { data, error } = await supabase.rpc('stats_majors');
  if (error) throw new Error(error.message);
  const row = (Array.isArray(data) ? data[0] : null) as Record<string, any> | null;
  if (!row) return null;
  return {
    universitas: Number(row.universitas ?? 0),
    totalProdi: Number(row.total_prodi ?? 0),
    s1: Number(row.s1 ?? 0),
    d4: Number(row.d4 ?? 0),
    d3: Number(row.d3 ?? 0),
    saintek: Number(row.saintek ?? 0),
    soshum: Number(row.soshum ?? 0),
    campuran: Number(row.campuran ?? 0),
  };
}

// Menunda nilai input search sampai user berhenti mengetik (missal 500ms),
// agar tidak melakukan hit RPC/DB di setiap ketukan keyboard.
export async function getPopularMajors(limit = 10): Promise<Major[]> {
  const { data, error } = await supabase.rpc('popular_majors', { p_limit: limit });
  if (error) throw new Error(error.message);
  return (data ?? []) as Major[];
}

export function useDebouncedValue<T>(value: T, delay = 500): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}