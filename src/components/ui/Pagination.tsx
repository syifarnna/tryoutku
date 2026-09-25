import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const PAGE_WINDOW = 2;

function pageItems(page: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | '...')[] = [1];
  const start = Math.max(2, page - PAGE_WINDOW);
  const end = Math.min(total - 1, page + PAGE_WINDOW);
  if (start > 2) items.push('...');
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push('...');
  items.push(total);
  return items;
}

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        Sebelumnya
      </Button>

      {pageItems(page, totalPages).map((it, idx) => {
        if (it === '...') {
          return (
            <span key={`e${idx}`} className="px-1.5 text-sm text-muted-foreground select-none">
              …
            </span>
          );
        }
        const active = it === page;
        return (
          <button
            key={it}
            type="button"
            onClick={() => onChange(it)}
            className={cn(
              'min-w-9 h-9 px-2 rounded-lg text-sm font-bold border transition-all cursor-pointer',
              active
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-background text-muted-foreground border-border hover:bg-muted'
            )}
          >
            {it}
          </button>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="gap-1"
      >
        Berikutnya
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};