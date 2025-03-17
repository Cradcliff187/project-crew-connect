import { useState, useEffect } from 'react';
import { Search, FileText, Plus, Filter, MoreHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StatusBadge from '@/components/ui/StatusBadge';
import PageTransition from '@/components/layout/PageTransition';
import Header from '@/components/layout/Header';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EstimateDetails, { EstimateItem, EstimateRevision } from '@/components/estimates/EstimateDetails';
import EstimateForm from '@/components/estimates/EstimateForm';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusType } from '@/types/common';

type EstimateType = {
  id: string;
  client: string;
  project: string;
  date: string;
  amount: number;
  status: StatusType | string;
  versions: number;
  description?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
};

const Estimates = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [estimates, setEstimates] = useState<EstimateType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateType | null>(null);
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([]);
  const [estimateRevisions, setEstimateRevisions] = useState<EstimateRevision[]>([]);
  const [showNewEstimateForm, setShowNewEstimateForm] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchEstimates();
  }, []);
  
  const fetchEstimates = async () => {
    try {
      setLoading(true);
      const { data: estimatesData, error } = await supabase
        .from('estimates')
        .select(`
          estimateid,
          customername,
          projectname,
          datecreated,
          estimateamount,
          status,
          "job description",
          sitelocationaddress,
          sitelocationcity,
          sitelocationstate,
          sitelocationzip,
          customerid,
          projectid
        `)
        .order('datecreated', { ascending: false });

      if (error) {
        throw error;
      }

      const { data: revisionCountsData, error: revisionsError } = await supabase
        .from('estimate_revisions')
        .select('estimate_id, count', { count: 'exact' });

      if (revisionsError) {
        console.error('Error fetching revision counts:', revisionsError);
      }

      const revisionCounts: Record<string, number> = {};
      if (revisionCountsData) {
        revisionCountsData.forEach((item) => {
          revisionCounts[item.estimate_id] = item.count || 0;
        });
      }

      const formattedEstimates = estimatesData.map(estimate => {
        const revisionCount = revisionCounts[estimate.estimateid] || 0;
        
        return {
          id: estimate.estimateid,
          client: estimate.customername || 'Unknown Client',
          project: estimate.projectname || 'Unnamed Project',
          date: estimate.datecreated || new Date().toISOString(),
          amount: Number(estimate.estimateamount) || 0,
          status: estimate.status || 'draft',
          versions: Number(revisionCount) + 1,
          description: estimate["job description"],
          location: {
            address: estimate.sitelocationaddress,
            city: estimate.sitelocationcity,
            state: estimate.sitelocationstate,
            zip: estimate.sitelocationzip
          }
        };
      });

      setEstimates(formattedEstimates);
    } catch (error) {
      console.error('Error fetching estimates:', error);
      toast({
        title: "Error",
        description: "Failed to load estimates. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchEstimateDetails = async (estimateId: string) => {
    try {
      const { data: items, error: itemsError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('estimate_id', estimateId);
      
      if (itemsError) {
        throw itemsError;
      }
      
      const { data: revisions, error: revisionsError } = await supabase
        .from('estimate_revisions')
        .select('*')
        .eq('estimate_id', estimateId)
        .order('version', { ascending: false });
      
      if (revisionsError) {
        throw revisionsError;
      }
      
      setEstimateItems(items || []);
      setEstimateRevisions(revisions || []);
    } catch (error) {
      console.error('Error fetching estimate details:', error);
      toast({
        title: "Error",
        description: "Failed to load estimate details. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewEstimate = (estimate: EstimateType) => {
    setSelectedEstimate(estimate);
    fetchEstimateDetails(estimate.id);
  };
  
  const closeEstimateDetails = () => {
    setSelectedEstimate(null);
    setEstimateItems([]);
    setEstimateRevisions([]);
    fetchEstimates(); // Refresh the list when the dialog is closed
  };
  
  const filteredEstimates = estimates.filter(estimate => 
    estimate.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    estimate.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
    estimate.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  const handleCreateNewEstimate = () => {
    setShowNewEstimateForm(true);
  };

  const handleCloseNewEstimateForm = () => {
    setShowNewEstimateForm(false);
    fetchEstimates(); // Refresh the list after creating a new estimate
  };
  
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <div className="flex flex-col gap-2 mb-6 animate-in">
            <h1 className="text-3xl font-semibold tracking-tight">Estimates</h1>
            <p className="text-muted-foreground">
              Create and manage your project estimates
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 animate-in" style={{ animationDelay: '0.1s' }}>
            <div className="relative w-full md:w-auto flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search estimates..." 
                className="pl-9 subtle-input rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4 mr-1" />
                Filter
                <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
              </Button>
              <Button 
                size="sm" 
                className="flex-1 md:flex-auto bg-[#0485ea] hover:bg-[#0373ce]"
                onClick={handleCreateNewEstimate}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Estimate
              </Button>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg shadow-sm animate-in" style={{ animationDelay: '0.2s' }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estimate #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Versions</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-6" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredEstimates.length > 0 ? (
                  filteredEstimates.map((estimate) => (
                    <TableRow key={estimate.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewEstimate(estimate)}>
                      <TableCell className="font-medium">{estimate.id}</TableCell>
                      <TableCell>{estimate.client}</TableCell>
                      <TableCell>{estimate.project}</TableCell>
                      <TableCell>{formatDate(estimate.date)}</TableCell>
                      <TableCell>${estimate.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <StatusBadge status={estimate.status as StatusType} />
                      </TableCell>
                      <TableCell>{estimate.versions}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewEstimate(estimate)}>View details</DropdownMenuItem>
                            <DropdownMenuItem>Edit estimate</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem>Create new version</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Convert to project</DropdownMenuItem>
                            <DropdownMenuItem>Download PDF</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                      <p>No estimates found. Create your first estimate!</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
      
      {selectedEstimate && (
        <EstimateDetails 
          estimate={selectedEstimate}
          items={estimateItems}
          revisions={estimateRevisions}
          open={!!selectedEstimate}
          onClose={closeEstimateDetails}
        />
      )}

      <EstimateForm 
        open={showNewEstimateForm} 
        onClose={handleCloseNewEstimateForm}
      />
    </PageTransition>
  );
};

export default Estimates;
