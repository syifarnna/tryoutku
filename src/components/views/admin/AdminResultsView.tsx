import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { LeaderboardEntry } from '../../../types';
import { getErrorMessage } from '../../../lib/utils';
import { Award, TrendingUp, Crown, Loader2, AlertCircle, Medal, User, School } from 'lucide-react';
import Swal from 'sweetalert2';

const TRYOUT_TYPES = ['Semua', 'UTBK SNBT', 'Ujian Mandiri', 'Ujian Kedinasan'] as const;

const TYPE_COLORS: Record<string, string> = {
  'Semua': 'bg-[#FF6B6B]',
  'UTBK SNBT': 'bg-[#06b6d4]',
  'Ujian Mandiri': 'bg-[#f97316]',
  'Ujian Kedinasan': 'bg-[#2DD4BF]',
};

export const AdminResultsView: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('Semua');

  const fetchLeaderboard = async (type: string) => {
    setLoading(true);
    const typeParam = type === 'Semua' ? null : type;

    // Coba pake RPC dulu (bypass RLS), fallback ke direct query
    const { data: rpcData, error: rpcErr } = await supabase.rpc('get_leaderboard', { p_type: typeParam });

    if (!rpcErr && rpcData) {
      setEntries(rpcData as LeaderboardEntry[]);
      setLoading(false);
      return;
    }

    // Fallback: query langsung
    let resultsQuery = supabase.from('tryout_results').select('*').order('total_score', { ascending: false });
    if (typeParam) {
      resultsQuery = resultsQuery.eq('tryout_type', typeParam);
    }

    const [resResults, resProfiles] = await Promise.all([
      resultsQuery,
      supabase.from('profiles').select('id, auth_uid, full_name, nisn, school, email'),
    ]);

    if (resResults.error) {
      Swal.fire('Gagal Memuat Leaderboard', getErrorMessage(resResults.error), 'error');
      setEntries([]);
      setLoading(false);
      return;
    }

    const profileMap = new Map<string, { full_name: string; nisn: string; school: string; email: string }>();
    if (resProfiles.data) {
      for (const p of resProfiles.data) {
        if (p.auth_uid) {
          profileMap.set(p.auth_uid, { full_name: p.full_name, nisn: p.nisn, school: p.school, email: p.email });
        }
        if (p.id) {
          profileMap.set(p.id, { full_name: p.full_name, nisn: p.nisn, school: p.school, email: p.email });
        }
      }
    }

    const bestPerUser = new Map<string, LeaderboardEntry>();
    for (const row of resResults.data as any[]) {
      const uid = row.user_id || row.student_id;
      if (!bestPerUser.has(uid) || row.total_score > bestPerUser.get(uid)!.total_score) {
        const profile = profileMap.get(uid);
        bestPerUser.set(uid, {
          ...row,
          profiles: profile || { full_name: 'Tidak dikenal', nisn: '-', school: '-', email: '' }
        });
      }
    }

    setEntries(Array.from(bestPerUser.values()).sort((a, b) => b.total_score - a.total_score));
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard(selectedType);
  }, [selectedType]);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
  };

  const topScore = entries[0]?.total_score || 0;
  const avgScore = entries.length
    ? entries.reduce((s, e) => s + e.total_score, 0) / entries.length
    : 0;

  const getPredicateClass = (pred: string) => {
    switch (pred) {
      case 'Sangat Baik': return 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900';
      case 'Baik': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Cukup': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default: return 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900';
    }
  };

  const getRankDisplay = (i: number) => {
    if (i === 0) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (i === 1) return <Medal className="w-5 h-5 text-slate-400" />;
    if (i === 2) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="font-bold text-slate-400 dark:text-slate-500 text-sm">{i + 1}</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-[#FF6B6B]" />
            Leaderboard Nasional
          </h2>
          <p className="text-slate-500 dark:text-[#777] mt-1">
            Peringkat peserta berdasarkan nilai tryout{selectedType !== 'Semua' ? ` ${selectedType}` : ''} terbaik.
            {!loading && <span className="ml-2">({entries.length} peserta)</span>}
          </p>
        </div>
        <button
          onClick={() => fetchLeaderboard(selectedType)}
          disabled={loading}
          className="px-4 py-2 bg-white dark:bg-[#000000] border border-slate-200 dark:border-[#141414] rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-[#1C1C1C] transition-colors shadow-sm disabled:opacity-60"
        >
          <TrendingUp className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TRYOUT_TYPES.map(t => (
          <button
            key={t}
            onClick={() => handleTypeChange(t)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              selectedType === t
                ? `${TYPE_COLORS[t]} text-white shadow-md scale-105`
                : 'bg-white dark:bg-[#000000] border border-slate-200 dark:border-[#141414] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1C1C1C]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#FF6B6B] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-indigo-100 text-sm font-semibold mb-1">Total Peserta</p>
            <h3 className="text-3xl font-bold">{entries.length} Siswa</h3>
          </div>
          <Award className="absolute right-[-20px] bottom-[-20px] w-32 h-32 text-white/10" />
        </div>
        <div className="bg-white dark:bg-[#000000] border border-slate-200 dark:border-[#141414] rounded-2xl p-6 shadow-sm">
          <p className="text-slate-500 dark:text-[#777] text-sm font-semibold mb-1">Nilai Tertinggi</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{topScore.toFixed(1)}</h3>
        </div>
        <div className="bg-white dark:bg-[#000000] border border-slate-200 dark:border-[#141414] rounded-2xl p-6 shadow-sm">
          <p className="text-slate-500 dark:text-[#777] text-sm font-semibold mb-1">Rata-rata Nasional</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{avgScore.toFixed(1)}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-[#000000] rounded-2xl border border-slate-200 dark:border-[#141414] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-[#141414] bg-slate-50/50 dark:bg-[#000000]">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
            <Crown className="w-4 h-4 text-yellow-500" />
            Peringkat Skor Terbaik Peserta
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#000000] border-b border-slate-200 dark:border-[#141414] text-xs uppercase tracking-wider text-slate-500 dark:text-[#777]">
                <th className="px-6 py-4 font-semibold text-center w-16">Rank</th>
                <th className="px-6 py-4 font-semibold">Nama Peserta</th>
                <th className="px-6 py-4 font-semibold">Sekolah</th>
                <th className="px-6 py-4 font-semibold">NISN</th>
                <th className="px-6 py-4 font-semibold text-center">Predikat</th>
                <th className="px-6 py-4 font-semibold text-right">Skor Terbaik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Memuat data leaderboard...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="text-slate-500 dark:text-[#777]">Belum ada hasil tryout dari peserta.</p>
                  </td>
                </tr>
              ) : (
                entries.map((e, i) => (
                  <tr key={e.user_id} className="hover:bg-slate-50/50 dark:hover:bg-[#232435]/50 transition-colors">
                    <td className="px-6 py-4 text-center">{getRankDisplay(i)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FFE0E0] dark:bg-indigo-900/30 flex items-center justify-center text-[#FF6B6B] font-bold shrink-0">
                          {e.profiles?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-white text-sm">
                            {e.profiles?.full_name || 'Tidak dikenal'}
                          </div>
                          <div className="text-[11px] text-slate-400">{e.profiles?.email || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                        <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {e.profiles?.school || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-600 dark:text-slate-300">
                      {e.profiles?.nisn || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${getPredicateClass(e.predicate)}`}>
                        {e.predicate}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-lg font-bold text-[#FF6B6B]">{e.total_score.toFixed(1)}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
