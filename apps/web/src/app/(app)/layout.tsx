import type { Metadata } from "next";
import "../globals.css";
import { Inter } from "next/font/google";
import React from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { SidebarLayout } from "@/components/sidebar";
import { AuthProvider } from "@/providers/Auth";
import { ThemeProvider } from "@/providers/Theme";
import { Toaster } from "@/components/ui/sonner";
import { DOCS_LINK } from "@/constants";

const inter = Inter({
  subsets: ["latin"],
  preload: true,
  display: "swap",
});

export const metadata: Metadata = {
  title: "IntelliChat",
  description: "Create personalized AI agents for study assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDemoApp = process.env.NEXT_PUBLIC_DEMO_APP === "true";
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV !== "production" && (
          <script
            crossOrigin="anonymous"
            src="//unpkg.com/react-scan/dist/auto.global.js"
          />
        )}
      </head>
      <body className={inter.className}>
        {isDemoApp && (
          <div className="fixed top-0 right-0 left-0 z-10 bg-gradient-to-r from-purple-600 via-violet-500 to-amber-400 py-2 text-center text-white shadow-md">
            You're currently using the IntelliChat demo application. To use your own agents,
            and run in production, check out the{" "}
            <a
              className="font-medium underline underline-offset-2"
              href={DOCS_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              documentation
            </a>
          </div>
        )}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <AuthProvider>
              <SidebarLayout>{children}</SidebarLayout>
            </AuthProvider>
          </NuqsAdapter>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
