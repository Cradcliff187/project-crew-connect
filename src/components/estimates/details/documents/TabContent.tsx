
import React from 'react';
import { Document } from '@/components/documents/schemas/documentSchema';
import DocumentList from './DocumentList';

interface TabContentProps {
  documents: Record<string, Document[]>;
  openDocument: (url: string) => void;
  getDocumentIcon: (fileType: string | null) => JSX.Element;
  formatFileSize: (bytes: number | null) => string;
  getCategoryBadgeColor: (category: string) => string;
  formatCategoryName: (category: string) => string;
  getVendorTypeDisplay: (vendorType: string) => string;
  type: 'category' | 'vendor';
}

const TabContent: React.FC<TabContentProps> = ({
  documents,
  openDocument,
  getDocumentIcon,
  formatFileSize,
  getCategoryBadgeColor,
  formatCategoryName,
  getVendorTypeDisplay,
  type
}) => {
  return (
    <div className="space-y-6">
      {Object.entries(documents).map(([key, docs]) => {
        // For vendor tab, split the key which is in format 'vendorType-vendorId'
        let displayName = key;
        if (type === 'vendor') {
          const [vendorType, vendorId] = key.split('-');
          displayName = `${getVendorTypeDisplay(vendorType)}: ${vendorId}`;
        } else {
          displayName = formatCategoryName(key);
        }

        return (
          <div key={key}>
            <h3 className="text-sm font-medium mb-2">
              {displayName}
            </h3>
            <DocumentList
              documents={docs}
              openDocument={openDocument}
              getDocumentIcon={getDocumentIcon}
              formatFileSize={formatFileSize}
              getCategoryBadgeColor={getCategoryBadgeColor}
              formatCategoryName={formatCategoryName}
              getVendorTypeDisplay={getVendorTypeDisplay}
            />
          </div>
        );
      })}
    </div>
  );
};

export default TabContent;
