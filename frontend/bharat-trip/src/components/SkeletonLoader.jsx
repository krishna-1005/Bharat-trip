import React from 'react';
import './skeletonLoader.css';

/**
 * SkeletonLoader Component
 * Mimics the premium itinerary layout with shimmer effects.
 */
const SkeletonLoader = () => {
  const skeletonStops = [1, 2, 3]; // Show 3 skeleton stops per day

  return (
    <div className="skeleton-itinerary">
      {/* Header Skeleton */}
      <div className="skeleton-header">
        <div className="skeleton-line title"></div>
        <div className="skeleton-line subtitle"></div>
      </div>

      {/* Stats Skeleton */}
      <div className="skeleton-stats-box shimmer"></div>

      {/* Day Section Skeleton */}
      <div className="skeleton-day-section">
        <div className="skeleton-day-title shimmer"></div>
        
        <div className="skeleton-stops-list">
          {skeletonStops.map((_, i) => (
            <div key={i} className="skeleton-stop-card">
              <div className="skeleton-image shimmer"></div>
              <div className="skeleton-info">
                <div className="skeleton-line meta shimmer"></div>
                <div className="skeleton-line heading shimmer"></div>
                <div className="skeleton-line detail shimmer"></div>
                <div className="skeleton-line text shimmer"></div>
                <div className="skeleton-actions">
                  <div className="skeleton-btn shimmer"></div>
                  <div className="skeleton-btn shimmer"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
