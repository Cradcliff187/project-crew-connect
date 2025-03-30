
import { Document, EntityType } from '@/components/documents/schemas/documentSchema';

/**
 * Helper function to safely cast string entity types to EntityType
 * This helps with TypeScript errors when dealing with data from the database
 */
export function asEntityType(entityType: string): EntityType {
  const validEntityTypes = [
    'PROJECT', 'CUSTOMER', 'WORK_ORDER', 'VENDOR', 'SUBCONTRACTOR',
    'ESTIMATE', 'TIME_ENTRY', 'EMPLOYEE', 'DETACHED', 'EXPENSE'
  ];
  
  if (validEntityTypes.includes(entityType.toUpperCase())) {
    return entityType.toUpperCase() as EntityType;
  }
  
  console.warn(`Invalid entity type "${entityType}" converted to "DETACHED"`);
  return 'DETACHED';
}

/**
 * Helper function to adapt database document objects to the Document interface
 * Handles type conversion issues and ensures all fields are compatible
 */
export function adaptDatabaseDocument(dbDocument: any): Document {
  return {
    ...dbDocument,
    entity_type: asEntityType(dbDocument.entity_type || 'DETACHED'),
    // Add any other field conversions here as needed
  };
}

/**
 * Helper function to adapt an array of database documents
 */
export function adaptDatabaseDocuments(dbDocuments: any[]): Document[] {
  return dbDocuments.map(adaptDatabaseDocument);
}
