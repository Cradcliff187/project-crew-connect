
import React from 'react';
import { Search, Filter, FileText, Receipt, FileBox, Shield, FileImage, File } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleCategoryChange = (value: string) => {
    onFilterChange({ 
      ...filters, 
      category: value as DocumentCategory 
    });
  };

  const handleEntityTypeChange = (value: string) => {
    onFilterChange({ 
      ...filters, 
      entityType: value as EntityType 
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'invoice':
        return <FileText className="h-4 w-4 mr-2" />;
      case 'receipt':
        return <Receipt className="h-4 w-4 mr-2" />;
      case 'contract':
        return <FileBox className="h-4 w-4 mr-2" />;
      case 'insurance':
      case 'certification':
        return <Shield className="h-4 w-4 mr-2" />;
      case 'photo':
        return <FileImage className="h-4 w-4 mr-2" />;
      default:
        return <File className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          className="pl-8"
          value={filters.search}
          onChange={handleSearchChange}
        />
      </div>
      
      <div className="flex items-center">
        <div className="flex items-center text-sm text-muted-foreground mr-2">
          <Filter className="h-4 w-4 mr-1" />
          <span>Filters</span>
        </div>
        
        {activeFiltersCount > 0 && (
          <>
            <Badge variant="secondary" className="mr-2">
              {activeFiltersCount}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onReset} 
              className="h-8 text-sm"
            >
              Reset
            </Button>
          </>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <Select
          value={filters.category || ''}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
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
          value={filters.entityType || ''}
          onValueChange={handleEntityTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Entities" />
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
            <SelectValue placeholder="Expense Documents" />
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
      
      <Separator />
    </div>
  );
};

export default DocumentFilters;
