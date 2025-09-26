import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [premiumSlotsOpen, setPremiumSlotsOpen] = useState(false);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        console.log('AdvertisingAlerts: Loading alerts...');
        const { data, error } = await supabase
          .from('alerts')
          .select('*')
          .eq('is_active', true)
          .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString())
          .order('priority', { ascending: true });

        console.log('AdvertisingAlerts: Query result:', { data, error });
        if (error) throw error;
        setAlerts((data || []).map(item => ({
          ...item,
          alert_type: item.alert_type as 'deadline' | 'premium_slot'
        })));
        console.log('AdvertisingAlerts: Alerts set to:', (data || []));
      } catch (error) {
        console.error('Error loading alerts:', error);
      }
    };

    loadAlerts();
  }, []);

  const deadlineAlerts = alerts.filter(alert => alert.alert_type === 'deadline');
  const premiumSlotAlerts = alerts.filter(alert => alert.alert_type === 'premium_slot');

  console.log('AdvertisingAlerts: Rendering with alerts:', alerts);
  console.log('AdvertisingAlerts: Deadline alerts:', deadlineAlerts);
  console.log('AdvertisingAlerts: Premium slot alerts:', premiumSlotAlerts);

  return (
    <>
      <div className="text-sm font-semibold text-foreground">Important Information</div>
      
      {/* Debug info */}
      <div className="text-xs text-gray-500 mb-2">
        Loading {alerts.length} alerts (Debug: {deadlineAlerts.length} deadline, {premiumSlotAlerts.length} premium)
      </div>
      
      {/* Deadline Alerts */}
      {deadlineAlerts.length > 0 ? deadlineAlerts.map((alert) => (
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
      )) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
          No deadline alerts found
        </div>
      )}

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

      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h4 className="font-semibold text-foreground mb-2">Advertise with us</h4>
        <p className="text-sm text-muted-foreground mb-3">
          Reach 14 areas across South Hampshire with our advertising packages.
        </p>
        <a href="/advertising" className="text-sm font-medium text-primary hover:underline">
          View offers →
        </a>
      </div>
    </>
  );
};

export default AdvertisingAlerts;