import { useState, useEffect, useRef, ChangeEvent, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { getAllUsersExceptAdmins, getAdminUserById, deleteAdminUser } from '../../services/adminService';
import type { AdminUser } from '../../types';

const ROLE_CFG: Record<string, string> = {
  DOCTOR: 'bg-teal-100 text-teal-700 border-teal-200',
  PATIENT: 'bg-blue-100 text-blue-700 border-blue-200',
};

function getRoleCls(roleName: string) {
  return ROLE_CFG[roleName?.toUpperCase()] ?? 'bg-gray-100 text-gray-700 border-gray-200';
}

function getInitials(userName: string) {
  return userName
      .split(/[\s._-]/)
      .filter((w) => w.length > 0)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-green-100 text-green-700',
  'bg-indigo-100 text-indigo-700',
  'bg-cyan-100 text-cyan-700',
];

function Backdrop({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
      <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {children}
      </div>
  );
}

export default function AdminUsers() {
  const location = useLocation();
  const autoOpenDone = useRef(false);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [viewUser, setViewUser] = useState<AdminUser | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    setError('');
    getAllUsersExceptAdmins()
        .then((res) => setUsers(res.data))
        .catch(() => setError('Failed to load users. Please try again.'))
        .finally(() => setLoading(false));
  };

  useEffect(fetchUsers, []);

  const handleView = (id: number) => {
    setViewLoading(true);
    setViewUser(null);
    getAdminUserById(id)
        .then((res) => setViewUser(res.data))
        .catch(() => {})
        .finally(() => setViewLoading(false));
  };

  useEffect(() => {
    if (autoOpenDone.current || users.length === 0) return;
    const navState = location.state as { searchFor?: string } | null;
    const searchFor = navState?.searchFor;
    if (!searchFor) return;
    autoOpenDone.current = true;
    const normalized = searchFor.toLowerCase().replace(/\s+/g, '.');
    const match = users.find((u) => u.userName.toLowerCase() === normalized);
    if (match) {
      handleView(match.id);
    } else {
      setSearch(searchFor);
    }
  }, [users, location.state]);

  const confirmDelete = async () => {
    if (deleteId === null) return;
    setDeleteError('');
    try {
      await deleteAdminUser(deleteId);
      setUsers((prev) => prev.filter((u) => u.id !== deleteId));
      setDeleteId(null);
    } catch {
      setDeleteError('Delete failed. Please try again.');
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
        (u.userName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
        (roleFilter === 'All' || u.roleName?.toUpperCase() === roleFilter.toUpperCase())
    );
  });

  if (loading) {
    return (
        <div className="flex items-center justify-center py-16">
          <svg className="w-6 h-6 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
    );
  }

  if (error) {
    return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <button onClick={fetchUsers} className="mt-3 text-sm font-semibold text-red-600 hover:underline">Retry</button>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between flex-wrap">
          <h2 className="text-lg font-bold text-gray-900">User Management</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                  type="text"
                  placeholder="Search username or email…"
                  value={search}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white w-64"
              />
            </div>
            <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white text-gray-700"
            >
              <option value="All">All Roles</option>
              <option value="Doctor">Doctor</option>
              <option value="Patient">Patient</option>
            </select>
            <span className="text-xs text-gray-400 font-medium self-center">{filtered.length} of {users.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-left">
                {['User', 'Email', 'Role', 'Contact', 'City', 'Age', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">No users match your search.</td></tr>
              ) : filtered.map((u, idx) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                          {getInitials(u.userName)}
                        </div>
                        <span className="font-medium text-gray-900 whitespace-nowrap font-mono text-xs">@{u.userName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs">{u.email}</td>
                    <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleCls(u.roleName)}`}>
                      {u.roleName}
                    </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{u.contactNumber}</td>
                    <td className="px-6 py-4 text-gray-600">{u.city}</td>
                    <td className="px-6 py-4 text-gray-600">{u.age}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleView(u.id)}
                            className="text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          View
                        </button>
                        <button
                            onClick={() => { setDeleteId(u.id); setDeleteError(''); }}
                            className="text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden divide-y divide-gray-100">
            {filtered.map((u, idx) => (
                <div key={u.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                        {getInitials(u.userName)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm font-mono">@{u.userName}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleCls(u.roleName)}`}>
                  {u.roleName}
                </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleView(u.id)} className="flex-1 text-center text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-semibold py-1.5 rounded-lg">View</button>
                    <button onClick={() => { setDeleteId(u.id); setDeleteError(''); }} className="flex-1 text-center text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold py-1.5 rounded-lg">Delete</button>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {(viewUser || viewLoading) && (
            <Backdrop onClose={() => setViewUser(null)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-700 to-blue-500">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">
                      {viewUser ? getInitials(viewUser.userName) : '…'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {viewUser ? `@${viewUser.userName}` : 'Loading…'}
                      </h3>
                      <p className="text-blue-100 text-xs mt-0.5">User Profile</p>
                    </div>
                  </div>
                  <button onClick={() => setViewUser(null)} aria-label="Close" className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/35 flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {viewLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <svg className="w-6 h-6 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    </div>
                ) : viewUser ? (
                    <>
                      <div className="p-6 space-y-3">
                        <div className="flex justify-center mb-2">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold border ${getRoleCls(viewUser.roleName)}`}>
                      {viewUser.roleName}
                    </span>
                        </div>
                        <dl className="space-y-2">
                          {[
                            { label: 'Username', value: `@${viewUser.userName}` },
                            { label: 'Email', value: viewUser.email },
                            { label: 'Contact', value: viewUser.contactNumber },
                            { label: 'Age', value: String(viewUser.age) },
                            { label: 'Address', value: [viewUser.streetAddress, viewUser.city, viewUser.state, viewUser.country].filter(Boolean).join(', ') },
                          ].map(({ label, value }) => (
                              <div key={label} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-gray-100">
                                <div className="min-w-0">
                                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                                  <p className="text-sm font-medium text-gray-800 mt-0.5 break-all">{value}</p>
                                </div>
                              </div>
                          ))}
                        </dl>
                      </div>
                      <div className="px-6 pb-6 flex gap-3">
                        <button onClick={() => setViewUser(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors">Close</button>
                      </div>
                    </>
                ) : null}
              </div>
            </Backdrop>
        )}

        {deleteId !== null && (
            <Backdrop onClose={() => setDeleteId(null)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="bg-red-50 border-b border-red-100 px-6 pt-7 pb-5 flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-red-100 border-2 border-red-200 flex items-center justify-center">
                    <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-gray-900">Confirm Delete</h3>
                </div>
                <div className="px-6 py-5">
                  <p className="text-sm text-gray-600 text-center leading-relaxed">
                    Are you sure you want to delete user ID <span className="font-semibold text-gray-900">#{deleteId}</span>? This action cannot be undone.
                  </p>
                  {deleteError && <p className="mt-3 text-xs text-red-600 text-center">{deleteError}</p>}
                </div>
                <div className="px-6 pb-6 flex gap-3">
                  <button onClick={() => setDeleteId(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors">Cancel</button>
                  <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">Confirm Delete</button>
                </div>
              </div>
            </Backdrop>
        )}
      </div>
  );
}