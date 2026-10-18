'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatDate } from '@/lib/utils';
import { Star, MessageSquare, Reply, CheckCircle2, MessageCircle, Filter } from 'lucide-react';

export default function FeedbackClient({ userName, role }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    let url = `/api/feedback?`;
    if (ratingFilter) url += `rating=${ratingFilter}&`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.data.feedback);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [ratingFilter]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!selectedFeedback) return;
    setReplyLoading(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackId: selectedFeedback._id,
          managerResponse: replyText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedFeedback(null);
        setReplyText('');
        setMessage('Reply posted to student successfully.');
        fetchFeedback();
      }
    } catch (err) {
      console.error(err);
    }
    setReplyLoading(false);
  };

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : '0.0';

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Student Feedback" subtitle="Review satisfaction ratings and answer meal suggestions" role={role} userName={userName} />

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

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average Student Rating</p>
              <div className="flex items-center gap-2 mt-1">
                <h3 className="text-3xl font-extrabold text-amber-400">{avgRating}</h3>
                <span className="text-sm text-slate-400">/ 5.0</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Star className="w-6 h-6 fill-amber-400" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Reviews Received</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{feedbacks.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 rounded-2xl border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={ratingFilter}
              onChange={e => setRatingFilter(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars Only</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          <span className="text-xs text-slate-400">Showing {feedbacks.length} feedback items</span>
        </div>

        {/* Feedback Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 text-center py-12 text-slate-400">Loading student feedback...</div>
          ) : feedbacks.length === 0 ? (
            <div className="col-span-2 glass-card p-12 rounded-2xl border border-white/5 text-center text-slate-400">
              No feedback entries found.
            </div>
          ) : (
            feedbacks.map(f => (
              <div key={f._id} className="glass-card p-5 rounded-2xl border border-white/5 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-4 h-4 ${star <= f.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 font-medium capitalize">
                      {f.mealType || 'General'} • {formatDate(f.date || f.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm text-slate-200">{f.comment || 'No comment text provided.'}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    By: <strong className="text-slate-400">{f.student?.name || 'Student'}</strong> ({f.student?.studentId || 'ID'})
                  </p>

                  {f.managerResponse && (
                    <div className="mt-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-300 space-y-1">
                      <p className="font-semibold flex items-center gap-1.5 text-indigo-200">
                        <MessageCircle className="w-3.5 h-3.5" /> Response from {f.respondedBy?.name || 'Manager'}:
                      </p>
                      <p className="text-slate-300">{f.managerResponse}</p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-white/5 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedFeedback(f);
                      setReplyText(f.managerResponse || '');
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5 transition-all"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    {f.managerResponse ? 'Edit Reply' : 'Reply'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Reply className="w-5 h-5 text-indigo-400" />
              Reply to Feedback
            </h3>

            <p className="text-xs text-slate-400">
              Student comment: &quot;<span className="text-white italic">{selectedFeedback.comment}</span>&quot;
            </p>

            <form onSubmit={handleReply} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Your Response *</label>
                <textarea
                  required
                  rows={4}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Thank the student or explain action taken..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFeedback(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replyLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
                >
                  {replyLoading ? 'Posting...' : 'Post Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
