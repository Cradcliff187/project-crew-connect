
import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

const SubcontractorDetail = () => {
  const { subcontractorId } = useParams();
  
  // Redirect to the new location
  return <Navigate to={`/subcontractors/${subcontractorId}`} replace />;
};

export default SubcontractorDetail;
