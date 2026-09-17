import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ratingService, type ChronaFeatureId, type FeatureRatingStats, INITIAL_FEATURE_CONFIGS } from '../../services/ratingService';
import { FeatureRatingModal } from './FeatureRatingModal';

interface FeatureRatingBadgeProps {
  featureId: ChronaFeatureId;
  featureName?: string;
  variant?: 'compact' | 'standard' | 'pill' | 'stars';
  className?: string;
  showRateLabel?: boolean;
}

export const FeatureRatingBadge: React.FC<FeatureRatingBadgeProps> = ({
  featureId,
  featureName,
  variant = 'compact',
  className = '',
  showRateLabel = false
}) => {
  const { currentUser } = useAuth();
  const config = INITIAL_FEATURE_CONFIGS[featureId] || {
    featureId,
    name: featureName || featureId,
    defaultRating: 4.5
  };

  const [stats, setStats] = useState<FeatureRatingStats>({
    featureId,
    name: config.name,
    averageRating: config.defaultRating,
    totalRatings: 0,
    hasUserRated: false
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadStats = () => {
      ratingService.getFeatureRating(featureId, currentUser?.id).then(res => {
        if (isMounted) setStats(res);
      });
    };

    loadStats();
    const unsubscribe = ratingService.subscribe(loadStats);

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [featureId, currentUser]);

  const ratingDisplay = stats.averageRating.toFixed(1);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsModalOpen(true);
        }}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-900/90 hover:bg-slate-850 border border-slate-800/80 hover:border-amber-500/40 text-[11px] font-mono transition-all cursor-pointer group shadow-sm ${className}`}
        title={stats.hasUserRated ? `Your rating: ⭐ ${stats.userRating}/5 (Click to update)` : `Rating: ⭐ ${ratingDisplay}/5 (Click to rate)`}
      >
        <Star className="w-3 h-3 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform shrink-0" />
        
        {variant === 'compact' && (
          <span className="text-amber-300 font-bold tracking-tight">
            {ratingDisplay}
          </span>
        )}

        {variant === 'standard' && (
          <span className="text-amber-300 font-bold tracking-tight">
            {ratingDisplay}<span className="text-slate-500 font-normal text-[10px]">/5</span>
          </span>
        )}

        {variant === 'pill' && (
          <span className="flex items-center gap-1">
            <span className="text-amber-300 font-bold">{ratingDisplay}</span>
            <span className="text-slate-500 text-[10px]">/5</span>
            {stats.hasUserRated && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" title="Rated by you" />
            )}
          </span>
        )}

        {variant === 'stars' && (
          <span className="flex items-center gap-1 text-[10px]">
            <span className="text-amber-400 font-bold">★★★★★</span>
            <span className="text-amber-300 font-bold">{ratingDisplay}</span>
          </span>
        )}

        {showRateLabel && (
          <span className="text-[10px] text-slate-400 group-hover:text-indigo-300 ml-0.5 border-l border-slate-800 pl-1.5">
            {stats.hasUserRated ? 'Rated' : 'Rate'}
          </span>
        )}
      </button>

      {isModalOpen && (
        <FeatureRatingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          featureId={featureId}
          featureName={featureName || config.name}
          onRatingSubmitted={(newStats) => setStats(newStats)}
        />
      )}
    </>
  );
};
