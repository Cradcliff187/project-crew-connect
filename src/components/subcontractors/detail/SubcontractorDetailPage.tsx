import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  // Use the custom hook to fetch subcontractor data
  const {
    subcontractor,
    loading,
    notFound,
    specialtyIds,
    projects,
    workOrders,
    loadingAssociations,
    fetchSubcontractor,
    documents,
    loadingDocuments,
  } = useSubcontractorData(subcontractorId);

  const handleEdit = () => {
    if (subcontractor) {
      console.log('Opening edit sheet with data:', subcontractor);
      setEditSheetOpen(true);
    } else {
      toast({
        title: 'Error',
        description: 'Cannot edit - Subcontractor not found',
        variant: 'destructive',
      });
    }
  };

  const handleSubcontractorUpdated = () => {
    console.log('Subcontractor updated, refreshing data...');
    fetchSubcontractor();

    toast({
      title: 'Subcontractor Updated',
      description: 'Subcontractor details have been updated successfully.',
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
          {/* Render self-contained cards directly in the grid */}
          <SubcontractorDetailCard subcontractor={subcontractor} />
          <ContactInformationCard subcontractor={subcontractor} />
        </div>

        {/* Group Compliance and Specialties (if present) */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <ComplianceInformationCard subcontractor={subcontractor} />
          {subcontractor.specialty_ids && subcontractor.specialty_ids.length > 0 && (
            <SpecialtiesSection subcontractor={subcontractor} specialtyIds={specialtyIds} />
          )}
        </div>

        {/* Associated Projects & Work Orders - Add Card wrappers back */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <AssociatedProjects projects={projects} loading={loadingAssociations} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <AssociatedWorkOrders workOrders={workOrders} loading={loadingAssociations} />
            </CardContent>
          </Card>
        </div>

        {/* Documents Section */}
        <div className="mt-6">
          <SubcontractorDocuments
            subcontractorId={subcontractor.subid}
            documents={documents || []}
            loading={loadingDocuments}
            onUploadSuccess={fetchSubcontractor}
          />
        </div>

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
