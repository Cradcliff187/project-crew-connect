
import React from 'react';
import { useParams } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';

const CustomerDetail = () => {
  const { customerId } = useParams();
  
  return (
    <PageTransition>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Customer Details</h1>
        <p>Customer ID: {customerId}</p>
      </div>
    </PageTransition>
  );
};

export default CustomerDetail;
