
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { documentCategories } from './schemas/documentSchema';
import { DocumentFilterFormValues, DocumentFiltersProps } from './types/documentTypes';

// Define the filter schema
const filterSchema = z.object({
  searchTerm: z.string().optional(),
  category: z.string().optional(),
  isExpense: z.boolean().optional().default(false),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

const DocumentFilters: React.FC<DocumentFiltersProps> = ({ 
  onFilterChange,
  initialFilters = {}
}) => {
  // Initialize the form with default values
  const form = useForm<DocumentFilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      searchTerm: initialFilters.searchTerm || '',
      category: initialFilters.category || '',
      isExpense: initialFilters.isExpense || false,
      dateFrom: initialFilters.dateFrom || '',
      dateTo: initialFilters.dateTo || '',
    },
  });

  // Handle form submission
  const onSubmit = (data: DocumentFilterFormValues) => {
    onFilterChange(data);
  };

  // Handle form reset
  const handleReset = () => {
    form.reset({
      searchTerm: '',
      category: '',
      isExpense: false,
      dateFrom: '',
      dateTo: '',
    });
    onFilterChange({
      searchTerm: '',
      category: '',
      isExpense: false,
      dateFrom: '',
      dateTo: '',
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Filter Documents</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search Term */}
              <FormField
                control={form.control}
                name="searchTerm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Search</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Search by file name or notes" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* Category Field - Use select instead of DocumentCategorySelector */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        {...field}
                      >
                        <option value="">All Categories</option>
                        {documentCategories.map((category) => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* Date Range */}
              <FormField
                control={form.control}
                name="dateFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dateTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* Is Expense Checkbox */}
              <FormField
                control={form.control}
                name="isExpense"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 mt-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Show only expenses
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button type="submit">Apply Filters</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default DocumentFilters;
