import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const NewsletterSignup = () => {
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [postcode, setPostcode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic here
    setFirstName('');
    setSurname('');
    setEmail('');
    setPostcode('');
  };

  return (
    <section id="newsletter" className="py-10 md:py-16 bg-community-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-background shadow-xl">
          <CardContent className="p-5 md:p-8 lg:p-12">
            <div className="lg:flex lg:items-center lg:justify-between gap-8">
              {/* Content */}
              <div className="lg:flex-1 mb-6 lg:mb-0">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-community-navy mb-3 md:mb-4">
                  Subscribe to our Monthly E-Newsletter
                </h2>
                <p className="text-base md:text-xl text-muted-foreground font-body mb-4 md:mb-6">
                  Exclusive news, stories, early event notifications and special offers
                </p>
                
                {/* Benefits - horizontal scroll on mobile */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 md:flex-wrap md:overflow-visible md:pb-0">
                  <span className="flex-shrink-0 px-3 py-1.5 bg-community-green/10 text-community-green text-sm rounded-full whitespace-nowrap">
                    ✓ Community Updates
                  </span>
                  <span className="flex-shrink-0 px-3 py-1.5 bg-community-green/10 text-community-green text-sm rounded-full whitespace-nowrap">
                    ✓ Competitions
                  </span>
                  <span className="flex-shrink-0 px-3 py-1.5 bg-community-green/10 text-community-green text-sm rounded-full whitespace-nowrap">
                    ✓ Local Promos
                  </span>
                </div>
              </div>
              
              {/* Form */}
              <div className="lg:w-96">
                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="newsletter-firstname" className="text-sm font-medium text-foreground">
                        First Name
                      </Label>
                      <Input
                        id="newsletter-firstname"
                        type="text"
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        maxLength={50}
                        className="w-full h-11 md:h-12 text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newsletter-surname" className="text-sm font-medium text-foreground">
                        Surname
                      </Label>
                      <Input
                        id="newsletter-surname"
                        type="text"
                        placeholder="Surname"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        required
                        maxLength={50}
                        className="w-full h-11 md:h-12 text-base"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="newsletter-email" className="text-sm font-medium text-foreground">
                      Email Address
                    </Label>
                    <Input
                      id="newsletter-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      maxLength={255}
                      className="w-full h-11 md:h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newsletter-postcode" className="text-sm font-medium text-foreground">
                      Postcode
                    </Label>
                    <Input
                      id="newsletter-postcode"
                      type="text"
                      placeholder="e.g. SO16 1AB"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      required
                      className="w-full h-11 md:h-12 text-base"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Helps us tailor content to your area</p>
                  </div>
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full bg-community-green hover:bg-green-600 text-white h-12 md:h-14 text-base md:text-lg"
                  >
                    Subscribe
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
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
