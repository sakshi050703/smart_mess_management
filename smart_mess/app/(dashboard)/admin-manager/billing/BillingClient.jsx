'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatCurrency, formatDate, billStatusColor } from '@/lib/utils';

export default function BillingClient({ role, userName }) {
  const [bills, setBills] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payForm, setPayForm] = useState({ amountInPaise: '', paymentMode: 'cash', paymentDate: new Date().toISOString().split('T')[0], transactionReference: '', notes: '' });
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState('');
  const [paySuccess, setPaySuccess] = useState('');

  const fetchBills = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/billing?page=${page}&limit=15${statusFilter ? `&status=${statusFilter}` : ''}`);
    const data = await res.json();
    if (data.success) {
      setBills(data.data.bills);
      setPagination(data.data.pagination);
    }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  async function handleRecordPayment(e) {
    e.preventDefault();
    setPayLoading(true);
    setPayError('');
    const rupees = parseFloat(payForm.amountInPaise);
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        billId: selected._id,
        amountInPaise: Math.round(rupees * 100),
        paymentMode: payForm.paymentMode,
        paymentDate: payForm.paymentDate,
        transactionReference: payForm.transactionReference,
        notes: payForm.notes,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setPaySuccess('Payment recorded successfully!');
      setShowPayModal(false);
      fetchBills();
    } else {
      setPayError(data.message || 'Payment failed');
    }
    setPayLoading(false);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Billing" subtitle="Manage student bills and payments" role={role} userName={userName} />

      <div className="p-6 flex-1 animate-fade-in space-y-6">
        {paySuccess && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">{paySuccess}</div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {['', 'unpaid', 'partial', 'paid', 'overdue'].map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${statusFilter === s ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'border-slate-700 text-slate-400 hover:border-indigo-500/40'}`}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="section-card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Period</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 8 }).map((_, j) => <td key={j}><div className="h-4 bg-slate-700/50 rounded animate-pulse" /></td>)}</tr>
                  ))
                ) : bills.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-slate-500">No bills found.</td></tr>
                ) : (
                  bills.map(bill => (
                    <tr key={bill._id}>
                      <td>
                        <div className="font-medium text-slate-200 text-sm">{bill.student?.name}</div>
                        <div className="text-slate-500 text-xs">{bill.student?.studentId}</div>
                      </td>
                      <td className="text-slate-400 text-sm">{bill.billingPeriod?.label || `${formatDate(bill.billingPeriod?.startDate)} - ${formatDate(bill.billingPeriod?.endDate)}`}</td>
                      <td className="text-slate-200 font-medium">{formatCurrency(bill.totalAmountInPaise)}</td>
                      <td className="text-emerald-400">{formatCurrency(bill.paidAmountInPaise)}</td>
                      <td className="text-amber-400 font-semibold">{formatCurrency(bill.balanceAmountInPaise)}</td>
                      <td className="text-slate-400 text-sm">{formatDate(bill.dueDate)}</td>
                      <td>
                        <span className={`badge ${billStatusColor(bill.status)}`}>
                          {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        {bill.status !== 'paid' && (
                          <button
                            onClick={() => { setSelected(bill); setPayForm({ ...payForm, amountInPaise: (bill.balanceAmountInPaise / 100).toFixed(2) }); setShowPayModal(true); setPayError(''); setPaySuccess(''); }}
                            className="btn-primary btn-sm"
                          >
                            Record Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800/60">
              <span className="text-slate-500 text-sm">Total: {pagination.total} bills</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary btn-sm" style={{ opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
                <span className="px-3 py-1.5 text-sm text-slate-400">Page {page} / {pagination.pages}</span>
                <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-secondary btn-sm" style={{ opacity: page === pagination.pages ? 0.4 : 1 }}>Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPayModal && selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">Record Payment</h2>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Bill summary */}
            <div className="mb-5 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="text-slate-400 text-xs mb-1">Student</div>
              <div className="text-white font-medium">{selected.student?.name}</div>
              <div className="grid grid-cols-3 gap-3 mt-3 text-sm">
                <div>
                  <div className="text-slate-500 text-xs">Total</div>
                  <div className="text-slate-200">{formatCurrency(selected.totalAmountInPaise)}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs">Paid</div>
                  <div className="text-emerald-400">{formatCurrency(selected.paidAmountInPaise)}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs">Balance</div>
                  <div className="text-amber-400 font-bold">{formatCurrency(selected.balanceAmountInPaise)}</div>
                </div>
              </div>
            </div>

            {payError && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{payError}</div>}

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="label">Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={(selected.balanceAmountInPaise / 100).toFixed(2)}
                  className="input"
                  value={payForm.amountInPaise}
                  onChange={e => setPayForm({ ...payForm, amountInPaise: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Payment Mode *</label>
                <select className="input" value={payForm.paymentMode} onChange={e => setPayForm({ ...payForm, paymentMode: e.target.value })}>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="label">Payment Date *</label>
                <input type="date" className="input" value={payForm.paymentDate} onChange={e => setPayForm({ ...payForm, paymentDate: e.target.value })} required />
              </div>
              {payForm.paymentMode !== 'cash' && (
                <div>
                  <label className="label">Transaction Reference</label>
                  <input className="input" placeholder="UPI transaction ID / bank ref." value={payForm.transactionReference} onChange={e => setPayForm({ ...payForm, transactionReference: e.target.value })} />
                </div>
              )}
              <div>
                <label className="label">Notes</label>
                <input className="input" placeholder="Optional note" value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPayModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={payLoading} className="btn-primary flex-1">
                  {payLoading ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
