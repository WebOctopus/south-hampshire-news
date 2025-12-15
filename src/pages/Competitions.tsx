import { useState, useEffect } from 'react';
import { Trophy, Clock, Users, Gift, Calendar } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import CompetitionEntryForm from '../components/CompetitionEntryForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Competition {
  id: string;
  title: string;
  description: string;
  prize: string;
  endDate: string;
  entryCount: number;
  category: string;
  image: string;
}

const mockCompetitions: Competition[] = [
  {
    id: '1',
    title: 'Win a Weekend Getaway',
    description: 'Escape to a luxurious countryside retreat for two. Includes accommodation, breakfast, and spa treatments.',
    prize: '£500 Weekend Break',
    endDate: '2025-06-15T23:59:59',
    entryCount: 1247,
    category: 'Travel',
    image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&h=600&fit=crop'
  },
  {
    id: '2',
    title: 'Local Restaurant Dining Experience',
    description: 'Three-course meal for four people at our featured local restaurant with wine pairing.',
    prize: '£200 Dining Voucher',
    endDate: '2025-06-12T23:59:59',
    entryCount: 892,
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=800&h=600&fit=crop'
  },
  {
    id: '3',
    title: 'Family Fun Day Out',
    description: 'Entry tickets for a family of four to the local adventure park, including lunch and activities.',
    prize: 'Family Day Pass',
    endDate: '2025-06-20T23:59:59',
    entryCount: 654,
    category: 'Family',
    image: 'https://images.unsplash.com/photo-1438565434616-3ef039228b15?w=800&h=600&fit=crop'
  },
  {
    id: '4',
    title: 'Monthly Shopping Spree',
    description: 'Shopping vouchers to spend at participating local businesses in the community.',
    prize: '£300 Shopping Vouchers',
    endDate: '2025-06-30T23:59:59',
    entryCount: 2156,
    category: 'Shopping',
    image: 'https://images.unsplash.com/photo-1493962853295-0fd70327578a?w=800&h=600&fit=crop'
  }
];

const CountdownTimer = ({ endDate }: { endDate: string }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(endDate) - +new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex items-center gap-2 text-sm font-mono bg-red-50 text-red-700 px-3 py-1 rounded-full">
      <Clock className="w-4 h-4" />
      <span>
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
    </div>
  );
};

const RulesAndTerms = () => {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-community-green" />
          Competition Rules & Terms
        </CardTitle>
      </CardHeader>
      <CardContent className="prose prose-sm max-w-none">
        <div className="space-y-4 text-gray-700">
          <div>
            <h4 className="font-semibold text-community-navy mb-2">How to Enter:</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>You must be 18 years or older to participate</li>
              <li>One entry per person per competition</li>
              <li>Entries must be submitted before the deadline</li>
              <li>Winners will be selected at random from all valid entries</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-community-navy mb-2">Prize Information:</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Prizes are non-transferable and cannot be exchanged for cash</li>
              <li>Winners will be notified within 48 hours of the draw</li>
              <li>Prizes must be claimed within 30 days of notification</li>
              <li>Some restrictions may apply to specific prizes</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-community-navy mb-2">General Terms:</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Employees of participating businesses are not eligible</li>
              <li>We reserve the right to disqualify entries that violate these terms</li>
              <li>Personal data will be used only for competition administration</li>
              <li>By entering, you agree to our privacy policy</li>
            </ul>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-900">
              Entering the competition consents to Discover Magazines Ltd storing the data supplied and sharing only with the relevant competition prize supplier. Entrants consent to receiving Discover's monthly e-newsletter Discover Extra.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Competitions = () => {
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleEnterCompetition = (competition: Competition) => {
    setSelectedCompetition(competition);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCompetition(null);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-heading font-bold text-community-navy mb-4">
            Enter Competitions
          </h1>
          <p className="text-xl text-gray-600 font-body max-w-3xl mx-auto">
            Win amazing prizes from local businesses and discover the best our community has to offer. 
            New competitions added monthly!
          </p>
        </div>

        {/* Live Competitions Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {mockCompetitions.map((competition) => (
            <Card key={competition.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-community-green/10 to-community-navy/10 relative">
                <img 
                  src={competition.image} 
                  alt={competition.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-4 left-4" variant="secondary">
                  {competition.category}
                </Badge>
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl text-community-navy">
                    {competition.title}
                  </CardTitle>
                  <CountdownTimer endDate={competition.endDate} />
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {competition.description}
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-community-green" />
                      <span className="font-semibold text-community-green">
                        {competition.prize}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{competition.entryCount.toLocaleString()} entries</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-community-green hover:bg-community-green/90"
                    onClick={() => handleEnterCompetition(competition)}
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Enter Competition
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Rules and Terms */}
        <RulesAndTerms />
      </main>
      <Footer />
      
      {/* Competition Entry Form Modal */}
      <CompetitionEntryForm
        competition={selectedCompetition}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
      />
    </div>
  );
};

export default Competitions;