import { AppSidebar } from "./components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default function Home() {
  return (
    // <SidebarProvider>
    //   <AppSidebar />
    //   <SidebarInset>
    //     <header className="flex h-14 items-center gap-4  bg-background px-4">
    //       <SidebarTrigger />
    //       <Separator orientation="vertical" className="h-12" />
    //     </header>
    //     <main className="flex-1 p-6">
          
    //     </main>
    //   </SidebarInset>
    // </SidebarProvider>
    <h1 className="text-4xl ">Hello World</h1>
  )
}

