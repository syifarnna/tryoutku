import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Profile } from '../../../types';
import { getErrorMessage } from '../../../lib/utils';
import {
  Users, Search, Mail, ShieldCheck, User as UserIcon,
  RefreshCw, ChevronLeft, ChevronRight, Loader2, AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';

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
            <Users className="w-6 h-6 text-[#FF6B6B]" />
            Daftar Pengguna
          </h2>
          <p className="text-sm text-slate-500 dark:text-[#777] mt-1">
            Kelola data peserta dan admin yang terdaftar.
            {!loading && <span className="ml-2 text-slate-400">({totalCount} total)</span>}
          </p>
        </div>
        <button
          onClick={() => fetchUsers(page)}
          disabled={loading}
          className="px-4 py-2 bg-white dark:bg-[#000000] border border-slate-200 dark:border-[#141414] rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-[#1C1C1C] transition-colors shadow-sm disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-[#000000] rounded-2xl border border-slate-200 dark:border-[#141414] shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-[#141414] bg-slate-50/50 dark:bg-[#000000]/50 flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, email, atau NISN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1C1C1C] bg-white dark:bg-[#000000] text-sm focus:outline-none focus:border-[#FF6B6B] dark:focus:border-[#FF6B6B] transition-colors"
            />
          </div>
          {search && (
            <span className="ml-3 text-xs text-slate-400 whitespace-nowrap">
              {filteredUsers.length} dari {users.length} ditampilkan
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-[#000000] text-slate-500 dark:text-[#777] font-medium">
              <tr>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">Kontak</th>
                <th className="px-6 py-4">NISN</th>
                <th className="px-6 py-4">Peran</th>
                <th className="px-6 py-4">Terdaftar</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="text-slate-500 dark:text-[#777]">
                      {search ? 'Tidak ada pengguna yang cocok dengan pencarian.' : 'Belum ada pengguna terdaftar.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-[#232435]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FFE0E0] dark:bg-indigo-900/30 flex items-center justify-center text-[#FF6B6B] font-bold shrink-0">
                          {user.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-white">{user.full_name}</div>
                          <div className="text-xs text-slate-500">{user.school || 'Sekolah belum diisi'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                      {user.nisn || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#141414] text-slate-600 dark:text-[#777] text-xs font-bold border border-slate-200 dark:border-[#1C1C1C]">
                          <UserIcon className="w-3 h-3" /> Peserta
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(user.updated_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleRole(user)}
                        disabled={togglingId === user.id}
                        className="px-3 py-1.5 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-[#1C1C1C] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1C1C1C] transition-all disabled:opacity-50"
                      >
                        {togglingId === user.id ? (
                          <Loader2 className="w-3 h-3 animate-spin inline" />
                        ) : user.role === 'admin' ? (
                          'Turunkan'
                        ) : (
                          'Jadikan Admin'
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && !search && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 dark:border-[#141414] bg-slate-50/50 dark:bg-[#000000]/50 text-sm">
            <span className="text-slate-500 dark:text-[#777] text-xs">
              Halaman {page + 1} dari {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg border border-slate-200 dark:border-[#1C1C1C] text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-[#000000] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-[#1C1C1C] text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-[#000000] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
