
import React from 'react';
import { Button } from "@/components/ui/button";
import { Filter, Plus } from "lucide-react";

interface DocumentEmptyProps {
  activeFiltersCount: number;
  onUploadClick: () => void;
}

const DocumentEmpty: React.FC<DocumentEmptyProps> = ({ 
  activeFiltersCount, 
  onUploadClick 
}) => {
  return (
    <div className="bg-white rounded-md shadow-sm border p-8 text-center">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="p-3 rounded-full bg-[#0485ea]/10">
          <Filter className="h-10 w-10 text-[#0485ea]" />
        </div>
        <h3 className="text-lg font-semibold">No documents found</h3>
        <p className="text-muted-foreground max-w-md">
          {activeFiltersCount > 0 
            ? "Try adjusting your filters or uploading new documents." 
            : "Upload your first document to get started."}
        </p>
        <Button 
          className="mt-4 bg-[#0485ea] hover:bg-[#0375d1]"
          onClick={onUploadClick}
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>
    </div>
  );
};

export default DocumentEmpty;
