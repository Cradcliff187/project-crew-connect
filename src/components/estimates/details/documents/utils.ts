
import { FileType } from 'lucide-react';
import React from 'react';

// Function to get document icon based on file type
export const getDocumentIcon = (fileType: string | null) => {
  if (!fileType) return <FileType className="h-5 w-5 text-[#0485ea]" />;
  
  if (fileType.includes('pdf')) {
    return <FileType className="h-5 w-5 text-red-500" />;
  } else if (fileType.includes('image')) {
    return <FileType className="h-5 w-5 text-green-500" />;
  } else if (fileType.includes('word') || fileType.includes('document')) {
    return <FileType className="h-5 w-5 text-blue-500" />;
  } else if (fileType.includes('excel') || fileType.includes('sheet')) {
    return <FileType className="h-5 w-5 text-emerald-500" />;
  } else if (fileType.includes('zip') || fileType.includes('archive')) {
    return <FileType className="h-5 w-5 text-amber-500" />;
  }
  
  return <FileType className="h-5 w-5 text-[#0485ea]" />;
};

// Format file size for display
export const formatFileSize = (bytes: number | null) => {
  if (!bytes) return 'Unknown size';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

// Get badge color based on document category
export const getCategoryBadgeColor = (category: string) => {
  switch (category) {
    case 'subcontractor_estimate':
      return "bg-purple-100 text-purple-800";
    case 'vendor_quote':
      return "bg-blue-100 text-blue-800";
    case 'invoice':
      return "bg-green-100 text-green-800";
    case 'contract':
      return "bg-amber-100 text-amber-800";
    case 'insurance':
      return "bg-red-100 text-red-800";
    case 'certification':
      return "bg-teal-100 text-teal-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Format category name for display
export const formatCategoryName = (category: string) => {
  if (category === 'subcontractor_estimate') return 'Subcontractor Estimate';
  if (category === 'vendor_quote') return 'Vendor Quote';
  
  return category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');
};

// Get vendor type display name
export const getVendorTypeDisplay = (vendorType: string) => {
  return vendorType === 'vendor' ? 'Vendor' : 
         vendorType === 'subcontractor' ? 'Subcontractor' : 
         vendorType.charAt(0).toUpperCase() + vendorType.slice(1);
};
