
import { useState } from 'react';
import { useReportData } from '@/hooks/useReportData';
import { useReportOptions } from '@/hooks/useReportOptions';
import PageTransition from '@/components/layout/PageTransition';
import ReportPageHeader from '@/components/reports/ReportPageHeader';
import ReportSidebar from '@/components/reports/ReportSidebar';
import ReportContentSection from '@/components/reports/ReportContentSection';
import ReportFilterSection from '@/components/reports/ReportFilterSection';
import { entityFields } from '@/data/reportEntities';

const Reports = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const { 
    data,
    loading,
    error,
    selectedEntity,
    filters,
    handleEntityChange,
    handleFilterChange
  } = useReportData('projects');
  
  const { 
    getStatusOptions, 
    getRoleOptions, 
    exportToCsv 
  } = useReportOptions();
  
  // Handle CSV export for the current data
  const handleExportCsv = () => {
    exportToCsv(data || [], entityFields[selectedEntity]);
  };

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  return (
    <PageTransition>
      <div className="container mx-auto py-6 space-y-6">
        <ReportPageHeader 
          title="Reports"
          description="View and export data across different entities"
          onToggleFilters={() => setShowFilters(!showFilters)}
          onExportCsv={handleExportCsv}
          showFilters={showFilters}
        />
        
        <div className="flex">
          {/* Sidebar Navigation */}
          <ReportSidebar 
            selectedEntity={selectedEntity}
            onSelectEntity={handleEntityChange}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={toggleSidebar}
          />
          
          {/* Main Content */}
          <div className="flex-1 ml-4">
            {showFilters && (
              <ReportFilterSection 
                filters={filters}
                onFilterChange={handleFilterChange}
                getStatusOptions={() => getStatusOptions(selectedEntity)}
                getRoleOptions={getRoleOptions}
                showEmployeeFilters={selectedEntity === 'employees'}
              />
            )}
            
            <ReportContentSection
              title={`${selectedEntity.charAt(0).toUpperCase() + selectedEntity.slice(1).replace('_', ' ')} Report`}
              searchValue={filters.search}
              onSearchChange={(value) => handleFilterChange('search', value)}
              data={data || []}
              loading={loading}
              error={error}
              fields={entityFields[selectedEntity]}
            />
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Reports;
