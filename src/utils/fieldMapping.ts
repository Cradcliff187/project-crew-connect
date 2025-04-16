import { EntityType } from '@/types/reports';

/**
 * This utility provides field mapping between frontend and database
 * It acts as an adapter layer to handle inconsistencies in database schema
 * and allow for gradual standardization without breaking changes
 */

/**
 * Maps frontend field names to database field names for each entity type
 * This allows us to use consistent frontend naming while adapting to
 * various database field naming patterns
 */
export const dbFieldMap: Record<EntityType, Record<string, string>> = {
  projects: {
    id: 'projectid',
    name: 'projectname',
    customerId: 'customerid',
    customerName: 'customername',
    description: 'jobdescription',
    status: 'status',
    createdAt: 'createdon',
    updatedAt: 'updated_at',
    address: 'sitelocationaddress',
    city: 'sitelocationcity',
    state: 'sitelocationstate',
    zip: 'sitelocationzip',
    totalBudget: 'total_budget',
    currentExpenses: 'current_expenses',
    budgetStatus: 'budget_status',
  },
  customers: {
    id: 'customerid',
    name: 'customername',
    email: 'contactemail',
    phone: 'phone',
    status: 'status',
    createdAt: 'createdon',
    updatedAt: 'updated_at',
    address: 'address',
    city: 'city',
    state: 'state',
    zip: 'zip',
    createdBy: 'createdby',
  },
  vendors: {
    id: 'vendorid',
    name: 'vendorname',
    email: 'email',
    phone: 'phone',
    status: 'status',
    createdAt: 'createdon',
    updatedAt: 'updated_at',
    address: 'address',
    city: 'city',
    state: 'state',
    zip: 'zip',
    createdBy: 'createdby',
    notes: 'notes',
    paymentTerms: 'payment_terms',
    qbVendorType: 'qbvendortype',
    taxId: 'tax_id',
  },
  subcontractors: {
    id: 'subid',
    name: 'subname',
    email: 'contactemail',
    phone: 'phone',
    status: 'status',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    address: 'address',
    city: 'city',
    state: 'state',
    zip: 'zip',
    hourlyRate: 'hourly_rate',
    rating: 'rating',
    notes: 'notes',
    paymentTerms: 'payment_terms',
    taxId: 'tax_id',
    specialtyIds: 'specialty_ids',
    onTimePercentage: 'on_time_percentage',
    qualityScore: 'quality_score',
    responseTimeHours: 'response_time_hours',
  },
  work_orders: {
    id: 'work_order_id',
    title: 'title',
    description: 'description',
    status: 'status',
    priority: 'priority',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    dueDate: 'due_by_date',
    customerId: 'customer_id',
    customerName: 'customer_name',
    projectId: 'project_id',
    assignedTo: 'assigned_to',
    scheduledDate: 'scheduled_date',
    scheduledTimeStart: 'scheduled_time_start',
    scheduledTimeEnd: 'scheduled_time_end',
    completedDate: 'completed_date',
    laborCost: 'labor_cost',
    materialsCost: 'materials_cost',
    totalCost: 'total_cost',
  },
  estimates: {
    id: 'estimateid',
    projectId: 'projectid',
    projectName: 'projectname',
    customerId: 'customerid',
    customerName: 'customername',
    status: 'status',
    createdAt: 'datecreated',
    updatedAt: 'updated_at',
    sentDate: 'sentdate',
    approvedDate: 'approveddate',
    amount: 'estimateamount',
    taxRate: 'taxrate',
    taxAmount: 'taxamount',
    contingencyRate: 'contingencyrate',
    contingencyAmount: 'contingencyamount',
    totalWithContingency: 'total_with_contingency',
    notes: 'notes',
    terms: 'terms',
  },
  expenses: {
    id: 'id',
    description: 'description',
    entityId: 'entity_id',
    entityType: 'entity_type',
    status: 'status',
    expenseType: 'expense_type',
    amount: 'amount',
    expenseDate: 'expense_date',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    vendorId: 'vendor_id',
    vendorName: 'vendor_name',
    receipt: 'receipt_document_id',
    category: 'category',
    notes: 'notes',
    quantity: 'quantity',
    unitPrice: 'unit_price',
    taxAmount: 'tax_amount',
  },
  time_entries: {
    id: 'id',
    entityId: 'entity_id',
    entityType: 'entity_type',
    employeeId: 'employee_id',
    dateWorked: 'date_worked',
    startTime: 'start_time',
    endTime: 'end_time',
    hoursWorked: 'hours_worked',
    employeeRate: 'employee_rate',
    totalCost: 'total_cost',
    notes: 'notes',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    locationData: 'location_data',
    hasReceipts: 'has_receipts',
  },
  change_orders: {
    id: 'id',
    entityId: 'entity_id',
    entityType: 'entity_type',
    title: 'title',
    description: 'description',
    status: 'status',
    orderNumber: 'change_order_number',
    totalAmount: 'total_amount',
    impactDays: 'impact_days',
    originalCompletionDate: 'original_completion_date',
    newCompletionDate: 'new_completion_date',
    requestedBy: 'requested_by',
    requestedDate: 'requested_date',
    approvedBy: 'approved_by',
    approvedDate: 'approved_date',
    approvalNotes: 'approval_notes',
    documentId: 'document_id',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  employees: {
    id: 'employee_id',
    firstName: 'first_name',
    lastName: 'last_name',
    email: 'email',
    phone: 'phone',
    role: 'role',
    hourlyRate: 'hourly_rate',
    status: 'status',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

/**
 * Generate reverse mapping (database to frontend field names)
 * This is automatically derived from the dbFieldMap
 */
export const frontendFieldMap: Record<EntityType, Record<string, string>> = Object.entries(
  dbFieldMap
).reduce(
  (acc, [entity, mapping]) => {
    acc[entity as EntityType] = Object.entries(mapping).reduce(
      (entityAcc, [frontendField, dbField]) => {
        entityAcc[dbField] = frontendField;
        return entityAcc;
      },
      {} as Record<string, string>
    );
    return acc;
  },
  {} as Record<EntityType, Record<string, string>>
);

/**
 * Converts a frontend field name to its database equivalent
 */
export function toDbField(entity: EntityType, fieldName: string): string {
  return dbFieldMap[entity]?.[fieldName] || fieldName;
}

/**
 * Converts a database field name to its frontend equivalent
 */
export function toFrontendField(entity: EntityType, dbFieldName: string): string {
  return frontendFieldMap[entity]?.[dbFieldName] || dbFieldName;
}

/**
 * Converts an object with frontend field names to use database field names
 */
export function mapToDbFields<T extends Record<string, any>>(
  entity: EntityType,
  data: T
): Record<string, any> {
  const result: Record<string, any> = {};

  Object.entries(data).forEach(([key, value]) => {
    const dbField = toDbField(entity, key);
    result[dbField] = value;
  });

  return result;
}

/**
 * Converts an object with database field names to use frontend field names
 */
export function mapToFrontendFields<T extends Record<string, any>>(
  entity: EntityType,
  data: T
): Record<string, any> {
  const result: Record<string, any> = {};

  Object.entries(data).forEach(([key, value]) => {
    const frontendField = toFrontendField(entity, key);
    result[frontendField] = value;
  });

  return result;
}

/**
 * Standardizes status values to uppercase format
 * This helps maintain consistency in frontend display
 * while adapting to the database's mixed conventions
 */
export function standardizeStatusValue(status: string | null | undefined): string | null {
  if (!status) return null;

  // Convert to uppercase for standard display
  return status.toUpperCase();
}

/**
 * Prepares a status value for database storage based on entity type
 */
export function prepareStatusForDb(entity: EntityType, status: string): string {
  // These entities use lowercase status in the database
  if (entity === 'projects' || entity === 'estimates') {
    return status.toLowerCase();
  }

  // Default to uppercase for all other entities
  return status.toUpperCase();
}

/**
 * Get a map of all possible status values for an entity type
 */
export function getStatusValuesForEntity(entity: EntityType): string[] {
  // Based on our schema analysis
  const statusMap: Partial<Record<EntityType, string[]>> = {
    projects: ['ACTIVE', 'COMPLETED', 'PENDING', 'CANCELLED'],
    customers: ['ACTIVE', 'PROSPECT', 'INACTIVE'],
    vendors: ['ACTIVE', 'INACTIVE'],
    subcontractors: ['ACTIVE', 'INACTIVE'],
    work_orders: ['NEW', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    estimates: ['DRAFT', 'SENT', 'APPROVED', 'REJECTED'],
    expenses: ['ACTIVE', 'PENDING', 'APPROVED', 'REJECTED'],
    change_orders: ['PENDING', 'APPROVED', 'REJECTED'],
    employees: ['ACTIVE', 'INACTIVE'],
  };

  return statusMap[entity] || [];
}
