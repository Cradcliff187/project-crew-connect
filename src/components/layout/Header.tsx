
import { useState, useEffect } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebarContext } from '@/components/layout/SidebarContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { toggleSidebar } = useSidebarContext();
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-30 flex h-14 w-full items-center justify-between px-4 transition-all duration-200 ${
        scrolled ? 'bg-background/80 backdrop-blur-sm border-b border-border/40' : 'bg-transparent'
      }`}
    >
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="text-muted-foreground hover:text-foreground"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
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
  );
};

export default Header;
