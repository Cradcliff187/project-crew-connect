
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  CalendarDays,
  Clipboard,
  FileSpreadsheet,
  FolderOpen,
  Home,
  Layers,
  LayoutDashboard,
  NotebookPen,
  Settings,
  Users,
  Wrench,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
}

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Define routes for the sidebar
  const routes = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      name: 'Projects',
      path: '/projects',
      icon: <FolderOpen className="h-5 w-5" />
    },
    {
      name: 'Estimates',
      path: '/estimates',
      icon: <FileSpreadsheet className="h-5 w-5" />
    },
    {
      name: 'Customers',
      path: '/customers',
      icon: <Users className="h-5 w-5" />
    },
    {
      name: 'Work Orders',
      path: '/work-orders',
      icon: <Wrench className="h-5 w-5" />
    },
    {
      name: 'Time Tracking',
      path: '/time-tracking',
      icon: <CalendarDays className="h-5 w-5" />
    },
    {
      name: 'Active Work',
      path: '/active-work',
      icon: <Clipboard className="h-5 w-5" />
    },
    {
      name: 'Contacts',
      path: '/contacts',
      icon: <Users className="h-5 w-5" />
    },
    {
      name: 'Vendors',
      path: '/vendors',
      icon: <Layers className="h-5 w-5" />
    },
    {
      name: 'Subcontractors',
      path: '/subcontractors',
      icon: <Home className="h-5 w-5" />
    },
    {
      name: 'Documents',
      path: '/documents',
      icon: <NotebookPen className="h-5 w-5" />
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      name: 'Report Builder',
      path: '/report-builder',
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: <Settings className="h-5 w-5" />
    }
  ];

  // Determine if a route is active
  const isActive = (path: string) => {
    // Handle special cases for paths with dynamic segments
    if (path === '/projects' && location.pathname.startsWith('/projects/')) {
      return true;
    } else if (path === '/customers' && location.pathname.startsWith('/customers/')) {
      return true;
    } else if (path === '/estimates' && location.pathname.startsWith('/estimates/')) {
      return true;
    } else if (path === '/work-orders' && location.pathname.startsWith('/work-orders/')) {
      return true;
    } else if (path === '/contacts' && location.pathname.startsWith('/contacts/')) {
      return true;
    } else if (path === '/vendors' && location.pathname.startsWith('/vendors/')) {
      return true;
    } else if (path === '/subcontractors' && location.pathname.startsWith('/subcontractors/')) {
      return true;
    } else if (path === '/report-builder' && location.pathname.startsWith('/report-builder/')) {
      return true;
    }
    
    // Default case for exact path matches
    return location.pathname === path;
  };
  
  // Handle navigation
  const handleNavigate = (path: string) => {
    navigate(path);
  };
  
  // Render sidebar with or without tooltips based on collapsed state
  return (
    <aside className={cn(
      "border-r bg-background transition-all duration-300 ease-in-out flex flex-col",
      isCollapsed ? "w-[70px]" : "w-[240px]"
    )}>
      <div className="px-3 py-2">
        <div className={cn(
          "py-2",
          isCollapsed ? "justify-center" : "justify-start"
        )}>
          <h2 className={cn(
            "font-semibold tracking-tight text-[#0485ea]",
            isCollapsed ? "text-center text-xl" : "text-xl px-4"
          )}>
            {isCollapsed ? 'AKC' : 'AKC LLC'}
          </h2>
        </div>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-2">
          {routes.map((route) => 
            isCollapsed ? (
              <TooltipProvider key={route.path} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive(route.path) ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-center",
                        isActive(route.path) ? "bg-[#0485ea] hover:bg-[#0485ea]/90" : ""
                      )}
                      onClick={() => handleNavigate(route.path)}
                    >
                      {route.icon}
                      <span className="sr-only">{route.name}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {route.name}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button
                key={route.path}
                variant={isActive(route.path) ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive(route.path) ? "bg-[#0485ea] hover:bg-[#0485ea]/90" : ""
                )}
                onClick={() => handleNavigate(route.path)}
              >
                {route.icon}
                <span className="ml-2">{route.name}</span>
              </Button>
            )
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
