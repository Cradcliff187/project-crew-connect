# Vendor–Subcontractor Component Alignment Report

## Summary

This report analyzes the visual and functional consistency between the Vendors and Subcontractors components. Both share a similar page structure with PageTransition, Header components, and Tables. However, there are several key inconsistencies: different styling approaches for empty/loading states, hardcoded color values instead of semantic design tokens, inconsistent hover state styling, and differing table component structures. The Subcontractors page includes a unique "Add Specialty" button not found in Vendors, while table layouts vary with different column sets. Most critically, the components use inconsistent implementations for similar UI patterns, with some leveraging reusable components and others using custom implementations. Addressing these inconsistencies will create a unified experience across both sections, enhancing usability, maintainability, and visual coherence within the application.

## Comparison Matrix

| Area                      | Vendors                                                           | Subcontractors                                                                                 | Consistency Issue?                            | Recommendation                                                                     |
| ------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Layout / Grid**         | Uses PageTransition + VendorsHeader + Table in flex column layout | Uses PageTransition + SubcontractorsHeader + Table in flex column layout                       | ✅ Generally consistent structure             | Maintain consistent flex column layout with mt-6 spacing                           |
| **Typography**            | Standard system through PageHeader                                | Standard system through PageHeader                                                             | ✅ Consistent                                 | No changes needed                                                                  |
| **Colors / Icons**        | Hardcoded color `bg-[#0485ea]` in VendorSheet                     | Hardcoded color `bg-[#0485ea]` in SubcontractorSheet and `hover:bg-[#0485ea]/5` in row hover   | ❌ Inconsistent use of design tokens          | Replace hardcoded colors with semantic tokens (`bg-primary`, `hover:bg-primary/5`) |
| **Spacing & Padding**     | `className="w-[180px] sm:w-[300px] pl-8"` in search               | `className="w-[180px] sm:w-[300px] pl-8"` in search                                            | ✅ Consistent                                 | Replace with SearchInput component for better maintainability                      |
| **Interaction States**    | `hover:bg-muted/50` in VendorTableRow                             | `hover:bg-[#0485ea]/5` in SubcontractorTableRow                                                | ❌ Inconsistent hover behaviors               | Standardize on `hover:bg-primary/5` or `hover:bg-muted/50`                         |
| **Accessibility**         | Missing aria-labels on some icon buttons                          | Missing aria-labels on some icon buttons                                                       | ⚠️ Consistent but needs improvement           | Add aria-labels to all icon-only buttons                                           |
| **Data Fields & Labels**  | Vendor-specific columns: Name, Contact, Location, Status, Actions | Subcontractor-specific columns: Name, Specialties, Contact, Location, Details, Status, Actions | ⚠️ Different fields reflecting content needs  | Standardize column styling while maintaining field differences                     |
| **Empty States**          | Standalone component with different layout than Subcontractors    | Table shell with TableCell (colSpan)                                                           | ❌ Different implementations                  | Create a shared EmptyState pattern for both components                             |
| **Loading States**        | Standalone component with full table structure                    | Only TableBody rows without full table                                                         | ❌ Inconsistent loading state implementations | Use TableLoading component from UI alignment for both                              |
| **Error States**          | Standalone component with custom styling                          | Table shell with error message                                                                 | ❌ Different implementations                  | Create a shared error state component                                              |
| **Form/Sheet Components** | VendorSheet with hardcoded colors                                 | SubcontractorSheet with hardcoded colors                                                       | ⚠️ Similar with minor inconsistencies         | Extract common patterns and standardize on design tokens                           |
| **Table Structure**       | Standalone component imports                                      | Nests components within table                                                                  | ❌ Different import/component hierarchies     | Standardize table component architecture                                           |

## Prioritized Recommendations

1. **Standardize Design Tokens Usage** (High Impact, Low Effort)

   - Replace all hardcoded color values (`bg-[#0485ea]`, `hover:bg-[#0375d1]`) with semantic tokens (`bg-primary`, `hover:bg-primary/80`)
   - Apply to both VendorSheet and SubcontractorSheet components
   - Design Token refs: `--primary`, `--primary-foreground`

2. **Implement Consistent Table Hover States** (High Impact, Low Effort)

   - Standardize hover styling in table rows across both components
   - Choose either `hover:bg-muted/50` or `hover:bg-primary/5` consistently
   - Design Token refs: `--muted`, `--primary`

3. **Create Common Search Component** (Medium Impact, Low Effort)

   - Replace custom search implementations with the shared SearchInput component
   - Ensures consistent styling and behavior for search functionality
   - Design Token refs: `--input`, `--border`, `--muted-foreground`

4. **Normalize Empty States** (Medium Impact, Medium Effort)

   - Create a shared EmptyState component that works within tables
   - Implement consistent visual styling and messaging patterns
   - Design Token refs: `--muted-foreground`, `--foreground`

5. **Standardize Loading States** (Medium Impact, Low Effort)

   - Use the TableLoading component from UI alignment in both sections
   - Ensure consistent skeleton loading appearance
   - Design Token refs: `--muted`

6. **Align Error State Handling** (Medium Impact, Low Effort)

   - Create a unified error state component
   - Standardize error messaging and styling
   - Design Token refs: `--destructive`, `--destructive-foreground`

7. **Refactor Sheet Components** (High Impact, High Effort)

   - Extract common patterns from VendorSheet and SubcontractorSheet
   - Create a base EntitySheet component to reduce duplication
   - Design Token refs: `--primary`, `--background`, `--card`

8. **Improve Accessibility** (High Impact, Low Effort)

   - Add aria-labels to all icon buttons
   - Ensure proper focus states on interactive elements
   - Design Token refs: `--ring`

9. **Align Table Component Structure** (Medium Impact, High Effort)

   - Standardize the way table components are structured and imported
   - Create consistent patterns for table headers, bodies, and rows
   - Design Token refs: `--border`, `--card`

10. **Create Specialty Badge Component** (Low Impact, Medium Effort)
    - Extract the specialties badge styling into a reusable component
    - Can be leveraged by both Vendors and Subcontractors for tagging
    - Design Token refs: `--secondary`, `--secondary-foreground`

## QA Checklist for Future Development

✓ All colors use semantic design tokens, not hardcoded values
✓ Hover states are consistent across similar elements
✓ All icon buttons include appropriate aria-labels
✓ Empty, loading, and error states follow standardized patterns
✓ Search functionality uses the shared SearchInput component
✓ Table layouts maintain visual consistency while accommodating different data fields
✓ Form and modal components follow the same visual language
✓ Spacing and padding values are consistent across both components
✓ Status badges use consistent styling through StatusBadge component
✓ Button sizes and variants match in equivalent contexts
