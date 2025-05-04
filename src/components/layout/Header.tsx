import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Header = () => {
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const [projectName, setProjectName] = useState<string | null>(null);

  // Fetch project data if we're on a project detail page
  useEffect(() => {
    const fetchProjectName = async () => {
      if (projectId) {
        const { data } = await supabase
          .from('projects')
          .select('projectname')
          .eq('projectid', projectId)
          .single();

        if (data) {
          setProjectName(data.projectname);
        }
      } else {
        setProjectName(null);
      }
    };

    fetchProjectName();
  }, [projectId]);

  // Extract the page title from the pathname
  const getPageTitle = () => {
    if (projectName && projectId) {
      return (
        <div className="flex items-center">
          <span>Projects</span>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="font-semibold">{projectName}</span>
          <span className="ml-2 text-sm text-muted-foreground">ID: {projectId}</span>
        </div>
      );
    }

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
