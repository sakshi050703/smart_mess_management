'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Receipt, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function StudentPaymentsClient({ userName, role }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Payment Receipts" subtitle="Official mess payment records and receipt numbers" role={role} userName={userName} />

      <div className="p-6 flex-1 space-y-6 max-w-5xl mx-auto w-full animate-fade-in">
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/40 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-5">Receipt #</th>
                  <th className="py-4 px-5">Date</th>
                  <th className="py-4 px-5">Amount</th>
                  <th className="py-4 px-5">Payment Mode</th>
                  <th className="py-4 px-5">Transaction Ref</th>
                  <th className="py-4 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400">Loading payment receipts...</td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400">No payment receipts found for your account.</td>
                  </tr>
                ) : (
                  payments.map(p => (
                    <tr key={p._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5 font-mono text-indigo-300 font-semibold flex items-center gap-1.5">
                        <Receipt className="w-4 h-4 text-indigo-400" />
                        {p.receiptNumber}
                      </td>
                      <td className="py-4 px-5 text-slate-300 text-xs">
                        {formatDate(p.paymentDate)}
                      </td>
                      <td className="py-4 px-5 font-bold text-emerald-400">
                        {formatCurrency(p.amountInPaise)}
                      </td>
                      <td className="py-4 px-5 capitalize text-slate-300">
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-200 border border-white/5">
                          {p.paymentMode}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-400 font-mono text-xs">
                        {p.transactionReference || 'Cash/Manual'}
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
