
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { SidebarInset } from '@/components/ui/sidebar';

const Layout = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </div>
  );
};

export default Layout;
