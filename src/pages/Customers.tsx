
import React from 'react';
import PageTransition from '@/components/layout/PageTransition';

const Customers = () => {
  return (
    <PageTransition>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <p>Manage your customer information here.</p>
      </div>
    </PageTransition>
  );
};

export default Customers;
