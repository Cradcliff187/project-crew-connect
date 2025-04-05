
import React from 'react';
import PageTransition from '@/components/layout/PageTransition';

const Dashboard = () => {
  return (
    <PageTransition>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>Welcome to the AKC LLC management dashboard.</p>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
