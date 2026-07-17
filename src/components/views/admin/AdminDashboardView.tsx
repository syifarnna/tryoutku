import React, { useEffect, useState } from 'react';
import { useAppState } from '../../../lib/store';
import { supabase } from '../../../lib/supabaseClient';
import { Users, BookOpen, Target, Award, GraduationCap } from 'lucide-react';

export const AdminDashboardView: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const state = useAppState();
  const [totalSubmissions, setTotalSubmissions] = useState<number>(0);

  useEffect(() => {
    supabase.from('tryout_results').select('*', { count: 'exact', head: true }).then(({ count }) => {
      if (count !== null) setTotalSubmissions(count);
    });
  }, []);

  const stats = [
    { label: 'Total Tryout', value: state.tryouts.length, icon: BookOpen, color: 'text-[#FF6B6B]', bg: 'bg-[#FF6B6B]/10', tab: 'admin_tryouts' },
    { label: 'Total Prodi/Kampus', value: state.majors.length, icon: Target, color: 'text-[#4D5DFB]', bg: 'bg-[#4D5DFB]/10', tab: 'admin_majors' },
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
            <div 
              key={i} 
              onClick={() => setActiveTab(stat.tab)}
              className="bg-white dark:bg-[#000000] rounded-2xl p-5 border border-slate-100 dark:border-[#141414] shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 dark:text-[#777] text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
