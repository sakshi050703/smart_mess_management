'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatCurrency, formatDate } from '@/lib/utils';
import { FileText, Download, Calendar, Filter, BarChart3 } from 'lucide-react';

export default function ReportsClient({ userName, role }) {
  const [reportType, setReportType] = useState('billing');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    let url = `/api/reports?type=${reportType}&`;
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setPreviewData(data.data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [reportType, startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExportCSV = () => {
    let url = `/api/reports?type=${reportType}&format=csv`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Reports & CSV Export" subtitle="Generate downloadable audit and financial records" role={role} userName={userName} />

      <div className="p-6 flex-1 space-y-6 max-w-7xl mx-auto w-full animate-fade-in">
        {/* Controls Bar */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Report Type</label>
                <select
                  value={reportType}
                  onChange={e => setReportType(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="billing">Student Billing & Dues</option>
                  <option value="payments">Manual Payments Log</option>
                  <option value="attendance">Daily Attendance</option>
                  <option value="wastage">Food Wastage Report</option>
                  <option value="inventory">Inventory Stock Valuation</option>
                </select>
              </div>

              {reportType !== 'inventory' && (
                <>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-600/30"
            >
              <Download className="w-4 h-4" />
              Download CSV Report
            </button>
          </div>
        </div>

        {/* Preview Summary */}
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm capitalize">{reportType} Report Preview</h3>
            <span className="text-xs text-slate-400">{previewData.length} records retrieved</span>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            {loading ? (
              <div className="text-center py-12 text-slate-400 text-xs">Generating report preview...</div>
            ) : previewData.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">No records found for the selected date range.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/5">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    {reportType === 'billing' && (
                      <>
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Total Fee</th>
                        <th className="py-3 px-4">Paid</th>
                        <th className="py-3 px-4">Balance</th>
                        <th className="py-3 px-4">Due Date</th>
                        <th className="py-3 px-4">Status</th>
                      </>
                    )}
                    {reportType === 'payments' && (
                      <>
                        <th className="py-3 px-4">Receipt #</th>
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Mode</th>
                        <th className="py-3 px-4">Payment Date</th>
                      </>
                    )}
                    {reportType === 'attendance' && (
                      <>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Meal</th>
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Status</th>
                      </>
                    )}
                    {reportType === 'wastage' && (
                      <>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Meal</th>
                        <th className="py-3 px-4">Waste Qty (Kg)</th>
                        <th className="py-3 px-4">Est. Loss</th>
                      </>
                    )}
                    {reportType === 'inventory' && (
                      <>
                        <th className="py-3 px-4">Item</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Stock</th>
                        <th className="py-3 px-4">Min Threshold</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {previewData.slice(0, 50).map((item, idx) => (
                    <tr key={item._id || idx} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 text-slate-500">{idx + 1}</td>
                      {reportType === 'billing' && (
                        <>
                          <td className="py-3 px-4 font-semibold text-white">{item.student?.name}</td>
                          <td className="py-3 px-4 text-slate-200">{formatCurrency(item.totalAmountInPaise)}</td>
                          <td className="py-3 px-4 text-emerald-400">{formatCurrency(item.paidAmountInPaise)}</td>
                          <td className="py-3 px-4 text-amber-400 font-bold">{formatCurrency(item.balanceAmountInPaise)}</td>
                          <td className="py-3 px-4 text-slate-400">{formatDate(item.dueDate)}</td>
                          <td className="py-3 px-4 capitalize">{item.status}</td>
                        </>
                      )}
                      {reportType === 'payments' && (
                        <>
                          <td className="py-3 px-4 font-mono text-indigo-300 font-semibold">{item.receiptNumber}</td>
                          <td className="py-3 px-4 font-semibold text-white">{item.student?.name}</td>
                          <td className="py-3 px-4 font-bold text-emerald-400">{formatCurrency(item.amountInPaise)}</td>
                          <td className="py-3 px-4 capitalize">{item.paymentMode}</td>
                          <td className="py-3 px-4 text-slate-400">{formatDate(item.paymentDate)}</td>
                        </>
                      )}
                      {reportType === 'attendance' && (
                        <>
                          <td className="py-3 px-4 text-slate-300">{formatDate(item.date)}</td>
                          <td className="py-3 px-4 capitalize font-semibold text-white">{item.mealType}</td>
                          <td className="py-3 px-4 text-slate-200">{item.student?.name}</td>
                          <td className="py-3 px-4 capitalize text-emerald-400">{item.status}</td>
                        </>
                      )}
                      {reportType === 'wastage' && (
                        <>
                          <td className="py-3 px-4 text-slate-300">{formatDate(item.date)}</td>
                          <td className="py-3 px-4 capitalize font-semibold text-white">{item.mealType}</td>
                          <td className="py-3 px-4 text-rose-400 font-bold">{item.totalQuantityKg} Kg</td>
                          <td className="py-3 px-4 text-amber-400">{formatCurrency(item.estimatedValueInPaise)}</td>
                        </>
                      )}
                      {reportType === 'inventory' && (
                        <>
                          <td className="py-3 px-4 font-semibold text-white">{item.name}</td>
                          <td className="py-3 px-4 capitalize">{item.category}</td>
                          <td className="py-3 px-4 text-slate-200 font-bold">{item.currentStock} {item.unit}</td>
                          <td className="py-3 px-4 text-slate-400">{item.minimumStock} {item.unit}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
