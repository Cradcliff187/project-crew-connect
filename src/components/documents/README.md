# Standardized Document Management System

## Overview

The Standardized Document Management System provides a unified approach to document handling across all entity types in the application. It offers consistent UI components, standardized document operations, and robust validation and migration utilities.

## Key Components

### Document Sections

Each entity type has a dedicated document section component that follows a standardized pattern:

- `ProjectDocumentsSection` - `/src/components/projects/documents/ProjectDocumentsSection.tsx`
- `EstimateDocumentsSection` - `/src/components/estimates/documents/EstimateDocumentsSection.tsx`
- `WorkOrderDocumentsSection` - `/src/components/work-orders/documents/WorkOrderDocumentsSection.tsx`
- `VendorDocumentsSection` - `/src/components/vendors/documents/VendorDocumentsSection.tsx`
- `SubcontractorDocumentsSection` - `/src/components/subcontractors/documents/SubcontractorDocumentsSection.tsx`
- `TimeEntryReceiptUpload` - `/src/components/time-entries/receipts/TimeEntryReceiptUpload.tsx`

### Core UI Components

- `DocumentsGrid` - `/src/components/documents/DocumentsGrid.tsx`

  - Grid view for documents with cards and action menus

- `DocumentsDataTable` - `/src/components/documents/DocumentsDataTable.tsx`

  - Table view for documents with sortable columns and action menus

- `DocumentCard` - `/src/components/documents/DocumentCard.tsx`

  - Card component for displaying document information in grid view

- `DocumentViewerDialog` - `/src/components/documents/DocumentViewerDialog.tsx`

  - Modal dialog for viewing document content

- `DocumentDeleteDialog` - `/src/components/documents/DocumentDeleteDialog.tsx`
  - Confirmation dialog for document deletion

### Document Upload

- `StandardizedDocumentUpload` - `/src/components/documents/StandardizedDocumentUpload.tsx`

  - Main component for uploading documents with metadata

- `DropzoneUploader` - `/src/components/documents/components/DropzoneUploader.tsx`

  - File dropzone and selection component

- `StandardizedMetadataForm` - `/src/components/documents/components/StandardizedMetadataForm.tsx`
  - Metadata form that adapts based on entity type and document category

### Migration and Validation

- `DocumentMigrationUtility` - `/src/components/documents/migration/DocumentMigrationUtility.tsx`

  - Tool for migrating documents to the standardized format

- `DocumentValidationUtility` - `/src/components/documents/validation/DocumentValidationUtility.tsx`
  - Tool for validating document metadata and storage links

## Usage

### Adding Document Functionality to a New Entity

1. Create a new document section component for your entity:

```typescript
import { useState, useEffect, useCallback } from 'react';
import useBreakpoint from '@/hooks/use-breakpoint';
import { Plus, GridIcon, ListIcon, Download, ViewIcon, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/components/documents/schemas/documentSchema';
import DocumentsDataTable from '@/components/documents/DocumentsDataTable';
import DocumentsGrid from '@/components/documents/DocumentsGrid';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import StandardizedDocumentUpload from '@/components/documents/StandardizedDocumentUpload';
import DocumentViewerDialog from '@/components/documents/DocumentViewerDialog';
import DocumentDeleteDialog from '@/components/documents/DocumentDeleteDialog';
import { useToast } from '@/hooks/use-toast';

interface YourEntityDocumentsSectionProps {
  entityId: string;
  entityName?: string;
}

export default function YourEntityDocumentsSection({
  entityId,
  entityName = 'Entity',
}: YourEntityDocumentsSectionProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const { isAboveMd } = useBreakpoint('md');
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', 'YOUR_ENTITY_TYPE')
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to include document URLs
      const docsWithUrls = await Promise.all(
        (data || []).map(async doc => {
          let publicUrl = '';

          try {
            const { data: urlData } = supabase.storage
              .from('construction_documents')
              .getPublicUrl(doc.storage_path);

            publicUrl = urlData.publicUrl;
          } catch (err) {
            console.error('Error getting public URL:', err);
          }

          return {
            ...doc,
            url: publicUrl,
            file_url: publicUrl,
            is_latest_version: doc.is_latest_version ?? true,
            mime_type: doc.file_type || 'application/octet-stream',
          } as Document;
        })
      );

      setDocuments(docsWithUrls);
    } catch (err) {
      console.error('Error fetching documents:', err);
      toast({
        title: 'Error',
        description: 'Failed to load documents.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [entityId, toast]);

  // Load documents on component mount
  useEffect(() => {
    if (entityId) {
      fetchDocuments();
    }
  }, [entityId, fetchDocuments]);

  // Add document action handlers and render the component...
}
```

2. Add the document section to your entity page:

```typescript
import YourEntityDocumentsSection from '@/components/your-entity/documents/YourEntityDocumentsSection';

export default function YourEntityDetailPage() {
  // Other code...

  return (
    <div>
      {/* Other entity content */}

      <YourEntityDocumentsSection
        entityId={entity.id}
        entityName={entity.name}
      />
    </div>
  );
}
```

## Data Structure

Documents are stored in the Supabase database with the following schema:

```typescript
interface Document {
  document_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  file_url: string;
  url: string; // Duplicate of file_url for backward compatibility
  entity_type: string;
  entity_id: string;
  category: string;
  is_latest_version: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  notes?: string;
  tags?: string[];
  mime_type: string;

  // Optional expense-related fields
  amount?: number;
  expense_date?: string;
  expense_type?: string;
  vendor_id?: string;
  vendor_name?: string;
  is_expense?: boolean;
}
```

## Migration and Validation

The system includes tools for migrating existing documents to the standardized format and validating document metadata:

1. **Document Migration Utility**

   - Updates existing documents to include standardized fields
   - Adds missing URLs and metadata
   - Ensures consistency across document records

2. **Document Validation Utility**
   - Validates storage paths and URLs
   - Checks for missing or invalid metadata
   - Identifies orphaned files or broken references

Access these tools via the `/documents/administration` page.

## Testing

A comprehensive test plan is available in `/src/components/documents/testing/DocumentTestPlan.md` that covers:

- Core component tests
- Entity-specific document section tests
- Migration and validation tool tests
- Integration tests
- Performance tests
- Mobile and responsive tests
- Error scenarios

## Best Practices

1. **Always use the standardized components**

   - Don't create custom document handling components
   - Extend the existing components if needed

2. **Follow the document category conventions**

   - Use consistent category names across entity types
   - Add new categories centrally in the metadata form

3. **Handle document lifecycle properly**

   - Delete documents from both database and storage
   - Update references when deleting entities

4. **Consider performance**

   - Load documents in batches for large collections
   - Use the grid view for visual browsing
   - Use the table view for larger document sets

5. **Validate frequently**
   - Run the document validation tool after major updates
   - Fix issues promptly to prevent data degradation
