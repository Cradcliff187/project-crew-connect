
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Briefcase, FileText, Clock, User2, Building2, Hammer, LayoutDashboard, FolderArchive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarContext } from './SidebarContext';
import { useIsMobile } from '@/hooks/use-mobile';

const Sidebar = () => {
  const location = useLocation();
  const { isOpen, closeSidebar } = useSidebarContext();
  const isMobile = useIsMobile();
  
  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      closeSidebar();
    }
  }, [location.pathname, isMobile, closeSidebar]);

  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Projects', href: '/projects', icon: <Briefcase className="h-5 w-5" /> },
    { name: 'Estimates', href: '/estimates', icon: <FileText className="h-5 w-5" /> },
    { name: 'Time Tracking', href: '/time-tracking', icon: <Clock className="h-5 w-5" /> },
    { name: 'Contacts', href: '/contacts', icon: <Users className="h-5 w-5" /> },
    { name: 'Subcontractors', href: '/subcontractors', icon: <Hammer className="h-5 w-5" /> },
    { name: 'Vendors', href: '/vendors', icon: <Building2 className="h-5 w-5" /> },
    { name: 'Documents', href: '/documents', icon: <FolderArchive className="h-5 w-5" /> },
  ];

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 flex-none transform overflow-y-auto bg-[#0485ea] shadow-lg transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-full flex-col px-4 py-6">
        <div className="mb-8 flex items-center px-2">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/lovable-uploads/5c52be9f-4fda-4b1d-bafb-59f86d835938.png" alt="AKC LLC Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold text-white">AKC LLC</span>
          </Link>
        </div>
        
        {/* Navigation items */}
        <nav className="space-y-1 flex-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                location.pathname === item.href || 
                (item.href !== '/' && location.pathname.startsWith(item.href))
                  ? "bg-white/20 text-white"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              )}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        
        <div className="mt-6 pt-6 border-t border-white/20">
          <div className="px-3 py-2 flex items-center text-sm font-medium text-white/80">
            <User2 className="mr-3 h-5 w-5" />
            <span>Admin User</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
