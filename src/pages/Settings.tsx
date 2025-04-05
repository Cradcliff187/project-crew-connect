
import React from 'react';
import PageTransition from '@/components/layout/PageTransition';

const Settings = () => {
  return (
    <PageTransition>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p>Manage your application settings here.</p>
      </div>
    </PageTransition>
  );
};

export default Settings;
