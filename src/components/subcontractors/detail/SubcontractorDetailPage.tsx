
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import SubcontractorDialog from '../SubcontractorDialog';
import useSubcontractorData from './useSubcontractorData';

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
      <div className="container max-w-4xl mx-auto py-6 text-foreground">
        <SubcontractorDetailHeader 
          subcontractor={subcontractor} 
          loading={loading} 
          onEdit={handleEdit} 
        />
        
        <Card className="mb-6">
          <SubcontractorDetailCard subcontractor={subcontractor} />
          
          <div className="px-6 pt-0 pb-6 grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <ContactInformationCard subcontractor={subcontractor} />
              
              {/* Financial Information */}
              <FinancialInformationCard subcontractor={subcontractor} />
            </div>
            
            <Separator />
            
            {/* Associated Data Section */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Associated Projects Section */}
              <AssociatedProjects 
                projects={projects} 
                loading={loadingAssociations} 
              />
              
              {/* Associated Work Orders Section */}
              <AssociatedWorkOrders 
                workOrders={workOrders} 
                loading={loadingAssociations} 
              />
            </div>
            
            <Separator />
            
            {/* Compliance Information */}
            <ComplianceInformationCard subcontractor={subcontractor} />
            
            {/* Rate Information (only if hourly_rate exists) */}
            {subcontractor.hourly_rate && (
              <>
                <Separator />
                <RateInformationCard subcontractor={subcontractor} />
              </>
            )}
            
            {/* Specialties */}
            {subcontractor.specialty_ids && subcontractor.specialty_ids.length > 0 && (
              <>
                <Separator />
                <SpecialtiesSection 
                  subcontractor={subcontractor} 
                  specialtyIds={specialtyIds} 
                />
              </>
            )}
            
            {/* Notes */}
            {subcontractor.notes && (
              <>
                <Separator />
                <NotesSection notes={subcontractor.notes} />
              </>
            )}
            
            {/* Documents Section - Moved to bottom */}
            <Separator />
            <SubcontractorDocuments subcontractorId={subcontractor.subid} />
          </div>
        </Card>
        
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
