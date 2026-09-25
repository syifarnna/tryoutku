import React from 'react';
import { cn } from '../../lib/utils';
import { Badge } from '@/components/ui/badge';

export const JENJANG_OPTIONS = ['S1', 'D4', 'D3', 'D2', 'S2', 'S3'] as const;
export type JenjangValue = typeof JENJANG_OPTIONS[number];

export const normalizeJenjang = (j?: string | null): string => {
  const s = (j || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (s === 'DIV' || s === 'D4') return 'D4';
  if (s === 'DIII' || s === 'D3') return 'D3';
  if (s === 'DII' || s === 'D2') return 'D2';
  if (s === 'S2') return 'S2';
  if (s === 'S3') return 'S3';
  return 'S1';
};

const STYLE: Record<string, string> = {
  S1: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900',
  D4: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400 border-sky-200 dark:border-sky-900',
  D3: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
  D2: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-900',
  S2: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400 border-violet-200 dark:border-violet-900',
  S3: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border-rose-200 dark:border-rose-900',
};

export const JenjangBadge: React.FC<{ jenjang?: string | null; className?: string }> = ({ jenjang, className }) => {
  const norm = normalizeJenjang(jenjang);
  return (
    <Badge
      variant="outline"
      className={cn('rounded-md text-[10px] font-bold h-auto px-2 py-0.5 border', STYLE[norm] || STYLE.S1, className)}
    >
      {norm}
    </Badge>
  );
};