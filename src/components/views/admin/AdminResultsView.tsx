import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { LeaderboardEntry, UtbkScore } from '../../../types';
import { getErrorMessage, cn } from '../../../lib/utils';
import { Award, TrendingUp, Crown, Loader2, AlertCircle, Medal, School } from 'lucide-react';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const predicateFromScore = (score: number): string => {
  if (score >= 710) return 'Sangat Baik';
  if (score >= 660) return 'Baik';
  if (score >= 600) return 'Cukup';
  return 'Kurang';
};

export const AdminResultsView: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);

    const [resScores, resProfiles] = await Promise.all([
      supabase.from('utbk_scores').select('*').order('total_score', { ascending: false }),
      supabase.from('profiles').select('id, auth_uid, full_name, nisn, school, email'),
    ]);

    if (resScores.error) {
      Swal.fire('Gagal Memuat Leaderboard', getErrorMessage(resScores.error), 'error');
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

    // Ambil satu nilai terbaik per peserta dari tabel utbk_scores.
    const bestPerUser = new Map<string, LeaderboardEntry>();
    for (const row of (resScores.data as UtbkScore[]) || []) {
      const uid = row.user_id;
      if (!uid) continue;
      const prev = bestPerUser.get(uid);
      if (!prev || row.total_score > prev.total_score) {
        const profile = profileMap.get(uid);
        bestPerUser.set(uid, {
          id: row.id,
          user_id: uid,
          student_id: uid,
          total_score: row.total_score,
          predicate: predicateFromScore(row.total_score),
          created_at: row.created_at,
          tryout_name: row.label || 'Input Nilai UTBK',
          tryout_type: '',
          tryout_date: row.recorded_on,
          scores: row.scores,
          profiles: profile || { full_name: 'Tidak dikenal', nisn: '-', school: '-', email: '' },
        });
      }
    }

    setEntries(Array.from(bestPerUser.values()).sort((a, b) => b.total_score - a.total_score));
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

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
            <Award className="w-6 h-6 text-primary" />
            Leaderboard Nasional
          </h2>
          <p className="text-slate-500 dark:text-muted-foreground mt-1">
            Peringkat peserta berdasarkan nilai UTBK terbaik yang diinput.
            {!loading && <span className="ml-2">({entries.length} peserta)</span>}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchLeaderboard()}
          disabled={loading}
          className="gap-2"
        >
          <TrendingUp className={cn('w-4 h-4', loading && 'animate-pulse')} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary text-white ring-0 border-0 shadow-md relative overflow-hidden">
          <CardContent className="p-6 relative z-10">
            <p className="text-indigo-100 text-sm font-semibold mb-1">Total Peserta</p>
            <h3 className="text-3xl font-bold">{entries.length} Siswa</h3>
          </CardContent>
          <Award className="absolute right-[-20px] bottom-[-20px] w-32 h-32 text-white/10" />
        </Card>
        <Card className="bg-card ring-0 border border-slate-200 dark:border-border shadow-sm">
          <CardContent className="p-6">
            <p className="text-slate-500 dark:text-muted-foreground text-sm font-semibold mb-1">Nilai Tertinggi</p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{topScore.toFixed(1)}</h3>
          </CardContent>
        </Card>
        <Card className="bg-card ring-0 border border-slate-200 dark:border-border shadow-sm">
          <CardContent className="p-6">
            <p className="text-slate-500 dark:text-muted-foreground text-sm font-semibold mb-1">Rata-rata Nasional</p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{avgScore.toFixed(1)}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card rounded-2xl border border-slate-200 dark:border-border overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-border bg-slate-50/50 dark:bg-card">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
            <Crown className="w-4 h-4 text-yellow-500" />
            Peringkat Skor Terbaik Peserta
          </h3>
        </div>
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-card hover:bg-slate-50 dark:hover:bg-black border-b border-slate-200 dark:border-border">
              <TableHead className="px-6 py-4 font-semibold text-center w-16">Rank</TableHead>
              <TableHead className="px-6 py-4 font-semibold">Nama Peserta</TableHead>
              <TableHead className="px-6 py-4 font-semibold">Sekolah</TableHead>
              <TableHead className="px-6 py-4 font-semibold">NISN</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-center">Predikat</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-right">Skor Terbaik</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="px-6 py-16 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Memuat data leaderboard...
                </TableCell>
              </TableRow>
            ) : entries.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="px-6 py-16 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="text-slate-500 dark:text-muted-foreground">Belum ada nilai UTBK dari peserta.</p>
                </TableCell>
              </TableRow>
            ) : (
              entries.map((e, i) => (
                <TableRow key={e.user_id} className="hover:bg-slate-50/50 dark:hover:bg-muted/80">
                  <TableCell className="px-6 py-4 text-center">{getRankDisplay(i)}</TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-indigo-900/30 flex items-center justify-center text-primary font-bold shrink-0">
                        {e.profiles?.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-white text-sm">
                          {e.profiles?.full_name || 'Tidak dikenal'}
                        </div>
                        <div className="text-[11px] text-slate-400">{e.profiles?.email || ''}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                      <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {e.profiles?.school || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-xs font-mono text-slate-600 dark:text-slate-300">
                    {e.profiles?.nisn || '-'}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Badge
                      variant="outline"
                      className={cn('rounded-md text-[11px] font-bold h-auto py-1 px-2.5', getPredicateClass(e.predicate))}
                    >
                      {e.predicate}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <p className="text-lg font-bold text-primary">{e.total_score.toFixed(1)}</p>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  );
};
