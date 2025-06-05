import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, MapPin, Clock, DollarSign, Users, Upload } from 'lucide-react';

const applicationFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  age: z.string().min(1, 'Please select your age range'),
  areaPreference: z.string().min(1, 'Please select your preferred area'),
  experience: z.string().optional(),
  availability: z.string().min(1, 'Please describe your availability'),
  cv: z.any().optional(),
});

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

const ApplyToDistribute = () => {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const { toast } = useToast();

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      age: '',
      areaPreference: '',
      experience: '',
      availability: '',
    },
  });

  const handleCvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCvFile(file);
    }
  };

  const onSubmit = (data: ApplicationFormValues) => {
    console.log('Application data:', data);
    console.log('CV file:', cvFile);
    
    toast({
      title: "Application Submitted!",
      description: "Thank you for your interest. We'll be in touch within 5 business days.",
    });
    
    form.reset();
    setCvFile(null);
  };

  const perks = [
    { icon: DollarSign, title: "Competitive Pay", description: "Earn £0.08-£0.12 per leaflet delivered" },
    { icon: Clock, title: "Flexible Hours", description: "Work around your schedule - early mornings or weekends" },
    { icon: MapPin, title: "Local Routes", description: "Deliver in your neighborhood or preferred areas" },
    { icon: Users, title: "Great Team", description: "Join a supportive community of distributors" },
  ];

  const payScales = [
    { area: "City Centre", rate: "£0.12 per leaflet", bonus: "Weekend bonus: +£0.02" },
    { area: "Residential Areas", rate: "£0.10 per leaflet", bonus: "Early morning: +£0.01" },
    { area: "Rural Areas", rate: "£0.08 per leaflet", bonus: "Distance bonus: +£0.03" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-community-navy to-community-green text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Join Our Distribution Team
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Become part of our community network and help local businesses reach their customers while earning competitive pay.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Age Requirement Notice */}
        <div className="mb-12 bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-amber-800">Age Requirement</h3>
              <p className="text-amber-700 mt-1">
                You must be 16 years or older to apply for a distribution position. Parental consent required for applicants under 18.
              </p>
            </div>
          </div>
        </div>

        {/* Perks Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold text-center mb-8">Why Join Our Team?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map((perk, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-community-green/10 rounded-lg flex items-center justify-center mb-4">
                    <perk.icon className="h-6 w-6 text-community-green" />
                  </div>
                  <CardTitle className="text-lg">{perk.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{perk.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Pay Scales Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold text-center mb-8">Pay Scales</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {payScales.map((scale, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-xl">{scale.area}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-community-green">{scale.rate}</p>
                    <p className="text-sm text-gray-600">{scale.bonus}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Application Form */}
        <section>
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Apply Now</CardTitle>
              <CardDescription className="text-center">
                Fill out the form below to start your application process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age Range</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your age range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="16-18">16-18 years</SelectItem>
                              <SelectItem value="19-25">19-25 years</SelectItem>
                              <SelectItem value="26-35">26-35 years</SelectItem>
                              <SelectItem value="36-45">36-45 years</SelectItem>
                              <SelectItem value="46-55">46-55 years</SelectItem>
                              <SelectItem value="55+">55+ years</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="areaPreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Area</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your preferred area" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="city-centre">City Centre</SelectItem>
                              <SelectItem value="north-residential">North Residential</SelectItem>
                              <SelectItem value="south-residential">South Residential</SelectItem>
                              <SelectItem value="east-residential">East Residential</SelectItem>
                              <SelectItem value="west-residential">West Residential</SelectItem>
                              <SelectItem value="rural-areas">Rural Areas</SelectItem>
                              <SelectItem value="industrial">Industrial Areas</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Previous Experience (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about any relevant experience you have..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="availability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Availability</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your availability (days, times, frequency)..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* CV Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Upload CV (Optional)</label>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleCvUpload}
                          className="hidden"
                          id="cv-upload"
                        />
                        <label
                          htmlFor="cv-upload"
                          className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-community-green transition-colors"
                        >
                          <div className="text-center">
                            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">
                              {cvFile ? cvFile.name : 'Click to upload your CV'}
                            </p>
                            <p className="text-xs text-gray-400">PDF, DOC, or DOCX (Max 5MB)</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Submit Application
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default ApplyToDistribute;