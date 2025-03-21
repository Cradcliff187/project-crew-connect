
import React from 'react';
import { Document } from '@/components/documents/schemas/documentSchema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TabContent from './TabContent';

interface DocumentTabsProps {
  documentsByCategory: Record<string, Document[]>;
  documentsByVendor: Record<string, Document[]>;
  openDocument: (url: string) => void;
  getDocumentIcon: (fileType: string | null) => JSX.Element;
  formatFileSize: (bytes: number | null) => string;
  getCategoryBadgeColor: (category: string) => string;
  formatCategoryName: (category: string) => string;
  getVendorTypeDisplay: (vendorType: string) => string;
}

const DocumentTabs: React.FC<DocumentTabsProps> = ({
  documentsByCategory,
  documentsByVendor,
  openDocument,
  getDocumentIcon,
  formatFileSize,
  getCategoryBadgeColor,
  formatCategoryName,
  getVendorTypeDisplay
}) => {
  return (
    <Tabs defaultValue="category">
      <TabsList className="mb-4">
        <TabsTrigger value="category">By Category</TabsTrigger>
        {Object.keys(documentsByVendor).length > 0 && (
          <TabsTrigger value="vendor">By Supplier/Subcontractor</TabsTrigger>
        )}
      </TabsList>
      
      <TabsContent value="category">
        <TabContent
          documents={documentsByCategory}
          openDocument={openDocument}
          getDocumentIcon={getDocumentIcon}
          formatFileSize={formatFileSize}
          getCategoryBadgeColor={getCategoryBadgeColor}
          formatCategoryName={formatCategoryName}
          getVendorTypeDisplay={getVendorTypeDisplay}
          type="category"
        />
      </TabsContent>
      
      {Object.keys(documentsByVendor).length > 0 && (
        <TabsContent value="vendor">
          <TabContent
            documents={documentsByVendor}
            openDocument={openDocument}
            getDocumentIcon={getDocumentIcon}
            formatFileSize={formatFileSize}
            getCategoryBadgeColor={getCategoryBadgeColor}
            formatCategoryName={formatCategoryName}
            getVendorTypeDisplay={getVendorTypeDisplay}
            type="vendor"
          />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default DocumentTabs;
