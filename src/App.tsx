
import React, { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Projects from './pages/Projects';
import ProjectDetailRefactored from './components/projects/ProjectDetailRefactored';
import Estimates from './pages/Estimates';
import EstimateDetailPage from './pages/EstimateDetailPage';
import WorkOrders from './pages/WorkOrders';
import WorkOrderDetail from './components/workOrders/details/WorkOrderDetail';
import Contacts from './pages/Contacts';
import ContactDetailPage from './components/contacts/ContactDetailPage';
import Documents from './pages/Documents';
import Vendors from './pages/Vendors';
import VendorDetail from './components/vendors/detail/VendorDetail';
import Subcontractors from './pages/Subcontractors';
import SubcontractorDetail from './components/subcontractors/SubcontractorDetail';
import Settings from './pages/Settings';
import Login from './pages/Login';
import RouteGuard from './components/auth/RouteGuard';
import EstimateEmailSettings from './pages/EstimateEmailSettings';
import TimeTracking from './pages/TimeTracking';
import ActiveWork from './pages/ActiveWork';
import Reports from './pages/Reports'; // Import the new Reports page

const queryClient = new QueryClient();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <RouteGuard>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="customers/:customerId" element={<CustomerDetail />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:projectId" element={<ProjectDetailRefactored />} />
              <Route path="estimates" element={<Estimates />} />
              <Route path="estimates/settings" element={<EstimateEmailSettings />} />
              <Route path="estimates/:estimateId" element={<EstimateDetailPage />} />
              <Route path="work-orders" element={<WorkOrders />} />
              <Route path="work-orders/:workOrderId" element={<WorkOrderDetail />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="contacts/:id" element={<ContactDetailPage />} />
              <Route path="documents" element={<Documents />} />
              <Route path="vendors" element={<Vendors />} />
              <Route path="vendors/:vendorId" element={<VendorDetail />} />
              <Route path="subcontractors" element={<Subcontractors />} />
              <Route path="subcontractors/:subcontractorId" element={<SubcontractorDetail />} />
              <Route path="settings" element={<Settings />} />
              <Route path="time-tracking" element={<TimeTracking />} />
              <Route path="active-work" element={<ActiveWork />} />
              <Route path="reports" element={<Reports />} /> {/* Add the Reports route */}
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </RouteGuard>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
