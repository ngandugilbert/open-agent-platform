"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme } = useTheme();

  // For use in the dropdown menu
  if (className) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={className}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="animate-fade-in shadow-lg">
          <DropdownMenuItem
            onClick={() => setTheme("light")}
            className="py-2.5 px-3 transition-colors hover:bg-secondary flex items-center gap-2"
          >
            <Sun className="h-4 w-4 text-primary" />
            <span className="font-medium">Light</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("dark")}
            className="py-2.5 px-3 transition-colors hover:bg-secondary flex items-center gap-2"
          >
            <Moon className="h-4 w-4 text-primary" />
            <span className="font-medium">Dark</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("system")}
            className="py-2.5 px-3 transition-colors hover:bg-secondary flex items-center gap-2"
          >
            <span className="h-4 w-4 flex items-center justify-center text-primary">💻</span>
            <span className="font-medium">System</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // For use in the sidebar (original implementation)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-md hover:bg-sidebar-accent/50 hover:text-white transition-all duration-200 hover:border-l-4 hover:border-accent/50"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all text-white/90 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all text-white/90 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="animate-fade-in shadow-lg">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="py-2.5 px-3 transition-colors hover:bg-secondary flex items-center gap-2"
        >
          <Sun className="h-4 w-4 text-primary" />
          <span className="font-medium">Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="py-2.5 px-3 transition-colors hover:bg-secondary flex items-center gap-2"
        >
          <Moon className="h-4 w-4 text-primary" />
          <span className="font-medium">Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="py-2.5 px-3 transition-colors hover:bg-secondary flex items-center gap-2"
        >
          <span className="h-4 w-4 flex items-center justify-center text-primary">💻</span>
          <span className="font-medium">System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
