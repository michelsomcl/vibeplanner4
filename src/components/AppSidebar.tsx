
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  PiggyBank,
  FileText,
  Scale,
  Home
} from "lucide-react";
import { NavLink, useParams } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { state } = useSidebar();
  const { id: clientId } = useParams();

  const mainItems = [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "Clientes", url: "/", icon: Users },
  ];

  const clientItems = clientId ? [
    { title: "Visão Geral", url: `/client/${clientId}`, icon: Users },
    { title: "Reestruturação Financeira", url: `/client/${clientId}/debts`, icon: TrendingUp },
    { title: "Acúmulo de Patrimônio", url: `/client/${clientId}/assets`, icon: DollarSign },
    { title: "Orçamento Mensal", url: `/client/${clientId}/budget`, icon: Calendar },
    { title: "Previdência", url: `/client/${clientId}/retirement`, icon: PiggyBank },
    { title: "Planejamento Sucessório", url: `/client/${clientId}/succession`, icon: Scale },
    { title: "Relatório Final", url: `/client/${clientId}/report`, icon: FileText },
  ] : [];

  const getNavClass = (isActive: boolean) =>
    isActive 
      ? "bg-white/20 text-white font-medium" 
      : "hover:bg-white/10 text-white/80 hover:text-white";

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar 
      className={isCollapsed ? "w-16" : "w-64"} 
      collapsible="icon"
      style={{ backgroundColor: '#7654ad' }}
    >
      <SidebarContent className="border-r-0" style={{ backgroundColor: '#7654ad' }}>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white font-semibold">
            {!isCollapsed && "Menu Principal"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => getNavClass(isActive)}
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {clientItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-white font-semibold">
              {!isCollapsed && "Planejamento"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {clientItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end 
                        className={({ isActive }) => getNavClass(isActive)}
                      >
                        <item.icon className="h-5 w-5" />
                        {!isCollapsed && <span className="text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
