import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  FileSpreadsheet,
  Users,
  Store,
  HardHat,
  Clock,
  FileText,
  ClipboardList,
  Briefcase,
  BarChart,
  UserSquare,
  Settings,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Site config
const siteConfig = {
  name: 'AKC LLC',
};

const mainNav = [
  {
    title: 'Dashboard',
    href: '/',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: 'Active Work',
    href: '/active-work',
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: <FolderKanban className="h-5 w-5" />,
  },
  {
    title: 'Estimates',
    href: '/estimates',
    icon: <FileSpreadsheet className="h-5 w-5" />,
  },
  {
    title: 'Work Orders',
    href: '/work-orders',
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    title: 'Contacts',
    href: '/contacts',
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: 'Vendors',
    href: '/vendors',
    icon: <Store className="h-5 w-5" />,
  },
  {
    title: 'Subcontractors',
    href: '/subcontractors',
    icon: <HardHat className="h-5 w-5" />,
  },
  {
    title: 'Time Tracking',
    href: '/time-tracking',
    icon: <Clock className="h-5 w-5" />,
  },
  {
    title: 'Documents',
    href: '/documents',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: <BarChart className="h-5 w-5" />,
  },
  {
    title: 'Employees',
    href: '/employees',
    icon: <UserSquare className="h-5 w-5" />,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mounted, setMounted] = React.useState(false);
  const [logoError, setLogoError] = React.useState(false);

  // Mock session for now - in a real app, you'd use your authentication context
  const session = null;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Force a re-render by replacing the component with an entirely new version
  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-start pl-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-10 w-auto flex items-center">
            {logoError ? (
              <div className="bg-[#0485ea] text-white rounded-md p-1.5 flex items-center justify-center h-8 w-8">
                <span className="font-bold text-md">AKC</span>
              </div>
            ) : (
              <img
                src="/lovable-uploads/bf868b68-9712-4cb9-a4f1-8f5b284a2521.png"
                alt="AKC LLC Logo"
                className="h-10 w-auto"
                onError={() => setLogoError(true)}
              />
            )}
          </div>
          {/* Site name text removed */}
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarMenu>
          {mainNav.map(item => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.href}
                tooltip={item.title}
              >
                <Link
                  to={item.href}
                  className="text-sidebar-foreground hover:text-sidebar-accent-foreground"
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <div className="p-3">
          {mounted && session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex h-8 w-full items-center justify-between rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session?.user?.image ?? ''} />
                      <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-left">{session?.user?.name}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" forceMount>
                <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => console.log('Sign out')}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="secondary" onClick={() => navigate('/login')} className="w-full">
              Login
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
