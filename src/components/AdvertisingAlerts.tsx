import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, AlertTriangle } from 'lucide-react';
import { useActiveAlerts } from '@/hooks/useActiveAlerts';

interface Alert {
  id: string;
  title: string;
  message: string;
  alert_type: 'deadline' | 'premium_slot';
  is_active: boolean;
  priority: number;
  badge_text: string | null;
  badge_color: string;
  expires_at: string | null;
}

const getBadgeColorClass = (color: string) => {
  const colorMap: { [key: string]: string } = {
    red: 'bg-red-600 text-white',
    orange: 'bg-orange-600 text-white',
    yellow: 'bg-yellow-600 text-white',
    green: 'bg-green-600 text-white',
    blue: 'bg-blue-600 text-white',
    purple: 'bg-purple-600 text-white'
  };
  return colorMap[color] || 'bg-red-600 text-white';
};

const AdvertisingAlerts = () => {
  const [premiumSlotsOpen, setPremiumSlotsOpen] = useState(true);
  const { data: alerts = [], isLoading, error } = useActiveAlerts();

  const deadlineAlerts = alerts.filter(alert => alert.alert_type === 'deadline');
  const premiumSlotAlerts = alerts.filter(alert => alert.alert_type === 'premium_slot');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-sm font-semibold text-foreground">Important Information</div>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-sm font-semibold text-foreground">Important Information</div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">Failed to load alerts</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-foreground">Important Information</div>
      
      {/* Deadline Alerts */}
      {deadlineAlerts.length > 0 && deadlineAlerts.map((alert) => (
        <div key={alert.id} className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-4 shadow-md">
          <h4 className="text-base font-bold text-red-700 mb-2 flex items-center justify-between">
            <span>⚠️ {alert.title}</span>
            {alert.badge_text && (
              <Badge className={getBadgeColorClass(alert.badge_color)}>
                {alert.badge_text}
              </Badge>
            )}
          </h4>
          <div className="text-sm text-red-600">
            {alert.message.split('\n').map((line, index) => (
              <p key={index} className={index === 0 ? "font-semibold mb-1" : "text-xs font-medium"}>
                {line}
              </p>
            ))}
          </div>
        </div>
      ))}

      {/* Premium Slot Alerts */}
      {premiumSlotAlerts.length > 0 && (
        <Collapsible open={premiumSlotsOpen} onOpenChange={setPremiumSlotsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
            <span className="text-sm font-semibold text-foreground">Premium Slot Alerts</span>
            <ChevronDown className={`h-4 w-4 transform transition-transform ${premiumSlotsOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2">
            {premiumSlotAlerts.map((alert) => (
              <div key={alert.id} className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="text-sm font-semibold text-orange-700">
                    {alert.title}
                  </h5>
                  {alert.badge_text && (
                    <Badge className={getBadgeColorClass(alert.badge_color)}>
                      {alert.badge_text}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-orange-600">
                  {alert.message}
                </p>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

export default AdvertisingAlerts;