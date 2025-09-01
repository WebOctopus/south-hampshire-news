import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, Calendar, Gift, Zap } from 'lucide-react';

export default function UrgencyAlerts() {
  const currentDate = new Date();
  const isDecember = currentDate.getMonth() === 11;
  const isSummer = currentDate.getMonth() >= 5 && currentDate.getMonth() <= 7;
  
  return (
    <Card className="border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-800">
          <Clock className="h-5 w-5 mr-2" />
          Limited Time Opportunities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seasonal Urgency */}
        {isDecember && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <div className="flex justify-between items-center">
                <div>
                  <strong className="text-red-800">Christmas Campaign Deadline</strong>
                  <p className="text-sm text-red-700 mt-1">
                    Last chance to reach customers before the holidays - deadline December 15th
                  </p>
                </div>
                <Badge className="bg-red-600 text-white">5 Days Left</Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Availability Alert */}
        <Alert className="border-yellow-200 bg-yellow-50">
          <Zap className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <div className="flex justify-between items-center">
              <div>
                <strong className="text-yellow-800">Prime Slots Filling Fast</strong>
                <p className="text-sm text-yellow-700 mt-1">
                  Only 3 premium advertising slots left in Southampton areas for next month
                </p>
              </div>
              <Badge className="bg-yellow-600 text-white">3 Left</Badge>
            </div>
          </AlertDescription>
        </Alert>

        {/* Special Offer Alert */}
        <Alert className="border-green-200 bg-green-50">
          <Gift className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="flex justify-between items-center">
              <div>
                <strong className="text-green-800">Book Within 7 Days - Save 15%</strong>
                <p className="text-sm text-green-700 mt-1">
                  Early bird discount expires soon. Lock in your campaign today!
                </p>
              </div>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                Claim Offer
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {/* Event Opportunity */}
        <Alert className="border-blue-200 bg-blue-50">
          <Calendar className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <div className="flex justify-between items-center">
              <div>
                <strong className="text-blue-800">Local Event Tie-In Available</strong>
                <p className="text-sm text-blue-700 mt-1">
                  Southampton Boat Show approaches - perfect timing for your campaign
                </p>
              </div>
              <Badge className="bg-blue-600 text-white">Perfect Timing</Badge>
            </div>
          </AlertDescription>
        </Alert>

        {/* Real-time Activity */}
        <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="flex items-center mb-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-sm font-medium text-purple-800">Live Activity</span>
          </div>
          <div className="space-y-1 text-xs text-purple-700">
            <p>• 2 businesses just booked campaigns in your area</p>
            <p>• 1 premium slot taken in Eastleigh (3 minutes ago)</p>
            <p>• 5 campaigns launching this week in Hampshire</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}