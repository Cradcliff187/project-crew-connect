
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BarChart3, ExternalLink, Download } from 'lucide-react';
import ProjectFinancialReport from '@/components/reports/ProjectFinancialReport';
import { exportProjectFinancialPDF } from '@/components/reports/utils/pdfExport';
import { useToast } from '@/hooks/use-toast';

interface ProjectFinancialReportCardProps {
  projectId: string;
}

const ProjectFinancialReportCard: React.FC<ProjectFinancialReportCardProps> = ({ projectId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showReportDialog, setShowReportDialog] = useState(false);

  const handleOpenFullReport = () => {
    navigate(`/reports?project=${projectId}`);
  };

  const handleQuickExportPDF = () => {
    // We'll implement a simple toast notification since the actual PDF generation happens in the report component
    toast({
      title: "Preparing PDF export",
      description: "Open full report for more export options",
    });
    
    // Navigate to the full report with export intent
    navigate(`/reports?project=${projectId}&action=export`);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Financial Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-4">
            <BarChart3 className="h-8 w-8 text-[#0485ea] mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              View detailed financial analysis for this project
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowReportDialog(true)}
              >
                Quick View
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleQuickExportPDF}
              >
                <Download className="h-4 w-4 mr-1" />
                Export PDF
              </Button>
              <Button 
                size="sm" 
                className="bg-[#0485ea] hover:bg-[#0375d1]"
                onClick={handleOpenFullReport}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Full Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Financial Summary</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <ProjectFinancialReport projectId={projectId} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectFinancialReportCard;
