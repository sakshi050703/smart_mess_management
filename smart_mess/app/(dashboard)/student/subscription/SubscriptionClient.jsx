'use client';

import { useState, useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Calendar, Check, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export default function SubscriptionClient({ userName, role }) {
  const [data, setData] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashRes, plansRes] = await Promise.all([
          fetch('/api/dashboard/student'),
          fetch('/api/meal-plans?activeOnly=true'),
        ]);
        const dashData = await dashRes.json();
        const plansData = await plansRes.json();
        if (dashData.success) setData(dashData.data);
        if (plansData.success) setAvailablePlans(plansData.data.mealPlans);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const sub = data?.activeSubscription;

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="My Subscription" subtitle="Active mess plan and membership details" role={role} userName={userName} />

      <div className="p-6 flex-1 space-y-8 max-w-5xl mx-auto w-full animate-fade-in">
        {/* Current Active Plan Banner */}
        {sub ? (
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-indigo-500/20 relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Active Subscription
                </span>
                <span className="text-xs text-slate-400">
                  Subscribed on {formatDate(sub.startDate)}
                </span>
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                  {sub.mealPlan?.name || 'Standard Mess Plan'}
                </h2>
                <p className="text-sm text-slate-300 mt-1">{sub.mealPlan?.description || 'Daily breakfast, lunch, and dinner'}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
                <div>
                  <p className="text-xs text-slate-400">Start Date</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{formatDate(sub.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">End Date</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{formatDate(sub.endDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Plan Rate</p>
                  <p className="text-sm font-semibold text-indigo-300 mt-0.5">{formatCurrency(sub.mealPlan?.priceInPaise || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Duration</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{sub.mealPlan?.durationDays || 30} Days</p>
                </div>
              </div>

              {/* Meals Included */}
              <div className="pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Meals Included in Plan:</p>
                <div className="flex flex-wrap gap-2">
                  {['breakfast', 'lunch', 'snacks', 'dinner'].map(meal => {
                    const isInc = sub.mealPlan?.includedMeals?.[meal];
                    return (
                      <span
                        key={meal}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize flex items-center gap-1.5 ${
                          isInc ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-900 text-slate-600 line-through'
                        }`}
                      >
                        {isInc && <Check className="w-3.5 h-3.5" />}
                        {meal}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 rounded-3xl border border-amber-500/20 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">No Active Subscription</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              You currently do not have an active mess plan. Please contact the mess manager to subscribe or renew your monthly plan.
            </p>
          </div>
        )}

        {/* Available Plans Catalog */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Available Mess Plans
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {availablePlans.map(plan => (
              <div key={plan._id} className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
                  <p className="text-2xl font-extrabold text-indigo-400 mt-3">{formatCurrency(plan.priceInPaise)}</p>
                  <p className="text-xs text-slate-500">Duration: {plan.durationDays} days</p>

                  <div className="mt-4 space-y-1.5">
                    {['breakfast', 'lunch', 'snacks', 'dinner'].map(meal => (
                      <div key={meal} className="flex items-center gap-2 text-xs">
                        {plan.includedMeals?.[meal] ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <span className="w-3.5 h-3.5 text-slate-600 text-center">✕</span>
                        )}
                        <span className={plan.includedMeals?.[meal] ? 'text-slate-200 capitalize' : 'text-slate-500 line-through capitalize'}>
                          {meal}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <span className="block text-center text-xs text-slate-400 py-1.5 rounded-lg bg-slate-900 border border-white/5">
                    Contact Mess Office to Enroll
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
