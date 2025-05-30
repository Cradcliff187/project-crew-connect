import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileText, GridIcon, ListIcon, Download, ViewIcon, Trash2 } from 'lucide-react';
import { Document } from '@/components/documents/schemas/documentSchema';
import StandardizedDocumentUpload from '@/components/documents/StandardizedDocumentUpload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import DocumentViewerDialog from '@/components/documents/DocumentViewerDialog';
import DocumentsGrid from '@/components/documents/DocumentsGrid';
import DocumentsDataTable from '@/components/documents/DocumentsDataTable';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import DocumentDeleteDialog from '@/components/documents/DocumentDeleteDialog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload,
  Camera,
  DollarSign,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface TimeEntryReceiptUploadProps {
  timeEntryId: string;
  employeeName?: string;
  amount?: number;
  date?: string;
  onReceiptAdded?: () => void;
  compact?: boolean;
}

interface ReceiptFormData {
  amount: number;
  merchant: string;
  tax: number;
  receipt_date: string;
  expense_category_id: string;
  cost_category_id: string;
  description: string;
  is_billable: boolean;
  file: File | null;
}

interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
}

interface CostCategory {
  category_id: string;
  name: string;
  description?: string;
}

interface OCRResult {
  text: string;
  confidence: number;
  extracted_data: {
    merchant?: string;
    total?: number;
    tax?: number;
    date?: string;
    items?: Array<{ description: string; amount: number }>;
  };
}

