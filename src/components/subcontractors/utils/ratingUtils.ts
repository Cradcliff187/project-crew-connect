
import { Subcontractor } from './types';

/**
 * Get subcontractor rating display
 */
export const getRatingDisplay = (rating: number | null): string => {
  if (rating === null) return 'Not Rated';
  
  const stars = '★'.repeat(Math.floor(rating));
  const remainder = rating % 1;
  const halfStar = remainder >= 0.5 ? '½' : '';
  
  return `${stars}${halfStar} (${rating})`;
};

/**
 * Calculate status based on performance metrics
 */
export const calculateStatusFromPerformance = (
  onTimePercentage: number, 
  qualityRating: number
): string => {
  if (onTimePercentage > 90 && qualityRating >= 4.5) {
    return 'PREFERRED';
  } else if (onTimePercentage > 75 && qualityRating >= 3.5) {
    return 'QUALIFIED';
  } else if (onTimePercentage > 60 && qualityRating >= 2.5) {
    return 'ACTIVE';
  } else {
    return 'REVIEW_NEEDED';
  }
};

/**
 * Get the class names for performance indicators
 */
export const getPerformanceIndicatorClass = (value: number | null, thresholds: { good: number, average: number }): string => {
  if (value === null) return 'text-gray-400';
  
  if (value >= thresholds.good) {
    return 'text-green-500';
  } else if (value >= thresholds.average) {
    return 'text-amber-500';
  } else {
    return 'text-red-500';
  }
};
