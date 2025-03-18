
import React, { useState } from 'react';
import PageTransition from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Download, Trash2, Eye, FileText, Receipt, FileBox, Shield, FileImage, File } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import DocumentUpload from "@/components/documents/DocumentUpload";
import { DialogTrigger, DialogTitle, DialogDescription, DialogHeader, DialogFooter, DialogContent, Dialog } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DocumentFilters from "@/components/documents/DocumentFilters";

// Define document model for frontend use
export interface Document {
  document_id: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  storage_path: string;
  entity_type: string;
  entity_id: string;
  uploaded_by: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  url?: string;
  category?: string;
  amount?: number;
  expense_date?: string;
  version?: number;
  is_expense?: boolean;
  notes?: string;
}

const DocumentsPage: React.FC = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
  };

  const handleDeleteDocument = () => {
    // Implement delete logic here
    setIsDeleteOpen(false);
  };

  return (
    <PageTransition>
      <div className="container py-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Documents</h1>
          <div className="space-x-2">
            <Input
              placeholder="Search documents..."
              className="md:w-[200px] lg:w-[300px]"
              value={search}
              onChange={handleSearchChange}
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Document
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                  <DialogDescription>
                    Upload a new document to your system.
                  </DialogDescription>
                </DialogHeader>
                <DocumentUpload />
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Separator className="mb-4" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            {/* Filters Component */}
            <div>Filters</div>
          </div>

          <div className="lg:col-span-3">
            {/* Documents Table */}
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>Uploaded Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((document) => (
                    <TableRow key={document.document_id}>
                      <TableCell>{document.file_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {document.category === 'invoice' && <FileText className="w-4 h-4 mr-2" />}
                          {document.category === 'receipt' && <Receipt className="w-4 h-4 mr-2" />}
                          {document.category === 'contract' && <FileBox className="w-4 h-4 mr-2" />}
                          {document.category === 'insurance' && <Shield className="w-4 h-4 mr-2" />}
                          {document.category === 'certification' && <Shield className="w-4 h-4 mr-2" />}
                          {document.category === 'photo' && <FileImage className="w-4 h-4 mr-2" />}
                          {document.category === 'other' && <File className="w-4 h-4 mr-2" />}
                          {document.category}
                        </div>
                      </TableCell>
                      <TableCell>{document.entity_type}</TableCell>
                      <TableCell>{document.created_at}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDocumentSelect(document)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsDeleteOpen(true)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Document</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this document? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" onClick={handleDeleteDocument}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default DocumentsPage;
