
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebarContext } from './SidebarContext';
import { cn } from '@/lib/utils';

const Layout = () => {
  const isMobile = useIsMobile();
  const { isOpen } = useSidebarContext();
  
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <div 
        className={cn(
          "flex flex-col flex-1 w-full overflow-hidden transition-all duration-200 ease-in-out",
          isOpen && !isMobile ? "ml-64" : ""
        )}
      >
        <Header />
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
