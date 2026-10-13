'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatCurrency, formatDate, billStatusColor } from '@/lib/utils';
import { CreditCard, Calendar, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function StudentBillingClient({ userName, role }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing');
      const data = await res.json();
      if (data.success) {
        setBills(data.data.bills);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const totalOutstanding = bills.reduce((sum, b) => sum + (b.balanceAmountInPaise || 0), 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="My Mess Bills" subtitle="View issued invoices, due dates and balances" role={role} userName={userName} />

      <div className="p-6 flex-1 space-y-6 max-w-5xl mx-auto w-full animate-fade-in">
        {/* Banner with notice */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400">Total Outstanding Balance</p>
            <h3 className={`text-2xl font-extrabold mt-1 ${totalOutstanding > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {formatCurrency(totalOutstanding)}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-indigo-400" />
              Payments are recorded manually by the mess accountant via Cash, UPI or Bank Transfer.
            </p>
          </div>

          <Link
            href="/student/payments"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            View Payment Receipts
          </Link>
        </div>

        {/* Bills Table */}
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/40 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-5">Billing Period</th>
                  <th className="py-4 px-5">Total Amount</th>
                  <th className="py-4 px-5">Paid</th>
                  <th className="py-4 px-5">Balance Due</th>
                  <th className="py-4 px-5">Due Date</th>
                  <th className="py-4 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400">Loading bills...</td>
                  </tr>
                ) : bills.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400">No bills generated for your account yet.</td>
                  </tr>
                ) : (
                  bills.map(bill => (
                    <tr key={bill._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5 font-semibold text-white">
                        {bill.billingPeriod?.label || `${formatDate(bill.billingPeriod?.startDate)} - ${formatDate(bill.billingPeriod?.endDate)}`}
                      </td>
                      <td className="py-4 px-5 text-slate-200 font-medium">
                        {formatCurrency(bill.totalAmountInPaise)}
                      </td>
                      <td className="py-4 px-5 text-emerald-400 font-medium">
                        {formatCurrency(bill.paidAmountInPaise)}
                      </td>
                      <td className="py-4 px-5 text-amber-400 font-bold">
                        {formatCurrency(bill.balanceAmountInPaise)}
                      </td>
                      <td className="py-4 px-5 text-slate-400 text-xs">
                        {bill.dueDate ? formatDate(bill.dueDate) : '—'}
                      </td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${billStatusColor(bill.status)}`}>
                          {bill.status}
                        </span>
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
