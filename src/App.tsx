import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { forceConsoleLogging } from './utils/debugUtils';
import RouteGuard from '@/components/auth/RouteGuard';
import AdminRoute from '@/components/auth/AdminRoute';
import FieldUserRoute from '@/components/auth/FieldUserRoute';
import Settings from './pages/Settings';
import EstimateEmailSettings from './pages/EstimateEmailSettings';
import EmployeesPage from './pages/Employees';
import FieldUserDashboard from './pages/FieldUserDashboard';
import AdminTimeEntries from './pages/AdminTimeEntries';
import ActiveWork from './pages/ActiveWork';
import Reports from './pages/Reports';
import ReportBuilder from './pages/ReportBuilder';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import SchedulingPage from './pages/SchedulingPage';

import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import ProjectEdit from './components/projects/ProjectEdit';
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
import { Toaster } from '@/components/ui/toaster';

const queryClient = new QueryClient();

function App() {
  // Initialize debug logging
  const cleanupLogging = forceConsoleLogging();

  // Add cleanup on unmount if needed
  useEffect(() => {
    return () => {
      cleanupLogging();
    };
  }, []);

  return (
    <React.Fragment>
      <QueryClientProvider client={queryClient}>
        {/* Routes not requiring auth protection go outside RouteGuard */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected routes go inside RouteGuard */}
          <Route
            path="/*"
            element={
              <RouteGuard>
                <LayoutRoutes />
              </RouteGuard>
            }
          />
        </Routes>
      </QueryClientProvider>
      <Toaster />
    </React.Fragment>
  );
}

// It's cleaner to define the Layout-based routes as a separate component
const LayoutRoutes = () => (
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<Dashboard />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="customers" element={<Customers />} />
      <Route path="customers/:customerId" element={<CustomerDetail />} />
      <Route path="projects" element={<Projects />} />
      <Route path="projects/:projectId" element={<ProjectDetail />} />
      <Route path="projects/:projectId/edit" element={<ProjectEdit />} />
      <Route path="work-orders" element={<WorkOrders />} />
      <Route path="work-orders/:workOrderId" element={<WorkOrderDetail />} />
      <Route path="documents" element={<Documents />} />
      <Route path="active-work" element={<ActiveWork />} />
      <Route path="scheduling" element={<SchedulingPage />} />

      {/* Admin-only routes */}
      <Route
        path="estimates"
        element={
          <AdminRoute>
            <Estimates />
          </AdminRoute>
        }
      />
      <Route
        path="estimates/settings"
        element={
          <AdminRoute>
            <EstimateEmailSettings />
          </AdminRoute>
        }
      />
      <Route
        path="estimates/:estimateId"
        element={
          <AdminRoute>
            <EstimateDetailPage />
          </AdminRoute>
        }
      />
      <Route
        path="contacts"
        element={
          <AdminRoute>
            <Contacts />
          </AdminRoute>
        }
      />
      <Route
        path="contacts/:id"
        element={
          <AdminRoute>
            <ContactDetailPage />
          </AdminRoute>
        }
      />
      <Route
        path="vendors"
        element={
          <AdminRoute>
            <Vendors />
          </AdminRoute>
        }
      />
      <Route
        path="vendors/:vendorId"
        element={
          <AdminRoute>
            <VendorDetail />
          </AdminRoute>
        }
      />
      <Route
        path="subcontractors"
        element={
          <AdminRoute>
            <Subcontractors />
          </AdminRoute>
        }
      />
      <Route
        path="subcontractors/:subcontractorId"
        element={
          <AdminRoute>
            <SubcontractorDetail />
          </AdminRoute>
        }
      />
      <Route
        path="settings"
        element={
          <AdminRoute>
            <Settings />
          </AdminRoute>
        }
      />
      <Route
        path="employees"
        element={
          <AdminRoute>
            <EmployeesPage />
          </AdminRoute>
        }
      />
      <Route
        path="reports"
        element={
          <AdminRoute>
            <Reports />
          </AdminRoute>
        }
      />
      <Route
        path="report-builder"
        element={
          <AdminRoute>
            <ReportBuilder />
          </AdminRoute>
        }
      />
      <Route
        path="report-builder/:reportId"
        element={
          <AdminRoute>
            <ReportBuilder />
          </AdminRoute>
        }
      />

      {/* Role-based time tracking routes with proper guards */}
      <Route
        path="admin/time-entries"
        element={
          <AdminRoute>
            <AdminTimeEntries />
          </AdminRoute>
        }
      />
      <Route
        path="field/time-tracking"
        element={
          <FieldUserRoute>
            <FieldUserDashboard />
          </FieldUserRoute>
        }
      />

      {/* Special testing route for admins to view field user interface */}
      <Route
        path="test/field-dashboard"
        element={
          <AdminRoute>
            <FieldUserDashboard />
          </AdminRoute>
        }
      />

      {/* Legacy redirect for old time-tracking route */}
      <Route path="time-tracking" element={<Navigate to="/admin/time-entries" replace />} />

      {/* Default catch-all for routes under Layout, Navigates to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Route>
  </Routes>
);

export default App;
