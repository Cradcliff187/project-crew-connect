import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, Clock, Star, AlertTriangle } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import SubcontractorsHeader from '@/components/subcontractors/SubcontractorsHeader';
import SubcontractorsTable from '@/components/subcontractors/table/SubcontractorsTable';
import useSubcontractors from '@/components/subcontractors/hooks/useSubcontractors';
import SubcontractorSheet from '@/components/subcontractors/SubcontractorSheet';

const Subcontractors = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtiesUpdated, setSpecialtiesUpdated] = useState(0);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [selectedSubcontractor, setSelectedSubcontractor] = useState<any | null>(null);
  const { user } = useAuth();

  // Use our custom hook with real Supabase data
  const { subcontractors, loading, error, refetch } = useSubcontractors();

  // Calculate metrics for summary cards
  const totalSubcontractors = subcontractors.length;
  const activeContracts = subcontractors.filter(sub => sub.status === 'active').length;
  const availableNow = subcontractors.filter(
    sub => sub.status === 'active' && sub.contract_on_file
  ).length;
  const topPerformers = subcontractors.filter(sub => sub.rating && sub.rating >= 4.5).length;

  const handleSubcontractorAdded = () => {
    refetch();
  };

  const handleSpecialtyAdded = () => {
    // Increment the specialties update counter to trigger a refresh in components that use specialties
    setSpecialtiesUpdated(prev => prev + 1);
  };

  const handleEditSubcontractor = (subcontractor: any) => {
    setSelectedSubcontractor(subcontractor);
    setEditSheetOpen(true);
  };

  const handleEditSheetClose = () => {
    setEditSheetOpen(false);
    setSelectedSubcontractor(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-4">
        {/* Compact Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center font-montserrat">
              <Users className="h-8 w-8 mr-3 text-blue-600" />
              Subcontractor Management
            </h1>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 font-opensans"
            >
              {user?.role || 'User'}
            </Badge>
          </div>
          <p className="text-gray-600 font-opensans">
            Manage subcontractor relationships and specialties
          </p>
        </div>

        {/* Summary Cards - Horizontal Layout for Desktop */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium font-opensans">
                    Total Subcontractors
                  </p>
                  <p className="text-2xl font-bold text-blue-900 font-montserrat">
                    {totalSubcontractors}
                  </p>
                </div>
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium font-opensans">
                    Active Contracts
                  </p>
                  <p className="text-2xl font-bold text-green-900 font-montserrat">
                    {activeContracts}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium font-opensans">Available Now</p>
                  <p className="text-2xl font-bold text-yellow-900 font-montserrat">
                    {availableNow}
                  </p>
                </div>
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium font-opensans">
                    Top Performers
                  </p>
                  <p className="text-2xl font-bold text-purple-900 font-montserrat">
                    {topPerformers}
                  </p>
                </div>
                <Star className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Maximum Space for Subcontractor Data */}
        <PageTransition>
          <div className="flex flex-col">
            <SubcontractorsHeader
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSubcontractorAdded={handleSubcontractorAdded}
              onSpecialtyAdded={handleSpecialtyAdded}
            />

            <div className="mt-4">
              <SubcontractorsTable
                subcontractors={subcontractors}
                loading={loading}
                error={error}
                searchQuery={searchQuery}
                onEditSubcontractor={handleEditSubcontractor}
              />
            </div>

            {/* Edit Subcontractor Sheet */}
            {editSheetOpen && selectedSubcontractor && (
              <SubcontractorSheet
                open={editSheetOpen}
                onOpenChange={handleEditSheetClose}
                onSubcontractorAdded={handleSubcontractorAdded}
                initialData={selectedSubcontractor}
                isEditing={true}
              />
            )}
          </div>
        </PageTransition>
      </div>
    </div>
  );
};

export default Subcontractors;
