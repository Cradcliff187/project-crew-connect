
import React from 'react';
import { Shield, FileText } from 'lucide-react';
import { Subcontractor } from '../utils/types';
import InsuranceStatus from '../InsuranceStatus';
import { format } from 'date-fns';

interface ComplianceInformationCardProps {
  subcontractor: Subcontractor;
}

const ComplianceInformationCard = ({ subcontractor }: ComplianceInformationCardProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-montserrat font-semibold mb-4 text-[#0485ea]">Compliance Information</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#0485ea]" />
            <span className="font-medium">Insurance: </span>
            <InsuranceStatus expirationDate={subcontractor.insurance_expiration} showText />
          </div>
          {subcontractor.insurance_provider && (
            <div className="flex items-center gap-2">
              <span className="ml-6">Provider: {subcontractor.insurance_provider}</span>
            </div>
          )}
          {subcontractor.insurance_policy_number && (
            <div className="flex items-center gap-2">
              <span className="ml-6">Policy #: {subcontractor.insurance_policy_number}</span>
            </div>
          )}
          {subcontractor.insurance_expiration && (
            <div className="flex items-center gap-2">
              <span className="ml-6">Expires: {formatDate(subcontractor.insurance_expiration)}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#0485ea]" />
            <span className="font-medium">Contract on File: {subcontractor.contract_on_file ? 'Yes' : 'No'}</span>
          </div>
          {subcontractor.contract_on_file && subcontractor.contract_expiration && (
            <div className="flex items-center gap-2">
              <span className="ml-6">Expires: {formatDate(subcontractor.contract_expiration)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplianceInformationCard;
