import { useState } from 'react';
import { useReportData } from '@/hooks/useReportData';
import { useReportOptions } from '@/hooks/useReportOptions';
import PageTransition from '@/components/layout/PageTransition';
import ReportPageHeader from '@/components/reports/ReportPageHeader';
import ReportContentSection from '@/components/reports/ReportContentSection';
import ReportFilterSection from '@/components/reports/ReportFilterSection';
import { entityFields, entityNames, entityIcons } from '@/data/reportEntities';
import { EntityType } from '@/types/reports';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Reports = () => {
  const [showFilters, setShowFilters] = useState(false);

  const { data, loading, error, selectedEntity, filters, handleEntityChange, handleFilterChange } =
    useReportData('projects');

  const { getStatusOptions, getRoleOptions, exportToCsv } = useReportOptions();

  // Handle CSV export for the current data
  const handleExportCsv = () => {
    exportToCsv(data || [], entityFields[selectedEntity]);
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

        {/* Entity Type Tabs - Replacing the sidebar with a horizontal tab list */}
        <div className="bg-white p-2 rounded-md border">
          <Tabs
            value={selectedEntity}
            onValueChange={value => handleEntityChange(value as EntityType)}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 h-auto">
              {(Object.keys(entityNames) as EntityType[]).map(entity => (
                <TabsTrigger
                  key={entity}
                  value={entity}
                  className="flex items-center gap-1 py-1.5 px-2 text-xs"
                >
                  {entityIcons[entity]}
                  <span className="ml-1">{entityNames[entity]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
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
            title={`${entityNames[selectedEntity]} Report`}
            searchValue={filters.search}
            onSearchChange={value => handleFilterChange('search', value)}
            data={data || []}
            loading={loading}
            error={error}
            fields={entityFields[selectedEntity]}
          />
        </div>
      </div>
    </PageTransition>
  );
};

export default Reports;
