
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Edit, MoreHorizontal } from 'lucide-react';
import { getStatusColor } from './utils/statusUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Subcontractor {
  subid: string;
  subname: string;
  contactemail?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  status?: string;
  specialty_ids?: string[];
  createdon?: string;
}

interface SubcontractorsTableProps {
  subcontractors: Subcontractor[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onEditSubcontractor?: (subcontractor: Subcontractor) => void;
}

const SubcontractorsTable = ({ 
  subcontractors, 
  loading, 
  error, 
  searchQuery,
  onEditSubcontractor
}: SubcontractorsTableProps) => {
  const navigate = useNavigate();
  
  const filteredSubcontractors = subcontractors.filter(sub => {
    const query = searchQuery.toLowerCase();
    return (
      sub.subname?.toLowerCase().includes(query) ||
      sub.contactemail?.toLowerCase().includes(query) ||
      sub.phone?.toLowerCase().includes(query) ||
      (sub.city && sub.state && (`${sub.city}, ${sub.state}`).toLowerCase().includes(query))
    );
  });
  
  const handleViewDetails = (subcontractor: Subcontractor) => {
    navigate(`/subcontractors/${subcontractor.subid}`);
  };
  
  const handleEdit = (subcontractor: Subcontractor) => {
    if (onEditSubcontractor) {
      onEditSubcontractor(subcontractor);
    }
  };
  
  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-5 w-28 bg-gray-200 rounded animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="h-9 w-24 bg-gray-200 rounded animate-pulse ml-auto"></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-red-500">Error: {error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }
  
  if (filteredSubcontractors.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">
          {searchQuery
            ? `No subcontractors found matching "${searchQuery}"`
            : "No subcontractors found. Add your first subcontractor to get started."}
        </p>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSubcontractors.map((subcontractor) => (
            <TableRow key={subcontractor.subid}>
              <TableCell className="font-medium">{subcontractor.subname}</TableCell>
              <TableCell>
                {subcontractor.contactemail && (
                  <div className="text-sm">{subcontractor.contactemail}</div>
                )}
                {subcontractor.phone && (
                  <div className="text-sm text-muted-foreground">{subcontractor.phone}</div>
                )}
              </TableCell>
              <TableCell>
                {subcontractor.city && subcontractor.state
                  ? `${subcontractor.city}, ${subcontractor.state}`
                  : subcontractor.city || subcontractor.state || '-'}
              </TableCell>
              <TableCell>
                <div
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(
                    subcontractor.status || "PENDING"
                  )}`}
                >
                  {subcontractor.status || "Pending"}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(subcontractor)}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(subcontractor)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(subcontractor)}>
                        Edit Subcontractor
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubcontractorsTable;
