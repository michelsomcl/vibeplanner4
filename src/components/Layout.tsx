
import { Outlet, useLocation } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

const Layout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      {!isHomePage && <AppSidebar />}
      
      <div className="flex-1 flex flex-col">
        {!isHomePage && (
          <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 shadow-sm">
            <SidebarTrigger className="text-primary hover:bg-primary/10" />
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-primary">VibePlanner</h1>
            </div>
          </header>
        )}
        
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
