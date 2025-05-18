"use client";

import { type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import NextLink from "next/link";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
  groupLabel,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    category?: string;
  }[];
  groupLabel: string;
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup className="mb-6">
      <SidebarGroupLabel className="text-white/90 font-medium text-xs mb-4 uppercase tracking-wider px-3 letter-spacing-wide">
        {groupLabel}
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1.5 px-2">
        {items.map((item, index) => (
          <NextLink
            href={item.url}
            key={`${item.title}-${index}`}
          >
            <SidebarMenuItem
              className={cn(
                "transition-all duration-200 rounded-lg overflow-hidden",
                pathname === item.url
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-4 border-primary shadow-sm"
                  : "hover:bg-sidebar-accent/50 hover:border-l-4 hover:border-primary/50 hover:shadow-sm"
              )}
            >
              <SidebarMenuButton tooltip={item.title} className="py-3 px-4">
                {item.icon && <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />}
                <span className="font-medium">{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </NextLink>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
