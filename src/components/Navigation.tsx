import { useState } from 'react';
import { Menu, X, User, LogOut, Shield, Newspaper, Users, Calendar, Building, Mail, Star, Trophy, MapPin, Briefcase, Phone, Megaphone, Calculator, Gift, Eye, ChevronDown } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AdvertisingAlerts from '@/components/AdvertisingAlerts';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    await signOut();
  };

  // Handle navigation for links with hash (#) or query params (?)
  // Uses direct window navigation to avoid React Router URL encoding issues
  const handleNavigation = (href: string, closeMenu?: boolean) => {
    if (closeMenu) {
      setIsMenuOpen(false);
    }
    
    if (href.includes('#') || href.includes('?')) {
      window.location.href = href;
    } else {
      navigate(href);
    }
  };

  const homeDropdownItems = [
    { name: 'Latest Community News', href: '/#news', description: 'Stay updated with the latest local stories and updates', icon: Newspaper },
    { name: 'Featured Advertisers', href: '/#advertisers', description: 'Discover local businesses and services in your area', icon: Star },
    { name: 'Newsletter Signup', href: '/#newsletter', description: 'Subscribe to receive regular community updates', icon: Mail },
  ];

  const competitionsDropdownItems = [
    { name: 'Current Competitions', href: '/competitions', description: 'Enter exciting competitions with amazing prizes', icon: Trophy },
    { name: 'Competition Rules', href: '/competitions#rules', description: 'Read terms and conditions for all competitions', icon: Eye },
  ];

  const distributeDropdownItems = [
    { name: 'Application Form', href: '/apply-to-distribute', description: 'Apply to become a distribution partner in your area', icon: Briefcase },
    { name: 'Distribution Areas', href: '/apply-to-distribute#areas', description: 'View available distribution territories', icon: MapPin },
    { name: 'Requirements', href: '/apply-to-distribute#requirements', description: 'Learn about distributor requirements and benefits', icon: Eye },
  ];

  const businessDirectoryDropdownItems = [
    { name: 'Browse Businesses', href: '/business-directory', description: 'Find local businesses and services by category', icon: Building },
    { name: 'Add Your Business', href: '/business-directory#add', description: 'List your business in our community directory', icon: Briefcase },
    { name: 'Featured Listings', href: '/business-directory#featured', description: 'Premium business listings with enhanced visibility', icon: Star },
  ];

  // Contact removed from dropdowns - now a direct link

  const whatsOnDropdownItems = [
    { name: 'Find Events', href: '/whats-on', description: 'Browse upcoming events in your area', icon: Calendar },
    { name: 'Add Events', href: '/whats-on?tab=add', description: 'Submit your event to be featured', icon: Calendar },
  ];

  const advertisingDropdownItems = [
    { name: 'Advertising Overview', href: '/advertising#top', description: 'Learn about our reach, story, and magazine editions', icon: Megaphone },
    { name: 'Rate Card Calculator', href: '/advertising#quick-quote', description: 'Get a quick pricing estimate in seconds', icon: Calculator },
    { name: 'Online Quote & Booking Tool', href: '/advertising#calculator', description: 'Full quote builder with all package options', icon: Gift },
    { name: 'Advertising Enquiry Form', href: '/advertising#enquiry-form', description: 'Get in touch for a personalised quote', icon: Phone },
  ];

  const allDropdownSections = [
    { title: 'Home', items: homeDropdownItems, path: '/' },
    { title: 'Events', items: whatsOnDropdownItems, path: '/whats-on' },
    { title: 'Competitions', items: competitionsDropdownItems, path: '/competitions' },
    { title: 'Directory', items: businessDirectoryDropdownItems, path: '/business-directory' },
    { title: 'Advertising', items: advertisingDropdownItems, path: '/advertising' },
    { title: 'Distribute', items: distributeDropdownItems, path: '/apply-to-distribute' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img 
                src="/lovable-uploads/discover-logo-2.png" 
                alt="Discover Magazines Logo" 
                className="h-16 w-auto py-2"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavigationMenu>
              <NavigationMenuList className="space-x-2">
                {/* Navigation items with dropdowns */}
                {allDropdownSections.map((section) => (
                  <NavigationMenuItem key={section.title}>
                    <NavigationMenuTrigger 
                      className="text-gray-700 hover:text-community-green px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-transparent hover:bg-transparent data-[state=open]:bg-transparent"
                      onClick={() => navigate(section.path)}
                    >
                      {section.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-full bg-white border border-border shadow-lg rounded-lg">
                        <div className="grid md:grid-cols-4 lg:grid-cols-5">
                          {/* Main content sections */}
                          <div className="md:col-span-3 lg:col-span-3 p-6">
                            <div className="grid gap-6 md:grid-cols-2">
                              <div>
                                <h3 className="text-sm font-semibold text-foreground mb-4">{section.title}</h3>
                                <div className="space-y-3">
                                  {section.items.map((item) => {
                                    const IconComponent = item.icon;
                                    return (
                                      <NavigationMenuLink key={item.name} asChild>
                                        <div
                                          onClick={() => handleNavigation(item.href)}
                                          className="group flex items-start space-x-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                                        >
                                          <div className="flex-shrink-0 w-6 h-6 text-muted-foreground group-hover:text-community-green transition-colors">
                                            <IconComponent size={20} />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-foreground group-hover:text-community-green transition-colors">
                                              {item.name}
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-tight mt-1">
                                              {item.description}
                                            </p>
                                          </div>
                                        </div>
                                      </NavigationMenuLink>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Featured content */}
                          <div className="md:col-span-1 lg:col-span-2 bg-muted/30 p-6 rounded-r-lg">
                            <div className="space-y-4">
                              {section.title === 'Advertising' ? (
                                <AdvertisingAlerts />
                              ) : section.title === 'Events' ? (
                                <>
                                  <div className="text-sm font-semibold text-foreground">Upcoming Events</div>
                                  <div className="bg-white rounded-lg p-4 shadow-sm border">
                                    <h4 className="text-sm font-medium text-foreground mb-2">What's happening?</h4>
                                    <p className="text-sm text-muted-foreground mb-3">
                                      Discover local events and activities happening in your community.
                                    </p>
                                    <Link 
                                      to="/whats-on" 
                                      className="inline-flex items-center text-sm font-medium text-community-green hover:text-green-600 transition-colors"
                                    >
                                      Browse events →
                                    </Link>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="text-sm font-semibold text-foreground">Latest News</div>
                                  <div className="bg-white rounded-lg p-4 shadow-sm border">
                                    <h4 className="text-sm font-medium text-foreground mb-2">Community Update!</h4>
                                    <p className="text-sm text-muted-foreground mb-3">
                                      Stay updated with the latest community stories and local events in South Hampshire.
                                    </p>
                                    <Link 
                                      to="/stories" 
                                      className="inline-flex items-center text-sm font-medium text-community-green hover:text-green-600 transition-colors"
                                    >
                                      Read more →
                                    </Link>
                                  </div>
                                </>
                              )}
                            </div>
                        </div>
                         </div>
                       </div>
                     </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}

                {/* Contact - Direct Link (no dropdown) */}
                <NavigationMenuItem>
                  <Link 
                    to="/contact"
                    className="text-gray-700 hover:text-community-green px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Contact
                  </Link>
                </NavigationMenuItem>

              </NavigationMenuList>
            </NavigationMenu>
            
            {/* User Dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-community-green ml-4">
                    <User size={16} className="mr-1" />
                    {user.email?.split('@')[0]}
                    <ChevronDown size={14} className="ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center w-full">
                      <User size={16} className="mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center w-full">
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Admin Button (outside navigation menu) */}
            {user && isAdmin && (
              <Link to="/admin" className="ml-4">
                <Button variant="ghost" size="sm" className="text-purple-700 hover:text-purple-800">
                  <Shield size={16} className="mr-1" />
                  Admin
                </Button>
              </Link>
            )}

            {/* Customer Login Button */}
            {!user && (
              <Link to="/auth" className="ml-4">
                <Button 
                  size="sm" 
                  className="bg-community-green hover:bg-green-600 text-white"
                >
                  Customer Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-gray-700 hover:text-community-green"
                >
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-80 bg-background">
                <SheetHeader>
                  <SheetTitle className="text-left text-lg font-semibold text-foreground">
                    Menu
                  </SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-6">
                  {/* Navigation Sections */}
                  <Accordion type="single" collapsible className="w-full">
                    {allDropdownSections.map((section) => (
                      <AccordionItem key={section.title} value={section.title} className="border-b border-border">
                        <AccordionTrigger className="text-left hover:text-community-green hover:no-underline py-4">
                          <div className="flex items-center justify-between w-full">
                            <span className="text-base font-medium text-foreground">{section.title}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <div className="space-y-2">
                            {section.items.map((item) => {
                              const IconComponent = item.icon;
                              return (
                                <div
                                  key={item.name}
                                  onClick={() => handleNavigation(item.href, true)}
                                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors group cursor-pointer"
                                >
                                  <div className="flex-shrink-0 w-5 h-5 text-muted-foreground group-hover:text-community-green transition-colors">
                                    <IconComponent size={18} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-foreground group-hover:text-community-green transition-colors">
                                      {item.name}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 leading-tight">
                                      {item.description}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>

                  {/* Contact - Direct Link (no accordion) */}
                  <Link
                    to="/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-3 py-4 border-b border-border hover:bg-accent transition-colors group"
                  >
                    <Phone size={18} className="text-muted-foreground group-hover:text-community-green" />
                    <span className="text-base font-medium text-foreground group-hover:text-community-green">Contact</span>
                  </Link>
                  {/* User Section */}
                  <div className="border-t border-border pt-6 space-y-3">
                    {user ? (
                      <>
                        <div className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground">
                          <User size={16} />
                          <span>Signed in as {user.email?.split('@')[0]}</span>
                        </div>
                        
                        <Link
                          to="/dashboard"
                          className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors text-foreground hover:text-community-green"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User size={18} />
                          <span className="font-medium">Dashboard</span>
                        </Link>
                        
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors text-purple-700 hover:text-purple-800"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Shield size={18} />
                            <span className="font-medium">Admin Dashboard</span>
                          </Link>
                        )}
                        
                        <button
                          onClick={handleSignOut}
                          className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors text-foreground hover:text-community-green w-full text-left"
                        >
                          <LogOut size={18} />
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </>
                    ) : (
                      <Link
                        to="/auth"
                        className="block w-full"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Button className="w-full bg-community-green hover:bg-green-600 text-white py-3">
                          Customer Login
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
