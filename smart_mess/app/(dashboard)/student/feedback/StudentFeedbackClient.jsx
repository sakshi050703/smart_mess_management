'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatDate } from '@/lib/utils';
import { Star, MessageSquare, Send, CheckCircle2, MessageCircle } from 'lucide-react';

export default function StudentFeedbackClient({ userName, role }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [mealType, setMealType] = useState('lunch');
  const [category, setCategory] = useState('food_quality');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/feedback');
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.data.feedback);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          mealType,
          category,
          comment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Thank you! Your feedback has been submitted to the mess management.');
        setComment('');
        fetchFeedback();
      } else {
        setMessage(data.message || 'Submission failed');
      }
    } catch (err) {
      setMessage('Failed to submit feedback');
    }
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Mess Feedback" subtitle="Share your thoughts on food quality and mess service" role={role} userName={userName} />

      <div className="p-6 flex-1 space-y-8 max-w-5xl mx-auto w-full animate-fade-in">
        {message && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        {/* Submit Feedback Card */}
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Leave Meal Feedback</h3>
              <p className="text-xs text-slate-400">Rate today&apos;s meal and suggest improvements</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-2xl transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star className={`w-7 h-7 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                  </button>
                ))}
                <span className="text-sm font-semibold text-amber-400 ml-2">{rating} / 5 Stars</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Meal Type</label>
                <select
                  value={mealType}
                  onChange={e => setMealType(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="snacks">Evening Snacks</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="food_quality">Food Taste & Quality</option>
                  <option value="cleanliness">Hygiene & Cleanliness</option>
                  <option value="service">Service & Staff</option>
                  <option value="portion">Portion Size</option>
                  <option value="variety">Menu Variety</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Your Comments & Suggestions</label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="What did you like or what could be improved?"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>

        {/* Previous Feedback List */}
        <div className="space-y-4">
          <h3 className="font-bold text-white text-base">Your Previous Feedback & Manager Replies</h3>

          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading your feedback...</div>
          ) : feedbacks.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl border border-white/5 text-center text-slate-400 text-sm">
              You haven&apos;t submitted any feedback yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbacks.map(f => (
                <div key={f._id} className="glass-card p-5 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-4 h-4 ${star <= f.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 font-medium capitalize">{f.mealType} • {formatDate(f.date)}</span>
                  </div>

                  <p className="text-sm text-slate-200">{f.comment}</p>

                  {f.managerResponse && (
                    <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-300 space-y-1">
                      <p className="font-semibold flex items-center gap-1.5 text-indigo-200">
                        <MessageCircle className="w-3.5 h-3.5" /> Mess Manager Reply:
                      </p>
                      <p className="text-slate-300">{f.managerResponse}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
