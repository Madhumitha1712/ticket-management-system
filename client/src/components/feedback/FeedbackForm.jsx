import React, { useState } from 'react';
import { Star, Send, CheckCircle2 } from 'lucide-react';
import { feedbackService } from '../../services/index.js';

export const FeedbackForm = ({ ticketId, existingFeedback, onFeedbackSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedFeedback, setSubmittedFeedback] = useState(existingFeedback || null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await feedbackService.submitFeedback({
        ticketId,
        rating,
        comment,
      });
      setSubmittedFeedback(result);
      if (onFeedbackSubmitted) onFeedbackSubmitted(result);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  if (submittedFeedback) {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Resolution Feedback Submitted</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= submittedFeedback.rating
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
        {submittedFeedback.comment && (
          <p className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
            "{submittedFeedback.comment}"
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700">
          Rate Support Experience
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">
          How satisfied are you with the resolution of this support ticket?
        </p>
      </div>

      {error && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Interactive Star Picker */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 text-slate-300 hover:scale-110 transition-transform focus:outline-none cursor-pointer"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= (hoverRating || rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-bold text-slate-800 ml-2">
            {rating === 5 && '🌟 Excellent (5/5)'}
            {rating === 4 && '👍 Good (4/5)'}
            {rating === 3 && '😐 Average (3/5)'}
            {rating === 2 && '👎 Poor (2/5)'}
            {rating === 1 && '⚠️ Very Unsatisfied (1/5)'}
          </span>
        </div>

        <div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share any comments or feedback regarding the support service (optional)..."
            rows={2}
            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-xs"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loading ? 'Submitting...' : 'Submit Review'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;
