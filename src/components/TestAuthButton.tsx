
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const TestAuthButton = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createTestUser = async () => {
    setLoading(true);
    try {
      const testEmail = 'test@example.com';
      const testPassword = 'test123456';
      
      console.log('Creating test user:', testEmail);
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Test user creation error:', error);
        toast({
          title: "Test User Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('Test user created successfully');
        toast({
          title: "Test User Created",
          description: `Test user: ${testEmail} / ${testPassword}`,
        });
      }
    } catch (error) {
      console.error('Unexpected error creating test user:', error);
      toast({
        title: "Error",
        description: "Failed to create test user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={createTestUser}
      disabled={loading}
      variant="outline"
      className="mb-4"
    >
      {loading ? 'Creating...' : 'Create Test User (test@example.com)'}
    </Button>
  );
};

export default TestAuthButton;
