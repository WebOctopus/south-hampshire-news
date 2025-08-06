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
  ChevronRight,
  MapPin,
  Package,
  Clock,
  TrendingUp,
  Monitor,
  Receipt,
  Tag
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
    section: "calculator",
    hasSubmenu: true,
    subItems: [
      {
        title: "Locations",
        icon: MapPin,
        section: "calculator-locations"
      },
      {
        title: "Ad Size & Pricing",
        icon: Package,
        section: "calculator-ad-sizes"
      },
      {
        title: "Subscription Settings",
        icon: Settings,
        section: "calculator-subscriptions"
      },
      {
        title: "Durations",
        icon: Clock,
        section: "calculator-durations"
      },
      {
        title: "Volume Discount",
        icon: TrendingUp,
        section: "calculator-volume-discounts"
      },
      {
        title: "Preview Calculator",
        icon: Monitor,
        section: "calculator-preview"
      },
      {
        title: "Issue-Based Pricing",
        icon: Receipt,
        section: "calculator-issue-pricing"
      },
      {
        title: "Special Deals",
        icon: Tag,
        section: "calculator-special-deals"
      }
    ]
  }
]

interface AdminSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  const [expandedItems, setExpandedItems] = useState<string[]>(['calculator']) // Default expand calculator

  const toggleExpanded = (section: string) => {
    setExpandedItems(prev => 
      prev.includes(section) 
        ? prev.filter(item => item !== section)
        : [...prev, section]
    )
  }

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
                <div key={item.section}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={activeSection === item.section}
                      className="cursor-pointer"
                    >
                      <button
                        onClick={() => {
                          if (item.hasSubmenu) {
                            toggleExpanded(item.section)
                          } else {
                            onSectionChange(item.section)
                          }
                        }}
                        className="flex items-center justify-between w-full text-left"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          {!collapsed && <span className="text-sm">{item.title}</span>}
                        </div>
                        {item.hasSubmenu && !collapsed && (
                          expandedItems.includes(item.section) 
                            ? <ChevronDown className="h-4 w-4" />
                            : <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  {/* Submenu */}
                  {item.hasSubmenu && expandedItems.includes(item.section) && !collapsed && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.subItems?.map((subItem) => (
                        <SidebarMenuItem key={subItem.section}>
                          <SidebarMenuButton
                            asChild
                            isActive={activeSection === subItem.section}
                            className="cursor-pointer text-sm"
                          >
                            <button
                              onClick={() => onSectionChange(subItem.section)}
                              className="flex items-center gap-3 w-full text-left"
                            >
                              <subItem.icon className="h-3 w-3 flex-shrink-0" />
                              <span className="text-xs">{subItem.title}</span>
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </div>
                  )}
                </div>
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