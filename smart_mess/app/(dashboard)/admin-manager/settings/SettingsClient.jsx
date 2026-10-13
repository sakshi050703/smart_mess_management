'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import { Settings, Shield, Bell, CheckCircle2, Clock } from 'lucide-react';

export default function SettingsClient({ userName, role }) {
  const [messName, setMessName] = useState('Smart Campus Mess');
  const [breakfastCutoff, setBreakfastCutoff] = useState('06:30');
  const [lunchCutoff, setLunchCutoff] = useState('11:00');
  const [dinnerCutoff, setDinnerCutoff] = useState('18:00');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Mess Settings & Configuration" subtitle="General operation parameters, cutoffs and rules" role={role} userName={userName} />

      <div className="p-6 flex-1 space-y-6 max-w-4xl mx-auto w-full animate-fade-in">
        {saved && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-400" />
              General Organization
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Mess Name</label>
                <input
                  type="text"
                  value={messName}
                  onChange={e => setMessName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Meal Booking Cutoff Times
            </h3>
            <p className="text-xs text-slate-400">Students cannot skip or book meals after these cutoff times on the day of the meal.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Breakfast Cutoff</label>
                <input
                  type="time"
                  value={breakfastCutoff}
                  onChange={e => setBreakfastCutoff(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Lunch Cutoff</label>
                <input
                  type="time"
                  value={lunchCutoff}
                  onChange={e => setLunchCutoff(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Dinner Cutoff</label>
                <input
                  type="time"
                  value={dinnerCutoff}
                  onChange={e => setDinnerCutoff(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