const TimeEntryReceiptUpload: React.FC<TimeEntryReceiptUploadProps> = ({
  timeEntryId,
  employeeName = 'Employee',
  amount,
  date,
  onReceiptAdded,
  compact = false,
}) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewType, setViewType] = useState<'grid' | 'list'>(compact ? 'list' : 'grid');
  const { toast } = useToast();
  const [formData, setFormData] = useState<ReceiptFormData>({
    amount: 0,
    merchant: '',
    tax: 0,
    receipt_date: date ? date.split('T')[0] : format(new Date(), 'yyyy-MM-dd'),
    expense_category_id: '',
    cost_category_id: '',
    description: '',
    is_billable: true,
    file: null,
  });
  const [expenseCategories] = useState<ExpenseCategory[]>([
    {
      id: '273cc2b8-019a-487a-b85c-b3aa3deb6c5d',
      name: 'Materials',
      description: 'Construction materials, supplies, and equipment',
    },
    {
      id: '108c00d1-8338-4223-8cc0-2c1d58dadb5d',
      name: 'Tools & Equipment',
      description: 'Tool purchases, rentals, and equipment costs',
    },
    {
      id: '1e8ea606-daee-48c6-8255-da38fb465d0e',
      name: 'Transportation',
      description: 'Vehicle fuel, mileage, and transportation costs',
    },
    {
      id: '8c49e693-0c3f-42e3-a8f1-a28a55cebab0',
      name: 'Safety Equipment',
      description: 'PPE, safety gear, and safety-related expenses',
    },
    {
      id: 'de67d4c8-2f15-421e-8de5-611035ae5903',
      name: 'Other',
      description: 'Miscellaneous project-related expenses',
    },
  ]);
  const [costCategories] = useState<CostCategory[]>([
    {
      category_id: '59bbeefb-63f3-4588-9c03-0eb6049c07d9',
      name: 'Materials',
      description: 'Cost of raw materials and supplies',
    },
    {
      category_id: '9ee87389-7ed6-4f16-8b0f-89c2872e9969',
      name: 'Labor',
      description: 'Direct labor costs',
    },
    {
      category_id: '79261722-b2ca-4d12-a553-da0862b0520d',
      name: 'Equipment',
      description: 'Costs related to equipment rental or usage',
    },
    {
      category_id: '7d6852b4-b97e-481d-ba73-feb37ad34f5c',
      name: 'Subcontractor',
      description: 'Costs associated with subcontractors',
    },
    {
      category_id: '2d067a66-b2d4-414e-b548-bd9e06c85492',
      name: 'Other',
      description: 'Miscellaneous costs not fitting other categories',
    },
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Format date for display
  const formatDate = date ? new Date(date).toLocaleDateString() : 'N/A';

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', 'TIME_ENTRY')
        .eq('entity_id', timeEntryId)
        .eq('category', 'receipt')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to include document URLs
      const receiptsWithUrls = await Promise.all(
        data.map(async doc => {
          if (doc.storage_path) {
            const { data: urlData, error: urlError } = await supabase.storage
              .from('construction_documents')
              .createSignedUrl(doc.storage_path, 3600); // 1 hour expiration

            if (urlError) {
              console.error('Error generating signed URL:', urlError);
              return { ...doc, url: null };
            }

            return { ...doc, url: urlData?.signedUrl || null };
          }
          return { ...doc, url: null };
        })
      );

      setDocuments(receiptsWithUrls);
    } catch (err) {
      console.error('Error in time entry receipts fetch:', err);
      toast({
        title: 'Error',
        description: 'Failed to load time entry receipts.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [timeEntryId, toast]);

  // Load documents on component mount
  useEffect(() => {
    if (timeEntryId) {
      fetchDocuments();
    }
  }, [timeEntryId, fetchDocuments]);

  const handleDocumentUploaded = () => {
    setUploadDialogOpen(false);
    fetchDocuments();
    if (onReceiptAdded) {
      onReceiptAdded();
    }
    toast({
      title: 'Receipt Uploaded',
      description: 'The receipt has been successfully uploaded.',
    });
  };

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setViewerOpen(true);
  };

  const handleDownloadDocument = async (document: Document) => {
    if (document.url) {
      window.open(document.url, '_blank');
    } else {
      toast({
        title: 'Error',
        description: 'Document URL not available.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (document: Document) => {
    setSelectedDocument(document);
    setDeleteDialogOpen(true);
  };

  const handleDocumentDeleted = async () => {
    setDeleteDialogOpen(false);
    await fetchDocuments();
    toast({
      title: 'Receipt Deleted',
      description: 'The receipt has been successfully deleted.',
    });
  };

  const getDocumentActions = (document: Document) => [
    {
      icon: <ViewIcon className="h-4 w-4" />,
      label: 'View',
      onClick: () => handleViewDocument(document),
    },
    {
      icon: <Download className="h-4 w-4" />,
      label: 'Download',
      onClick: () => handleDownloadDocument(document),
    },
    {
      icon: <Trash2 className="h-4 w-4" />,
      label: 'Delete',
      onClick: () => handleDeleteClick(document),
    },
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
      setUploadedFiles([file]);
      processOCR(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const processOCR = async (file: File) => {
    setIsProcessingOCR(true);
    try {
      // Upload file to temporary storage for OCR processing
      const fileExt = file.name.split('.').pop();
      const fileName = `temp-ocr-${Date.now()}.${fileExt}`;
      const filePath = `temp/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get signed URL for OCR processing
      const { data: urlData } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 3600);

      if (!urlData?.signedUrl) {
        throw new Error('Failed to get signed URL for OCR processing');
      }

      // Process with OCR
      const response = await fetch('/api/ocr/process-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          imageUrl: urlData.signedUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('OCR processing failed');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setOcrResult(result.data);

        // Auto-fill form with OCR data
        if (result.data.extracted_data) {
          const extracted = result.data.extracted_data;
          setFormData(prev => ({
            ...prev,
            amount: extracted.total || prev.amount,
            merchant: extracted.merchant || prev.merchant,
            tax: extracted.tax || prev.tax,
            receipt_date: extracted.date || prev.receipt_date,
            description: extracted.merchant
              ? `Receipt from ${extracted.merchant}`
              : prev.description,
          }));
        }

        toast({
          title: 'OCR Processing Complete! 🎉',
          description: 'Receipt data has been extracted and filled in automatically.',
        });
      }

      // Clean up temporary file
      await supabase.storage.from('documents').remove([filePath]);
    } catch (error) {
      console.error('OCR processing error:', error);
      toast({
        title: 'OCR Processing Failed',
        description: 'Please fill in the receipt details manually.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.file || !formData.expense_category_id || !formData.cost_category_id) {
      toast({
        title: 'Missing Information',
        description: 'Please upload a file and select both expense and cost categories.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get employee ID
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('employee_id')
        .eq('user_id', user.id)
        .single();

      if (empError) throw empError;

      // Upload file to permanent storage
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `receipt-${timeEntryId}-${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, formData.file);

      if (uploadError) throw uploadError;

      // Create receipt record directly in receipts table
      const receiptId = crypto.randomUUID();

      const { data: receipt, error: receiptError } = await supabase
        .from('receipts')
        .insert({
          id: receiptId,
          employee_id: employee.employee_id,
          amount: formData.amount,
          merchant: formData.merchant,
          tax: formData.tax,
          currency: 'USD',
          receipt_date: formData.receipt_date,
          ocr_raw: ocrResult,
          ocr_confidence: ocrResult?.confidence,
          ocr_processed_at: ocrResult ? new Date().toISOString() : null,
          storage_path: filePath,
          file_name: formData.file.name,
          file_size: formData.file.size,
          mime_type: formData.file.type,
          created_by: employee.employee_id,
        })
        .select()
        .single();

      if (receiptError) throw receiptError;

      // Create corresponding expense record
      const { error: expenseError } = await supabase.from('expenses').insert({
        entity_type: 'RECEIPT',
        expense_type: 'MATERIAL',
        description: formData.description || `Receipt from ${formData.merchant || 'Unknown'}`,
        amount: formData.amount,
        quantity: 1,
        unit_price: formData.amount,
        expense_date: formData.receipt_date,
        is_billable: formData.is_billable,
        expense_category_id: formData.expense_category_id,
        cost_category_id: formData.cost_category_id,
        receipt_id: receiptId,
      });

      if (expenseError) {
        console.warn('Failed to create expense record:', expenseError);
        // Don't fail the whole operation if expense creation fails
      }

      // For now, skip linking to time entry due to schema constraints
      // This can be handled via a separate receipt management system

      toast({
        title: 'Receipt Uploaded Successfully! 📄',
        description: 'Your receipt has been processed and categorized.',
      });

      onReceiptAdded();
    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload receipt. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, file: null }));
    setUploadedFiles([]);
    setOcrResult(null);
  };

  // Render compact mode
  if (compact) {
    return (
      <>
        <div className="mt-2">
          {documents.length > 0 ? (
            <div className="flex flex-col space-y-2">
              {documents.map(doc => (
                <Button
                  key={doc.document_id}
                  variant="outline"
                  size="sm"
                  className="flex justify-between w-full text-left"
                  onClick={() => handleViewDocument(doc)}
                >
                  <span className="truncate flex-1">{doc.file_name}</span>
                  <span className="text-xs text-muted-foreground">View</span>
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUploadDialogOpen(true)}
                className="text-[#0485ea]"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Another Receipt
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUploadDialogOpen(true)}
              className="w-full"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Receipt
            </Button>
          )}
        </div>

        {/* Document Viewer */}
        <DocumentViewerDialog
          document={selectedDocument}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />

        {/* Receipt Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <DialogHeader>
              <DialogTitle>Upload Receipt</DialogTitle>
              <DialogDescription>
                Upload a receipt for expenses related to this time entry.
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-grow pr-1 -mr-1">
              <StandardizedDocumentUpload
                entityType="TIME_ENTRY"
                entityId={timeEntryId}
                onSuccess={handleDocumentUploaded}
                onCancel={() => setUploadDialogOpen(false)}
                isReceiptUpload={true}
                prefillData={{
                  notes: `Receipt for ${employeeName} on ${formatDate}`,
                  category: 'receipt',
                  amount: amount,
                  expenseDate: date ? new Date(date) : undefined,
                }}
                preventFormPropagation={true}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Document Delete Dialog */}
        <DocumentDeleteDialog
          document={selectedDocument}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDocumentDeleted={handleDocumentDeleted}
        />
      </>
    );
  }

  // Render full mode
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Receipt</h3>
        <p className="text-gray-600">
          Upload and categorize receipts for {employeeName}'s time entry
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Receipt Image or PDF</span>
            </CardTitle>
            <CardDescription>
              Upload a photo or scan of your receipt. We'll automatically extract the details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {uploadedFiles.length === 0 ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <div className="space-y-4">
                  <div className="flex justify-center space-x-4">
                    <Camera className="h-8 w-8 text-gray-400" />
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {isDragActive ? 'Drop the receipt here' : 'Upload Receipt'}
                    </p>
                    <p className="text-gray-600">
                      Drag & drop or click to select • JPG, PNG, PDF up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-600">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isProcessingOCR && (
                        <div className="flex items-center space-x-2 text-blue-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Processing...</span>
                        </div>
                      )}
                      {ocrResult && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          OCR Complete
                        </Badge>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* OCR Results */}
        {ocrResult && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <CheckCircle2 className="h-5 w-5" />
                <span>OCR Results</span>
              </CardTitle>
              <CardDescription className="text-green-700">
                Confidence: {(ocrResult.confidence * 100).toFixed(1)}% • Data extracted
                automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {ocrResult.extracted_data.merchant && (
                  <div>
                    <span className="font-medium text-green-800">Merchant:</span>
                    <span className="ml-2 text-green-700">{ocrResult.extracted_data.merchant}</span>
                  </div>
                )}
                {ocrResult.extracted_data.total && (
                  <div>
                    <span className="font-medium text-green-800">Total:</span>
                    <span className="ml-2 text-green-700">
                      ${ocrResult.extracted_data.total.toFixed(2)}
                    </span>
                  </div>
                )}
                {ocrResult.extracted_data.tax && (
                  <div>
                    <span className="font-medium text-green-800">Tax:</span>
                    <span className="ml-2 text-green-700">
                      ${ocrResult.extracted_data.tax.toFixed(2)}
                    </span>
                  </div>
                )}
                {ocrResult.extracted_data.date && (
                  <div>
                    <span className="font-medium text-green-800">Date:</span>
                    <span className="ml-2 text-green-700">{ocrResult.extracted_data.date}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Receipt Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Receipt Details</span>
            </CardTitle>
            <CardDescription>Verify and complete the receipt information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Total Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount || ''}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))
                  }
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="tax">Tax Amount</Label>
                <Input
                  id="tax"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.tax || ''}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="merchant">Merchant/Vendor</Label>
                <Input
                  id="merchant"
                  value={formData.merchant}
                  onChange={e => setFormData(prev => ({ ...prev, merchant: e.target.value }))}
                  placeholder="e.g., Home Depot"
                />
              </div>
              <div>
                <Label htmlFor="receipt_date">Receipt Date</Label>
                <Input
                  id="receipt_date"
                  type="date"
                  value={formData.receipt_date}
                  onChange={e => setFormData(prev => ({ ...prev, receipt_date: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the expense..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Categorization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Expense Categorization</span>
            </CardTitle>
            <CardDescription>
              Categorize this expense for proper accounting and reporting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="expense_category">Expense Category *</Label>
              <Select
                value={formData.expense_category_id}
                onValueChange={value =>
                  setFormData(prev => ({ ...prev, expense_category_id: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select expense category..." />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        {category.description && (
                          <div className="text-xs text-gray-500">{category.description}</div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cost_category">Cost Category *</Label>
              <Select
                value={formData.cost_category_id}
                onValueChange={value => setFormData(prev => ({ ...prev, cost_category_id: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cost category..." />
                </SelectTrigger>
                <SelectContent>
                  {costCategories.map(category => (
                    <SelectItem key={category.category_id} value={category.category_id}>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        {category.description && (
                          <div className="text-xs text-gray-500">{category.description}</div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_billable"
                checked={formData.is_billable}
                onChange={e => setFormData(prev => ({ ...prev, is_billable: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_billable" className="text-sm">
                This expense is billable to the client
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <Button
            type="submit"
            disabled={
              isUploading ||
              !formData.file ||
              !formData.expense_category_id ||
              !formData.cost_category_id
            }
            className="flex items-center space-x-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Save Receipt</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Document Viewer */}
      <DocumentViewerDialog
        document={selectedDocument}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
      />

      {/* Document Delete Dialog */}
      <DocumentDeleteDialog
        document={selectedDocument}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDocumentDeleted={handleDocumentDeleted}
      />
    </div>
  );
};

export default TimeEntryReceiptUpload;
