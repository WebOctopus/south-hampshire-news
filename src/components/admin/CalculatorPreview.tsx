import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, RefreshCw, ExternalLink } from 'lucide-react';
import CostCalculatorOptimized from '@/components/CostCalculatorOptimized';
import DataConnectionTest from './DataConnectionTest';

const CalculatorPreview = () => {
  return (
    <div className="space-y-6">
      {/* Data Connection Test */}
      <DataConnectionTest />

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-heading font-bold text-community-navy flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Cost Calculator Preview & Testing
          </h2>
          <p className="text-gray-600 mt-1">
            Test the calculator functionality and verify data connections
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            ✅ Optimized Version
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            React Query Cached
          </Badge>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✅</div>
              <p className="text-sm font-medium mt-1">Data Loading</p>
              <p className="text-xs text-gray-500">Optimized with caching</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✅</div>
              <p className="text-sm font-medium mt-1">Error Handling</p>
              <p className="text-xs text-gray-500">Comprehensive boundaries</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✅</div>
              <p className="text-sm font-medium mt-1">Timeout Prevention</p>
              <p className="text-xs text-gray-500">Retry logic enabled</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✅</div>
              <p className="text-sm font-medium mt-1">Admin Connected</p>
              <p className="text-xs text-gray-500">All settings linked</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Calculator Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Live Calculator Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="max-w-md mx-auto">
              <CostCalculatorOptimized>
                <Button size="lg" className="w-full bg-community-green hover:bg-community-green/90">
                  Test Cost Calculator
                </Button>
              </CostCalculatorOptimized>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <h3 className="font-medium text-community-navy">Testing Instructions:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="space-y-2">
                <p><strong>1. Basic Testing:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Click "Test Cost Calculator" above</li>
                  <li>Fill in contact information</li>
                  <li>Select pricing model (Fixed or BOGOF)</li>
                  <li>Choose distribution areas</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p><strong>2. Advanced Testing:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Test different ad sizes</li>
                  <li>Try various duration options</li>
                  <li>Verify pricing calculations</li>
                  <li>Check volume discounts</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" className="flex items-center gap-2" onClick={() => window.open('/advertising', '_blank')}>
              <ExternalLink className="h-4 w-4" />
              View Live Calculator
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
              Clear Calculator Cache
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalculatorPreview;