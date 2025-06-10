import { Calendar, Trophy, Building2, FileText, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const IconCardsSection = () => {
  const cards = [
    {
      icon: Calendar,
      title: 'Events',
      description: 'Discover local happenings and community gatherings',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: Trophy,
      title: 'Competitions',
      description: 'Enter exciting contests and win amazing prizes',
      color: 'text-yellow-600 bg-yellow-50'
    },
    {
      icon: Clock,
      title: 'Competition Deadlines',
      description: 'Don\'t miss out! Check entry deadlines for current competitions',
      color: 'text-red-600 bg-red-50'
    },
    {
      icon: Building2,
      title: 'Trusted Businesses',
      description: 'Find reliable local services and shops',
      color: 'text-community-green bg-green-50'
    },
    {
      icon: FileText,
      title: 'Local Stories',
      description: 'Read inspiring tales from your community',
      color: 'text-purple-600 bg-purple-50'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {cards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <Card key={index} className="group hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${card.color}`}>
                    <IconComponent size={32} />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-community-navy mb-2">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 font-body">
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