import { Building2, Calendar, FileText, BookOpen, Plus, List, Gift, Home, LogOut, Settings, HelpCircle } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

interface DashboardSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  businessCount: number
  eventCount: number  
  quoteCount: number
  bookingCount: number
  voucherCount?: number
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
  voucherCount = 0,
  editingBusiness,
  editingEvent
}: DashboardSidebarProps) {
  const { state } = useSidebar()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      navigate("/")
      toast.success("Signed out successfully")
    } catch (error) {
      toast.error("Error signing out")
    }
  }

  const handleBackToWebsite = () => {
    navigate("/")
  }

  const handleProfileSettings = () => {
    setActiveTab("profile")
  }

  const handleSupport = () => {
    navigate("/support")
  }

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
    },
    {
      title: `Your Vouchers (${voucherCount})`,
      value: "vouchers",
      icon: Gift,
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
      
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleBackToWebsite}>
              <Home className="h-4 w-4" />
              {state !== "collapsed" && <span>Back to Website</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleProfileSettings} className={getNavCls("profile")}>
              <Settings className="h-4 w-4" />
              {state !== "collapsed" && <span>Profile Settings</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSupport}>
              <HelpCircle className="h-4 w-4" />
              {state !== "collapsed" && <span>Support</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} className="text-destructive hover:text-destructive">
              <LogOut className="h-4 w-4" />
              {state !== "collapsed" && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}