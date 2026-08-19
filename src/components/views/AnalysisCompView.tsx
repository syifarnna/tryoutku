import React from 'react';
import { BarChart3, Info, Sparkles, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { useAppState } from '../../lib/store';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const AnalysisCompView: React.FC = () => {
  const state = useAppState();
  const latestResult = state.results[0];

  const chartData = state.competencies.map(comp => {
    const skor = latestResult?.scores[comp.code] || 0;
    return {
      code: comp.code,
      name: comp.name,
      skor,
      nasional: 550
    };
  });

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Analisis Kompetensi & Pemetaan 7 Subtes</h2>
          <p className="text-xs text-slate-400 mt-0.5">Pantau kekuatan kognitif Anda dibandingkan rata-rata nasional IRT</p>
        </div>
      </div>

      {/* Bar Chart */}
      <Card className="p-6 lg:p-8 rounded-3xl ring-0 bg-white dark:bg-card border border-slate-100 dark:border-border shadow-xs gap-6">
        <CardTitle className="text-base font-bold text-slate-800 dark:text-white">Skor Subtes Terakhir vs Rata-rata Nasional</CardTitle>
        
        <div className="w-full h-80 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.4} />
              <XAxis dataKey="code" stroke="#94a3b8" fontSize={11} fontWeight="bold" tickLine={false} />
              <YAxis domain={[0, 1000]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#111111', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
              <Bar dataKey="skor" name="Skor Saya" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.skor >= 650 ? '#2DD4BF' : entry.skor >= 550 ? '#FF6B6B' : '#FBBF24'} />
                ))}
              </Bar>
              <Bar dataKey="nasional" name="Rata-rata Nasional" fill="#cbd5e1" opacity={0.4} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Competencies Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.competencies.map(comp => {
          const skor = latestResult?.scores[comp.code] || 0;
          return (
            <Card key={comp.code} className="p-5 rounded-2xl ring-0 bg-white dark:bg-card border border-slate-100 dark:border-border shadow-2xs flex items-start gap-4 gap-0">
              <Badge 
                variant="outline" 
                className="w-12 h-12 rounded-2xl bg-[#FF6B6B]/10 text-[#FF6B6B] font-black text-sm flex items-center justify-center shrink-0 mt-0.5 border-[#FF6B6B]/20 px-0"
              >
                {comp.code}
              </Badge>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{comp.name}</h4>
                  <span className="font-extrabold text-base text-[#FF6B6B]">{skor}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{comp.description}</p>
              </div>
            </Card>
          );
        })}
      </div>

    </div>
  );
};
