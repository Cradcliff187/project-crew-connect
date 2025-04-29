import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('customername', { ascending: true });

      if (error) {
        throw error;
      }

      setCustomers(data || []);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      setError(error.message || 'Error fetching customers');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    customer =>
      customer.customername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contactemail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Customers</h1>
          <Button
            className="bg-[#0485ea] hover:bg-[#0373ce]"
            onClick={() => console.log('Add new customer')} // This would open a form dialog in the future
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search customers..."
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-700">{error}</div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {searchTerm ? 'No customers match your search' : 'No customers found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map(customer => (
                    <TableRow
                      key={customer.customerid}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/customers/${customer.customerid}`)}
                    >
                      <TableCell className="font-medium">{customer.customername}</TableCell>
                      <TableCell>{customer.contactemail || '—'}</TableCell>
                      <TableCell>{customer.phone || '—'}</TableCell>
                      <TableCell>
                        {customer.city || ''}
                        {customer.city && customer.state ? ', ' : ''}
                        {customer.state || ''}
                        {!customer.city && !customer.state && '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={customer.status === 'ACTIVE' ? 'success' : 'outline'}
                          className="capitalize"
                        >
                          {customer.status || 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Customers;
