"use client";

import * as React from "react";
import { Wrench, Bot, MessageCircle, Brain, Home, Database, Settings, BookOpen } from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SiteHeader } from "./sidebar-header";

// Organized navigation data with categories
const data = {
  mainNav: [
    {
      title: "Chat",
      url: "/",
      icon: MessageCircle,
      category: "core"
    },
    {
      title: "Agents",
      url: "/agents",
      icon: Bot,
      category: "core"
    },
  ],
  toolsNav: [
    {
      title: "Tools",
      url: "/tools",
      icon: Wrench,
      category: "tools"
    },
    {
      title: "RAG",
      url: "/rag",
      icon: Brain,
      category: "tools"
    },
  ],
  // Additional categories can be added here
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      className="shadow-lg"
      {...props}
    >
      <SiteHeader />
      <SidebarContent className="flex flex-col space-y-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent px-1">
        <NavMain
          items={data.mainNav}
          groupLabel="Main"
        />
        <NavMain
          items={data.toolsNav}
          groupLabel="Tools & Resources"
        />
      </SidebarContent>
      <SidebarFooter className="mt-auto pt-4 border-t border-sidebar-border/30">
        <NavUser />
      </SidebarFooter>
      <SidebarRail className="hover:bg-sidebar-accent/20" />
    </Sidebar>
  );
}
