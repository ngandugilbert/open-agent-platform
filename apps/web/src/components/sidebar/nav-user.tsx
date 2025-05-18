"use client";

import { useState } from "react";
import {
  ChevronsUpDown,
  LogOut,
  User,
  Loader2,
  TriangleAlert,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthContext } from "@/providers/Auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfigStore } from "@/features/chat/hooks/use-config-store";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user: authUser, signOut, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { resetStore } = useConfigStore();
  const { setTheme } = useTheme();

  // Use auth user if available, otherwise use default user
  const displayUser = authUser
    ? {
        name: authUser.displayName || authUser.email?.split("@")[0] || "User",
        email: authUser.email || "",
        avatar: authUser.avatarUrl || "",
        company: authUser.companyName || "",
        firstName: authUser.firstName || "",
        lastName: authUser.lastName || "",
      }
    : {
        name: "Guest",
        email: "Not signed in",
        avatar: "",
        company: "",
        firstName: "",
        lastName: "",
      };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      const { error } = await signOut();

      if (error) {
        console.error("Error signing out:", error);
        toast.error("Error signing out", { richColors: true });
        return;
      }

      router.push("/signin");
    } catch (err) {
      console.error("Error during sign out:", err);
      toast.error("Error signing out", { richColors: true });
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleSignIn = () => {
    router.push("/signin");
  };

  const handleClearLocalData = () => {
    resetStore();
    toast.success("Local data cleared. Please refresh the page.", {
      richColors: true,
    });
  };

  const isProdEnv = process.env.NODE_ENV === "production";

  return (
    <div className="space-y-4 px-2 mb-2">
      <SidebarGroup>
        <SidebarMenu className="space-y-2">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-16 group-data-[collapsible=icon]:p-0! hover:translate-x-0 hover:bg-sidebar-accent/50 transition-all duration-200 hover:border-l-4 hover:border-primary/50 data-[state=open]:border-l-4 data-[state=open]:border-primary rounded-lg overflow-hidden shadow-sm">
                  <Avatar className="h-10 w-10 rounded-full border-2 border-primary/70 shadow-md">
                    <AvatarImage
                      src={displayUser.avatar}
                      alt={displayUser.name}
                    />
                    <AvatarFallback className="rounded-full bg-white/10 text-white">
                      {displayUser.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight ml-3">
                    <span className="truncate font-semibold text-white">
                      {displayUser.name}
                    </span>
                    <span className="truncate text-xs text-white/80">{displayUser.email}</span>
                    {"company" in displayUser && (
                      <span className="text-white/60 truncate text-xs">
                        {displayUser.company}
                      </span>
                    )}
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-white/80" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-60 rounded-lg shadow-lg animate-fade-in border-border"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={6}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-3 py-3 text-left text-sm">
                <Avatar className="h-12 w-12 rounded-full border-2 border-accent/40 shadow-md">
                  <AvatarImage
                    src={displayUser.avatar}
                    alt={displayUser.name}
                  />
                  <AvatarFallback className="rounded-full bg-accent/10 text-accent">
                    {displayUser.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-base">
                    {displayUser.name}
                  </span>
                  <span className="truncate text-sm text-muted-foreground">{displayUser.email}</span>
                  {"company" in displayUser && (
                    <span className="text-muted-foreground truncate text-xs">
                      {displayUser.company}
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuItem className="py-3 px-4 transition-colors hover:bg-secondary/80 rounded-md mx-1 my-0.5" onClick={() => setTheme("light")}>
              <div className="flex items-center">
                <Sun className="mr-3 h-5 w-5 text-primary" />
                <span className="font-medium">Light Mode</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="py-3 px-4 transition-colors hover:bg-secondary/80 rounded-md mx-1 my-0.5" onClick={() => setTheme("dark")}>
              <div className="flex items-center">
                <Moon className="mr-3 h-5 w-5 text-primary" />
                <span className="font-medium">Dark Mode</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="py-3 px-4 transition-colors hover:bg-secondary/80 rounded-md mx-1 my-0.5" onClick={() => setTheme("system")}>
              <div className="flex items-center">
                <span className="mr-3 h-5 w-5 flex items-center justify-center text-primary">💻</span>
                <span className="font-medium">System Theme</span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1" />

            {isAuthenticated ? (
              <DropdownMenuItem
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="py-3 px-4 transition-colors hover:bg-secondary/80 rounded-md mx-1 my-0.5"
              >
                {isSigningOut ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin text-primary" />
                    <span className="font-medium">Signing out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="mr-3 h-5 w-5 text-primary" />
                    <span className="font-medium">Sign out</span>
                  </>
                )}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={handleSignIn} className="py-3 px-4 transition-colors hover:bg-secondary/80 rounded-md mx-1 my-0.5">
                <User className="mr-3 h-5 w-5 text-primary" />
                <span className="font-medium">Sign in</span>
              </DropdownMenuItem>
            )}
            {!isProdEnv && (
              <DropdownMenuItem onClick={handleClearLocalData} className="py-3 px-4 transition-colors hover:bg-secondary/80 rounded-md mx-1 my-0.5">
                <TriangleAlert className="mr-3 h-5 w-5 text-destructive" />
                <span className="font-medium">Clear local data</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </div>
  );
}
