
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { DocumentCategory, EntityType, entityCategoryMap, getEntityCategories } from '../schemas/documentSchema';
import { parseEntityType } from '../utils/documentTypeUtils';

interface CategoryFilterProps {
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  entityType?: string;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategories,
  onCategoryChange,
  entityType
}) => {
  // Get available categories based on entity type
  const availableCategories = entityType 
    ? getEntityCategories(entityType ? parseEntityType(entityType) : EntityType.PROJECT)
    : Object.keys(entityCategoryMap).reduce((acc, key) => {
        return [...acc, ...entityCategoryMap[EntityType[key as keyof typeof EntityType]]];
      }, [] as DocumentCategory[]).filter((value, index, self) => self.indexOf(value) === index);

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const clearFilters = () => {
    onCategoryChange([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filter by Category</h3>
        {selectedCategories.length > 0 && (
          <button 
            className="text-xs text-muted-foreground hover:text-foreground flex items-center"
            onClick={clearFilters}
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {availableCategories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategories.includes(category) ? "default" : "outline"}
            className={`cursor-pointer capitalize ${
              selectedCategories.includes(category) 
                ? "bg-[#0485ea] hover:bg-[#0485ea]/90" 
                : "hover:bg-muted"
            }`}
            onClick={() => toggleCategory(category)}
          >
            {selectedCategories.includes(category) && <Check className="h-3 w-3 mr-1" />}
            {category.replace(/_/g, ' ')}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
