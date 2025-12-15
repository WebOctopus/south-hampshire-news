import { useState, useEffect } from 'react';
import { Trophy, Clock, Users, Gift, Calendar, Loader2 } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import CompetitionEntryForm from '../components/CompetitionEntryForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCompetitions, Competition } from '@/hooks/useCompetitions';
import { isPast } from 'date-fns';

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
  const { data: competitions, isLoading } = useCompetitions();
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Filter out expired competitions
  const activeCompetitions = competitions?.filter(c => !isPast(new Date(c.end_date))) || [];

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
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-community-green" />
            <span className="ml-2 text-gray-600">Loading competitions...</span>
          </div>
        ) : activeCompetitions.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Active Competitions</h3>
            <p className="text-gray-500">Check back soon for new competitions!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {activeCompetitions.map((competition) => (
              <Card key={competition.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-community-green/10 to-community-navy/10 relative">
                  {competition.image_url ? (
                    <img 
                      src={competition.image_url} 
                      alt={competition.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Trophy className="w-16 h-16 text-community-navy/30" />
                    </div>
                  )}
                  <Badge className="absolute top-4 left-4" variant="secondary">
                    {competition.category}
                  </Badge>
                </div>
                
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl text-community-navy">
                      {competition.title}
                    </CardTitle>
                    <CountdownTimer endDate={competition.end_date} />
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
                        <span>{competition.entry_count.toLocaleString()} entries</span>
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
        )}

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
