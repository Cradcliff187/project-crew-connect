import { useState } from 'react';
import { EntityType, FieldDefinition, FilterDefinition, ReportConfig } from '@/types/reports';
import { entityFields } from '@/data/reportEntities';

export const useReportBuilder = () => {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    name: 'New Report',
    description: 'Report description',
    primaryEntity: 'projects',
    selectedFields: [],
    filters: [],
    chartType: 'table',
    sortDirection: 'desc',
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  // Handle entity change
  const handleEntityChange = (entity: EntityType) => {
    setReportConfig(prev => ({
      ...prev,
      primaryEntity: entity,
      selectedFields: [],
      filters: [],
      groupByField: undefined,
      sortByField: undefined,
    }));
  };

  // Handle adding field to the report
  const handleAddField = (field: FieldDefinition) => {
    if (reportConfig.selectedFields.some(f => f.field === field.field)) {
      return;
    }

    setReportConfig(prev => ({
      ...prev,
      selectedFields: [...prev.selectedFields, field],
    }));
  };

  // Handle removing field from the report
  const handleRemoveField = (index: number) => {
    const newFields = [...reportConfig.selectedFields];
    const removedField = newFields[index];
    newFields.splice(index, 1);

    setReportConfig(prev => ({
      ...prev,
      selectedFields: newFields,
      groupByField: prev.groupByField?.field === removedField.field ? undefined : prev.groupByField,
      sortByField: prev.sortByField?.field === removedField.field ? undefined : prev.sortByField,
    }));
  };

  // Handle reordering fields
  const handleReorderFields = (fields: FieldDefinition[]) => {
    setReportConfig(prev => ({
      ...prev,
      selectedFields: fields,
    }));
  };

  // Handle adding filter
  const handleAddFilter = (filter: FilterDefinition) => {
    setReportConfig(prev => ({
      ...prev,
      filters: [...prev.filters, filter],
    }));
  };

  // Handle removing filter
  const handleRemoveFilter = (id: string) => {
    setReportConfig(prev => ({
      ...prev,
      filters: prev.filters.filter(filter => filter.id !== id),
    }));
  };

  // Handle report name change
  const handleNameChange = (name: string) => {
    setReportConfig(prev => ({
      ...prev,
      name,
    }));
  };

  // Handle report description change
  const handleDescriptionChange = (description: string) => {
    setReportConfig(prev => ({
      ...prev,
      description,
    }));
  };

  // Handle chart type change
  const handleChartTypeChange = (chartType: string) => {
    setReportConfig(prev => ({
      ...prev,
      chartType,
    }));
  };

  // Handle sort field change
  const handleSortFieldChange = (field?: FieldDefinition) => {
    setReportConfig(prev => ({
      ...prev,
      sortByField: field,
    }));
  };

  // Handle sort direction change
  const handleSortDirectionChange = (sortDirection: 'asc' | 'desc') => {
    setReportConfig(prev => ({
      ...prev,
      sortDirection,
    }));
  };

  // Handle group by field change
  const handleGroupByFieldChange = (field?: FieldDefinition) => {
    setReportConfig(prev => ({
      ...prev,
      groupByField: field,
    }));
  };

  // Generate preview
  const handleGeneratePreview = () => {
    // In a real implementation, this would fetch data from the API
    let dummyData: any[] = [];

    switch (reportConfig.primaryEntity) {
      case 'projects':
        dummyData = [
          {
            projectid: 'PRJ-000001',
            projectname: 'New Office Building',
            status: 'active',
            customername: 'ABC Corp',
            createdon: '2024-01-15',
            total_budget: 150000,
            current_expenses: 75000,
          },
          {
            projectid: 'PRJ-000002',
            projectname: 'Home Renovation',
            status: 'completed',
            customername: 'John Smith',
            createdon: '2023-11-20',
            total_budget: 35000,
            current_expenses: 34000,
          },
          {
            projectid: 'PRJ-000003',
            projectname: 'Restaurant Remodel',
            status: 'on_hold',
            customername: 'Taste of Italy',
            createdon: '2024-02-05',
            total_budget: 85000,
            current_expenses: 15000,
          },
        ];
        break;
      case 'work_orders':
        dummyData = [
          {
            work_order_id: 'WO-001',
            title: 'Fix Plumbing',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            actual_hours: 4.5,
            materials_cost: 350,
            total_cost: 750,
            progress: 65,
          },
          {
            work_order_id: 'WO-002',
            title: 'Electrical Repair',
            status: 'COMPLETED',
            priority: 'MEDIUM',
            actual_hours: 2.0,
            materials_cost: 125,
            total_cost: 275,
            progress: 100,
          },
          {
            work_order_id: 'WO-003',
            title: 'Paint Room',
            status: 'NEW',
            priority: 'LOW',
            actual_hours: 0,
            materials_cost: 0,
            total_cost: 0,
            progress: 0,
          },
        ];
        break;
    }

    if (reportConfig.selectedFields.length > 0) {
      const fieldNames = reportConfig.selectedFields.map(field => field.field);
      dummyData = dummyData.map(item => {
        const filtered: any = {};
        fieldNames.forEach(name => {
          if (item[name] !== undefined) {
            filtered[name] = item[name];
          }
        });
        return filtered;
      });
    }

    setPreviewData(dummyData);
    setIsPreviewMode(true);
  };

  // Save report
  const handleSaveReport = () => {
    // In a real implementation, this would save the report to the database
    console.log('Saving report:', reportConfig);
    alert('Report saved successfully!');
  };

  return {
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
  };
};
