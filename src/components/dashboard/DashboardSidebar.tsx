import { Building2, Calendar, FileText, BookOpen, Plus, List } from "lucide-react"
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
} from "@/components/ui/sidebar"

interface DashboardSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  businessCount: number
  eventCount: number  
  quoteCount: number
  bookingCount: number
  editingBusiness: any
  editingEvent: any
}

export function DashboardSidebar({
  activeTab,
  setActiveTab,
  businessCount,
  eventCount,
  quoteCount,
  bookingCount,
  editingBusiness,
  editingEvent
}: DashboardSidebarProps) {
  const { state } = useSidebar()

  const getNavCls = (tabValue: string) =>
    activeTab === tabValue 
      ? "bg-primary/10 text-primary border-r-2 border-primary font-medium" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"

  const businessItems = [
    {
      title: editingBusiness ? "Edit Listing" : "Create New Listing",
      value: "create",
      icon: editingBusiness ? Building2 : Plus,
      disabled: businessCount > 0 && !editingBusiness
    },
    {
      title: `Your Listings (${businessCount})`,
      value: "listings", 
      icon: List,
      disabled: false
    }
  ]

  const eventItems = [
    {
      title: editingEvent ? "Edit Event" : "Create Event",
      value: "create-event",
      icon: editingEvent ? Calendar : Plus,
      disabled: false
    },
    {
      title: `Your Events (${eventCount})`,
      value: "events",
      icon: List,
      disabled: false
    }
  ]

  const otherItems = [
    {
      title: `Saved Quotes (${quoteCount})`,
      value: "quotes",
      icon: FileText,
      disabled: false
    },
    {
      title: `Bookings (${bookingCount})`,
      value: "bookings", 
      icon: BookOpen,
      disabled: false
    }
  ]

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold text-muted-foreground">
            Business Directory
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {businessItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton 
                    onClick={() => setActiveTab(item.value)}
                    disabled={item.disabled}
                    className={getNavCls(item.value)}
                  >
                    <item.icon className="h-4 w-4" />
                    {state !== "collapsed" && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold text-muted-foreground">
            Events
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {eventItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton 
                    onClick={() => setActiveTab(item.value)}
                    disabled={item.disabled}
                    className={getNavCls(item.value)}
                  >
                    <item.icon className="h-4 w-4" />
                    {state !== "collapsed" && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold text-muted-foreground">
            Advertising
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {otherItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton 
                    onClick={() => setActiveTab(item.value)}
                    disabled={item.disabled}
                    className={getNavCls(item.value)}
                  >
                    <item.icon className="h-4 w-4" />
                    {state !== "collapsed" && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}