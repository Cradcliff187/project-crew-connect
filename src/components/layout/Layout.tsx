
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useSidebarContext } from './SidebarContext';

const Layout = () => {
  // We still use the existing context for compatibility
  const { isOpen, toggleSidebar } = useSidebarContext();
  
  return (
    <SidebarProvider defaultOpen={isOpen} open={isOpen} onOpenChange={toggleSidebar}>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
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
