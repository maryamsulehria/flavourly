"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  ChefHat,
  ClipboardList,
  Home,
  Settings,
  User,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NutritionistSidebarProps {
  pendingCount?: number;
}

export default function NutritionistSidebar({
  pendingCount,
}: NutritionistSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const navigation: NavigationItem[] = [
    {
      name: "Dashboard",
      href: "/nutritionist",
      icon: Home,
    },
    {
      name: "Review Queue",
      href: "/nutritionist/queue",
      icon: ClipboardList,
      badge: pendingCount || 0,
    },
    {
      name: "My Verified",
      href: "/nutritionist/verified",
      icon: CheckCircle,
    },
  ];

  const secondaryNavigation: NavigationItem[] = [
    {
      name: "Profile",
      href: session?.user?.id
        ? `/nutritionist/profile/${session.user.id}`
        : "/nutritionist/profile",
      icon: User,
    },
    {
      name: "Settings",
      href: "/nutritionist/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="hidden lg:flex lg:flex-shrink-0 lg:fixed lg:inset-y-0 lg:z-50">
      <div className="flex flex-col w-64">
        <div className="flex-1 flex flex-col h-screen bg-card border-r">
          {/* Logo/Brand */}
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-card">
            <div className="flex items-center">
              <div className="p-2 bg-primary rounded-lg">
                <ChefHat className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-foreground">Flavourly</p>
                <p className="text-xs text-muted-foreground">Nutritionist</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Button
                    key={item.name}
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start h-10 px-3",
                      isActive && "bg-primary text-primary-foreground",
                      !isActive &&
                        "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                    onClick={() => router.push(item.href)}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    <span className="flex-1 text-left">{item.name}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge
                        variant="destructive"
                        className="ml-2 h-5 min-w-[1.25rem] text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </nav>

            <Separator />

            {/* Secondary Navigation */}
            <nav className="px-2 py-4 space-y-1">
              {secondaryNavigation.map((item) => {
                const isActive = pathname.includes(item.href);
                const Icon = item.icon;

                return (
                  <Button
                    key={item.name}
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start h-10 px-3",
                      isActive && "bg-primary text-primary-foreground",
                      !isActive &&
                        "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                    onClick={() => router.push(item.href)}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    <span className="flex-1 text-left">{item.name}</span>
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
