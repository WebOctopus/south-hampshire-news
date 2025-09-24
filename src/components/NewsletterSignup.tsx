import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [postcode, setPostcode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup - would connect to backend
    console.log('Newsletter signup:', { email, postcode });
    setEmail('');
    setPostcode('');
    // Show success message
  };

  return (
    <section id="newsletter" className="py-16 bg-community-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-white shadow-xl">
          <CardContent className="p-8 lg:p-12">
            <div className="text-center lg:text-left lg:flex lg:items-center lg:justify-between">
              <div className="lg:flex-1 mb-8 lg:mb-0 lg:pr-8">
                <h2 className="text-3xl lg:text-4xl font-heading font-bold text-community-navy mb-4">
                  Subscribe to our Monthly E-Newsletter
                </h2>
                <p className="text-xl text-gray-600 font-body mb-6">
                  Sign up to receive our email with exclusive news, stories, early event notifications and special offers from advertisers
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
                  <span>✓ Regular Community Updates</span>
                  <span>✓ Exclusive Competitions</span>
                  <span>✓ Local Business Promotions</span>
                </div>
              </div>
              <div className="lg:w-96">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="newsletter-email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      id="newsletter-email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full text-lg py-3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newsletter-postcode" className="text-sm font-medium text-gray-700">
                      Postcode
                    </Label>
                    <Input
                      id="newsletter-postcode"
                      type="text"
                      placeholder="Enter your postcode"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      required
                      className="w-full text-lg py-3"
                    />
                    <p className="text-xs text-gray-500 mt-1">This helps us tailor communications to your area</p>
                  </div>
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full bg-community-green hover:bg-green-600 text-white text-lg py-3"
                  >
                    Subscribe to Newsletter
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