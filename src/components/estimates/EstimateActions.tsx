import React, { useState, useEffect } from 'react';
import {
  MoreHorizontal,
  FileEdit,
  Trash,
  Send,
  CheckCircle,
  XCircle,
  ArrowRightLeft,
  Share2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusType } from '@/types/common';
import { useNavigate } from 'react-router-dom';
import { isEstimateConverted } from '@/services/estimateService';

interface EstimateActionsProps {
  status: StatusType;
  onEdit?: () => void;
  onDelete?: () => void;
  onConvert?: () => void;
  onShare?: () => void;
  size?: 'default' | 'sm';
  direction?: 'horizontal' | 'vertical';
  currentRevision?: any;
  estimateId?: string;
}

const EstimateActions: React.FC<EstimateActionsProps> = ({
  status,
  onEdit,
  onDelete,
  onConvert,
  onShare,
  size = 'default',
  direction = 'horizontal',
  currentRevision,
  estimateId,
}) => {
  const navigate = useNavigate();
  const [isConverted, setIsConverted] = useState<boolean>(
    status === 'converted' // Initial value based on status
  );
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  useEffect(() => {
    // Check if the estimate is already converted when the component mounts
    const checkConversionStatus = async () => {
      if (estimateId) {
        setIsCheckingStatus(true);
        try {
          const converted = await isEstimateConverted(estimateId);
          setIsConverted(converted);
        } catch (error) {
          console.error('Error checking conversion status:', error);
        } finally {
          setIsCheckingStatus(false);
        }
      }
    };

    checkConversionStatus();
  }, [estimateId, status]);

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else if (estimateId) {
      // Navigate to edit page if no onEdit handler is provided but estimateId is available
      navigate(`/estimates/edit/${estimateId}`);
    }
  };

  return direction === 'horizontal' ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={size} className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        {onEdit !== null && (
          <DropdownMenuItem onClick={handleEdit}>
            <FileEdit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}

        {onShare && currentRevision?.pdf_document_id && (
          <DropdownMenuItem onClick={onShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </DropdownMenuItem>
        )}

        {!isConverted && onConvert && (
          <DropdownMenuItem
            onClick={() => {
              console.log(
                'EstimateActions: Convert option clicked from dropdown for estimate:',
                estimateId
              );
              onConvert();
            }}
            disabled={isCheckingStatus}
          >
            {isCheckingStatus ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRightLeft className="mr-2 h-4 w-4" />
            )}
            {isCheckingStatus ? 'Checking status...' : 'Convert to Project'}
          </DropdownMenuItem>
        )}

        {isConverted && (
          <DropdownMenuItem disabled>
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            Already Converted
          </DropdownMenuItem>
        )}

        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={onDelete}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <div className="flex flex-col space-y-2">
      {onEdit !== null && (
        <Button size={size} variant="outline" className="justify-start" onClick={handleEdit}>
          <FileEdit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      )}

      {onShare && currentRevision?.pdf_document_id && (
        <Button size={size} variant="outline" className="justify-start" onClick={onShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      )}

      {!isConverted && onConvert && (
        <Button
          size={size}
          variant="outline"
          className="justify-start"
          onClick={() => {
            console.log(
              'EstimateActions: Convert button clicked from vertical menu for estimate:',
              estimateId
            );
            onConvert();
          }}
          disabled={isCheckingStatus}
        >
          {isCheckingStatus ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ArrowRightLeft className="mr-2 h-4 w-4" />
          )}
          {isCheckingStatus ? 'Checking status...' : 'Convert to Project'}
        </Button>
      )}

      {isConverted && (
        <Button size={size} variant="outline" className="justify-start text-green-600" disabled>
          <CheckCircle className="mr-2 h-4 w-4" />
          Already Converted
        </Button>
      )}

      {onDelete && (
        <Button
          size={size}
          variant="outline"
          className="justify-start text-red-600"
          onClick={onDelete}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </Button>
      )}
    </div>
  );
};

export default EstimateActions;
