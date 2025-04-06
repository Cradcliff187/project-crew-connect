import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Users,
  Briefcase,
  ClipboardCheck,
  Settings,
  Menu,
  CreditCard,
  Contact,
  Tool,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  icon: React.ComponentType<any>;
  text: string;
  to: string;
}

interface SidebarProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

const Sidebar = ({ isMobileMenuOpen, toggleMobileMenu }: SidebarProps) => {
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  // Main navigation items
  const navItems = [
    { icon: LayoutDashboard, text: 'Dashboard', to: '/' },
    { icon: Briefcase, text: 'Projects', to: '/projects' },
    { icon: ClipboardCheck, text: 'Estimates', to: '/estimates' },
    { icon: Users, text: 'Customers', to: '/customers' },
    { icon: CreditCard, text: 'Vendors', to: '/vendors' },
    { icon: Contact, text: 'Contacts', to: '/contacts' },
    { icon: Tool, text: 'Work Orders', to: '/work-orders' },
    { icon: BarChart3, text: 'Reports', to: '/reports' },
    { icon: Settings, text: 'Settings', to: '/settings' },
  ];

  return (
    <div className={cn(
      "flex flex-col w-64 border-r bg-secondary border-r-muted min-h-screen fixed top-0 left-0 z-20",
      isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
      "transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static"
    )}>
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/" className="font-bold text-lg">
          Admin Panel
        </Link>
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleMobileMenu}>
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      <nav className="flex-1 px-2 py-4">
        {navItems.map((item: NavItem) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              location.pathname === item.to ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
            onClick={toggleMobileMenu}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.text}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
