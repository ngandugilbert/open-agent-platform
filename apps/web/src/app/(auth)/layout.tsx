import React from "react";
import AuthLayout from "./auth-layout";
import { AuthProvider } from "@/providers/Auth";
import type { Metadata } from "next";
import "../globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/providers/Theme";
import { Toaster } from "@/components/ui/sonner";
import { DOCS_LINK } from "@/constants";

const inter = Inter({
  subsets: ["latin"],
  preload: true,
  display: "swap",
});

export const metadata: Metadata = {
  title: "IntelliChat - Auth",
  description: "Create personalized AI agents for study assistance",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDemoApp = process.env.NEXT_PUBLIC_DEMO_APP === "true";
  return (
    <html lang="en" suppressHydrationWarning>
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
          <AuthProvider>
            <AuthLayout>{children}</AuthLayout>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
