
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
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { siteConfig } from "@/config/site";
import { useEffect, useState } from "react";
import { MainNavItem } from "@/types/nav";

interface SidebarProps {
  className?: string;
  items?: MainNavItem[];
}

const mainNav = [
  {
    title: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Projects",
    href: "/Projects",
    icon: <FolderKanban className="h-5 w-5" />,
  },
  {
    title: "Estimates",
    href: "/Estimates",
    icon: <FileSpreadsheet className="h-5 w-5" />,
  },
  {
    title: "Work Orders",
    href: "/WorkOrders",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    title: "Contacts",
    href: "/Contacts",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Vendors",
    href: "/Vendors",
    icon: <Store className="h-5 w-5" />,
  },
  {
    title: "Subcontractors",
    href: "/Subcontractors",
    icon: <HardHat className="h-5 w-5" />,
  },
  {
    title: "Time Tracking",
    href: "/TimeTracking",
    icon: <Clock className="h-5 w-5" />,
  },
  {
    title: "Documents",
    href: "/Documents",
    icon: <FileText className="h-5 w-5" />,
  },
];

export function Sidebar({ className, items }: SidebarProps) {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={cn(
        "flex h-full w-[280px] flex-col border-r bg-background py-4",
        className
      )}
    >
      <ScrollArea className="flex-1 space-y-4 px-3">
        <div onClick={() => navigate("/")} className="flex items-center space-x-2 px-2 cursor-pointer">
          <span className="font-bold">{siteConfig.name}</span>
        </div>
        <Separator />
        <div className="space-y-1">
          {mainNav.map((item) => (
            <Button
              key={item.title}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2",
                window.location.pathname === item.href
                  ? "bg-secondary text-foreground hover:bg-secondary/80"
                  : "hover:bg-secondary/50"
              )}
              onClick={() => navigate(item.href)}
            >
              {item.icon}
              <span>{item.title}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
      <div className="flex flex-col space-y-1 p-3">
        <Separator />
        {mounted && (
          <Button variant="secondary" onClick={() => navigate('/login')}>
            Login
          </Button>
        )}
      </div>
    </div>
  );
}
