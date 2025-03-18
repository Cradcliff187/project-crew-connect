
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageTransition from '@/components/layout/PageTransition';
import SubcontractorDetailHeader from './SubcontractorDetailHeader';

const SubcontractorNotFoundView = () => {
  const navigate = useNavigate();
  
  return (
    <PageTransition>
      <div className="container max-w-4xl mx-auto py-6">
        <SubcontractorDetailHeader 
          subcontractor={null} 
          loading={false} 
          onEdit={() => {}} 
        />
        <Card>
          <CardHeader>
            <CardTitle>Subcontractor Not Found</CardTitle>
            <CardDescription>
              The subcontractor you are looking for could not be found.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              className="bg-[#0485ea] hover:bg-[#0375d1] text-white"
              onClick={() => navigate('/subcontractors')}
            >
              Return to Subcontractors
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageTransition>
  );
};

export default SubcontractorNotFoundView;
