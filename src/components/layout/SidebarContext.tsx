
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarContextProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextProps>({
  isOpen: true,
  toggleSidebar: () => {},
  closeSidebar: () => {},
});

export const useSidebarContext = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsOpen(prev => !prev);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};
