'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatCurrency } from '@/lib/utils';
import { Package, AlertTriangle, Plus, Search, Filter, ArrowUpRight, ArrowDownLeft, CheckCircle2 } from 'lucide-react';

export default function InventoryClient({ role, userName }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    category: 'vegetables',
    unit: 'kg',
    currentStock: '',
    minimumStock: '',
    costPerUnit: '',
    supplier: '',
    notes: '',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Adjust Stock Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustForm, setAdjustForm] = useState({
    type: 'in',
    quantity: '',
    reason: '',
  });
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    let url = `/api/inventory?`;
    if (categoryFilter) url += `category=${categoryFilter}&`;
    if (lowStockOnly) url += `lowStock=true&`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setItems(data.data.items);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [categoryFilter, lowStockOnly]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError('');
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addForm.name,
          category: addForm.category,
          unit: addForm.unit,
          currentStock: Number(addForm.currentStock || 0),
          minimumStock: Number(addForm.minimumStock || 0),
          costPerUnit: Math.round(Number(addForm.costPerUnit || 0) * 100),
          supplier: addForm.supplier,
          notes: addForm.notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setMessage('Item added to inventory successfully');
        setAddForm({ name: '', category: 'vegetables', unit: 'kg', currentStock: '', minimumStock: '', costPerUnit: '', supplier: '', notes: '' });
        fetchInventory();
      } else {
        setAddError(data.message || 'Failed to add item');
      }
    } catch (err) {
      setAddError(err.message || 'Error occurred');
    }
    setAddLoading(false);
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    setAdjustLoading(true);
    try {
      const qty = Number(adjustForm.quantity);
      let newStock = selectedItem.currentStock;
      if (adjustForm.type === 'in') newStock += qty;
      else if (adjustForm.type === 'out') newStock = Math.max(0, newStock - qty);
      else if (adjustForm.type === 'adjustment') newStock = qty;

      const res = await fetch(`/api/inventory/${selectedItem._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStock: newStock,
          transactionType: adjustForm.type,
          reason: adjustForm.reason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAdjustModal(false);
        setMessage(`Stock updated for ${selectedItem.name}`);
        setSelectedItem(null);
        setAdjustForm({ type: 'in', quantity: '', reason: '' });
        fetchInventory();
      }
    } catch (err) {
      console.error(err);
    }
    setAdjustLoading(false);
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.supplier?.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = items.filter(i => i.isLowStock).length;
  const totalValuation = items.reduce((acc, i) => acc + (i.currentStock * (i.costPerUnit || 0)), 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Inventory Management" subtitle="Track stock levels, consumables and orders" role={role} userName={userName} />

      <div className="p-6 flex-1 space-y-6 animate-fade-in">
        {message && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-card p-5 rounded-2xl flex items-center justify-between border border-white/5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Items</p>
              <h3 className="text-2xl font-bold text-white mt-1">{items.length}</h3>
              <p className="text-xs text-slate-500 mt-1">Across all categories</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between border border-white/5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Low Stock Alerts</p>
              <h3 className={`text-2xl font-bold mt-1 ${lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {lowStockCount}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Needs immediate reorder</p>
            </div>
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${lowStockCount > 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between border border-white/5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Estimated Value</p>
              <h3 className="text-2xl font-bold text-white mt-1">{formatCurrency(totalValuation)}</h3>
              <p className="text-xs text-slate-500 mt-1">Total current inventory asset</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 glass-card p-4 rounded-2xl border border-white/5">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search items by name or supplier..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-slate-900/60 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="">All Categories</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="grains">Grains & Pulses</option>
              <option value="dairy">Dairy</option>
              <option value="spices">Spices</option>
              <option value="oil">Oil</option>
              <option value="beverages">Beverages</option>
              <option value="other">Other</option>
            </select>

            <button
              onClick={() => setLowStockOnly(!lowStockOnly)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
                lowStockOnly
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                  : 'bg-slate-900/40 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Low Stock Only
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Add New Item
          </button>
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/40 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-5">Item Name</th>
                  <th className="py-4 px-5">Category</th>
                  <th className="py-4 px-5">Current Stock</th>
                  <th className="py-4 px-5">Min Stock</th>
                  <th className="py-4 px-5">Rate / Unit</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-slate-400">Loading inventory records...</td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-slate-400">No inventory items match your criteria.</td>
                  </tr>
                ) : (
                  filteredItems.map(item => (
                    <tr key={item._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5 font-semibold text-white">
                        {item.name}
                        {item.supplier && <p className="text-xs text-slate-500 font-normal">Supplier: {item.supplier}</p>}
                      </td>
                      <td className="py-4 px-5 capitalize text-slate-300">
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/80 text-slate-300 border border-white/5">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-medium text-white">
                        <span className="text-base">{item.currentStock}</span> <span className="text-xs text-slate-400">{item.unit}</span>
                      </td>
                      <td className="py-4 px-5 text-slate-400">
                        {item.minimumStock} {item.unit}
                      </td>
                      <td className="py-4 px-5 text-slate-300">
                        {item.costPerUnit ? `${formatCurrency(item.costPerUnit)} / ${item.unit}` : '—'}
                      </td>
                      <td className="py-4 px-5">
                        {item.isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowAdjustModal(true);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 transition-all"
                        >
                          Adjust Stock
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

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Add Inventory Item</h3>
            {addError && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">{addError}</div>}
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Item Name *</label>
                  <input
                    required
                    type="text"
                    value={addForm.name}
                    onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Potatoes"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Category</label>
                  <select
                    value={addForm.category}
                    onChange={e => setAddForm({ ...addForm, category: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="grains">Grains & Pulses</option>
                    <option value="dairy">Dairy</option>
                    <option value="spices">Spices</option>
                    <option value="oil">Oil</option>
                    <option value="beverages">Beverages</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Unit *</label>
                  <input
                    required
                    type="text"
                    value={addForm.unit}
                    onChange={e => setAddForm({ ...addForm, unit: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="kg, litre, bag"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    step="any"
                    value={addForm.currentStock}
                    onChange={e => setAddForm({ ...addForm, currentStock: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Min Threshold</label>
                  <input
                    type="number"
                    step="any"
                    value={addForm.minimumStock}
                    onChange={e => setAddForm({ ...addForm, minimumStock: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Cost / Unit (₹)</label>
                  <input
                    type="number"
                    step="any"
                    value={addForm.costPerUnit}
                    onChange={e => setAddForm({ ...addForm, costPerUnit: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. 40"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Supplier</label>
                  <input
                    type="text"
                    value={addForm.supplier}
                    onChange={e => setAddForm({ ...addForm, supplier: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Local Farm Ltd"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
                >
                  {addLoading ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Adjust Stock: {selectedItem.name}</h3>
            <p className="text-xs text-slate-400">Current Stock: <strong className="text-white">{selectedItem.currentStock} {selectedItem.unit}</strong></p>

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Adjustment Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustForm({ ...adjustForm, type: 'in' })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 ${
                      adjustForm.type === 'in' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-slate-900/60 border-white/10 text-slate-400'
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" /> Received
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustForm({ ...adjustForm, type: 'out' })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 ${
                      adjustForm.type === 'out' ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-slate-900/60 border-white/10 text-slate-400'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" /> Used / Out
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustForm({ ...adjustForm, type: 'adjustment' })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 ${
                      adjustForm.type === 'adjustment' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-900/60 border-white/10 text-slate-400'
                    }`}
                  >
                    Exact Set
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {adjustForm.type === 'adjustment' ? 'New Total Stock Quantity' : 'Quantity to Add/Deduct'} ({selectedItem.unit}) *
                </label>
                <input
                  required
                  type="number"
                  step="any"
                  min="0"
                  value={adjustForm.quantity}
                  onChange={e => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. 25"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={adjustForm.reason}
                  onChange={e => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Weekly procurement delivery, dinner prep"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
                >
                  {adjustLoading ? 'Saving...' : 'Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
