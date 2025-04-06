
import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import Customers from '@/pages/Customers';
import CustomerDetail from '@/pages/CustomerDetail';
import Settings from '@/pages/Settings';
import Vendors from '@/pages/Vendors'; 
import Estimates from '@/pages/Estimates';
import Contacts from './pages/Contacts';
import WorkOrders from './pages/WorkOrders';
import Reports from './pages/Reports';
import ActiveWork from './pages/ActiveWork';
import VendorDetail from './components/vendors/detail/VendorDetail';
import Subcontractors from './pages/Subcontractors';
import TimeTracking from './pages/TimeTracking';
import Documents from './pages/Documents';

// Routes configuration
const routes = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'active-work', element: <ActiveWork /> },
      { path: 'projects', element: <Projects /> },
      { path: 'projects/:projectId', element: <ProjectDetail /> },
      { path: 'estimates', element: <Estimates /> },
      { path: 'work-orders', element: <WorkOrders /> },
      { path: 'customers', element: <Customers /> },
      { path: 'customers/:customerId', element: <CustomerDetail /> },
      { path: 'contacts', element: <Contacts /> },
      { path: 'vendors', element: <Vendors /> },
      { path: 'vendors/:vendorId', element: <VendorDetail /> },
      { path: 'subcontractors', element: <Subcontractors /> },
      { path: 'time-tracking', element: <TimeTracking /> },
      { path: 'documents', element: <Documents /> },
      { path: 'reports', element: <Reports /> },
      { path: 'settings', element: <Settings /> },
    ],
    errorElement: <div>Error: Page not found</div>,
  }
]);

function App() {
  return (
    <RouterProvider router={routes} />
  );
}

export default App;
