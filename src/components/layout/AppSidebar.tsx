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
  Calendar,
  ClockIcon,
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
import { useAuth } from '@/contexts/AuthContext';

// Site config
const siteConfig = {
  name: 'AKC LLC',
};

// Base navigation items (common to all users)
const baseNav = [
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
    title: 'Scheduling',
    href: '/scheduling',
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: <FolderKanban className="h-5 w-5" />,
  },
  {
    title: 'Work Orders',
    href: '/work-orders',
    icon: <ClipboardList className="h-5 w-5" />,
  },
];

// Admin-specific navigation items
const adminNav = [
  {
    title: 'Estimates',
    href: '/estimates',
    icon: <FileSpreadsheet className="h-5 w-5" />,
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
    title: 'Time Entry Management',
    href: '/admin/time-entries',
    icon: <ClockIcon className="h-5 w-5" />,
  },
  {
    title: 'Field Time Tracking (Test)',
    href: '/test/field-dashboard',
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

// Field user-specific navigation items
const fieldUserNav = [
  {
    title: 'Time Tracking',
    href: '/field/time-tracking',
    icon: <Clock className="h-5 w-5" />,
  },
  {
    title: 'Documents',
    href: '/documents',
    icon: <FileText className="h-5 w-5" />,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, user, isLoading, signOut, isAdmin, isFieldUser } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const [logoError, setLogoError] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Build navigation based on user role
  const getNavigationItems = () => {
    let navItems = [...baseNav];

    if (isAdmin) {
      navItems = [...navItems, ...adminNav];
    } else if (isFieldUser) {
      navItems = [...navItems, ...fieldUserNav];
    }

    return navItems;
  };

  const navigationItems = getNavigationItems();

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
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarMenu>
          {navigationItems.map(item => (
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
          {isLoading ? (
            <Button variant="secondary" disabled className="w-full">
              Loading...
            </Button>
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex h-8 w-full items-center justify-between rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url || ''} />
                      <AvatarFallback>{user?.email?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">
                        {user?.user_metadata?.full_name || user?.email}
                      </span>
                      {(isAdmin || isFieldUser) && (
                        <span className="text-xs text-muted-foreground">
                          {isAdmin ? 'Administrator' : 'Field User'}
                        </span>
                      )}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" forceMount>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    Settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>Log out</DropdownMenuItem>
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
