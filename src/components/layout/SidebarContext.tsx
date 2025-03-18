
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarContextProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextProps>({
  isOpen: true,
  toggleSidebar: () => {},
  closeSidebar: () => {},
  openSidebar: () => {},
});

export const useSidebarContext = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  // Update sidebar state when screen size changes
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    console.log('Toggling sidebar. Current state:', isOpen);
    setIsOpen(prev => !prev);
  };

  const closeSidebar = () => {
    console.log('Closing sidebar');
    setIsOpen(false);
  };
  
  const openSidebar = () => {
    console.log('Opening sidebar');
    setIsOpen(true);
  };

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar, openSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};
