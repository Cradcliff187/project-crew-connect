
import React from 'react';
import { Search, Filter, FileText, Receipt, FileBox, Shield, FileImage, File } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { DocumentCategory, EntityType, entityTypes } from './schemas/documentSchema';

interface FilterOptions {
  search: string;
  category?: DocumentCategory;
  entityType?: EntityType;
  isExpense?: boolean;
  sortBy?: string;
}

interface DocumentFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onReset: () => void;
  activeFiltersCount: number;
}

const DocumentFilters: React.FC<DocumentFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  activeFiltersCount
}) => {
  const handleCategoryChange = (value: string) => {
    onFilterChange({ 
      ...filters, 
      category: value === 'all' ? undefined : value as DocumentCategory 
    });
  };

  const handleEntityTypeChange = (value: string) => {
    onFilterChange({ 
      ...filters, 
      entityType: value === 'all' ? undefined : value as EntityType 
    });
  };

  const handleSortChange = (value: string) => {
    onFilterChange({ ...filters, sortBy: value });
  };

  const handleExpenseFilterChange = (value: string) => {
    onFilterChange({ 
      ...filters, 
      isExpense: value === 'all' ? undefined : value === 'yes' 
    });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#0485ea]" />
          <h3 className="font-medium text-[#0485ea]">Filter Documents</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount}</Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onReset} 
            className="h-8 text-sm"
          >
            Clear All
          </Button>
        )}
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Select
          value={filters.category !== undefined ? filters.category : 'all'}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Document Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="invoice">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                <span>Invoice</span>
              </div>
            </SelectItem>
            <SelectItem value="receipt">
              <div className="flex items-center">
                <Receipt className="h-4 w-4 mr-2" />
                <span>Receipt</span>
              </div>
            </SelectItem>
            <SelectItem value="estimate">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-blue-600" />
                <span>Estimate</span>
              </div>
            </SelectItem>
            <SelectItem value="contract">
              <div className="flex items-center">
                <FileBox className="h-4 w-4 mr-2" />
                <span>Contract</span>
              </div>
            </SelectItem>
            <SelectItem value="insurance">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                <span>Insurance</span>
              </div>
            </SelectItem>
            <SelectItem value="certification">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                <span>Certification</span>
              </div>
            </SelectItem>
            <SelectItem value="photo">
              <div className="flex items-center">
                <FileImage className="h-4 w-4 mr-2" />
                <span>Photo</span>
              </div>
            </SelectItem>
            <SelectItem value="other">
              <div className="flex items-center">
                <File className="h-4 w-4 mr-2" />
                <span>Other</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filters.entityType !== undefined ? filters.entityType : 'all'}
          onValueChange={handleEntityTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Related To" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            {entityTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filters.isExpense === undefined ? 'all' : filters.isExpense ? 'yes' : 'no'}
          onValueChange={handleExpenseFilterChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Document Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Documents</SelectItem>
            <SelectItem value="yes">Expenses Only</SelectItem>
            <SelectItem value="no">Non-Expenses Only</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filters.sortBy || 'newest'}
          onValueChange={handleSortChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="name_asc">Name (A-Z)</SelectItem>
            <SelectItem value="name_desc">Name (Z-A)</SelectItem>
            <SelectItem value="size_asc">Size (Smallest)</SelectItem>
            <SelectItem value="size_desc">Size (Largest)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.category && (
            <Badge variant="outline" className="flex items-center gap-1 bg-gray-50">
              {filters.category}
              <button 
                className="ml-1 hover:bg-gray-200 rounded-full w-4 h-4 inline-flex items-center justify-center"
                onClick={() => handleCategoryChange('all')}
              >
                ×
              </button>
            </Badge>
          )}
          {filters.entityType && (
            <Badge variant="outline" className="flex items-center gap-1 bg-gray-50">
              {filters.entityType.replace('_', ' ').toLowerCase()}
              <button 
                className="ml-1 hover:bg-gray-200 rounded-full w-4 h-4 inline-flex items-center justify-center"
                onClick={() => handleEntityTypeChange('all')}
              >
                ×
              </button>
            </Badge>
          )}
          {filters.isExpense !== undefined && (
            <Badge variant="outline" className="flex items-center gap-1 bg-gray-50">
              {filters.isExpense ? 'Expenses Only' : 'Non-Expenses Only'}
              <button 
                className="ml-1 hover:bg-gray-200 rounded-full w-4 h-4 inline-flex items-center justify-center"
                onClick={() => handleExpenseFilterChange('all')}
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}
    </Card>
  );
};

export default DocumentFilters;
