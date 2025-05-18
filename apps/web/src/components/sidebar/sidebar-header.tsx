"use client";

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { LangGraphLogoSVG } from "../icons/langgraph";
import NextLink from "next/link";

export function SiteHeader() {
  return (
    <SidebarHeader className="mb-8 pt-4 px-2">
      <SidebarMenu>
        <SidebarMenuItem className="px-2">
          <SidebarMenuButton
            size="lg"
            asChild
            className="flex items-center justify-center gap-0 hover:translate-x-0 hover:scale-105 py-3 rounded-lg transition-all duration-200"
          >
            <NextLink href="/">
              <LangGraphLogoSVG className="!h-7 !w-auto flex-shrink-0 text-primary drop-shadow-sm" />
              <div className="grid flex-1 pl-3 text-left text-base leading-tight transition-all group-data-[collapsible=icon]:pl-0 group-data-[collapsible=icon]:opacity-0">
                <span className="truncate font-bold text-white text-lg tracking-wide">
                  IntelliChat
                </span>
                <span className="text-xs text-white/80 truncate font-medium">AI Assistant Platform</span>
              </div>
            </NextLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
