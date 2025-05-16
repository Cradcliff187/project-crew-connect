/**
 * Represents a UUID, stored as a string.
 */
export type AssigneeId = string;

/**
 * Defines the core types of assignees supported for scheduling and other assignments.
 * 'vendor' can be added if it's a distinct assignee type needed system-wide.
 * For schedule_items, current UI in AssigneeSelector implies employee, subcontractor, external_contact.
 */
export type CoreAssigneeType = 'employee' | 'subcontractor' | 'external_contact';

/**
 * Base interface for any assignable entity.
 */
export interface BaseAssignee {
  id: AssigneeId; // UUID
  name: string; // Display name, could be full_name, company_name etc.
  email?: string | null;
  type: CoreAssigneeType;
}

/**
 * Represents an Employee assignee.
 */
export interface EmployeeAssignee extends BaseAssignee {
  type: 'employee';
  first_name?: string | null; // Optional, if name is preferred as full_name
  last_name?: string | null; // Optional
  role?: string | null;
}

/**
 * Represents a Subcontractor assignee.
 */
export interface SubcontractorAssignee extends BaseAssignee {
  type: 'subcontractor';
  company_name?: string | null; // Often used as the primary name
  contact_name?: string | null;
}

/**
 * Represents an External Contact assignee.
 */
export interface ExternalContactAssignee extends BaseAssignee {
  type: 'external_contact';
  relationship?: string | null; // e.g., Client, Partner
}

// Union type for any kind of assignee
export type Assignee = EmployeeAssignee | SubcontractorAssignee | ExternalContactAssignee;

// Type for the value prop of AssigneeSelector if it strictly stores {type, id}
export type AssigneeSelectionValue = { type: CoreAssigneeType; id: AssigneeId };
