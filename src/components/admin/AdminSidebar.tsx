import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  Building2,
  Users,
  FileText,
  Calculator,
  DollarSign,
  Settings,
  BarChart3,
  Shield,
  ChevronDown,
  ChevronRight
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Dashboard",
    icon: BarChart3,
    section: "overview"
  },
  {
    title: "Businesses",
    icon: Building2,
    section: "businesses"
  },
  {
    title: "Users",
    icon: Users,
    section: "users"
  },
  {
    title: "Stories",
    icon: FileText,
    section: "stories"
  },
  {
    title: "Pricing",
    icon: DollarSign,
    section: "pricing"
  },
  {
    title: "Cost Calculator",
    icon: Calculator,
    section: "calculator"
  }
]

interface AdminSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-card border-r">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            {!collapsed && (
              <div>
                <h2 className="font-semibold text-sm">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">Management Dashboard</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.section}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeSection === item.section}
                    className="cursor-pointer"
                  >
                    <button
                      onClick={() => onSectionChange(item.section)}
                      className="flex items-center gap-3 w-full text-left"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Section */}
        <div className="mt-auto p-4 border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button className="flex items-center gap-3 w-full text-left text-muted-foreground hover:text-foreground">
                  <Settings className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span className="text-sm">Settings</span>}
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}