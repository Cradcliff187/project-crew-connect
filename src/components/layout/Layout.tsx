import { Outlet } from 'react-router-dom';
import Header from './Header';
import { AppSidebar } from './AppSidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

const Layout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />
        <SidebarInset className="flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
