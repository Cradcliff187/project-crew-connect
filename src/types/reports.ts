import { ReactNode } from 'react';
import { EntityType } from './common';

// Define field type
export type FieldType =
  | 'text'
  | 'date'
  | 'number'
  | 'currency'
  | 'status'
  | 'percentage'
  | 'boolean';

// Define field structure
export interface FieldDefinition {
  label: string;
  field: string;
  type: FieldType;
  entity?: EntityType;
  name?: string; // For compatibility with ReportBuilder
  description?: string; // For tooltips when hovering over column headers
}

// Define filter structure
export interface FilterDefinition {
  id: string;
  field: FieldDefinition;
  operator: string;
  value: string;
}

// Define report config structure
export interface ReportConfig {
  name: string;
  description: string;
  primaryEntity: EntityType;
  selectedFields: FieldDefinition[];
  filters: FilterDefinition[];
  groupByField?: FieldDefinition;
  chartType: string;
  sortByField?: FieldDefinition;
  sortDirection: 'asc' | 'desc';
}

// Define custom DateRange interface
export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

// Define report filters
export interface ReportFilters {
  search: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  status: string;
  expenseType?: string;
  role?: string;
}

// Chart type definition
export interface ChartTypeOption {
  value: string;
  label: string;
  icon: ReactNode;
}
