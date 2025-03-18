
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import PageTransition from '@/components/layout/PageTransition';
import SubcontractorDialog from './SubcontractorDialog';
import useSubcontractorData from './detail/useSubcontractorData';

// Import refactored components
import SubcontractorDetailHeader from './detail/SubcontractorDetailHeader';
import ContactInformationCard from './detail/ContactInformationCard';
import FinancialInformationCard from './detail/FinancialInformationCard';
import ComplianceInformationCard from './detail/ComplianceInformationCard';
import PerformanceMetricsCard from './detail/PerformanceMetricsCard';
import SpecialtiesSection from './detail/SpecialtiesSection';
import AssociatedProjectsCard from './detail/AssociatedProjectsCard';
import WorkOrdersCard from './detail/WorkOrdersCard';
import NotesSection from './detail/NotesSection';

const SubcontractorDetail = () => {
  const { subcontractorId } = useParams<{ subcontractorId: string }>();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
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
    return (
      <PageTransition>
        <div className="container max-w-4xl mx-auto py-6">
          <div className="flex items-center mb-6">
            <Skeleton className="h-10 w-40 mr-auto" />
            <Skeleton className="h-10 w-40" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="grid gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }
  
  if (!subcontractor) {
    return (
      <PageTransition>
        <div className="container max-w-4xl mx-auto py-6">
          <SubcontractorDetailHeader 
            subcontractor={null} 
            loading={false} 
            onEdit={() => {}} 
          />
          <Card>
            <CardHeader>
              <CardTitle>Subcontractor Not Found</CardTitle>
              <CardDescription>
                The subcontractor you are looking for could not be found.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <button 
                className="bg-primary text-primary-foreground px-4 py-2 rounded"
                onClick={() => navigate('/subcontractors')}
              >
                Return to Subcontractors
              </button>
            </CardFooter>
          </Card>
        </div>
      </PageTransition>
    );
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
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{subcontractor.subname}</CardTitle>
                <CardDescription className="mt-1">{subcontractor.subid}</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="grid gap-6">
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
          </CardContent>
        </Card>
        
        {/* Edit Subcontractor Dialog */}
        {editDialogOpen && (
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

export default SubcontractorDetail;
