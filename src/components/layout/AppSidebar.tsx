
import { Users, Briefcase, FileText, Clock, User2, Building2, Hammer, LayoutDashboard, FolderArchive } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const location = useLocation();
  
  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: Briefcase },
    { name: 'Estimates', href: '/estimates', icon: FileText },
    { name: 'Time Tracking', href: '/time-tracking', icon: Clock },
    { name: 'Contacts', href: '/contacts', icon: Users },
    { name: 'Subcontractors', href: '/subcontractors', icon: Hammer },
    { name: 'Vendors', href: '/vendors', icon: Building2 },
    { name: 'Documents', href: '/documents', icon: FolderArchive },
  ];

  // Check if the current path matches the navigation item
  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <Sidebar 
      collapsible="offcanvas" 
      data-sidebar="sidebar" 
      className="bg-[#0485ea] text-white"
    >
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/akc-logo.png" 
            alt="AKC LLC Logo" 
            className="h-8 w-auto bg-white rounded-sm p-1" 
          />
          <span className="text-xl font-bold text-white">AKC LLC</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.href)}
                    className="hover:bg-white/10 data-[active=true]:bg-white/20"
                    tooltip={item.name}
                  >
                    <Link to={item.href} className="text-white">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-white/20 mt-auto">
        <div className="px-3 py-2 flex items-center text-sm font-medium text-white/80">
          <User2 className="mr-3 h-5 w-5" />
          <span>Admin User</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
