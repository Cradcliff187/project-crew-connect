
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControl = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlProps) => {
  // Don't show pagination if there's only one page
  if (totalPages <= 1) return null;

  // Generate array of page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    // Always include first page
    pages.push(1);
    
    // For small number of pages, show all
    if (totalPages <= 7) {
      for (let i = 2; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // For many pages, use ellipses
      if (currentPage > 3) {
        pages.push('ellipsis');
      }
      
      // Pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }
    }
    
    // Always include last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Pagination className="justify-center">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          />
        </PaginationItem>

        {pageNumbers.map((page, index) => (
          page === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => onPageChange(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        ))}

        <PaginationItem>
          <PaginationNext
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationControl;
