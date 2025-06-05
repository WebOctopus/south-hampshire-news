import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup - would connect to backend
    console.log('Newsletter signup:', email);
    setEmail('');
    // Show success message
  };

  return (
    <section className="py-16 bg-community-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-white shadow-xl">
          <CardContent className="p-8 lg:p-12">
            <div className="text-center lg:text-left lg:flex lg:items-center lg:justify-between">
              <div className="lg:flex-1 mb-8 lg:mb-0 lg:pr-8">
                <h2 className="text-3xl lg:text-4xl font-heading font-bold text-community-navy mb-4">
                  Discover Extra
                </h2>
                <p className="text-xl text-gray-600 font-body mb-6">
                  Get exclusive content, early event notifications, and special offers delivered to your inbox
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>✓ Weekly community updates</span>
                  <span>✓ Exclusive competitions</span>
                  <span>✓ Local business offers</span>
                </div>
              </div>
              
              <div className="lg:flex-1 lg:max-w-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full text-lg py-3"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full bg-community-green hover:bg-green-600 text-white text-lg py-3"
                  >
                    Subscribe to Discover Extra
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    We respect your privacy. Unsubscribe at any time.
                  </p>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default NewsletterSignup;