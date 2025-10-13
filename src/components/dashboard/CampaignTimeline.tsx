import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Clock, Calendar, TrendingUp, FileText } from 'lucide-react';

interface CampaignTimelineProps {
  quote: any;
}

export default function CampaignTimeline({ quote }: CampaignTimelineProps) {
  // Add null safety check
  if (!quote) {
    return null;
  }

  const getTimelineSteps = () => {
    const baseSteps = [
      {
        id: 1,
        title: "Quote Saved",
        description: "Campaign details and pricing confirmed",
        icon: CheckCircle,
        status: "completed",
        timeframe: "✓ Complete"
      },
      {
        id: 2,
        title: "Book Campaign",
        description: "Confirm details and secure your slots",
        icon: Circle,
        status: quote.status === 'approved' || quote.status === 'active' ? "completed" : "current",
        timeframe: "Ready now"
      },
      {
        id: 3,
        title: "Design & Approval",
        description: "Artwork creation and final approval",
        icon: FileText,
        status: quote.status === 'active' ? "completed" : quote.status === 'approved' ? "current" : "pending",
        timeframe: "Week 1"
      },
      {
        id: 4,
        title: "Distribution Begins",
        description: "Your ads reach homes across selected areas",
        icon: TrendingUp,
        status: quote.status === 'active' ? "current" : "pending",
        timeframe: "Week 2-3"
      },
      {
        id: 5,
        title: "Peak Response",
        description: "Maximum customer response period",
        icon: Calendar,
        status: "pending",
        timeframe: "Week 3-4"
      },
      {
        id: 6,
        title: "Results Analysis",
        description: "Performance report and next steps",
        icon: Clock,
        status: "pending",
        timeframe: "Month end"
      }
    ];

    return baseSteps;
  };

  const steps = getTimelineSteps();

  const getStepClasses = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          container: 'border-green-200 bg-green-50',
          icon: 'text-green-600',
          badge: 'bg-green-100 text-green-800'
        };
      case 'current':
        return {
          container: 'border-blue-200 bg-blue-50 ring-2 ring-blue-100',
          icon: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-800'
        };
      default:
        return {
          container: 'border-gray-200 bg-gray-50',
          icon: 'text-gray-400',
          badge: 'bg-gray-100 text-gray-600'
        };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 text-purple-600 mr-2" />
          Your Campaign Timeline
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Track your progress from quote to results
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const classes = getStepClasses(step.status);
            const IconComponent = step.icon;
            
            return (
              <div key={step.id} className="flex items-start space-x-4">
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div className={`p-2 rounded-full border-2 ${
                    step.status === 'completed' ? 'border-green-500 bg-green-500' :
                    step.status === 'current' ? 'border-blue-500 bg-blue-500' :
                    'border-gray-300 bg-white'
                  }`}>
                    <IconComponent className={`h-4 w-4 ${
                      step.status === 'completed' || step.status === 'current' ? 'text-white' : 'text-gray-400'
                    }`} />
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-px h-8 ${
                      step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                    }`} />
                  )}
                </div>

                {/* Step Content */}
                <div className={`flex-1 p-4 rounded-lg border ${classes.container} transition-all`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{step.title}</h4>
                    <Badge className={classes.badge}>
                      {step.timeframe}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                  
                  {step.status === 'current' && (
                    <div className="mt-3 p-2 bg-white border border-blue-200 rounded text-xs text-blue-700">
                      <strong>Next step:</strong> {
                        step.id === 2 ? 'Click "Book Campaign" to secure your advertising slots' :
                        step.id === 3 ? 'Upload your artwork or book our design service' :
                        step.id === 4 ? 'Campaign distribution will begin automatically' :
                        'Monitor response and track results'
                      }
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        {quote.status !== 'active' && quote.status !== 'approved' && (
          <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-blue-100 rounded-lg border border-primary/20">
            <div className="text-center">
              <h5 className="font-medium text-primary mb-2">Ready to Start Your Campaign?</h5>
              <p className="text-sm text-primary/80 mb-3">
                Your timeline begins the moment you book. Early booking ensures the best slots!
              </p>
              <div className="flex gap-2 justify-center">
                <Badge className="bg-yellow-100 text-yellow-800">⏰ Book within 7 days: Save 15%</Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}