import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL =
  import.meta.env.VITE_API_URL || 'https://mern-auth-backend-qkwp.onrender.com/api';

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  profilePicture?: string;
  provider?: string;
  createdAt?: string;
}

interface DashboardStats {
  totalUsers: number;
  adminCount: number;
  userCount: number;
  providerStats: Record<string, number>;
  recentUsers: UserRecord[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

function getToken(): string {
  return localStorage.getItem('token') || '';
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'user' as 'admin' | 'user' });
  const [actionLoading, setActionLoading] = useState('');

  const fetchUsers = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError('');
      try {
        const params: Record<string, string | number> = { page, limit: 10 };
        if (search) params.search = search;
        if (roleFilter) params.role = roleFilter;

        const response = await axios.get(`${API_URL}/users`, {
          headers: authHeaders(),
          params,
        });
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      } catch (err: unknown) {
        const message =
          axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : 'Failed to load users';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [search, roleFilter],
  );

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/users/stats`, {
        headers: authHeaders(),
      });
      setStats(response.data);
    } catch {
      // stats are optional, don't block
    }
  }, []);

  useEffect(() => {
    fetchUsers(1);
    fetchStats();
  }, [fetchUsers, fetchStats]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    setActionLoading(id);
    try {
      await axios.delete(`${API_URL}/users/${id}`, { headers: authHeaders() });
      await fetchUsers(pagination.page);
      await fetchStats();
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Failed to delete user';
      alert(message);
    } finally {
      setActionLoading('');
    }
  };

  const openEdit = (u: UserRecord) => {
    setEditingUser(u);
    setEditForm({ name: u.name, email: u.email, role: u.role });
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    setActionLoading(editingUser._id);
    try {
      await axios.put(`${API_URL}/users/${editingUser._id}`, editForm, {
        headers: authHeaders(),
      });
      setEditingUser(null);
      await fetchUsers(pagination.page);
      await fetchStats();
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Failed to update user';
      alert(message);
    } finally {
      setActionLoading('');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-8 py-6 text-center">
          <p className="text-lg font-semibold text-red-300">Access Denied</p>
          <p className="mt-2 text-sm text-slate-400">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.26em] text-cyan-400">Administration</p>
          <h1 className="mt-2 text-3xl font-bold">User Management</h1>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">Total Users</p>
              <p className="mt-2 text-3xl font-bold text-white">{stats.totalUsers}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">Administrators</p>
              <p className="mt-2 text-3xl font-bold text-cyan-400">{stats.adminCount}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">Regular Users</p>
              <p className="mt-2 text-3xl font-bold text-emerald-400">{stats.userCount}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">Auth Providers</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(stats.providerStats).map(([provider, count]) => (
                  <span
                    key={provider}
                    className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300"
                  >
                    {provider}: {count}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
          >
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">User</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Email</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Role</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Provider</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Joined</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                      <p className="mt-3">Loading users...</p>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u._id}
                      className="border-b border-slate-800/50 transition hover:bg-slate-800/30"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              u.profilePicture ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=0ea5e9&color=fff&size=64`
                            }
                            alt={u.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <span className="font-medium text-white">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-300">{u.email}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            u.role === 'admin'
                              ? 'border border-amber-500/40 bg-amber-500/10 text-amber-300'
                              : 'border border-slate-700 bg-slate-800 text-slate-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 capitalize text-slate-400">{u.provider || 'local'}</td>
                      <td className="px-5 py-3 text-slate-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(u)}
                            disabled={actionLoading === u._id}
                            className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300 transition hover:bg-cyan-500 hover:text-white disabled:opacity-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(u._id, u.name)}
                            disabled={actionLoading === u._id || u._id === user?._id}
                            className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                          >
                            {actionLoading === u._id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-800 px-5 py-3">
              <p className="text-xs text-slate-500">
                Showing {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-1">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => fetchUsers(p)}
                    className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                      p === pagination.page
                        ? 'bg-cyan-500 text-slate-950'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white">Edit User</h3>
              <p className="mt-1 text-sm text-slate-400">Update user information</p>

              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="edit-name" className="mb-1.5 block text-sm font-medium text-slate-300">
                    Full name
                  </label>
                  <input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="edit-email" className="mb-1.5 block text-sm font-medium text-slate-300">
                    Email
                  </label>
                  <input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="edit-role" className="mb-1.5 block text-sm font-medium text-slate-300">
                    Role
                  </label>
                  <select
                    id="edit-role"
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, role: e.target.value as 'admin' | 'user' }))
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={!!actionLoading}
                  className="flex-1 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

