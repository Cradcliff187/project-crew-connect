
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Document } from './DocumentTypes';

export interface DocumentValidationUtilityProps {
  document: Document;
}

const DocumentValidationUtility: React.FC<DocumentValidationUtilityProps> = ({ document }) => {
  const validateDocument = (doc: Document) => {
    const errors: string[] = [];

    // Check required fields
    if (!doc.file_name) errors.push('Missing file name');
    if (!doc.entity_type) errors.push('Missing entity type');
    if (!doc.entity_id) errors.push('Missing entity ID');

    // Check expense consistency
    if (doc.is_expense) {
      if (doc.category !== 'receipt' && doc.category !== 'invoice') {
        errors.push('Expense documents should have category "receipt" or "invoice"');
      }

      if (!doc.amount && doc.amount !== 0) {
        errors.push('Expense documents should have an amount');
      }
    }

    // Check version consistency
    if (doc.parent_document_id && !doc.version) {
      errors.push('Documents with a parent should have a version number');
    }

    return errors;
  };

  const errors = validateDocument(document);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Validation</CardTitle>
      </CardHeader>
      <CardContent>
        {errors.length > 0 ? (
          <Alert variant="destructive">
            <AlertTitle>Validation Errors</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-4">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertTitle>Document is valid</AlertTitle>
            <AlertDescription>All required fields are present and consistent.</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentValidationUtility;
export { DocumentValidationUtility };
