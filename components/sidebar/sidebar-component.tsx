"use client";

import { GalleryVerticalEnd } from "lucide-react";
import { Separator } from "../ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "../ui/sidebar"
import { SidebarProps } from "../ui/types";
import Link from "next/link";
import { BreadcrumbComponent } from "./breadcrumb-component"
import { useMemo } from "react";

export function SidebarComponent({
  logo = <GalleryVerticalEnd className="size-4" />,
  companyName = "Acme Inc",
  navigationItems,
  breadcrumbItems,
  isAdmin,
  children,
  headerUserNav,
}: SidebarProps) {
  // Filter out admin-only routes if user is not admin
  const filteredNavigationItems = useMemo(
    () =>
      {
        const filteredGroups = navigationItems.filter(item => {
          if (item.adminOnly) {
            return isAdmin;
          }
          return true;
        })

        const filteredItems = filteredGroups.map(group => ({
          ...group,
          items: group.items.filter(subItem => {
            if (subItem.adminOnly) {
              return isAdmin;
            }
            return true;
          }),
        }))
        return filteredItems
      },
    [navigationItems, isAdmin],
  );

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="#" className="flex items-center gap-2">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
                    {logo}
                  </div>
                  <span className="font-semibold">{companyName}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="hide-scrollbar">
          {filteredNavigationItems.map((item) => {
            return (
              <SidebarGroup key={item.title}>
                <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((subItem) => (
                      <SidebarMenuItem key={subItem.title}>
                        <SidebarMenuButton asChild isActive={subItem.isActive}>
                          <Link href={subItem.url}>{subItem.title}</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <BreadcrumbComponent items={breadcrumbItems.items} />
          <div className="flex-1" />
          {headerUserNav}
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
{/* <SidebarComponent
logo={<Image src="/logo.jpeg" alt="Logo" width={100} height={100} />}
companyName="Study portal"
navigationItems={adminNavigation}
headerUserNav={<UserNavWrapper />}
breadcrumbItems={{ items: adminBreadcrumb }}
>
{children}
</SidebarComponent> */}