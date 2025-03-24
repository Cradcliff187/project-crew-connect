
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import SubcontractorDialog from '../SubcontractorDialog';
import useSubcontractorData from './useSubcontractorData';
import { getPaymentTermsLabel } from '../utils/performanceUtils';

// Import refactored components
import SubcontractorDetailHeader from './SubcontractorDetailHeader';
import SubcontractorDetailCard from './SubcontractorDetailCard';
import ContactInformationCard from './ContactInformationCard';
import FinancialInformationCard from './FinancialInformationCard';
import ComplianceInformationCard from './ComplianceInformationCard';
import RateInformationCard from './PerformanceMetricsCard';
import SpecialtiesSection from './SpecialtiesSection';
import AssociatedProjects from './AssociatedProjects';
import AssociatedWorkOrders from './AssociatedWorkOrders';
import NotesSection from './NotesSection';
import SubcontractorNotFoundView from './SubcontractorNotFoundView';
import SubcontractorLoadingView from './SubcontractorLoadingView';
import SubcontractorDocuments from './SubcontractorDocuments';

const SubcontractorDetailPage = () => {
  const { subcontractorId } = useParams<{ subcontractorId: string }>();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  // Use the custom hook to fetch subcontractor data
  const { 
    subcontractor, 
    loading, 
    specialtyIds, 
    projects, 
    workOrders, 
    loadingAssociations,
    fetchSubcontractor 
  } = useSubcontractorData(subcontractorId);
  
  const handleEdit = () => {
    if (subcontractor) {
      console.log('Opening edit dialog with data:', subcontractor);
      setEditDialogOpen(true);
    } else {
      toast({
        title: "Error",
        description: "Cannot edit - Subcontractor not found",
        variant: "destructive"
      });
    }
  };
  
  const handleSubcontractorUpdated = () => {
    console.log('Subcontractor updated, refreshing data...');
    fetchSubcontractor();
    
    toast({
      title: "Subcontractor Updated",
      description: "Subcontractor details have been updated successfully."
    });
  };
  
  if (loading) {
    return <SubcontractorLoadingView />;
  }
  
  if (!subcontractor) {
    return <SubcontractorNotFoundView />;
  }
  
  return (
    <PageTransition>
      <div className="container py-6 text-foreground">
        <SubcontractorDetailHeader 
          subcontractor={subcontractor} 
          loading={loading} 
          onEdit={handleEdit} 
        />
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Main Info Card */}
          <Card>
            <SubcontractorDetailCard subcontractor={subcontractor} />
            <CardContent>
              <div className="space-y-4">
                {subcontractor.tax_id && (
                  <div>
                    <p className="text-sm font-medium">Tax ID</p>
                    <p>{subcontractor.tax_id}</p>
                  </div>
                )}
                
                {subcontractor.payment_terms && (
                  <div>
                    <p className="text-sm font-medium">Payment Terms</p>
                    <p>{getPaymentTermsLabel(subcontractor.payment_terms)}</p>
                  </div>
                )}
                
                {subcontractor.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium">Notes</p>
                      <p className="whitespace-pre-wrap">{subcontractor.notes}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card>
            <CardContent className="pt-6">
              <ContactInformationCard subcontractor={subcontractor} />
            </CardContent>
          </Card>
        </div>
        
        {/* Compliance Information */}
        <div className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <ComplianceInformationCard subcontractor={subcontractor} />
            </CardContent>
          </Card>
        </div>
        
        {/* Associated Projects & Work Orders */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <AssociatedProjects 
                projects={projects} 
                loading={loadingAssociations} 
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <AssociatedWorkOrders 
                workOrders={workOrders} 
                loading={loadingAssociations} 
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Specialties */}
        {subcontractor.specialty_ids && subcontractor.specialty_ids.length > 0 && (
          <div className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <SpecialtiesSection 
                  subcontractor={subcontractor} 
                  specialtyIds={specialtyIds} 
                />
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Documents Section */}
        <div className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <SubcontractorDocuments subcontractorId={subcontractor.subid} />
            </CardContent>
          </Card>
        </div>
        
        {/* Edit Subcontractor Dialog */}
        {subcontractor && (
          <SubcontractorDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSubcontractorAdded={handleSubcontractorUpdated}
            initialData={subcontractor}
            isEditing={true}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default SubcontractorDetailPage;
