import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { ToastProvider } from "@/contexts/ToastContext";
import { SessionProvider } from "next-auth/react";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SMS — School Management System",
    template: "%s | SMS",
  },
  description:
    "A multi-tenant School Management System for schools, students, teachers, exams, and library operations.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-base font-sans text-text">
        <ToastProvider>
          <SessionProvider>{children}</SessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}