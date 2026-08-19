import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Target, Trash2 } from 'lucide-react';
import { appStore, useAppState } from '../../lib/store';
import { supabase } from '../../lib/supabaseClient';
import { cn } from '../../lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export const TargetMajorsView: React.FC = () => {
  const state = useAppState();
  
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('');
  const [selectedMajorId, setSelectedMajorId] = useState<string>('');
  const [fetchedMajors, setFetchedMajors] = useState<any[]>([]);
  const [isLoadingMajors, setIsLoadingMajors] = useState(false);
  const [majorsError, setMajorsError] = useState('');
  
  const targetMajors = appStore.getTargetMajors();
  
  useEffect(() => {
    async function fetchMajorsForInstitution() {
      if (!selectedInstitutionId) {
        setFetchedMajors([]);
        return;
      }
      
      setIsLoadingMajors(true);
      setMajorsError('');
      
      let { data: majors, error } = await supabase
        .from('majors')
        .select('id, name, cluster, institution_id, passing_grade_total, passing_grades(*), institutions(name)')
        .eq('institution_id', selectedInstitutionId)
        .order('name', { ascending: true });
        
      if (error) {
        console.warn("Error with relation query, falling back to simple query:", error);
        const fallback = await supabase
          .from('majors')
          .select('*')
          .eq('institution_id', selectedInstitutionId)
          .order('name', { ascending: true });
          
        if (!fallback.error && fallback.data) {
          majors = fallback.data;
          error = null;
        } else if (fallback.error) {
          error = fallback.error;
        }
      }
        
      if (error) {
        console.error("Error fetching majors:", error);
        setMajorsError(`${error.message || JSON.stringify(error)}. (Penting: Jika error terkait relasi tabel, pastikan Anda telah meng-copy dan menjalankan SQL Blueprint terbaru di menu SQL Editor pada Supabase Dashboard Anda)`);
        setFetchedMajors([]);
      } else if (majors) {
        setFetchedMajors(majors);
      }
      setIsLoadingMajors(false);
    }
    
    fetchMajorsForInstitution();
  }, [selectedInstitutionId]);

  const filteredMajors = useMemo(() => {
    return fetchedMajors.filter(m => !state.targetMajorIds.includes(m.id));
  }, [fetchedMajors, state.targetMajorIds]);

  const handleAddTarget = () => {
    if (selectedMajorId) {
      const majorObj = fetchedMajors.find(m => m.id === Number(selectedMajorId));
      if (majorObj) {
        const storeMajor = {
          id: majorObj.id,
          institution_id: majorObj.institution_id,
          institution_name: majorObj.institutions?.name || 'Unknown',
          name: majorObj.name,
          cluster: majorObj.cluster,
          passing_grade_total: majorObj.passing_grade_total
        };
        if (!state.majors.find(m => m.id === storeMajor.id)) {
           appStore.syncMajorToState(storeMajor);
        }
      }
      appStore.addTargetMajor(Number(selectedMajorId));
      setSelectedMajorId('');
    }
  };

  const selectedMajorInfo = useMemo(() => {
    if (!selectedMajorId) return null;
    return fetchedMajors.find(m => m.id === Number(selectedMajorId));
  }, [selectedMajorId, fetchedMajors]);

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      <div className="border-b border-slate-100 dark:border-border pb-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Target Institut & Jurusan Impian Saya</h2>
        <p className="text-xs text-slate-400 mt-0.5">Satu siswa dapat memiliki banyak pilihan PTN/Jurusan target untuk dikomparasi</p>
      </div>

      {/* Active Targets */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider">Pilihan Jurusan Target Saya ({targetMajors.length})</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {targetMajors.map((major, idx) => (
            <Card key={major.id} className="p-5 rounded-3xl ring-0 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 flex flex-col justify-between relative group gap-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="text-[10px] font-black h-auto px-2.5 py-0.5 rounded-full bg-[#FF6B6B] text-white border-[#FF6B6B]">
                    Pilihan #{idx + 1}
                  </Badge>
                  <span className="text-xs font-bold text-slate-500">PG: {major.passing_grade_total}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-white leading-snug pt-1">{major.name}</h4>
                <p className="text-xs font-semibold text-[#FF6B6B]">{major.institution_name}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => appStore.setActiveTargetMajor(major.id)}
                  className={cn(
                    "text-xs font-bold h-auto p-1",
                    state.activeTargetMajorId === major.id ? 'text-emerald-600 underline' : 'text-slate-500 hover:text-[#FF6B6B]'
                  )}
                >
                  {state.activeTargetMajorId === major.id ? '✓ Analisis Aktif' : 'Set Jadi Analisis'}
                </Button>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => appStore.removeTargetMajor(major.id)}
                  className="text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950"
                  title="Hapus Target"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
          {targetMajors.length === 0 && (
            <div className="col-span-full p-8 border-2 border-dashed border-slate-200 dark:border-border rounded-3xl text-center">
              <p className="text-slate-500 text-sm">Belum ada jurusan target yang dipilih. Silakan tambahkan di bawah.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add New Target Dropdowns Grid */}
      <Card className="p-6 lg:p-8 rounded-3xl ring-0 bg-white dark:bg-card border border-slate-100 dark:border-border shadow-xs gap-6">
        <div>
          <h3 className="font-bold text-base text-slate-800 dark:text-white">Tambah Target Institut Baru</h3>
          <p className="text-xs text-slate-400 mt-1">Pilih Kampus lalu Pilih Program Studi incaran Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">1. Pilih Kampus / Institut</Label>
            <select
              value={selectedInstitutionId}
              onChange={(e) => {
                setSelectedInstitutionId(e.target.value);
                setSelectedMajorId('');
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-card border border-slate-200 dark:border-border text-sm focus:outline-none focus:border-[#FF6B6B] dark:text-white"
            >
              <option value="">-- Pilih Kampus --</option>
              {state.institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name} ({inst.location})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">2. Pilih Program Studi</Label>
            {majorsError ? (
              <div className="p-3 bg-rose-50 text-rose-600 text-xs rounded-xl">Error memuat prodi: {majorsError}</div>
            ) : (
              <select
                value={selectedMajorId}
                onChange={(e) => setSelectedMajorId(e.target.value)}
                disabled={!selectedInstitutionId || isLoadingMajors || fetchedMajors.length === 0}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-card border border-slate-200 dark:border-border text-sm focus:outline-none focus:border-[#FF6B6B] dark:text-white disabled:opacity-50"
              >
                <option value="">
                  {!selectedInstitutionId 
                    ? '-- Pilih Kampus Dulu --' 
                    : isLoadingMajors 
                      ? 'Memuat prodi...' 
                      : fetchedMajors.length === 0 
                        ? '-- Belum ada prodi untuk kampus ini --' 
                        : filteredMajors.length === 0 
                          ? '-- Semua Prodi Sudah Ditambahkan --' 
                          : '-- Pilih Program Studi --'}
                </option>
                {filteredMajors.map(m => (
                  <option key={m.id} value={m.id}>{m.name} - {m.cluster}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {selectedMajorInfo && (
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
            <div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">Informasi Prodi</p>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="text-[10px] font-bold h-auto px-2 py-0.5 rounded-md bg-white dark:bg-card text-slate-700 dark:text-slate-300 border-slate-200 dark:border-border">
                  Rumpun: {selectedMajorInfo.cluster}
                </Badge>
                <Badge variant="outline" className="text-[10px] font-bold h-auto px-2 py-0.5 rounded-md bg-white dark:bg-card text-slate-700 dark:text-slate-300 border-slate-200 dark:border-border">
                  Passing Grade: <span className="text-indigo-600 dark:text-indigo-400 ml-1">{selectedMajorInfo.passing_grade_total}</span>
                </Badge>
                {selectedMajorInfo.passing_grades && selectedMajorInfo.passing_grades.map((pg: any) => (
                  <Badge key={pg.id} variant="outline" className="text-[10px] font-bold h-auto px-2 py-0.5 rounded-md bg-white dark:bg-card text-slate-700 dark:text-slate-300 border-slate-200 dark:border-border">
                    {pg.competency_code}: <span className="text-indigo-600 dark:text-indigo-400 ml-1">{pg.min_score}</span>
                  </Badge>
                ))}
              </div>
            </div>
            
            <Button
              onClick={handleAddTarget}
              disabled={!selectedMajorId}
              className="px-5 py-2.5 h-auto rounded-xl bg-[#FF6B6B] text-white hover:bg-[#E85D5D] text-sm font-bold shrink-0 shadow-md gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah ke Target</span>
            </Button>
          </div>
        )}
      </Card>

    </div>
  );
};
