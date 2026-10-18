'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { Package, AlertTriangle, ArrowUpRight, CheckCircle2, Search } from 'lucide-react';

export default function KitchenInventoryClient({ userName, role }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [usedQty, setUsedQty] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (data.success) {
        setItems(data.data.items);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleUseStock = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    setSubmitting(true);
    try {
      const qty = Number(usedQty);
      const newStock = Math.max(0, selectedItem.currentStock - qty);

      const res = await fetch(`/api/inventory/${selectedItem._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStock: newStock,
          transactionType: 'out',
          reason: reason || 'Kitchen consumption during meal preparation',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedItem(null);
        setUsedQty('');
        setReason('');
        setMessage(`Logged usage of ${qty} ${selectedItem.unit} for ${selectedItem.name}`);
        fetchItems();
      }
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Kitchen Inventory & Consumption" subtitle="Track ingredients and log daily kitchen consumption" role={role} userName={userName} />

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

        <div className="glass-card p-4 rounded-2xl border border-white/5 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ingredient or item..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <span className="text-xs text-slate-400">{filtered.length} Items</span>
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/40 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-5">Item Name</th>
                  <th className="py-4 px-5">Category</th>
                  <th className="py-4 px-5">Stock Level</th>
                  <th className="py-4 px-5">Min Threshold</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400">Loading inventory...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400">No matching ingredients.</td>
                  </tr>
                ) : (
                  filtered.map(item => (
                    <tr key={item._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5 font-semibold text-white">
                        {item.name}
                      </td>
                      <td className="py-4 px-5 capitalize text-slate-300 text-xs">
                        {item.category}
                      </td>
                      <td className="py-4 px-5 font-bold text-white">
                        {item.currentStock} <span className="text-xs text-slate-400 font-normal">{item.unit}</span>
                      </td>
                      <td className="py-4 px-5 text-slate-400 text-xs">
                        {item.minimumStock} {item.unit}
                      </td>
                      <td className="py-4 px-5">
                        {item.isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Available
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 border border-emerald-500/30 transition-all"
                        >
                          Log Used
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Log Used Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-emerald-400" />
              Log Consumption: {selectedItem.name}
            </h3>

            <p className="text-xs text-slate-400">
              Current Available: <strong className="text-white">{selectedItem.currentStock} {selectedItem.unit}</strong>
            </p>

            <form onSubmit={handleUseStock} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Quantity Used ({selectedItem.unit}) *</label>
                <input
                  required
                  type="number"
                  step="any"
                  min="0"
                  max={selectedItem.currentStock}
                  value={usedQty}
                  onChange={e => setUsedQty(e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Meal / Cooking Reason</label>
                <input
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Lunch vegetable curry prep"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30"
                >
                  {submitting ? 'Updating...' : 'Log Used'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
