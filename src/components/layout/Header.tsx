
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from '@/components/ui/sidebar';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get the page title based on the current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/projects')) return 'Projects';
    if (path.startsWith('/estimates')) return 'Estimates';
    if (path.startsWith('/time-tracking')) return 'Time Tracking';
    if (path.startsWith('/contacts')) return 'Contacts';
    if (path.startsWith('/subcontractors')) return 'Subcontractors';
    if (path.startsWith('/vendors')) return 'Vendors';
    if (path.startsWith('/documents')) return 'Documents';
    return '';
  };

  // Get the page description based on the current route
  const getPageDescription = () => {
    const path = location.pathname;
    if (path === '/') return 'Overview of your business activities';
    if (path.startsWith('/projects')) return 'Manage your active and completed projects';
    if (path.startsWith('/estimates')) return 'Create and manage customer estimates';
    if (path.startsWith('/time-tracking')) return 'Track time for projects and team members';
    if (path.startsWith('/contacts')) return 'Manage your contacts and customers';
    if (path.startsWith('/subcontractors')) return 'Manage your subcontractors and trades';
    if (path.startsWith('/vendors')) return 'Manage your suppliers and material vendors';
    if (path.startsWith('/documents')) return 'Store and organize important documents';
    return '';
  };

  const pageTitle = getPageTitle();
  const pageDescription = getPageDescription();

  return (
    <div className="flex flex-col">
      <header 
        className={`sticky top-0 z-30 flex h-14 w-full items-center justify-between px-4 transition-all duration-200 ${
          scrolled ? 'bg-background/80 backdrop-blur-sm border-b border-border/40' : 'bg-transparent'
        }`}
      >
        <div className="flex items-center">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        </div>
        
        <div className="hidden md:flex items-center w-full max-w-xs mx-auto">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search..." 
              className="w-full pl-9 subtle-input rounded-full h-8 text-sm"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-construction-500 text-white text-[9px] flex items-center justify-center">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-4">
                <h4 className="text-sm font-medium mb-3">Notifications</h4>
                <div className="space-y-3">
                  <div className="flex gap-2 items-start border-b pb-3">
                    <div className="h-8 w-8 rounded-full bg-construction-100 flex items-center justify-center">
                      <span className="text-construction-700 text-xs">PR</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Project Update</p>
                      <p className="text-xs text-muted-foreground">Lakeside Project: Phase 1 completed</p>
                      <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-start border-b pb-3">
                    <div className="h-8 w-8 rounded-full bg-construction-100 flex items-center justify-center">
                      <span className="text-construction-700 text-xs">ES</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Estimate Approved</p>
                      <p className="text-xs text-muted-foreground">Client approved Highrise Renovation</p>
                      <p className="text-xs text-muted-foreground mt-1">3 hours ago</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <div className="h-8 w-8 rounded-full bg-construction-100 flex items-center justify-center">
                      <span className="text-construction-700 text-xs">TM</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Time Log</p>
                      <p className="text-xs text-muted-foreground">John submitted 8h on Downtown Project</p>
                      <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">View All</Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="h-7 w-7 rounded-full bg-construction-600 flex items-center justify-center text-white">
            <span className="font-medium text-xs">AK</span>
          </div>
        </div>
      </header>
      
      {pageTitle && (
        <div className="px-4 pt-6 pb-2 animate-in">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">{pageTitle}</h1>
            {pageDescription && (
              <p className="text-muted-foreground">{pageDescription}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
