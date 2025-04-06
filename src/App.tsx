import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import Error404 from '@/pages/Error404';
import AuthLayout from '@/components/layout/AuthLayout';
import Loading from '@/components/ui/Loading';
import Customers from '@/pages/Customers';
import CustomerDetail from '@/pages/CustomerDetail';
import NewCustomer from '@/pages/NewCustomer';
import EditCustomer from '@/pages/EditCustomer';
import NewProject from '@/pages/NewProject';
import Settings from '@/pages/Settings';
import Vendors from '@/pages/Vendors'; 
import VendorDetail from '@/pages/VendorDetail';
import EditProject from '@/pages/EditProject';
import Estimates from '@/pages/Estimates';
import NewEstimate from './pages/NewEstimate';
import EstimateDetail from './pages/EstimateDetail';
import Contacts from './pages/Contacts';
import WorkOrders from './pages/WorkOrders';
import WorkOrderDetail from './pages/WorkOrderDetail';
import NewWorkOrder from './pages/NewWorkOrder';
import EditWorkOrder from './pages/EditWorkOrder';
import Reports from './pages/Reports';

// Routes configuration
const routes = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
    errorElement: <Error404 />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'projects', element: <Projects /> },
      { path: 'projects/:projectId', element: <ProjectDetail /> },
      { path: 'projects/:projectId/edit', element: <EditProject /> },
      { path: 'projects/new', element: <NewProject /> },
      { path: 'customers', element: <Customers /> },
      { path: 'customers/:customerId', element: <CustomerDetail /> },
      { path: 'customers/new', element: <NewCustomer /> },
      { path: 'customers/:customerId/edit', element: <EditCustomer /> },
      { path: 'vendors', element: <Vendors /> },
      { path: 'vendors/:vendorId', element: <VendorDetail /> },
      { path: 'settings', element: <Settings /> },
      { path: 'estimates', element: <Estimates /> },
      { path: 'estimates/new', element: <NewEstimate /> },
      { path: 'estimates/:estimateId', element: <EstimateDetail /> },
      { path: 'contacts', element: <Contacts /> },
      { path: 'work-orders', element: <WorkOrders /> },
      { path: 'work-orders/:workOrderId', element: <WorkOrderDetail /> },
      { path: 'work-orders/new', element: <NewWorkOrder /> },
      { path: 'work-orders/:workOrderId/edit', element: <EditWorkOrder /> },
      { path: 'reports', element: <Reports /> },
    ],
  },
]);

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={routes} />
    </Suspense>
  );
}

export default App;
