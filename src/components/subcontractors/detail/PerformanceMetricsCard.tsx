
import React from 'react';
import { Star, Clock, Award, AlertTriangle } from 'lucide-react';
import { Subcontractor } from '../utils/types';

interface PerformanceMetricsCardProps {
  subcontractor: Subcontractor;
}

const PerformanceMetricsCard = ({ subcontractor }: PerformanceMetricsCardProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Performance Metrics</h3>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          {subcontractor.rating !== null && subcontractor.rating !== undefined && (
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              <span>Rating: {subcontractor.rating} / 5</span>
            </div>
          )}
          {subcontractor.last_performance_review && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Last Review: {new Date(subcontractor.last_performance_review).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          {subcontractor.hourly_rate !== null && subcontractor.hourly_rate !== undefined && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span>Hourly Rate: ${subcontractor.hourly_rate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetricsCard;
