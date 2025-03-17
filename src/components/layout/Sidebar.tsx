
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BarChart2, FileText, Briefcase, Users, Clock, ChevronLeft, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useSidebarContext } from './SidebarContext';

const NavItem = ({ 
  icon: Icon, 
  label, 
  path,
  isActive = false,
  onClick,
}: { 
  icon: React.ElementType;
  label: string;
  path: string;
  isActive?: boolean;
  onClick?: () => void;
}) => {
  const { isOpen } = useSidebarContext();
  
  return isOpen ? (
    <Button
      variant={isActive ? "default" : "ghost"}
      className={cn(
        "w-full justify-start px-3 py-6",
        isActive && "bg-construction-50 text-construction-700 hover:text-construction-800 hover:bg-construction-100"
      )}
      onClick={onClick}
    >
      <Icon className="mr-2 h-5 w-5" />
      <span>{label}</span>
    </Button>
  ) : (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? "default" : "ghost"}
          size="icon"
          className={cn(
            "w-full h-12",
            isActive && "bg-construction-50 text-construction-700 hover:text-construction-800 hover:bg-construction-100"
          )}
          onClick={onClick}
        >
          <Icon className="h-5 w-5" />
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-popover text-popover-foreground">
        {label}
      </TooltipContent>
    </Tooltip>
  );
};

const Sidebar = () => {
  const { isOpen, toggleSidebar, closeSidebar } = useSidebarContext();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const handleNavigate = (path: string) => {
    navigate(path);
    closeSidebar();
  };
  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}
      
      <aside 
        className={cn(
          "fixed top-0 left-0 z-50 flex h-full flex-col border-r bg-card transition-all duration-300 ease-in-out lg:relative lg:z-0", 
          isOpen ? "w-64" : "w-[60px]"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 py-4">
          {isOpen ? (
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/5c52be9f-4fda-4b1d-bafb-59f86d835938.png" 
                alt="AKC LLC Logo" 
                className="h-8 w-auto mr-2" 
              />
              <h1 className="text-lg font-semibold tracking-tight text-construction-700">AKC LLC</h1>
            </div>
          ) : (
            <div className="mx-auto">
              <img 
                src="/lovable-uploads/5c52be9f-4fda-4b1d-bafb-59f86d835938.png" 
                alt="AKC LLC Logo" 
                className="h-8 w-auto" 
              />
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:flex hidden" 
            onClick={toggleSidebar}
          >
            <ChevronLeft 
              className={cn(
                "h-4 w-4 transition-transform", 
                !isOpen && "rotate-180"
              )} 
            />
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto no-scrollbar">
          <div className="space-y-1 px-2 py-3">
            <NavItem 
              icon={Home} 
              label="Dashboard" 
              path="/" 
              isActive={isActive("/")}
              onClick={() => handleNavigate("/")}
            />
            <NavItem 
              icon={FileText} 
              label="Estimates" 
              path="/estimates" 
              isActive={isActive("/estimates")}
              onClick={() => handleNavigate("/estimates")}
            />
            <NavItem 
              icon={Briefcase} 
              label="Projects" 
              path="/projects" 
              isActive={isActive("/projects")}
              onClick={() => handleNavigate("/projects")}
            />
            <NavItem 
              icon={Users} 
              label="Contacts" 
              path="/contacts" 
              isActive={isActive("/contacts")}
              onClick={() => handleNavigate("/contacts")}
            />
            <NavItem 
              icon={Clock} 
              label="Time Tracking" 
              path="/time-tracking" 
              isActive={isActive("/time-tracking")}
              onClick={() => handleNavigate("/time-tracking")}
            />
          </div>
          
          <Separator className={cn(isOpen ? "mx-4" : "mx-0 w-full")} />
          
          <div className="space-y-1 px-2 py-3">
            <NavItem 
              icon={BarChart2} 
              label="Reports" 
              path="/reports" 
              isActive={isActive("/reports")}
              onClick={() => handleNavigate("/reports")}
            />
            <NavItem 
              icon={Settings} 
              label="Settings" 
              path="/settings" 
              isActive={isActive("/settings")}
              onClick={() => handleNavigate("/settings")}
            />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
