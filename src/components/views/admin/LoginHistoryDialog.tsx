import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { getErrorMessage } from '../../../lib/utils';
import { LoginEvent } from '../../../types';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Loader2, MapPin, Monitor, Globe, Clock, AlertCircle } from 'lucide-react';

interface LoginHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName?: string;
}

const describeUserAgent = (ua?: string | null): string => {
  if (!ua) return 'Perangkat tidak dikenal';
  const s = ua.toLowerCase();
  const os = s.includes('windows') ? 'Windows'
    : s.includes('android') ? 'Android'
    : s.includes('iphone') || s.includes('ipad') ? 'iOS'
    : s.includes('mac os') ? 'macOS'
    : s.includes('linux') ? 'Linux'
    : '';
  const browser = s.includes('edg/') ? 'Edge'
    : s.includes('chrome') ? 'Chrome'
    : s.includes('firefox') ? 'Firefox'
    : s.includes('safari') ? 'Safari'
    : '';
  const parts = [os, browser].filter(Boolean);
  if (parts.length === 0) return ua.slice(0, 60);
  return parts.join(' · ');
};

const formatLocation = (e: LoginEvent): string => {
  const parts = [e.city, e.region, e.country].filter((p): p is string => !!p && p.trim().length > 0);
  return parts.length > 0 ? parts.join(', ') : 'Lokasi tidak diketahui';
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export const LoginHistoryDialog: React.FC<LoginHistoryDialogProps> = ({
  open, onOpenChange, userId, userName,
}) => {
  const [events, setEvents] = useState<LoginEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !userId) return;
    let active = true;
    setLoading(true);
    setError(null);
    setEvents([]);
    supabase
      .from('login_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data, error: err }) => {
        if (!active) return;
        if (err) {
          setError(getErrorMessage(err));
        } else {
          setEvents((data as LoginEvent[]) || []);
        }
        setLoading(false);
      });
    return () => { active = false; };
  }, [open, userId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Riwayat Login
          </DialogTitle>
          <DialogDescription>
            {userName ? `Aktivitas login terakhir untuk ${userName}.` : 'Aktivitas login terakhir.'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto -mx-1 px-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Memuat riwayat login...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">{error}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm">Belum ada riwayat login yang tercatat.</p>
              <p className="text-xs text-slate-400 mt-1">
                Riwayat mulai tercatat setelah fitur ini aktif.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-border">
              {events.map((e) => (
                <li key={e.id} className="py-3 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {formatDateTime(e.created_at)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{formatLocation(e)}</span>
                    {e.ip && <span className="text-slate-400 font-mono">· {e.ip}</span>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-muted-foreground">
                    <Monitor className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{describeUserAgent(e.user_agent)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
