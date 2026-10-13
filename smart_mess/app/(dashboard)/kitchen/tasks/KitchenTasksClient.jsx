'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import { CheckSquare, Square, CheckCircle2, Clock, Sparkles } from 'lucide-react';

const defaultTasks = [
  { id: 1, title: 'Morning Kitchen Disinfection & Counter Wipe-down', category: 'Hygiene', time: '06:00 AM', done: true },
  { id: 2, title: 'Breakfast Prep & Tea/Coffee Station Setup', category: 'Cooking', time: '06:30 AM', done: true },
  { id: 3, title: 'Inspect Refrigerator & Cold Storage Temperatures (< 4°C)', category: 'Safety', time: '08:30 AM', done: false },
  { id: 4, title: 'Receive & Verify Daily Fresh Vegetables Procurement', category: 'Inventory', time: '09:30 AM', done: false },
  { id: 5, title: 'Lunch Dal, Rice, and Sabzi Cooking Shift', category: 'Cooking', time: '10:30 AM', done: false },
  { id: 6, title: 'Post-Lunch Dish Sanitization & Floor Mopping', category: 'Hygiene', time: '03:00 PM', done: false },
  { id: 7, title: 'Evening Snacks & Tea Prep', category: 'Cooking', time: '04:30 PM', done: false },
  { id: 8, title: 'Dinner Roti/Curry Preparation Shift', category: 'Cooking', time: '06:30 PM', done: false },
  { id: 9, title: 'Night Leftover Weighing & Wastage Log Submission', category: 'Waste', time: '10:00 PM', done: false },
  { id: 10, title: 'Kitchen Deep Clean, Gas Valve Shutoff & Waste Disposal', category: 'Safety', time: '10:30 PM', done: false },
];

export default function KitchenTasksClient({ userName, role }) {
  const [tasks, setTasks] = useState(defaultTasks);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const completed = tasks.filter(t => t.done).length;
  const progressPercent = Math.round((completed / tasks.length) * 100);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Kitchen Routine Tasks & Checklist" subtitle="Daily operations, sanitation and cooking protocols" role={role} userName={userName} />

      <div className="p-6 flex-1 space-y-6 max-w-4xl mx-auto w-full animate-fade-in">
        {/* Progress Card */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Today&apos;s Checklist Progress</h3>
              <p className="text-xs text-slate-400">Complete standard operating procedures across shifts</p>
            </div>
            <span className="text-xl font-extrabold text-emerald-400">{progressPercent}% Done</span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">{completed} of {tasks.length} tasks completed</p>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {tasks.map(task => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`glass-card p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                task.done ? 'border-emerald-500/20 bg-emerald-500/[0.03]' : 'border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`p-1 rounded-lg ${task.done ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {task.done ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                </div>

                <div>
                  <h4 className={`text-sm font-semibold transition-colors ${task.done ? 'text-slate-400 line-through' : 'text-white'}`}>
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {task.category}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" /> {task.time}
                    </span>
                  </div>
                </div>
              </div>

              {task.done && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Done
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
