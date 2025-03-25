import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SidebarComponent  } from "@/components/sidebar/sidebar-component";
import { adminBreadcrumb, adminNavigation } from "@/components/ui/navigation";
import { UserNavWrapper } from "@/components/sidebar/user-nav-wrapper";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        
      >
        <SidebarComponent
          logo={<Image src="/logo.png" alt="Logo" width={100} height={100} />}
          companyName="NEIGHBOURHOOD HELPER"
          navigationItems={adminNavigation}
          headerUserNav={<UserNavWrapper />}
          breadcrumbItems={{ items: adminBreadcrumb }}
          >
          {children}
        </SidebarComponent> 
        <Toaster position="bottom-right"/>
      </body>
    </html>
  );
}
