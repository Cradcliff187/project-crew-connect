
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import SubcontractorSheet from '../SubcontractorSheet';
import useSubcontractorData from './useSubcontractorData';
import { getPaymentTermsLabel } from '../utils/performanceUtils';

// Import refactored components
import SubcontractorDetailHeader from './SubcontractorDetailHeader';
import SubcontractorDetailCard from './SubcontractorDetailCard';
import ContactInformationCard from './ContactInformationCard';
import FinancialInformationCard from './FinancialInformationCard';
import ComplianceInformationCard from './ComplianceInformationCard';
import PerformanceMetricsCard from './PerformanceMetricsCard';
import SpecialtiesSection from './SpecialtiesSection';
import AssociatedProjects from './AssociatedProjects';
import AssociatedWorkOrders from './AssociatedWorkOrders';
import NotesSection from './NotesSection';
import SubcontractorNotFoundView from './SubcontractorNotFoundView';
import SubcontractorLoadingView from './SubcontractorLoadingView';
import SubcontractorDocuments from './SubcontractorDocuments';
import SubcontractorExpenses from './SubcontractorExpenses';
import SubcontractorMaterials from './SubcontractorMaterials';
import SubcontractorTimelogs from './SubcontractorTimelogs';

const SubcontractorDetailPage = () => {
  const { subcontractorId } = useParams<{ subcontractorId: string }>();
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
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
      console.log('Opening edit sheet with data:', subcontractor);
      setEditSheetOpen(true);
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
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
          <TabsList className="grid grid-cols-6 mb-4">
            <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
            <TabsTrigger value="documents" className="text-sm">Documents</TabsTrigger>
            <TabsTrigger value="projects" className="text-sm">Projects</TabsTrigger>
            <TabsTrigger value="time" className="text-sm">Time Tracking</TabsTrigger>
            <TabsTrigger value="expenses" className="text-sm">Expenses</TabsTrigger>
            <TabsTrigger value="materials" className="text-sm">Materials</TabsTrigger>
          </TabsList>
        
          <TabsContent value="overview" className="space-y-6">
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
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium">Notes</p>
                        <p className="whitespace-pre-wrap">{subcontractor.notes}</p>
                      </div>
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
            <Card>
              <CardContent className="pt-6">
                <ComplianceInformationCard subcontractor={subcontractor} />
              </CardContent>
            </Card>
            
            {/* Associated Work Summary */}
            <div className="grid gap-6 md:grid-cols-2">
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
              <Card>
                <CardContent className="pt-6">
                  <SpecialtiesSection 
                    subcontractor={subcontractor} 
                    specialtyIds={specialtyIds} 
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="documents">
            <SubcontractorDocuments subcontractorId={subcontractor.subid} />
          </TabsContent>
          
          <TabsContent value="projects">
            <Card>
              <CardContent className="pt-6">
                <AssociatedProjects 
                  projects={projects} 
                  loading={loadingAssociations}
                  showFullTable={true}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="time">
            <SubcontractorTimelogs subcontractorId={subcontractor.subid} />
          </TabsContent>
          
          <TabsContent value="expenses">
            <SubcontractorExpenses subcontractorId={subcontractor.subid} />
          </TabsContent>
          
          <TabsContent value="materials">
            <SubcontractorMaterials subcontractorId={subcontractor.subid} />
          </TabsContent>
        </Tabs>
        
        {/* Edit Subcontractor Sheet */}
        {subcontractor && (
          <SubcontractorSheet
            open={editSheetOpen}
            onOpenChange={setEditSheetOpen}
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
