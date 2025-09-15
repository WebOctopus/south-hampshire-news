import { useState } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  HelpCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building, 
  Users, 
  Megaphone,
  Eye,
  Clock,
  FileText,
  Gift,
  Truck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Support = () => {
  const navigate = useNavigate();

  const howItWorksSteps = [
    {
      icon: <Eye className="h-8 w-8 text-community-green" />,
      title: "Discover Local Content",
      description: "Browse community news, local events, business listings, and exciting competitions all in one place."
    },
    {
      icon: <Truck className="h-8 w-8 text-community-green" />,
      title: "Letterbox Delivery",
      description: "Our magazine is delivered directly to 158,000 homes across SO & PO postcodes through our trusted distribution network."
    },
    {
      icon: <MapPin className="h-8 w-8 text-community-green" />,
      title: "12 Coverage Areas",
      description: "We cover 12 distinct areas across South Hampshire, ensuring relevant local content for each community."
    },
    {
      icon: <Users className="h-8 w-8 text-community-green" />,
      title: "Community Engagement",
      description: "Connect with local businesses, attend community events, and participate in competitions to win amazing prizes."
    }
  ];

  const faqs = [
    {
      category: "General",
      questions: [
        {
          question: "What is Discover Magazine?",
          answer: "Discover Magazine is a community publication that covers local news, events, business directory, and competitions across South Hampshire. We deliver to 158,000 homes across SO & PO postcodes."
        },
        {
          question: "How often is the magazine published?",
          answer: "The magazine follows a regular publication schedule with deadlines for submissions. The next deadline is 14th May 2025. Check our advertising section for current deadlines."
        },
        {
          question: "Which areas do you cover?",
          answer: "We cover 12 areas across South Hampshire including Winchester & Surrounds, Itchen Valley, Meon Valley & Whiteley, New Forest & Waterside, Southampton West & Totton, Test Valley & Romsey, Winchester & Alresford, and Chandler's Ford & Eastleigh."
        },
        {
          question: "How can I get a copy of the magazine?",
          answer: "The magazine is delivered free to homes in our coverage areas. If you live in an SO or PO postcode area, you should receive it through your letterbox."
        }
      ]
    },
    {
      category: "Events & Submissions",
      questions: [
        {
          question: "How do I submit an event?",
          answer: "You can submit events through our 'Submit an Event' form on the homepage or through the What's On section. You'll need to register for an account to submit events."
        },
        {
          question: "How do I submit a story or news article?",
          answer: "Use our 'Submit a Story' button on the homepage or contact us through the Contact page. Our editorial team will review all submissions."
        },
        {
          question: "Is there a deadline for event submissions?",
          answer: "Yes, events need to be submitted before our publication deadlines to appear in the next issue. Check the advertising section for current deadlines."
        },
        {
          question: "Can I submit photos with my story?",
          answer: "Yes, we encourage photos to accompany stories and events. You can upload images through our submission forms."
        }
      ]
    },
    {
      category: "Business Directory",
      questions: [
        {
          question: "How do I add my business to the directory?",
          answer: "Register for an account and use the Business Directory section to create your listing. You can add details like contact information, description, and category."
        },
        {
          question: "Is there a cost to list my business?",
          answer: "Basic business directory listings are free. We also offer featured listings and advertising packages for enhanced visibility."
        },
        {
          question: "Can I edit my business listing?",
          answer: "Yes, once you've created an account and added your business, you can edit your listing details anytime through your dashboard."
        },
        {
          question: "How many businesses can I list?",
          answer: "Currently, you can list one business per account. Contact us if you need to list multiple businesses."
        }
      ]
    },
    {
      category: "Advertising",
      questions: [
        {
          question: "What advertising options are available?",
          answer: "We offer various advertising packages including different ad sizes, areas, and duration options. Use our cost calculator to explore pricing for your needs."
        },
        {
          question: "How do I calculate advertising costs?",
          answer: "Use our interactive cost calculator in the Advertising section. You can select ad size, areas, duration, and see pricing instantly."
        },
        {
          question: "What is the BOGOF (3 + Repeat) package?",
          answer: "The BOGOF package allows you to book 3 issues and receive additional benefits including a 10% voucher for our leafleting service, available in your dashboard."
        },
        {
          question: "When is the next advertising deadline?",
          answer: "The next deadline is 14th May 2025. Don't miss out - contact us to secure your advertising space."
        },
        {
          question: "Do you offer leafleting services?",
          answer: "Yes, we offer leafleting services in addition to magazine advertising. Contact us for pricing and coverage areas."
        }
      ]
    },
    {
      category: "Account & Technical",
      questions: [
        {
          question: "Why do I need to create an account?",
          answer: "An account allows you to submit events, manage business listings, save advertising quotes, track bookings, and access special offers like vouchers."
        },
        {
          question: "I forgot my password, how do I reset it?",
          answer: "Use the password reset option on the login page. You'll receive an email with instructions to reset your password."
        },
        {
          question: "Can I delete my account?",
          answer: "Yes, you can delete your account through your Profile Settings in the dashboard. Note that this action cannot be undone."
        },
        {
          question: "How do I use my vouchers?",
          answer: "Vouchers earned from qualifying bookings appear in your dashboard. Contact us to redeem vouchers for leafleting services."
        }
      ]
    },
    {
      category: "Distribution",
      questions: [
        {
          question: "How can I become a distributor?",
          answer: "Apply through our 'Apply to Distribute' section. We'll review your application and contact you about available territories."
        },
        {
          question: "What are the requirements to be a distributor?",
          answer: "Distributors need to be reliable, have their own transport, and be able to deliver magazines on schedule. Specific requirements are outlined in the application form."
        },
        {
          question: "Which areas need distributors?",
          answer: "Available distribution areas change regularly. Check the 'Apply to Distribute' section for current opportunities."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
            <HelpCircle className="h-5 w-5 text-primary" />
            <span className="text-primary font-medium">Support Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
            How Can We Help You?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions and learn how Discover Magazine works
          </p>
        </div>

        {/* Quick Contact */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Need More Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/contact')}
              >
                <Mail className="h-8 w-8 text-primary" />
                <div className="text-center">
                  <div className="font-medium">Contact Us</div>
                  <div className="text-sm text-muted-foreground">Send us a message</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/advertising')}
              >
                <Megaphone className="h-8 w-8 text-primary" />
                <div className="text-center">
                  <div className="font-medium">Advertising</div>
                  <div className="text-sm text-muted-foreground">Get advertising info</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => window.open('mailto:support@discovermags.co.uk')}
              >
                <Phone className="h-8 w-8 text-primary" />
                <div className="text-center">
                  <div className="font-medium">Email Support</div>
                  <div className="text-sm text-muted-foreground">support@discovermags.co.uk</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold text-foreground mb-8 text-center">
            How Discover Magazine Works
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {howItWorksSteps.map((step, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-primary/5 to-community-green/5 border-primary/20">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">About Our Publication</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-community-green/10 text-community-green">
                        <MapPin className="h-3 w-3 mr-1" />
                        Coverage
                      </Badge>
                      <span className="text-sm">158,000 homes across SO & PO postcodes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-community-green/10 text-community-green">
                        <Building className="h-3 w-3 mr-1" />
                        Areas
                      </Badge>
                      <span className="text-sm">12 distinct areas across South Hampshire</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-community-green/10 text-community-green">
                        <Clock className="h-3 w-3 mr-1" />
                        Delivery
                      </Badge>
                      <span className="text-sm">Regular letterbox delivery schedule</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-3">What We Feature</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-community-green" />
                      Local community news and stories
                    </li>
                    <li className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-community-green" />
                      Upcoming events and activities
                    </li>
                    <li className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-community-green" />
                      Local business directory
                    </li>
                    <li className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-community-green" />
                      Competitions with great prizes
                    </li>
                    <li className="flex items-center gap-2">
                      <Megaphone className="h-4 w-4 text-community-green" />
                      Business advertising opportunities
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-12" />

        {/* FAQ Section */}
        <section>
          <h2 className="text-3xl font-heading font-bold text-foreground mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          {faqs.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl text-primary">{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`}>
                      <AccordionTrigger className="text-left hover:text-primary">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pt-2">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Call to Action */}
        <Card className="mt-12 bg-gradient-to-r from-community-green/5 to-primary/5 border-community-green/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Still Have Questions?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our team is here to help! Whether you need assistance with advertising, submissions, or general inquiries, 
              we're just a message away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/contact')}
                className="bg-community-green hover:bg-community-green/90"
              >
                <Mail className="h-5 w-5 mr-2" />
                Contact Us
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/advertising')}
              >
                <Megaphone className="h-5 w-5 mr-2" />
                Advertising Enquiry
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default Support;