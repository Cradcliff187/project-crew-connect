# Modal (Dialog) Guidelines

## Overview

This document outlines the proper usage of modal dialogs in the AKC Revisions application. Following these guidelines ensures consistent user experience and prevents common issues like nested dialogs and accessibility violations.

## Core Principles

### 1. No Nested Dialogs

**⚠️ NEVER render a Dialog inside another Dialog**

Nested dialogs create poor user experience and accessibility issues:

- Multiple backdrop overlays confuse users
- Focus management becomes unpredictable
- Escape key behavior is ambiguous
- Screen readers announce conflicting information

❌ **Bad:**

```tsx
<Dialog open={open1}>
  <DialogContent>
    <Dialog open={open2}>
      {' '}
      {/* NEVER DO THIS */}
      <DialogContent>...</DialogContent>
    </Dialog>
  </DialogContent>
</Dialog>
```

✅ **Good:**

```tsx
// Use DocumentViewerContent inside existing dialogs
<Dialog open={uploadOpen}>
  <DialogContent>
    <DocumentViewerContent document={doc} />
  </DialogContent>
</Dialog>

// Or use DocumentViewerDialog standalone
<DocumentViewerDialog
  document={doc}
  open={viewOpen}
  onOpenChange={setViewOpen}
/>
```

### 2. Required Radix-UI Structure

Every dialog must follow this structure:

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Brief description of what this dialog does</DialogDescription>
    </DialogHeader>

    {/* Dialog body content */}

    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button onClick={handleSave}>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```

### 3. Accessibility Requirements

#### DialogDescription is MANDATORY

Every `DialogContent` must have an associated `DialogDescription`:

```tsx
<DialogContent>
  <DialogHeader>
    <DialogTitle>Upload Document</DialogTitle>
    <DialogDescription>Upload and categorize documents for this project</DialogDescription>
  </DialogHeader>
</DialogContent>
```

If the description should not be visible, use the `sr-only` class:

```tsx
<DialogDescription className="sr-only">
  View and manage document {document.file_name}
</DialogDescription>
```

#### Focus Management

- Dialog automatically traps focus when opened
- First focusable element receives focus on open
- Focus returns to trigger element on close
- Use `DialogClose` for proper close button behavior

#### Keyboard Navigation

- `Escape` closes the dialog
- `Tab` cycles through focusable elements
- `Shift+Tab` cycles backward

## Document Viewer Pattern

### Components Available

1. **DocumentViewerContent** - Base viewer without dialog wrapper
2. **DocumentViewerDialog** - Full dialog implementation
3. **DocumentViewer** - Deprecated alias (use DocumentViewerDialog)

### Usage Examples

#### Inside an existing dialog:

```tsx
import { DocumentViewerContent } from '@/components/documents';

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>View Receipt</DialogTitle>
      <DialogDescription>Receipt for purchase order #12345</DialogDescription>
    </DialogHeader>
    <DocumentViewerContent document={receiptDoc} showHeader={false} />
  </DialogContent>
</Dialog>;
```

#### Standalone viewer:

```tsx
import { DocumentViewerDialog } from '@/components/documents';

<DocumentViewerDialog
  document={document}
  open={viewerOpen}
  onOpenChange={setViewerOpen}
  relatedDocuments={relatedDocs}
  onVersionChange={handleVersionChange}
/>;
```

## Common Patterns

### Upload Dialog with Viewer

```tsx
function DocumentManager() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState<Document | null>(null);

  return (
    <>
      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Select and upload a new document</DialogDescription>
          </DialogHeader>
          <DocumentUpload onSuccess={() => setUploadOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Separate Viewer Dialog */}
      <DocumentViewerDialog
        document={viewDoc}
        open={!!viewDoc}
        onOpenChange={open => !open && setViewDoc(null)}
      />
    </>
  );
}
```

### Confirmation Dialog

```tsx
<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Document?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. The document will be permanently deleted.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Testing Checklist

Before submitting dialog-related code:

- [ ] No Dialog components are rendered inside other Dialog components
- [ ] Every DialogContent has a DialogDescription
- [ ] Dialog can be closed with Escape key
- [ ] Focus is properly managed (trapped when open, restored when closed)
- [ ] Screen reader announces dialog title and description
- [ ] Loading states are handled appropriately
- [ ] Error states provide clear feedback

## Migration Guide

If you have existing nested dialogs:

1. Identify the inner dialog component
2. If it's a document viewer, replace with `DocumentViewerContent`
3. If it's custom content, extract to a separate component
4. Ensure only one Dialog wrapper remains
5. Add missing DialogDescription components
6. Test accessibility with keyboard navigation

## References

- [Radix UI Dialog Documentation](https://www.radix-ui.com/primitives/docs/components/dialog)
- [WAI-ARIA Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [Component Source](../../src/components/ui/dialog.tsx)
