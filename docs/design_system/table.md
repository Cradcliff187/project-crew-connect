# Design System: Table

This document describes the standard table components.

## Base Components

- **`src/components/ui/table.tsx`:** Provides styled wrappers for standard HTML table elements.
- **Exports:**
  - `Table`: Wrapper for `<table>` (inside a responsive `div`).
  - `TableHeader`: Wrapper for `<thead>`.
  - `TableBody`: Wrapper for `<tbody>`.
  - `TableFooter`: Wrapper for `<tfoot>`.
  - `TableRow`: Wrapper for `<tr>`.
  - `TableHead`: Wrapper for `<th>`.
  - `TableCell`: Wrapper for `<td>`.
  - `TableCaption`: Wrapper for `<caption>`.

## Styling

- Components primarily use Tailwind CSS for structure and appearance, providing a consistent base style.
- **Table:** `w-full caption-bottom text-sm`. Wrapped in `div` with `relative w-full overflow-auto`.
- **TableHeader (`<thead>`):** `[&_tr]:border-b` (adds border below header rows).
- **TableBody (`<tbody>`):** `[&_tr:last-child]:border-0` (removes border from last body row).
- **TableFooter (`<tfoot>`):** `border-t bg-muted/50 font-medium [&>tr]:last:border-b-0`.
- **TableRow (`<tr>`):** `border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted` (adds bottom border, hover effect, selected state).
- **TableHead (`<th>`):** `h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0` (padding, alignment, text style, special padding adjustment for checkboxes).
- **TableCell (`<td>`):** `p-4 align-middle [&:has([role=checkbox])]:pr-0` (padding, alignment, special padding adjustment for checkboxes).
- **TableCaption (`<caption>`):** `mt-4 text-sm text-muted-foreground`.

## Props

- Each component accepts standard HTML attributes for its corresponding element (e.g., `colSpan`, `rowSpan` on `TableCell`/`TableHead`).
- `className`: Allows adding custom Tailwind classes for overrides or specific styling needs on any table part.
- `ref`: Forwarded to the underlying HTML element.

## Usage Guidelines

- Import the required table components from `@/components/ui/table`.
- Structure your table using the standard HTML hierarchy, but replace the native elements with the imported components (e.g., use `<Table>` instead of `<table>`, `<TableRow>` instead of `<tr>`, etc.).
- Use `TableHeader` and `TableHead` for header rows/cells.
- Use `TableBody` and `TableCell` for data rows/cells.
- Use `TableCaption` for providing an accessible description of the table.
- These components provide basic styling. For complex table features like sorting, filtering, pagination, consider using them in conjunction with libraries like `@tanstack/react-table`.

## Examples

### Basic Table

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const invoices = [
  {
    invoice: 'INV001',
    paymentStatus: 'Paid',
    totalAmount: '$250.00',
    paymentMethod: 'Credit Card',
  },
  {
    invoice: 'INV002',
    paymentStatus: 'Pending',
    totalAmount: '$150.00',
    paymentMethod: 'PayPal',
  },
  // ... more invoices
];

function BasicTable() {
  return (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map(invoice => (
          <TableRow key={invoice.invoice}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$2,500.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
```
