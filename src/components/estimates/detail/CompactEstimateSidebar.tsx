
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { MapPin, User, Mail, Calendar, FileText } from 'lucide-react';
import { EstimateRevision } from '../types/estimateTypes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EstimateRevisionTimeline from './EstimateRevisionTimeline';
import RevisionComparison from './RevisionComparison';

interface CompactEstimateSidebarProps {
  estimate: {
    estimateid: string;
    customerid?: string;
    customername?: string;
    contactemail?: string;
    status: string;
    datecreated?: string;
    estimateamount: number;
    sitelocationaddress?: string;
    sitelocationcity?: string;
    sitelocationstate?: string;
    sitelocationzip?: string;
    projectid?: string;
    projectname?: string;
  };
  revisions: EstimateRevision[];
  currentRevisionId?: string;
  onRevisionSelect: (revisionId: string) => void;
}

const CompactEstimateSidebar: React.FC<CompactEstimateSidebarProps> = ({ 
  estimate, 
  revisions,
  currentRevisionId,
  onRevisionSelect
}) => {
  // Helper to get status color
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-300';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'converted': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Helper to format address
  const formatAddress = () => {
    const address = [];
    
    if (estimate.sitelocationaddress) 
      address.push(estimate.sitelocationaddress);
    
    const cityStateZip = [
      estimate.sitelocationcity,
      estimate.sitelocationstate,
      estimate.sitelocationzip
    ].filter(Boolean).join(', ');
    
    if (cityStateZip) address.push(cityStateZip);
    
    return address.join(', ') || 'No location specified';
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">Overview</div>
            <Badge variant="outline" className={`${getStatusColor(estimate.status)}`}>
              {estimate.status.toUpperCase()}
            </Badge>
          </div>
          
          <div className="space-y-4 mb-3">
            <div>
              <div className="text-sm text-muted-foreground">Amount</div>
              <div className="text-lg font-bold mb-1">
                {formatCurrency(estimate.estimateamount)}
              </div>
            </div>
            
            <div className="space-y-2.5">
              {estimate.customername && (
                <div className="flex items-start text-sm">
                  <User className="h-3.5 w-3.5 mt-0.5 text-muted-foreground mr-2 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="truncate">{estimate.customername}</div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{estimate.customername}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="text-xs text-muted-foreground">Customer</div>
                  </div>
                </div>
              )}
              
              {estimate.contactemail && (
                <div className="flex items-start text-sm">
                  <Mail className="h-3.5 w-3.5 mt-0.5 text-muted-foreground mr-2 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="truncate">{estimate.contactemail}</div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{estimate.contactemail}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="text-xs text-muted-foreground">Contact Email</div>
                  </div>
                </div>
              )}
              
              {estimate.projectname && (
                <div className="flex items-start text-sm">
                  <FileText className="h-3.5 w-3.5 mt-0.5 text-muted-foreground mr-2 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="truncate">{estimate.projectname}</div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{estimate.projectname}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="text-xs text-muted-foreground">Project</div>
                  </div>
                </div>
              )}
              
              {estimate.datecreated && (
                <div className="flex items-start text-sm">
                  <Calendar className="h-3.5 w-3.5 mt-0.5 text-muted-foreground mr-2 flex-shrink-0" />
                  <div>
                    <div>{formatDate(estimate.datecreated)}</div>
                    <div className="text-xs text-muted-foreground">Date Created</div>
                  </div>
                </div>
              )}
              
              {(estimate.sitelocationaddress || estimate.sitelocationcity) && (
                <div className="flex items-start text-sm">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground mr-2 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="truncate">{formatAddress()}</div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{formatAddress()}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="text-xs text-muted-foreground">Location</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="comparison">Compare</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="mt-3">
          <Card>
            <CardContent className="p-4">
              <EstimateRevisionTimeline
                revisions={revisions}
                currentRevisionId={currentRevisionId}
                onSelectRevision={onRevisionSelect}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="comparison" className="mt-3">
          {currentRevisionId && (
            <RevisionComparison
              estimateId={estimate.estimateid}
              currentRevisionId={currentRevisionId}
              revisions={revisions}
              onRevisionSelect={onRevisionSelect}
            />
          )}
        </TabsContent>
      </Tabs>
    </>
  );
};

export default CompactEstimateSidebar;
