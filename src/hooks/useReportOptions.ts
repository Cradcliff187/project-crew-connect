import { EntityType } from '@/types/reports';

export const useReportOptions = () => {
  // Get status options based on the selected entity
  const getStatusOptions = (entity: EntityType): { value: string; label: string }[] => {
    const allOption = { value: 'all', label: 'All Statuses' };

    switch (entity) {
      case 'projects':
        return [
          allOption,
          { value: 'new', label: 'New' },
          { value: 'active', label: 'Active' },
          { value: 'on_hold', label: 'On Hold' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' },
        ];
      case 'work_orders':
        return [
          allOption,
          { value: 'NEW', label: 'New' },
          { value: 'IN_PROGRESS', label: 'In Progress' },
          { value: 'ON_HOLD', label: 'On Hold' },
          { value: 'COMPLETED', label: 'Completed' },
          { value: 'CANCELLED', label: 'Cancelled' },
        ];
      case 'estimates':
        return [
          allOption,
          { value: 'draft', label: 'Draft' },
          { value: 'sent', label: 'Sent' },
          { value: 'approved', label: 'Approved' },
          { value: 'rejected', label: 'Rejected' },
          { value: 'converted', label: 'Converted to Project' },
        ];
      case 'employees':
        return [
          allOption,
          { value: 'ACTIVE', label: 'Active' },
          { value: 'INACTIVE', label: 'Inactive' },
        ];
      default:
        return [
          allOption,
          { value: 'ACTIVE', label: 'Active' },
          { value: 'INACTIVE', label: 'Inactive' },
        ];
    }
  };

  // Get role options for employees
  const getRoleOptions = (): { value: string; label: string }[] => {
    return [
      { value: 'all', label: 'All Roles' },
      { value: 'Admin', label: 'Admin' },
      { value: 'Manager', label: 'Manager' },
      { value: 'Technician', label: 'Technician' },
      { value: 'Laborer', label: 'Laborer' },
      { value: 'Office', label: 'Office' },
    ];
  };

  // Function to handle CSV export
  const exportToCsv = (data: any[], fields: any[]) => {
    if (!data || data.length === 0) return;

    // Get the headers
    const headers = fields.map(field => field.label);

    // Map the data
    const csvData = data.map((item: any) => {
      return fields.map(field => {
        const value = item[field.field];
        if (value === null || value === undefined) return '';

        // Format special types for CSV
        if (field.type === 'date' && value) {
          return formatDate(value);
        } else if (field.type === 'currency' && value !== null) {
          return typeof value === 'number' ? value.toFixed(2) : value;
        } else if (field.type === 'percentage' && value !== null) {
          return typeof value === 'number' ? value.toFixed(2) : value;
        } else if (field.type === 'boolean') {
          return value ? 'Yes' : 'No';
        } else {
          return String(value).replace(/"/g, '""'); // Escape quotes
        }
      });
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Create and click a download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `report_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  return {
    getStatusOptions,
    getRoleOptions,
    exportToCsv,
  };
};
