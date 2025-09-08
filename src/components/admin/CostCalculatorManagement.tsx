import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, MapPin, DollarSign, Clock, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { usePricingInvalidation } from '@/hooks/usePricingMutations';
import LocationsManagement from './LocationsManagement';
import AdvertSizesPricingManagement from './AdvertSizesPricingManagement';
import SubscriptionSettingsManagement from './SubscriptionSettingsManagement';
import LeafletingManagement from './LeafletingManagement';

const CostCalculatorManagement = () => {
  const [activeTab, setActiveTab] = useState('locations');
  const [stats, setStats] = useState({
    totalLocations: 0,
    activeLocations: 0,
    totalAdSizes: 0,
    activeAdSizes: 0,
    subscriptionDurations: 0,
    volumeDiscounts: 0
  });
  const { toast } = useToast();
  const { invalidateAll } = usePricingInvalidation();

  const loadStats = async () => {
    try {
      // Invalidate all pricing-related queries to ensure fresh data
      invalidateAll();
      
      // You can implement actual stats loading here
      setStats({
        totalLocations: 14,
        activeLocations: 14,
        totalAdSizes: 7,
        activeAdSizes: 7,
        subscriptionDurations: 2,
        volumeDiscounts: 4
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const statCards = [
    {
      title: 'Active Locations',
      value: `${stats.activeLocations}/${stats.totalLocations}`,
      icon: MapPin,
      color: 'text-blue-600'
    },
    {
      title: 'Ad Sizes',
      value: stats.activeAdSizes,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Subscriptions',
      value: stats.subscriptionDurations,
      icon: Clock,
      color: 'text-purple-600'
    },
    {
      title: 'Volume Tiers',
      value: stats.volumeDiscounts,
      icon: Calculator,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-community-navy flex items-center gap-2">
            <Calculator className="h-8 w-8 text-community-green" />
            Cost Calculator Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage advertising locations, pricing, and subscription settings
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Last Updated: {new Date().toLocaleDateString()}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Management Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculator Management Console
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="locations" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Locations
              </TabsTrigger>
              <TabsTrigger value="adSizes" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Ad Sizes & Pricing
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Subscription Settings
              </TabsTrigger>
              <TabsTrigger value="leaflets" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Leaflets
              </TabsTrigger>
            </TabsList>

            <TabsContent value="locations" className="mt-6">
              <LocationsManagement onStatsUpdate={loadStats} />
            </TabsContent>

            <TabsContent value="adSizes" className="mt-6">
              <AdvertSizesPricingManagement onStatsUpdate={loadStats} />
            </TabsContent>

            <TabsContent value="subscriptions" className="mt-6">
              <SubscriptionSettingsManagement onStatsUpdate={loadStats} />
            </TabsContent>

            <TabsContent value="leaflets" className="mt-6">
              <LeafletingManagement onStatsUpdate={loadStats} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostCalculatorManagement;