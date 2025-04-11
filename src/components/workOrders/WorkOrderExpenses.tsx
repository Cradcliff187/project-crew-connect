
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, FilePlus, Receipt } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Document, EntityType } from '@/components/documents/schemas/documentSchema';
import { DocumentViewer } from '@/components/documents';
import { formatDate } from '@/lib/utils';

interface WorkOrderExpense {
  id: string;
  expense_name: string;
  expense_type: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  receipt_document_id: string | null;
  created_at: string;
  source_type: string;
}

interface WorkOrderExpensesProps {
  workOrderId: string;
  expenses: WorkOrderExpense[];
  onAddExpense: () => void;
  onAddReceipt: (expense: WorkOrderExpense) => void;
}

const WorkOrderExpenses = ({ workOrderId, expenses, onAddExpense, onAddReceipt }: WorkOrderExpensesProps) => {
  const { toast } = useToast();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const handleViewReceipt = async (receiptId: string) => {
    if (!receiptId) return;
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('document_id', receiptId)
        .single();
      
      if (error) throw error;
      
      // Get URL for the document from storage
      const { data: urlData } = await supabase
        .storage
        .from('construction_documents')
        .getPublicUrl(data.storage_path);
      
      if (!urlData) throw new Error('Could not get document URL');
      
      // Create document object with URL
      const document: Document = {
        document_id: data.document_id,
        file_name: data.file_name,
        file_type: data.file_type,
        url: urlData.publicUrl,
        storage_path: data.storage_path,
        entity_type: EntityType.WORK_ORDER,
        entity_id: data.entity_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        tags: data.tags || [],
      };
      
      setSelectedDocument(document);
      
    } catch (err) {
      console.error('Error fetching receipt:', err);
      toast({
        title: 'Error',
        description: 'Could not load the receipt',
        variant: 'destructive',
      });
    }
  };
  
  const closeViewer = () => {
    setSelectedDocument(null);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Expenses & Materials</h3>
        <Button
          className="bg-[#0485ea] hover:bg-[#0375d1]"
          onClick={onAddExpense}
        >
          <FilePlus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>
      
      {expenses.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No expenses recorded for this work order.</p>
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={onAddExpense}
            >
              <FilePlus className="mr-2 h-4 w-4" />
              Record Expense
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Item</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Quantity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Unit Price</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Total</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm">{expense.expense_name}</td>
                  <td className="px-4 py-3 text-sm capitalize">{expense.expense_type || "N/A"}</td>
                  <td className="px-4 py-3 text-sm">{expense.quantity}</td>
                  <td className="px-4 py-3 text-sm">${expense.unit_price?.toFixed(2) || "0.00"}</td>
                  <td className="px-4 py-3 text-sm">${expense.total_price?.toFixed(2) || "0.00"}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(expense.created_at)}</td>
                  <td className="px-4 py-3">
                    {expense.receipt_document_id ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewReceipt(expense.receipt_document_id || '')}
                        className="h-8 px-2 text-[#0485ea]"
                      >
                        <Receipt className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddReceipt(expense)}
                        className="h-8 px-2 text-muted-foreground"
                      >
                        <FilePlus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {selectedDocument && (
        <DocumentViewer 
          document={selectedDocument}
          open={Boolean(selectedDocument)}
          onOpenChange={(open) => !open && closeViewer()}
        />
      )}
    </div>
  );
};

export default WorkOrderExpenses;
