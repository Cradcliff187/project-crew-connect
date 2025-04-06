
import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
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

// Routes configuration
const routes = createBrowserRouter([
  {
    path: '/',
    element: <div className="min-h-screen w-full">{/* Main app layout */}
      <div className="min-h-screen w-full">{/* Content */}
        <Suspense fallback={<div>Loading...</div>}>
          <Dashboard />
        </Suspense>
      </div>
    </div>,
    errorElement: <div>Error: Page not found</div>,
  },
  { path: '/projects', element: <Projects /> },
  { path: '/projects/:projectId', element: <ProjectDetail /> },
  { path: '/customers', element: <Customers /> },
  { path: '/customers/:customerId', element: <CustomerDetail /> },
  { path: '/vendors', element: <Vendors /> },
  { path: '/vendors/:vendorId', element: <Vendors /> },
  { path: '/settings', element: <Settings /> },
  { path: '/estimates', element: <Estimates /> },
  { path: '/contacts', element: <Contacts /> },
  { path: '/work-orders', element: <WorkOrders /> },
  { path: '/reports', element: <Reports /> },
]);

function App() {
  return (
    <RouterProvider router={routes} />
  );
}

export default App;
