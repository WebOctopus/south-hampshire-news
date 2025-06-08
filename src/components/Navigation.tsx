
import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
  };

  const simpleNavigationItems = [
    { name: 'Home', href: '/', isRoute: true },
    { name: 'Enter Competitions', href: '/competitions', isRoute: true },
    { name: 'Apply to Distribute', href: '/apply-to-distribute', isRoute: true },
    { name: 'Business Directory', href: '/business-directory', isRoute: true },
    { name: 'Contact Us', href: '/contact', isRoute: true },
  ];

  const whatsOnDropdownItems = [
    { name: 'Find Events', href: '/whats-on', description: 'Browse upcoming events in your area' },
    { name: 'Add Events', href: '/whats-on?tab=add', description: 'Submit your event to be featured' },
  ];

  const advertisingDropdownItems = [
    { name: 'View Advertising Options', href: '/advertising', description: 'Explore our advertising packages and rates' },
    { name: 'Cost Calculator', href: '/advertising#calculator', description: 'Calculate your advertising costs instantly' },
    { name: 'Distribution Areas', href: '/advertising#areas', description: 'See our 12 areas across South Hampshire' },
    { name: 'Special Offers', href: '/advertising#offers', description: 'Current promotional deals and packages' },
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
                {/* Simple navigation items */}
                {simpleNavigationItems.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    <NavigationMenuLink asChild>
                      <Link
                        to={item.href}
                        className="text-gray-700 hover:text-community-green px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}

                {/* Advertising & Leaflets dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-community-green px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-transparent hover:bg-transparent data-[state=open]:bg-transparent">
                    Advertising & Leaflets
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 w-[400px]">
                      {advertisingDropdownItems.map((item) => (
                        <NavigationMenuLink key={item.name} asChild>
                          <Link
                            to={item.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{item.name}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {item.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* What's On dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-community-green px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-transparent hover:bg-transparent data-[state=open]:bg-transparent">
                    What's On / Add Event
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 w-[400px]">
                      {whatsOnDropdownItems.map((item) => (
                        <NavigationMenuLink key={item.name} asChild>
                          <Link
                            to={item.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{item.name}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {item.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-2 ml-4">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-community-green">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="text-gray-700">
                  <User size={16} className="mr-1" />
                  {user.email?.split('@')[0]}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-community-green"
                >
                  <LogOut size={16} className="mr-1" />
                  Sign Out
                </Button>
              </div>
            ) : (
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
              {simpleNavigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-700 hover:text-community-green block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Advertising section */}
              <div className="border-t pt-2">
                <div className="px-3 py-2 text-gray-700 text-base font-medium">Advertising & Leaflets</div>
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
              
              {/* Mobile What's On section */}
              <div className="border-t pt-2">
                <div className="px-3 py-2 text-gray-700 text-base font-medium">What's On / Add Event</div>
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
