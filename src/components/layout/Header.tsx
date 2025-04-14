import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';

const Header = () => {
  const location = useLocation();

  // Extract the page title from the pathname
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    return path
      .substring(1)
      .split('/')[0]
      .replace(/-/g, ' ')
      .replace(/^\w/, c => c.toUpperCase());
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold md:text-xl">{getPageTitle()}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
