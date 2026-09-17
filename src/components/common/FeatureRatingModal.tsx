import React, { useState, useEffect } from 'react';
import { Star, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ratingService, type ChronaFeatureId, type FeatureRatingStats, INITIAL_FEATURE_CONFIGS } from '../../services/ratingService';

interface FeatureRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureId: ChronaFeatureId;
  featureName?: string;
  onRatingSubmitted?: (newStats: FeatureRatingStats) => void;
}

export const FeatureRatingModal: React.FC<FeatureRatingModalProps> = ({
  isOpen,
  onClose,
  featureId,
  featureName,
  onRatingSubmitted
}) => {
  const { currentUser } = useAuth();
  const displayName = featureName || INITIAL_FEATURE_CONFIGS[featureId]?.name || featureId;

  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [existingUserRating, setExistingUserRating] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setHasSubmitted(false);
      setErrorMessage(null);
      ratingService.getFeatureRating(featureId, currentUser?.id).then(stats => {
        if (stats.userRating) {
          setSelectedRating(stats.userRating);
          setExistingUserRating(stats.userRating);
        } else {
          setSelectedRating(5);
          setExistingUserRating(null);
        }
        if (stats.userFeedback) {
          setFeedback(stats.userFeedback);
        } else {
          setFeedback('');
        }
      });
    }
  }, [isOpen, featureId, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await ratingService.submitRating(
        featureId,
        selectedRating,
        feedback,
        currentUser?.id || 'guest'
      );

      if (res.success) {
        setHasSubmitted(true);
        if (onRatingSubmitted) {
          onRatingSubmitted(res.stats);
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMessage("Couldn't save your rating. Please try again.");
      }
    } catch {
      setErrorMessage("Couldn't save your rating. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md p-6 rounded-3xl bg-slate-950 border border-indigo-500/30 shadow-2xl shadow-indigo-950/50 space-y-5">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>RATE THIS FEATURE</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {hasSubmitted ? (
          <div className="py-8 text-center space-y-3 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Thank you for your feedback!</h3>
            <p className="text-xs text-slate-400 font-mono">
              Thanks for rating <strong className="text-indigo-300">{displayName}</strong>. Your rating has been updated.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-white">How would you rate {displayName}?</h3>
              <p className="text-xs text-slate-400">
                {existingUserRating
                  ? `Your current rating: ⭐ ${existingUserRating}/5 (Select below to update)`
                  : 'Select your rating from 1 to 5 stars'}
              </p>
            </div>

            {/* INTERACTIVE STAR PICKER */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isFilled = (hoverRating !== null ? hoverRating : selectedRating) >= starValue;
                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setSelectedRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1.5 rounded-xl hover:bg-slate-900 transition-all cursor-pointer transform hover:scale-110"
                    title={`${starValue} Star${starValue > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        isFilled
                          ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                          : 'text-slate-700 hover:text-slate-500'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="text-center font-mono text-xs font-bold text-amber-300">
              {hoverRating !== null ? `${hoverRating}.0 / 5.0` : `${selectedRating}.0 / 5.0`}
            </div>

            {/* OPTIONAL FEEDBACK */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] font-mono text-slate-400">
                Tell us what you think (Optional):
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What did you like or what can we improve?..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs cursor-pointer shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Rating...</span>
                </>
              ) : (
                <span>{existingUserRating ? 'Update Rating 🌟' : 'Submit Rating 🌟'}</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
