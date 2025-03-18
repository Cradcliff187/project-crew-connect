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

import { MainNavItem } from "@/types/nav";
import { siteConfig } from "@/config/site";
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
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

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
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
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
        <Link href="/" className="flex items-center space-x-2 px-2">
          {/* <Icons.logo className="h-6 w-6" /> */}
          <span className="font-bold">{siteConfig.name}</span>
        </Link>
        <Separator />
        <div className="space-y-1">
          {mainNav.map((item) => (
            <Link key={item.title} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2",
                  pathname === item.href
                    ? "bg-secondary text-foreground hover:bg-secondary/80"
                    : "hover:bg-secondary/50"
                )}
              >
                {item.icon}
                <span>{item.title}</span>
              </Button>
            </Link>
          ))}
        </div>
      </ScrollArea>
      <div className="flex flex-col space-y-1 p-3">
        <Separator />
        {mounted && session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex h-8 w-full items-center justify-between rounded-md">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.image ?? ""} />
                    <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-left">{session?.user?.name}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" forceMount>
              <DropdownMenuItem onClick={() => router.push('/Settings')}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="secondary" onClick={() => router.push('/login')}>
            Login
          </Button>
        )}
      </div>
    </div>
  );
}
