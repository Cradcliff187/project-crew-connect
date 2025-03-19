
import { Subcontractor } from './types';

// Calculate status based on performance metrics
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

// Get the class names for performance indicators
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

// Calculate the overall vendor score (0-100)
export const calculateVendorScore = (subcontractor: Subcontractor): number | null => {
  // If essential metrics are missing, return null
  if (!subcontractor.rating && !subcontractor.on_time_percentage) {
    return null;
  }
  
  let totalScore = 0;
  let weightSum = 0;
  
  // Quality Rating (scale 0-5) - 40% weight
  if (subcontractor.rating !== null && subcontractor.rating !== undefined) {
    totalScore += (subcontractor.rating / 5) * 100 * 0.4;
    weightSum += 0.4;
  }
  
  // On-time percentage - 30% weight
  if (subcontractor.on_time_percentage !== null && subcontractor.on_time_percentage !== undefined) {
    totalScore += subcontractor.on_time_percentage * 0.3;
    weightSum += 0.3;
  }
  
  // Response time (inversely proportional) - 15% weight
  if (subcontractor.response_time_hours !== null && subcontractor.response_time_hours !== undefined) {
    // Convert response time to a 0-100 scale (assuming 48 hours is 0%, 1 hour is 100%)
    const responseScore = Math.max(0, Math.min(100, 100 - ((subcontractor.response_time_hours - 1) / 47 * 100)));
    totalScore += responseScore * 0.15;
    weightSum += 0.15;
  }
  
  // Safety (inversely proportional to incidents) - 15% weight
  if (subcontractor.safety_incidents !== null && subcontractor.safety_incidents !== undefined) {
    // Convert safety incidents to a 0-100 scale (0 incidents is 100%, 5+ incidents is 0%)
    const safetyScore = Math.max(0, 100 - (subcontractor.safety_incidents * 20));
    totalScore += safetyScore * 0.15;
    weightSum += 0.15;
  }
  
  // If we don't have enough data, return null
  if (weightSum < 0.5) {
    return null;
  }
  
  // Normalize the score based on available metrics
  return Math.round(totalScore / weightSum);
};
