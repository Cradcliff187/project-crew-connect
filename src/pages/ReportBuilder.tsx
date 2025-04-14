import { motion } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';
import { useReportBuilder } from '@/hooks/useReportBuilder';
import { entityFields } from '@/data/reportEntities';

// Import components
import ReportBuilderHeader from '@/components/reportBuilder/ReportBuilderHeader';
import ReportBuilderPreview from '@/components/reportBuilder/ReportBuilderPreview';
import ReportDetailsForm from '@/components/reportBuilder/ReportDetailsForm';
import EntitySelector from '@/components/reportBuilder/EntitySelector';
import AvailableFieldsList from '@/components/reportBuilder/AvailableFieldsList';
import ChartTypeSelector from '@/components/reportBuilder/ChartTypeSelector';
import SelectedFieldsList from '@/components/reportBuilder/SelectedFieldsList';
import SortAndGroupForm from '@/components/reportBuilder/SortAndGroupForm';
import FiltersSection from '@/components/reportBuilder/FiltersSection';
import ReportGenerateSection from '@/components/reportBuilder/ReportGenerateSection';

const ReportBuilder = () => {
  const {
    reportConfig,
    isPreviewMode,
    previewData,
    handleEntityChange,
    handleAddField,
    handleRemoveField,
    handleReorderFields,
    handleAddFilter,
    handleRemoveFilter,
    handleNameChange,
    handleDescriptionChange,
    handleChartTypeChange,
    handleSortFieldChange,
    handleSortDirectionChange,
    handleGroupByFieldChange,
    handleGeneratePreview,
    handleSaveReport,
    setIsPreviewMode,
  } = useReportBuilder();

  return (
    <PageTransition>
      <div className="container mx-auto py-6 space-y-6">
        <ReportBuilderHeader
          title="Report Builder"
          description="Create customized reports based on your data"
          isPreviewMode={isPreviewMode}
          onTogglePreviewMode={() => setIsPreviewMode(!isPreviewMode)}
          onSaveReport={handleSaveReport}
        />

        {isPreviewMode ? (
          <ReportBuilderPreview reportConfig={reportConfig} previewData={previewData} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <ReportDetailsForm
                name={reportConfig.name}
                description={reportConfig.description}
                onNameChange={handleNameChange}
                onDescriptionChange={handleDescriptionChange}
              />

              <EntitySelector value={reportConfig.primaryEntity} onChange={handleEntityChange} />

              <AvailableFieldsList
                fields={entityFields[reportConfig.primaryEntity]}
                onAddField={handleAddField}
              />

              <ChartTypeSelector value={reportConfig.chartType} onChange={handleChartTypeChange} />
            </div>

            {/* Middle Column */}
            <div className="space-y-6">
              <SelectedFieldsList
                fields={reportConfig.selectedFields}
                onRemoveField={handleRemoveField}
                onReorderFields={handleReorderFields}
              />

              <SortAndGroupForm
                selectedFields={reportConfig.selectedFields}
                sortByField={reportConfig.sortByField}
                sortDirection={reportConfig.sortDirection}
                groupByField={reportConfig.groupByField}
                onSortFieldChange={handleSortFieldChange}
                onSortDirectionChange={handleSortDirectionChange}
                onGroupByFieldChange={handleGroupByFieldChange}
              />

              <FiltersSection
                entityType={reportConfig.primaryEntity}
                filters={reportConfig.filters}
                onAddFilter={handleAddFilter}
                onRemoveFilter={handleRemoveFilter}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <ReportGenerateSection
                selectedEntityType={reportConfig.primaryEntity}
                selectedFieldsCount={reportConfig.selectedFields.length}
                onGeneratePreview={handleGeneratePreview}
              />
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default ReportBuilder;
