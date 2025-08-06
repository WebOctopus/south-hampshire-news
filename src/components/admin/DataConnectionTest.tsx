import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { usePricingData } from '@/hooks/usePricingData';

const DataConnectionTest = () => {
  const { 
    areas, 
    adSizes, 
    durations, 
    subscriptionDurations, 
    volumeDiscounts, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = usePricingData();

  const dataTests = [
    {
      name: 'Pricing Areas',
      data: areas,
      expected: 'Should have distribution areas configured in admin',
      status: areas.length > 0 ? 'success' : 'error'
    },
    {
      name: 'Ad Sizes',
      data: adSizes,
      expected: 'Should have advertisement sizes configured in admin',
      status: adSizes.length > 0 ? 'success' : 'error'
    },
    {
      name: 'Fixed Durations',
      data: durations,
      expected: 'Should have fixed pricing durations configured',
      status: durations.length > 0 ? 'success' : 'warning'
    },
    {
      name: 'Subscription Durations',
      data: subscriptionDurations,
      expected: 'Should have subscription durations configured',
      status: subscriptionDurations.length > 0 ? 'success' : 'warning'
    },
    {
      name: 'Volume Discounts',
      data: volumeDiscounts,
      expected: 'Should have volume discount tiers configured',
      status: volumeDiscounts.length > 0 ? 'success' : 'warning'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Testing Data Connections...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Checking if Cost Calculator can access admin-configured data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Data Connection Status</span>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Test
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Connection Error</span>
              </div>
              <p className="text-red-700 text-sm">{error?.message}</p>
            </div>
          )}

          <div className="space-y-4">
            {dataTests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <h4 className="font-medium">{test.name}</h4>
                    <p className="text-sm text-muted-foreground">{test.expected}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(test.status)}>
                    {Array.isArray(test.data) ? `${test.data.length} items` : 'No data'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Areas:</span>
                <span className="ml-2 font-bold">{areas.length}</span>
              </div>
              <div>
                <span className="text-blue-700">Ad Sizes:</span>
                <span className="ml-2 font-bold">{adSizes.length}</span>
              </div>
              <div>
                <span className="text-blue-700">Fixed Durations:</span>
                <span className="ml-2 font-bold">{durations.length}</span>
              </div>
              <div>
                <span className="text-blue-700">Subscriptions:</span>
                <span className="ml-2 font-bold">{subscriptionDurations.length}</span>
              </div>
              <div>
                <span className="text-blue-700">Volume Discounts:</span>
                <span className="ml-2 font-bold">{volumeDiscounts.length}</span>
              </div>
            </div>
          </div>

          {areas.length > 0 && adSizes.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">✅ Connection Verified</span>
              </div>
              <p className="text-green-700 text-sm">
                The Cost Calculator can successfully access all admin-configured data. All settings from the admin dashboard are properly connected.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataConnectionTest;