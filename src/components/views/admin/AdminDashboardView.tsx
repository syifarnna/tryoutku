import React, { useEffect, useState } from 'react';
import { useAppState } from '../../../lib/store';
import { supabase } from '../../../lib/supabaseClient';
import { Users, BookOpen, Target, Award, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const AdminDashboardView: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const state = useAppState();
  const [totalSubmissions, setTotalSubmissions] = useState<number>(0);

  useEffect(() => {
    supabase.from('tryout_results').select('*', { count: 'exact', head: true }).then(({ count }) => {
      if (count !== null) setTotalSubmissions(count);
    });
  }, []);

  const stats = [
    { label: 'Total Tryout', value: state.tryouts.length, icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10', tab: 'admin_tryouts' },
    { label: 'Total Prodi/Kampus', value: state.majors.length, icon: Target, color: 'text-secondary', bg: 'bg-secondary/10', tab: 'admin_majors' },
    { label: 'Total Rekomendasi Bimbel', value: state.tutors.length, icon: GraduationCap, color: 'text-[#F43F5E]', bg: 'bg-[#F43F5E]/10', tab: 'admin_tutors' },
    { label: 'Total Pengerjaan', value: totalSubmissions, icon: Award, color: 'text-[#FBBF24]', bg: 'bg-[#FBBF24]/10', tab: 'admin_results' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard Administrator</h2>
        <p className="text-slate-500 dark:text-[#777] mt-1">Ringkasan sistem TryoutKu dan akses cepat ke panel manajemen.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card
              key={i}
              onClick={() => setActiveTab(stat.tab)}
              className="cursor-pointer hover:shadow-md transition-all group ring-0 border border-slate-100 dark:border-[#141414] shadow-sm bg-white dark:bg-[#000000]"
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform', stat.bg, stat.color)}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-slate-500 dark:text-[#777] text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
