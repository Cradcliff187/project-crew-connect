
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { EstimateRevision } from '../types/estimateTypes';
import EstimateRevisionTimeline from './EstimateRevisionTimeline';
import EstimateRevisionSummary from './EstimateRevisionSummary';

interface CompactEstimateSidebarProps {
  estimate: {
    estimateid: string;
    customername?: string;
    contactemail?: string;
    status: string;
  };
  revisions: EstimateRevision[];
  currentRevisionId?: string;
  onRevisionSelect: (id: string) => void;
}

/**
 * CompactEstimateSidebar displays a condensed view of estimate information and revision timeline
 * for use in the estimate detail page sidebar
 */
const CompactEstimateSidebar: React.FC<CompactEstimateSidebarProps> = ({
  estimate,
  revisions,
  currentRevisionId,
  onRevisionSelect
}) => {
  const currentRevision = revisions.find(rev => rev.id === currentRevisionId);
  
  // Get previous revision for comparison
  const getPreviousRevision = () => {
    if (!currentRevision) return null;
    
    const sortedRevisions = [...revisions].sort((a, b) => a.version - b.version);
    const currentIndex = sortedRevisions.findIndex(r => r.id === currentRevisionId);
    
    if (currentIndex <= 0) return null;
    return sortedRevisions[currentIndex - 1];
  };
  
  const previousRevision = getPreviousRevision();
  
  return (
    <div className="space-y-4">
      {/* Current Revision Summary */}
      {currentRevision && (
        <Card className="bg-[#0485ea]/5 border-[#0485ea]/20">
          <CardContent className="p-4">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Current Revision</h3>
              <EstimateRevisionSummary 
                revision={currentRevision} 
                previousRevision={previousRevision} 
              />
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Timeline */}
      <Card>
        <CardContent className="p-4">
          <EstimateRevisionTimeline
            revisions={revisions}
            currentRevisionId={currentRevisionId}
            onSelectRevision={onRevisionSelect}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CompactEstimateSidebar;
