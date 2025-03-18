
import React from 'react';
import { Star, Clock, Award, AlertTriangle } from 'lucide-react';
import { calculateVendorScore, Subcontractor } from '../utils/subcontractorUtils';
import VendorScoreBadge from '../VendorScoreBadge';

interface PerformanceMetricsCardProps {
  subcontractor: Subcontractor;
}

const PerformanceMetricsCard = ({ subcontractor }: PerformanceMetricsCardProps) => {
  // Calculate vendor score
  const vendorScore = calculateVendorScore(subcontractor);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Performance Metrics</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Overall Score:</span>
          <VendorScoreBadge score={vendorScore} showText={true} size="lg" />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          {subcontractor.rating !== null && subcontractor.rating !== undefined && (
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              <span>Rating: {subcontractor.rating} / 5</span>
            </div>
          )}
          {subcontractor.on_time_percentage !== null && subcontractor.on_time_percentage !== undefined && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>On-time: {subcontractor.on_time_percentage}%</span>
            </div>
          )}
          {subcontractor.quality_score !== null && subcontractor.quality_score !== undefined && (
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span>Quality Score: {subcontractor.quality_score} / 100</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          {subcontractor.safety_incidents !== null && subcontractor.safety_incidents !== undefined && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span>Safety Incidents: {subcontractor.safety_incidents}</span>
            </div>
          )}
          {subcontractor.response_time_hours !== null && subcontractor.response_time_hours !== undefined && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Avg. Response Time: {subcontractor.response_time_hours} hrs</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetricsCard;
