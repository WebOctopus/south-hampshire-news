import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Auth = () => {
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        console.log('Auth page: Checking existing session...');
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('Auth page: Existing session found, checking role...');
          
          // Check if user is admin
          const isAdmin = await checkUserRole(session.user.id);
          
          if (isAdmin) {
            console.log('Auth page: Admin session found, redirecting to admin dashboard...');
            navigate('/admin');
          } else {
            console.log('Auth page: Regular user session found, redirecting to dashboard...');
            navigate('/dashboard');
          }
        }
      } catch (error) {
        console.error('Auth page: Error checking auth:', error);
      }
    };
    checkAuth();
  }, [navigate]);

  const checkUserRole = async (userId: string) => {
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();

      return !!roleData;
    } catch (error) {
      console.log('Auth page: No admin role found or error checking role');
      return false;
    }
  };

  const sendWelcomeEmail = async (email: string, displayName?: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-welcome-email', {
        body: { email, displayName }
      });
      
      if (error) {
        console.error('Error sending welcome email:', error);
      } else {
        console.log('Welcome email sent successfully');
      }
    } catch (error) {
      console.error('Error invoking welcome email function:', error);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Auth page: Starting sign up process for:', signUpEmail);
    setSignUpLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        console.error('Auth page: Sign up error:', error);
        toast({
          title: "Sign Up Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('Auth page: Sign up successful');
        
        // Send welcome email
        await sendWelcomeEmail(signUpEmail);
        
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your registration."
        });
        // Clear form
        setSignUpEmail('');
        setSignUpPassword('');
      }
    } catch (error) {
      console.error('Auth page: Unexpected error during sign up:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSignUpLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Auth page: Starting sign in process for:', signInEmail);
    setSignInLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword
      });

      if (error) {
        console.error('Auth page: Sign in error:', error);
        toast({
          title: "Sign In Error",
          description: error.message,
          variant: "destructive"
        });
        setSignInLoading(false);
        return;
      }

      if (data.user) {
        console.log('Auth page: Sign in successful for user:', data.user.email);
        
        // Clear form immediately
        setSignInEmail('');
        setSignInPassword('');
        
        // Show success message
        toast({
          title: "Welcome back!",
          description: "You have been successfully signed in."
        });

        // Check role and navigate
        const isAdmin = await checkUserRole(data.user.id);
        
        if (isAdmin) {
          console.log('Auth page: Admin role detected, redirecting to admin dashboard');
          navigate('/admin');
        } else {
          console.log('Auth page: Regular user, redirecting to dashboard');
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Auth page: Unexpected error during sign in:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSignInLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }

    setForgotPasswordLoading(true);

    try {
      // Call edge function which generates the reset link and sends branded email
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: { email: forgotPasswordEmail }
      });

      if (error) {
        console.error('Password reset error:', error);
        throw new Error(error.message || 'Failed to send reset email');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Check your email",
        description: "We've sent you a password reset link. Please check your inbox."
      });
      setForgotPasswordOpen(false);
      setForgotPasswordEmail('');
    } catch (error: any) {
      console.error('Unexpected error during password reset:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="py-16 bg-gray-50">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold mb-4">
              Business Owner Portal
            </h1>
            <p className="text-gray-600">
              Sign in to manage your business listings and connect with local customers.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Get Started</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <label htmlFor="signin-email" className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <Input
                        id="signin-email"
                        type="email"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        required
                        placeholder="Enter your email"
                        disabled={signInLoading}
                      />
                    </div>
                    <div>
                      <label htmlFor="signin-password" className="block text-sm font-medium mb-1">
                        Password
                      </label>
                      <Input
                        id="signin-password"
                        type="password"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                        disabled={signInLoading}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-community-green hover:bg-green-600"
                      disabled={signInLoading}
                    >
                      {signInLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setForgotPasswordOpen(true)}
                        className="text-sm text-community-green hover:underline"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <label htmlFor="signup-email" className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        required
                        placeholder="Enter your email"
                        disabled={signUpLoading}
                      />
                    </div>
                    <div>
                      <label htmlFor="signup-password" className="block text-sm font-medium mb-1">
                        Password
                      </label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        required
                        placeholder="Create a password"
                        minLength={6}
                        disabled={signUpLoading}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-community-green hover:bg-green-600"
                      disabled={signUpLoading}
                    >
                      {signUpLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword}>
            <div className="space-y-4 py-4">
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium mb-1">
                  Email Address
                </label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  disabled={forgotPasswordLoading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setForgotPasswordOpen(false)}
                disabled={forgotPasswordLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-community-green hover:bg-green-600"
                disabled={forgotPasswordLoading}
              >
                {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
