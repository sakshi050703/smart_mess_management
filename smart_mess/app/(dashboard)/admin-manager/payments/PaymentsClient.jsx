'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Receipt, AlertTriangle, CheckCircle2, RotateCcw, Search } from 'lucide-react';

export default function PaymentsClient({ userName, role }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showReverseModal, setShowReverseModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [reversalReason, setReversalReason] = useState('');
  const [reverseLoading, setReverseLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments');
      const data = await res.json();
      if (data.success) {
        setPayments(data.data.payments);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleReverse = async (e) => {
    e.preventDefault();
    if (!selectedPayment) return;
    setReverseLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/payments/${selectedPayment._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reversalReason }),
      });
      const data = await res.json();
      if (data.success) {
        setShowReverseModal(false);
        setMessage(`Payment ${selectedPayment.receiptNumber} reversed successfully.`);
        setSelectedPayment(null);
        setReversalReason('');
        fetchPayments();
      } else {
        setError(data.message || 'Reversal failed');
      }
    } catch (err) {
      setError('An error occurred');
    }
    setReverseLoading(false);
  };

  const filtered = payments.filter(p =>
    p.receiptNumber?.toLowerCase().includes(search.toLowerCase()) ||
    p.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.student?.studentId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Payment Records" subtitle="Track offline fee receipts, modes and payment reversals" role={role} userName={userName} />

      <div className="p-6 flex-1 space-y-6 max-w-7xl mx-auto w-full animate-fade-in">
        {message && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {message}
            </span>
            <button onClick={() => setMessage('')} className="text-xs text-slate-400 hover:text-white">Dismiss</button>
          </div>
        )}

        <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by receipt # or student..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <span className="text-xs text-slate-400">Total Recorded Receipts: {filtered.length}</span>
        </div>

        {/* Payments Table */}
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/40 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-5">Receipt #</th>
                  <th className="py-4 px-5">Student</th>
                  <th className="py-4 px-5">Amount</th>
                  <th className="py-4 px-5">Mode</th>
                  <th className="py-4 px-5">Date</th>
                  <th className="py-4 px-5">Recorded By</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-slate-400">Loading payments...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-slate-400">No payment receipts found.</td>
                  </tr>
                ) : (
                  filtered.map(p => (
                    <tr key={p._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5 font-mono text-indigo-300 font-semibold flex items-center gap-1.5">
                        <Receipt className="w-4 h-4 text-indigo-400" />
                        {p.receiptNumber}
                      </td>
                      <td className="py-4 px-5 font-semibold text-white">
                        {p.student?.name || 'Student'}
                        <p className="text-xs text-slate-400 font-mono font-normal">{p.student?.studentId || 'ID'}</p>
                      </td>
                      <td className="py-4 px-5 font-bold text-emerald-400">
                        {formatCurrency(p.amountInPaise)}
                      </td>
                      <td className="py-4 px-5 capitalize text-slate-300 text-xs">
                        <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 border border-white/5">
                          {p.paymentMode}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-300 text-xs">
                        {formatDate(p.paymentDate)}
                      </td>
                      <td className="py-4 px-5 text-slate-400 text-xs">
                        {p.recordedBy?.name || 'Accountant'}
                      </td>
                      <td className="py-4 px-5">
                        {p.isReversed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <AlertTriangle className="w-3 h-3" /> Reversed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        {!p.isReversed && role === 'admin' && (
                          <button
                            onClick={() => {
                              setSelectedPayment(p);
                              setShowReverseModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all flex items-center gap-1.5 ml-auto"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Reverse
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reverse Payment Modal */}
      {showReverseModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Reverse Payment Receipt
            </h3>

            <p className="text-xs text-slate-400">
              You are about to reverse payment receipt <strong className="text-indigo-300 font-mono">{selectedPayment.receiptNumber}</strong> of {formatCurrency(selectedPayment.amountInPaise)}. The bill balance will be updated automatically.
            </p>

            {error && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">{error}</div>}

            <form onSubmit={handleReverse} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Reversal Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={reversalReason}
                  onChange={e => setReversalReason(e.target.value)}
                  placeholder="e.g. Cheque bounced / incorrect entry recorded"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReverseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reverseLoading}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30"
                >
                  {reverseLoading ? 'Processing...' : 'Confirm Reversal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
