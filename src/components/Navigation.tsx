import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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

  const navigationItems = [
    { name: 'Home', href: '/', isRoute: true },
    
    { name: 'What\'s On / Add Event', href: '/whats-on', isRoute: true },
    { name: 'Enter Competitions', href: '/competitions', isRoute: true },
    { name: 'Advertising & Leaflets', href: '/advertising', isRoute: true },
    { name: 'Apply to Distribute', href: '/apply-to-distribute', isRoute: true },
    { name: 'Business Directory', href: '/business-directory', isRoute: true },
    { name: 'Contact Us', href: '/contact', isRoute: true },
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
            <div className="flex items-baseline space-x-4">
              {navigationItems.map((item) => 
                item.isRoute ? (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-gray-700 hover:text-community-green px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:text-community-green px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    {item.name}
                  </a>
                )
              )}
            </div>
            
            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-2">
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
              <Link to="/auth">
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
              {navigationItems.map((item) => 
                item.isRoute ? (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-gray-700 hover:text-community-green block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:text-community-green block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                )
              )}
              
              {/* Mobile Auth Buttons */}
              <div className="border-t pt-2">
                {user ? (
                  <>
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