import { Outlet, useLocation } from "@modern-js/runtime/router"
import AppSidebar from "./AppSidebar"
import AppSwitch from "./AppSwitch"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "./ui/sidebar"



const SidebarLayout = () => {
    const location = useLocation();
    const pathname = location.pathname;

  if (pathname.includes("/auth")) {
    return <Outlet/>;
  }
  return (
    <SidebarProvider>
      
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          {/* AppSwitch positioned at header-right */}
          <div className="ml-auto">
            <AppSwitch />
          </div>
        </header>
        
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </SidebarInset>

    </SidebarProvider>
  )
}

export default SidebarLayout