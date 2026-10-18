'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatDate } from '@/lib/utils';

export default function StudentsClient({ role, userName }) {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', rollNumber: '', department: '', course: '', year: '', roomNumber: '', hostel: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users?role=student&page=${page}&limit=15&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.data.users);
        setPagination(data.data.pagination);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  async function handleAddStudent(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, role: 'student', year: form.year ? parseInt(form.year) : undefined }),
    });
    const data = await res.json();
    if (data.success) {
      setSuccess('Student added successfully');
      setShowModal(false);
      setForm({ name: '', email: '', password: '', phone: '', rollNumber: '', department: '', course: '', year: '', roomNumber: '', hostel: '' });
      fetchStudents();
    } else {
      setError(data.message || 'Failed to add student');
    }
    setSaving(false);
  }

  async function handleDeactivate(id) {
    if (!confirm('Deactivate this student?')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    fetchStudents();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Students" subtitle="Manage student accounts" role={role} userName={userName} />
      <div className="p-6 flex-1 animate-fade-in">
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">{success}</div>
        )}

        {/* Header actions */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <input
              type="search"
              className="input pl-9"
              placeholder="Search students..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary btn-sm">
            + Add Student
          </button>
        </div>

        {/* Table */}
        <div className="section-card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll No.</th>
                  <th>Department</th>
                  <th>Room</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j}><div className="h-4 bg-slate-700/50 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-500">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  students.map(s => (
                    <tr key={s._id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-slate-200 font-medium text-sm">{s.name}</div>
                            <div className="text-slate-500 text-xs">{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-slate-400 text-sm">{s.rollNumber || '—'}</td>
                      <td className="text-slate-400 text-sm">{s.department || '—'}</td>
                      <td className="text-slate-400 text-sm">{s.roomNumber ? `${s.roomNumber}` : '—'}{s.hostel ? `, ${s.hostel}` : ''}</td>
                      <td className="text-slate-400 text-sm">{s.phone || '—'}</td>
                      <td className="text-slate-400 text-sm">{formatDate(s.createdAt)}</td>
                      <td>
                        <span className={`badge ${s.isActive ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 bg-slate-400/10'}`}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          {s.isActive && role === 'admin' && (
                            <button onClick={() => handleDeactivate(s._id)} className="btn-icon btn-sm text-rose-400 hover:bg-rose-500/10" title="Deactivate">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M17 16l4-4m0 0l-4-4m4 4H7"/>
                              </svg>
                            </button>
                          )}
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
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800/60">
              <span className="text-slate-500 text-sm">Total: {pagination.total}</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary btn-sm" style={{ opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
                <span className="px-3 py-1.5 text-sm text-slate-400">Page {page} / {pagination.pages}</span>
                <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-secondary btn-sm" style={{ opacity: page === pagination.pages ? 0.4 : 1 }}>Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">Add Student</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Name *</label>
                  <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input type="email" className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Password *</label>
                  <input type="password" className="input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label className="label">Roll Number</label>
                  <input className="input" value={form.rollNumber} onChange={e => setForm({ ...form, rollNumber: e.target.value })} />
                </div>
                <div>
                  <label className="label">Year</label>
                  <input type="number" className="input" min="1" max="6" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
                </div>
                <div>
                  <label className="label">Department</label>
                  <input className="input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
                </div>
                <div>
                  <label className="label">Course</label>
                  <input className="input" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} />
                </div>
                <div>
                  <label className="label">Room Number</label>
                  <input className="input" value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} />
                </div>
                <div>
                  <label className="label">Hostel</label>
                  <input className="input" value={form.hostel} onChange={e => setForm({ ...form, hostel: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Adding...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
