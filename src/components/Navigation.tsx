import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Shield, Newspaper, Users, Calendar, Building, Mail, Star, Trophy, MapPin, Briefcase, Phone, Megaphone, Calculator, Gift, Eye, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if user is admin
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .eq('role', 'admin')
            .single();
          
          setIsAdmin(!!roleData);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Check if user is admin
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .single();
        
        setIsAdmin(!!roleData);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    setIsAdmin(false);
  };

  const homeDropdownItems = [
    { name: 'Latest Community News', href: '/#news', description: 'Stay updated with the latest local stories and updates', icon: Newspaper },
    { name: 'Featured Advertisers', href: '/#advertisers', description: 'Discover local businesses and services in your area', icon: Star },
    { name: 'Newsletter Signup', href: '/#newsletter', description: 'Subscribe to receive regular community updates', icon: Mail },
  ];

  const competitionsDropdownItems = [
    { name: 'Current Competitions', href: '/competitions', description: 'Enter exciting competitions with amazing prizes', icon: Trophy },
    { name: 'Past Winners', href: '/competitions#winners', description: 'See previous competition winners and their stories', icon: Users },
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

  const contactDropdownItems = [
    { name: 'Contact Form', href: '/contact', description: 'Get in touch with our editorial team', icon: Phone },
    { name: 'Editorial Submissions', href: '/contact#editorial', description: 'Submit news stories and community updates', icon: Newspaper },
    { name: 'Advertising Enquiries', href: '/contact#advertising', description: 'Discuss advertising opportunities and packages', icon: Megaphone },
  ];

  const whatsOnDropdownItems = [
    { name: 'Find Events', href: '/whats-on', description: 'Browse upcoming events in your area', icon: Calendar },
    { name: 'Add Events', href: '/whats-on?tab=add', description: 'Submit your event to be featured', icon: Calendar },
  ];

  const advertisingDropdownItems = [
    { name: 'View Advertising Options', href: '/advertising', description: 'Explore our advertising packages and rates', icon: Megaphone },
    { name: 'Cost Calculator', href: '/advertising#calculator', description: 'Calculate your advertising costs instantly', icon: Calculator },
    { name: 'Distribution Areas', href: '/advertising#areas', description: 'See our 12 areas across South Hampshire', icon: MapPin },
    { name: 'Special Offers', href: '/advertising#offers', description: 'Current promotional deals and packages', icon: Gift },
  ];

  const allDropdownSections = [
    { title: 'Home', items: homeDropdownItems, path: '/' },
    { title: 'Competitions', items: competitionsDropdownItems, path: '/competitions' },
    { title: 'Distribute', items: distributeDropdownItems, path: '/apply-to-distribute' },
    { title: 'Directory', items: businessDirectoryDropdownItems, path: '/business-directory' },
    { title: 'Contact', items: contactDropdownItems, path: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img 
                src="/lovable-uploads/cc241b5d-25f5-4df1-bf08-5b9569b299a1.png" 
                alt="Discover Magazines Logo" 
                className="h-8 w-auto"
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
                                        <Link
                                          to={item.href}
                                          className="group flex items-start space-x-3 p-3 rounded-lg hover:bg-accent transition-colors"
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
                                        </Link>
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
                            </div>
                          </div>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}

                {/* Advertising dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger 
                    className="text-gray-700 hover:text-community-green px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-transparent hover:bg-transparent data-[state=open]:bg-transparent"
                    onClick={() => navigate('/advertising')}
                  >
                    Advertising
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-full bg-white border border-border shadow-lg rounded-lg">
                      <div className="grid md:grid-cols-4 lg:grid-cols-5">
                        {/* Main content sections */}
                        <div className="md:col-span-3 lg:col-span-3 p-6">
                          <div className="grid gap-6 md:grid-cols-2">
                            <div>
                              <h3 className="text-sm font-semibold text-foreground mb-4">Advertising</h3>
                              <div className="space-y-3">
                                {advertisingDropdownItems.map((item) => {
                                  const IconComponent = item.icon;
                                  return (
                                    <NavigationMenuLink key={item.name} asChild>
                                      <Link
                                        to={item.href}
                                        className="group flex items-start space-x-3 p-3 rounded-lg hover:bg-accent transition-colors"
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
                                      </Link>
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
                            <div className="text-sm font-semibold text-foreground">Important Information</div>
                            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-4 shadow-md">
                              <h4 className="text-base font-bold text-red-700 mb-2 flex items-center">
                                ⚠️ DEADLINE ALERT!
                              </h4>
                              <p className="text-sm font-semibold text-red-600 mb-1">
                                Next deadline: 14th May 2025
                              </p>
                              <p className="text-xs text-red-500 font-medium">
                                Don't miss out - secure your ad space now!
                              </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm border">
                              <h4 className="text-sm font-medium text-foreground mb-2">Advertise with us</h4>
                              <p className="text-sm text-muted-foreground mb-3">
                                Reach 12 areas across South Hampshire with our advertising packages.
                              </p>
                              <Link 
                                to="/advertising#offers" 
                                className="inline-flex items-center text-sm font-medium text-community-green hover:text-green-600 transition-colors"
                              >
                                View offers →
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Events dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger 
                    className="text-gray-700 hover:text-community-green px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-transparent hover:bg-transparent data-[state=open]:bg-transparent"
                    onClick={() => navigate('/whats-on')}
                  >
                    Events
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-full bg-white border border-border shadow-lg rounded-lg">
                      <div className="grid md:grid-cols-4 lg:grid-cols-5">
                        {/* Main content sections */}
                        <div className="md:col-span-3 lg:col-span-3 p-6">
                          <div className="grid gap-6 md:grid-cols-2">
                            <div>
                              <h3 className="text-sm font-semibold text-foreground mb-4">Events</h3>
                              <div className="space-y-3">
                                {whatsOnDropdownItems.map((item) => {
                                  const IconComponent = item.icon;
                                  return (
                                    <NavigationMenuLink key={item.name} asChild>
                                      <Link
                                        to={item.href}
                                        className="group flex items-start space-x-3 p-3 rounded-lg hover:bg-accent transition-colors"
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
                                      </Link>
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
                          </div>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
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

            {/* Business Login Button */}
            {!user && (
              <Link to="/auth" className="ml-4">
                <Button 
                  size="sm" 
                  className="bg-community-green hover:bg-green-600 text-white"
                >
                  Business Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-community-green focus:outline-none focus:text-community-green"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {/* Mobile sections with dropdowns */}
              {allDropdownSections.map((section) => (
                <div key={section.title} className="border-t pt-2">
                  <div className="px-3 py-2 text-gray-700 text-base font-medium">{section.title}</div>
                  {section.items.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="text-gray-600 hover:text-community-green block px-6 py-2 rounded-md text-sm transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              ))}
              
              {/* Mobile Advertising section */}
              <div className="border-t pt-2">
                <div className="px-3 py-2 text-gray-700 text-base font-medium">Advertising</div>
                {advertisingDropdownItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-gray-600 hover:text-community-green block px-6 py-2 rounded-md text-sm transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              
              {/* Mobile Events section */}
              <div className="border-t pt-2">
                <div className="px-3 py-2 text-gray-700 text-base font-medium">Events</div>
                {whatsOnDropdownItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-gray-600 hover:text-community-green block px-6 py-2 rounded-md text-sm transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              
              {/* Mobile Auth Buttons */}
              <div className="border-t pt-2">
                {user ? (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="text-purple-700 hover:text-purple-800 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Shield size={16} className="inline mr-2" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/dashboard"
                      className="text-gray-700 hover:text-community-green block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <div className="px-3 py-2 text-gray-700 text-base font-medium">
                      <User size={16} className="inline mr-2" />
                      {user.email?.split('@')[0]}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left text-gray-700 hover:text-community-green px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                    >
                      <LogOut size={16} className="inline mr-2" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="block w-full text-center bg-community-green text-white hover:bg-green-600 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Business Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
