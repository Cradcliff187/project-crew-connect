
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Index from './pages/Index';
import Projects from './pages/Projects';
import Estimates from './pages/Estimates';
import Contacts from './pages/Contacts';
import Documents from './pages/Documents';
import TimeTracking from './pages/TimeTracking';
import NotFound from './pages/NotFound';
import Vendors from './pages/Vendors';
import ProjectDetail from './components/projects/ProjectDetail';
import ProjectEdit from './components/projects/ProjectEdit';
import { SidebarProvider } from './components/layout/SidebarContext';
import Layout from './components/layout/Layout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SidebarProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:projectId" element={<ProjectDetail />} />
              <Route path="/projects/:projectId/edit" element={<ProjectEdit />} />
              <Route path="/estimates" element={<Estimates />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/time-tracking" element={<TimeTracking />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" />} />
            </Route>
          </Routes>
        </SidebarProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
