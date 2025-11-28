import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Calculator, TrendingUp, DollarSign } from 'lucide-react';
import { formatPrice } from '@/lib/pricingCalculator';

interface ROICalculatorProps {
  totalCirculation: number;
  totalInvestment: number;
}

export default function ROICalculator({ totalCirculation, totalInvestment }: ROICalculatorProps) {
  const [responseRate, setResponseRate] = useState([1]);
  const [avgOrderValue, setAvgOrderValue] = useState(50);
  const [repeatCustomers, setRepeatCustomers] = useState([30]);

  const responses = Math.round((totalCirculation * responseRate[0]) / 100);
  const directRevenue = responses * avgOrderValue;
  const repeatRevenue = Math.round((responses * repeatCustomers[0]) / 100) * avgOrderValue * 2;
  const totalRevenue = directRevenue + repeatRevenue;
  const roi = totalInvestment > 0 ? ((totalRevenue - totalInvestment) / totalInvestment) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="h-5 w-5 text-blue-600 mr-2" />
          Your ROI Calculator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          See the potential return on your {formatPrice(totalInvestment)} investment
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Response Rate */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Expected Response Rate</Label>
          <div className="px-3">
            <Slider
              value={responseRate}
              onValueChange={setResponseRate}
              max={5}
              min={0.5}
              step={0.1}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.5%</span>
            <span className="font-medium">{responseRate[0]}% = {responses} customers</span>
            <span>5%</span>
          </div>
          <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
            💡 Industry average is 1-2% for local advertising
          </p>
        </div>

        {/* Average Order Value */}
        <div className="space-y-2">
          <Label htmlFor="aov" className="text-sm font-medium">Average Customer Value (£)</Label>
          <Input
            id="aov"
            type="number"
            value={avgOrderValue}
            onChange={(e) => setAvgOrderValue(Number(e.target.value))}
            min="1"
            placeholder="50"
          />
        </div>

        {/* Repeat Customer Rate */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Become Repeat Customers</Label>
          <div className="px-3">
            <Slider
              value={repeatCustomers}
              onValueChange={setRepeatCustomers}
              max={50}
              min={10}
              step={5}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10%</span>
            <span className="font-medium">{repeatCustomers[0]}%</span>
            <span>50%</span>
          </div>
        </div>

        {/* Results */}
        <div className="border-t pt-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Initial Revenue</p>
              <p className="font-bold text-lg">{formatPrice(directRevenue)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Repeat Revenue</p>
              <p className="font-bold text-lg">{formatPrice(repeatRevenue)}</p>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Total Revenue Potential</span>
              <span className="text-2xl font-bold text-green-700">{formatPrice(totalRevenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Return on Investment</span>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-lg font-bold text-green-700">{roi.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {roi > 200 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex items-center mb-1">
                <DollarSign className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="font-medium text-yellow-800">Excellent ROI Potential!</span>
              </div>
              <p className="text-xs text-yellow-700">
                This projection shows strong potential returns. Ready to make it happen?
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}