import { Home, Settings, Users, FileText, HelpCircle, Menu } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// Sample navigation data
const navigationItems = [
  {
    
    items: [
      { name: "Dashboard", icon: Home, href: "/" },
      { name: "Users", icon: Users, href: "/users" },
      { name: "Documents", icon: FileText, href: "/documents" },
    ],
  }
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="h-14 flex border-b py-4">
        <div className="flex items-center gap-2 ">
          <Menu className="h-5 w-5" />
          <span className="font-semibold">My Work</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navigationItems.map((section) => (
          <SidebarGroup>
          
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild>
                      <a href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
     
      <SidebarRail />
    </Sidebar>
  )
}
