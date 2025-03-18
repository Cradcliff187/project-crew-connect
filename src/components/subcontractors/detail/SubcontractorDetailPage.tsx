
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import SubcontractorDialog from '../SubcontractorDialog';
import useSubcontractorData from './useSubcontractorData';

// Import refactored components
import SubcontractorDetailHeader from './SubcontractorDetailHeader';
import SubcontractorDetailCard from './SubcontractorDetailCard';
import ContactInformationCard from './ContactInformationCard';
import FinancialInformationCard from './FinancialInformationCard';
import ComplianceInformationCard from './ComplianceInformationCard';
import PerformanceMetricsCard from './PerformanceMetricsCard';
import SpecialtiesSection from './SpecialtiesSection';
import AssociatedProjectsCard from './AssociatedProjectsCard';
import WorkOrdersCard from './WorkOrdersCard';
import NotesSection from './NotesSection';
import SubcontractorNotFoundView from './SubcontractorNotFoundView';
import SubcontractorLoadingView from './SubcontractorLoadingView';

const SubcontractorDetailPage = () => {
  const { subcontractorId } = useParams<{ subcontractorId: string }>();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  console.log('SubcontractorDetailPage - Current subcontractorId:', subcontractorId);
  
  // Use the custom hook to fetch subcontractor data
  const { 
    subcontractor, 
    loading, 
    specialties, 
    projects, 
    workOrders, 
    loadingAssociations,
    fetchSubcontractor 
  } = useSubcontractorData(subcontractorId);
  
  const handleEdit = () => {
    console.log('Opening edit dialog with data:', subcontractor);
    setEditDialogOpen(true);
  };
  
  const handleSubcontractorUpdated = () => {
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
      <div className="container max-w-4xl mx-auto py-6">
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
            
            {/* Compliance Information */}
            <ComplianceInformationCard subcontractor={subcontractor} />
            
            <Separator />
            
            {/* Performance Metrics */}
            <PerformanceMetricsCard subcontractor={subcontractor} />
            
            {/* Specialties */}
            {subcontractor.specialty_ids && subcontractor.specialty_ids.length > 0 && (
              <>
                <Separator />
                <SpecialtiesSection 
                  subcontractor={subcontractor} 
                  specialties={specialties} 
                />
              </>
            )}

            {/* Associated Projects */}
            {projects.length > 0 && (
              <>
                <Separator />
                <AssociatedProjectsCard 
                  projects={projects} 
                  loading={loadingAssociations} 
                />
              </>
            )}

            {/* Associated Work Orders */}
            {workOrders.length > 0 && (
              <>
                <Separator />
                <WorkOrdersCard 
                  workOrders={workOrders} 
                  loading={loadingAssociations} 
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
          </div>
        </Card>
        
        {/* Edit Subcontractor Dialog - ALWAYS render the dialog but control visibility with open prop */}
        <SubcontractorDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSubcontractorAdded={handleSubcontractorUpdated}
          initialData={subcontractor}
          isEditing={true}
        />
      </div>
    </PageTransition>
  );
};

export default SubcontractorDetailPage;
