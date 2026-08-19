import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Profile } from '../../../types';
import { getErrorMessage, cn } from '../../../lib/utils';
import {
  Users, Search, Mail, ShieldCheck, User as UserIcon,
  RefreshCw, ChevronLeft, ChevronRight, Loader2, AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const PAGE_SIZE = 20;

export const AdminUsersView: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async (pageNum: number) => {
    setLoading(true);
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const [countRes, dataRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false })
        .range(from, to),
    ]);

    if (dataRes.error) {
      Swal.fire('Gagal Memuat Data', getErrorMessage(dataRes.error), 'error');
    } else {
      setUsers(dataRes.data || []);
    }
    if (countRes.count !== null) {
      setTotalCount(countRes.count);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers(page);
  }, [page, fetchUsers]);

  const toggleRole = async (user: Profile) => {
    const newRole = user.role === 'admin' ? 'peserta' : 'admin';
    const label = newRole === 'admin' ? 'Admin' : 'Peserta';

    const confirmed = await Swal.fire({
      icon: 'question',
      title: `Ubah peran ${user.full_name}?`,
      text: `Pengguna ini akan menjadi ${label}.`,
      showCancelButton: true,
      confirmButtonText: `Ya, jadikan ${label}`,
      cancelButtonText: 'Batal',
      confirmButtonColor: '#FF6B6B',
    });

    if (!confirmed.isConfirmed) return;

    setTogglingId(user.id);
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', user.id);

    if (error) {
      Swal.fire('Gagal', getErrorMessage(error), 'error');
    } else {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      Swal.fire({
        icon: 'success',
        title: `Peran berhasil diubah`,
        text: `${user.full_name} sekarang adalah ${label}.`,
        timer: 2000,
        showConfirmButton: false,
      });
    }
    setTogglingId(null);
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.nisn?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Daftar Pengguna
          </h2>
          <p className="text-sm text-slate-500 dark:text-[#777] mt-1">
            Kelola data peserta dan admin yang terdaftar.
            {!loading && <span className="ml-2 text-slate-400">({totalCount} total)</span>}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchUsers(page)}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-border shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-border bg-slate-50/50 dark:bg-card/50 flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Cari nama, email, atau NISN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          {search && (
            <span className="ml-3 text-xs text-slate-400 whitespace-nowrap">
              {filteredUsers.length} dari {users.length} ditampilkan
            </span>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-card hover:bg-slate-50 dark:hover:bg-[#000000] border-b border-slate-200 dark:border-border">
              <TableHead className="px-6 py-4 font-semibold">Nama Lengkap</TableHead>
              <TableHead className="px-6 py-4 font-semibold">Kontak</TableHead>
              <TableHead className="px-6 py-4 font-semibold">NISN</TableHead>
              <TableHead className="px-6 py-4 font-semibold">Peran</TableHead>
              <TableHead className="px-6 py-4 font-semibold">Terdaftar</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="px-6 py-16 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Memuat data pengguna...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="px-6 py-16 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="text-slate-500 dark:text-[#777]">
                    {search ? 'Tidak ada pengguna yang cocok dengan pencarian.' : 'Belum ada pengguna terdaftar.'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-[#232435]/50">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-indigo-900/30 flex items-center justify-center text-primary font-bold shrink-0">
                        {user.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-white">{user.full_name}</div>
                        <div className="text-xs text-slate-500">{user.school || 'Sekolah belum diisi'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[180px]">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                    {user.nisn || '-'}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {user.role === 'admin' ? (
                      <Badge variant="secondary" className="gap-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-md h-auto py-1 px-2.5 text-xs font-bold">
                        <ShieldCheck className="w-3 h-3" /> Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 bg-slate-100 dark:bg-[#141414] text-slate-600 dark:text-[#777] border-slate-200 dark:border-border rounded-md h-auto py-1 px-2.5 text-xs font-bold">
                        <UserIcon className="w-3 h-3" /> Peserta
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(user.updated_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => toggleRole(user)}
                      disabled={togglingId === user.id}
                      className="font-bold"
                    >
                      {togglingId === user.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : user.role === 'admin' ? (
                        'Turunkan'
                      ) : (
                        'Jadikan Admin'
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && !search && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 dark:border-border bg-slate-50/50 dark:bg-card/50 text-sm">
            <span className="text-slate-500 dark:text-[#777] text-xs">
              Halaman {page + 1} dari {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
