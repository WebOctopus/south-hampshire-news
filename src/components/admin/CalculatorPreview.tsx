import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, RefreshCw, ExternalLink } from 'lucide-react';
import CostCalculator from '@/components/CostCalculator';

const CalculatorPreview = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-heading font-bold text-community-navy flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Calculator Preview
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Test the calculator with real-time updates reflecting your configuration changes
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh Preview
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('/advertising', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            View Live Page
          </Button>
        </div>
      </div>

      {/* Preview Information */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Real-time Updates
              </Badge>
              <span className="text-sm text-gray-600">Changes reflect immediately</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                All Features
              </Badge>
              <span className="text-sm text-gray-600">Full calculator functionality</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                Test Environment
              </Badge>
              <span className="text-sm text-gray-600">Safe testing area</span>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <CostCalculator>
                <Button size="lg" className="w-full bg-community-green hover:bg-community-green/90">
                  Test Cost Calculator
                </Button>
              </CostCalculator>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <h3 className="font-medium text-community-navy">Testing Instructions:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="space-y-2">
                <p><strong>1. Basic Testing:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Click the button above to open the calculator</li>
                  <li>Fill in contact information</li>
                  <li>Select different payment structures</li>
                  <li>Choose various locations and ad sizes</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <p><strong>2. Advanced Testing:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Test BOGOF functionality with 3+ areas</li>
                  <li>Verify pricing calculations are accurate</li>
                  <li>Check discount applications</li>
                  <li>Ensure all form validations work</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-community-navy">Data Integrity</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-gray-300 rounded"></div>
                  <span>All locations are displayed correctly</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-gray-300 rounded"></div>
                  <span>Ad sizes show proper dimensions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-gray-300 rounded"></div>
                  <span>Pricing calculations are accurate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-gray-300 rounded"></div>
                  <span>Circulation numbers are correct</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-community-navy">Functionality</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-gray-300 rounded"></div>
                  <span>BOGOF selection works properly</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-gray-300 rounded"></div>
                  <span>Volume discounts apply correctly</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-gray-300 rounded"></div>
                  <span>Subscription pricing is accurate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-gray-300 rounded"></div>
                  <span>Form validation prevents errors</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Any changes made to locations, ad sizes, or pricing in the management tabs will be reflected in this preview immediately. 
              Use this area to verify that your configuration changes work as expected before making them live.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalculatorPreview;