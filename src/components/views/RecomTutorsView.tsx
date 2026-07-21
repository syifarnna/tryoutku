import React from 'react';
import { ExternalLink, GraduationCap, MessageCircle, Sparkles, Star, Tag } from 'lucide-react';
import { appStore } from '../../lib/store';
import { cn } from '../../lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export const RecomTutorsView: React.FC = () => {
  const summary = appStore.getAnalysis();
  if (!summary) return null;

  const weakest = summary.weakest_competency;

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Header Info */}
      <div className="p-8 rounded-3xl bg-linear-to-r from-[#1D1A3E] to-[#1A0F2E] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <Badge className="bg-white/20 text-white border-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md h-auto px-3 py-1 gap-2">
            <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
            <span>Fitur Inti: Solusi Defisit Nilai Subtes</span>
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Rekomendasi Les/Bimbel Terpersonalisasi
          </h2>
          {weakest ? (
            <p className="text-xs sm:text-sm text-purple-100 leading-relaxed">
              Berdasarkan hasil gap analysis Anda, defisit poin terbesar berada pada kompetensi <strong className="text-amber-300 underline">{weakest.competency_name} ({weakest.competency_code})</strong> sebesar <strong className="text-rose-300">{weakest.gap} poin</strong>. Kami telah menyeleksi lembaga bimbel intensif terkemuka untuk membantu Anda mendongkrak skor tersebut!
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-purple-100 leading-relaxed">
              Seluruh kompetensi Anda berada di zona aman! Berikut adalah rekomendasi program pemantapan supercamp agar Anda bisa mengamankan skor top nasional &gt;750.
            </p>
          )}
        </div>
      </div>

      {/* Tutors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {summary.recommended_tutors.map((tutor) => {
          const isMatchedWeakest = weakest && tutor.focus_competency_code === weakest.competency_code;

          return (
            <Card 
              key={tutor.id} 
              className={cn(
                "p-6 lg:p-8 rounded-3xl transition-all flex flex-col justify-between shadow-xs relative overflow-hidden gap-0 ring-0 bg-white dark:bg-[#000000]",
                isMatchedWeakest 
                  ? 'border-2 border-[#FF6B6B] ring-4 ring-[#FF6B6B]/10 shadow-lg' 
                  : 'border border-slate-100 dark:border-[#141414] hover:border-slate-300'
              )}
            >
              {isMatchedWeakest && (
                <div className="absolute top-0 right-0 bg-[#FF6B6B] text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Rekomendasi Utama Gap Anda
                </div>
              )}

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="h-auto px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-[#FF6B6B] border-indigo-200 dark:border-indigo-800 font-black text-xs">
                    {tutor.focus_competency_code}
                  </Badge>
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{tutor.rating}</span>
                  </div>
                </div>

                <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-snug">
                  {tutor.name}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {tutor.description}
                </p>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#000000] space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Estimasi Biaya:</span>
                    <strong className="text-slate-800 dark:text-white font-bold">{tutor.price}</strong>
                  </div>
                  {tutor.batch_start && (
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Jadwal Kelas:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{tutor.batch_start}</strong>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] text-slate-400 truncate font-medium">
                  {tutor.contact_info}
                </span>

                <a
                  href={tutor.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "px-5 py-3 h-auto rounded-2xl text-xs font-bold shadow-md shadow-[#FF6B6B]/30 gap-2 shrink-0",
                    "bg-[#FF6B6B] hover:bg-[#E85D5D] text-white"
                  )}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Daftar / Konsultasi WA</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>
            </Card>
          );
        })}
      </div>

    </div>
  );
};
