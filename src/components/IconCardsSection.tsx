import { Calendar, Trophy, Building2, FileText, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useNextDeadline } from '@/hooks/useNextDeadline';

const IconCardsSection = () => {
  const navigate = useNavigate();
  const { data: nextDeadline, isLoading } = useNextDeadline();

  const deadlineText = nextDeadline?.formatted
    ? `Copy deadline: ${nextDeadline.formatted}`
    : isLoading 
      ? 'Loading...'
      : 'Check schedule for deadlines';

  const cards = [
    {
      icon: Clock,
      title: 'Next Issue Deadline',
      description: deadlineText,
      color: 'text-red-600 bg-red-50',
      priority: true,
      link: '/advertising'
    },
    {
      icon: Calendar,
      title: 'Events',
      description: 'Local happenings and community gatherings',
      color: 'text-blue-600 bg-blue-50',
      priority: false,
      link: '/whats-on'
    },
    {
      icon: Trophy,
      title: 'Competitions',
      description: 'Enter contests and win amazing prizes',
      color: 'text-yellow-600 bg-yellow-50',
      priority: false,
      link: '/competitions'
    },
    {
      icon: Building2,
      title: 'Trusted Businesses',
      description: 'Find reliable local services and shops',
      color: 'text-community-green bg-green-50',
      priority: false,
      link: '/business-directory'
    },
    {
      icon: FileText,
      title: 'Local Stories',
      description: 'Inspiring tales from your community',
      color: 'text-purple-600 bg-purple-50',
      priority: false,
      link: '/stories'
    }
  ];

  return (
    <section className="py-8 md:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile: Horizontal scroll */}
        <div className="md:hidden">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
            {cards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <Card 
                  key={index} 
                  onClick={() => navigate(card.link)}
                  className={`flex-shrink-0 w-[280px] snap-center group hover:shadow-lg transition-shadow duration-300 cursor-pointer ${
                    card.priority ? 'ring-2 ring-red-500 ring-offset-2' : ''
                  }`}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={`w-14 h-14 flex-shrink-0 rounded-full flex items-center justify-center ${card.color}`}>
                      <IconComponent size={28} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-heading font-semibold text-community-navy mb-1">
                        {card.title}
                      </h3>
                      <p className="text-sm text-muted-foreground font-body line-clamp-2">
                        {card.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {/* Scroll indicator dots */}
          <div className="flex justify-center gap-1.5 mt-2">
            {cards.map((_, index) => (
              <div 
                key={index} 
                className="w-2 h-2 rounded-full bg-muted-foreground/30"
              />
            ))}
          </div>
        </div>

        {/* Desktop: Grid layout */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-6">
          {cards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <Card 
                key={index} 
                onClick={() => navigate(card.link)}
                className={`group hover:shadow-lg transition-shadow duration-300 cursor-pointer ${
                  card.priority ? 'ring-2 ring-red-500 ring-offset-2' : ''
                }`}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${card.color}`}>
                    <IconComponent size={32} />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-community-navy mb-2">
                    {card.title}
                  </h3>
                  <p className="text-muted-foreground font-body">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default IconCardsSection;
