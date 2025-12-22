import { useEffect } from 'react';
import { Calendar, Trophy, Building2, FileText, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { usePricingData } from '@/hooks/usePricingData';
import { parseISO, format, isAfter } from 'date-fns';

// Parse various date formats from schedule data
const parseDateString = (dateStr: string, yearHint?: string | number): Date | null => {
  if (!dateStr || dateStr.toLowerCase() === 'tbc') return null;
  
  // Try ISO format first (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return parseISO(dateStr);
  }
  
  // Try DD.MM.YYYY format
  const fullMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (fullMatch) {
    const [, day, month, year] = fullMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  // Try DD.MM or DD.M format with year hint
  const shortMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})$/);
  if (shortMatch && yearHint) {
    const [, day, month] = shortMatch;
    const year = typeof yearHint === 'string' ? parseInt(yearHint) : yearHint;
    if (!isNaN(year)) {
      return new Date(year, parseInt(month) - 1, parseInt(day));
    }
  }
  
  return null;
};

const IconCardsSection = () => {
  const navigate = useNavigate();
  const { areas, isLoading, isError } = usePricingData();

  useEffect(() => {
    // Diagnostics to confirm schedule is loading in the browser
    console.debug('[IconCardsSection] pricing areas loaded:', {
      isLoading,
      isError,
      areasCount: areas?.length ?? 0,
      firstAreaName: areas?.[0]?.name,
      firstScheduleItem: (areas?.[0]?.schedule as any)?.[0],
    });
  }, [areas, isLoading, isError]);

  // Find the next upcoming PRINT date (preferred) from all area schedules
  const getNextIssuePrintDate = (): Date | null => {
    if (!areas || areas.length === 0) return null;

    const today = new Date();
    let nextFuture: Date | null = null;
    let mostRecentPast: Date | null = null;

    areas.forEach((area) => {
      const schedule = area.schedule as
        | Array<{
            // DB currently stores both snake_case and camelCase keys
            print_deadline?: string;
            printDeadline?: string;
            copy_deadline?: string;
            copyDeadline?: string;
            year?: string | number;
          }>
        | undefined;

      schedule?.forEach((issue) => {
        const printStr = issue.print_deadline || issue.printDeadline;
        const copyStr = issue.copy_deadline || issue.copyDeadline;
        const raw = printStr || copyStr;
        if (!raw || typeof raw !== 'string') return;

        const date = parseDateString(raw, issue.year);
        if (!date) return;

        if (isAfter(date, today)) {
          if (!nextFuture || date < nextFuture) nextFuture = date;
        } else {
          if (!mostRecentPast || date > mostRecentPast) mostRecentPast = date;
        }
      });
    });

    return nextFuture || mostRecentPast;
  };

  const nextPrintDate = getNextIssuePrintDate();
  const deadlineText = nextPrintDate
    ? `Next issue prints: ${format(nextPrintDate, 'do MMMM yyyy')}`
    : 'Next issue prints: —';

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
