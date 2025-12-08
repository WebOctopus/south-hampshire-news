import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { usePricingData } from '@/hooks/usePricingData';
import { formatPrice } from '@/lib/pricingCalculator';
import { Calculator, TrendingUp, Users, Target, Gift, PoundSterling } from 'lucide-react';
import ROIFactorsInfo from './ROIFactorsInfo';
import NewAdvertiserPromo from './NewAdvertiserPromo';

// Ad size options for the slider - ordered from smallest to largest
const AD_SIZE_OPTIONS = [
  { label: '1/8', name: '1/8 Page' },
  { label: '1/6', name: '1/6 Page' },
  { label: '1/4', name: '1/4 Page' },
  { label: '1/3', name: '1/3 Page' },
  { label: '1/2', name: '1/2 Page Landscape' },
  { label: '2/3', name: '2/3 Page' },
  { label: 'Full', name: 'Full Page' },
];

// Default subscription pricing per ad size per number of areas (used for instant display)
const DEFAULT_PRICING: Record<string, Record<number, number>> = {
  '1/8 Page': { 1: 30, 2: 45, 3: 60, 4: 75, 5: 90, 6: 105, 7: 120 },
  '1/6 Page': { 1: 35, 2: 55, 3: 72, 4: 90, 5: 108, 6: 126, 7: 144 },
  '1/4 Page': { 1: 45, 2: 68, 3: 90, 4: 113, 5: 135, 6: 158, 7: 180 },
  '1/3 Page': { 1: 55, 2: 83, 3: 110, 4: 138, 5: 165, 6: 193, 7: 220 },
  '1/2 Page Landscape': { 1: 70, 2: 105, 3: 140, 4: 175, 5: 210, 6: 245, 7: 280 },
  '2/3 Page': { 1: 85, 2: 128, 3: 170, 4: 213, 5: 255, 6: 298, 7: 340 },
  'Full Page': { 1: 110, 2: 165, 3: 220, 4: 275, 5: 330, 6: 385, 7: 440 },
};

// Default circulation per area (used when DB not loaded)
const DEFAULT_CIRCULATIONS = [12000, 7500, 8000, 9500, 11000, 6500, 7000, 8500, 10000, 9000, 7500, 8000, 6000, 5500];

const QuickQuoteCalculator: React.FC = () => {
  const [adSizeIndex, setAdSizeIndex] = useState(2); // Default to 1/4 page
  const [numberOfAreas, setNumberOfAreas] = useState(3); // Default to 3 areas
  const [customerValue, setCustomerValue] = useState(1000); // Default £1000
  const [responseRate, setResponseRate] = useState(1); // Default 1%

  const { areas, adSizes, subscriptionDurations, isLoading, isError } = usePricingData();

  // Find the matching ad size from database
  const selectedAdSize = useMemo(() => {
    if (!adSizes?.length) return null;
    const targetName = AD_SIZE_OPTIONS[adSizeIndex].name;
    return adSizes.find(size => size.name === targetName) || null;
  }, [adSizes, adSizeIndex]);

  // Calculate BOGOF doubled areas (min 2, max 14)
  const bogofAreas = useMemo(() => {
    return Math.min(numberOfAreas * 2, 14);
  }, [numberOfAreas]);

  // Calculate total circulation for BOGOF areas - use DB if available, else defaults
  const totalCirculation = useMemo(() => {
    if (areas?.length) {
      const sortedAreas = [...areas].slice(0, bogofAreas);
      return sortedAreas.reduce((sum, area) => sum + area.circulation, 0);
    }
    // Use default circulations when DB not loaded
    return DEFAULT_CIRCULATIONS.slice(0, bogofAreas).reduce((sum, circ) => sum + circ, 0);
  }, [areas, bogofAreas]);

  // Get subscription pricing - use DB if available, else defaults for instant display
  const monthlyPrice = useMemo(() => {
    const adSizeName = AD_SIZE_OPTIONS[adSizeIndex].name;
    
    // Try database values first
    if (selectedAdSize?.subscription_pricing_per_issue) {
      const subscriptionPricing = selectedAdSize.subscription_pricing_per_issue;
      if (typeof subscriptionPricing === 'object') {
        const priceKey = numberOfAreas.toString();
        if (subscriptionPricing[priceKey]) {
          return subscriptionPricing[priceKey];
        }
      }
    }
    
    // Use hardcoded defaults for instant display
    return DEFAULT_PRICING[adSizeName]?.[numberOfAreas] || 90;
  }, [selectedAdSize, adSizeIndex, numberOfAreas]);

  // Calculate 6-month total
  const sixMonthTotal = useMemo(() => {
    return monthlyPrice * 6;
  }, [monthlyPrice]);

  // ROI calculations
  const roiCalculations = useMemo(() => {
    const potentialResponses = Math.round((totalCirculation * responseRate) / 100);
    const potentialRevenue = potentialResponses * customerValue;
    const roi = sixMonthTotal > 0 ? ((potentialRevenue - sixMonthTotal) / sixMonthTotal) * 100 : 0;
    
    return {
      potentialResponses,
      audience: totalCirculation,
      potentialRevenue,
      roi: Math.round(roi)
    };
  }, [totalCirculation, responseRate, customerValue, sixMonthTotal]);

  return (
    <div className="space-y-8">
      {/* ROI Factors Educational Section */}
      <ROIFactorsInfo />
      
      {/* New Advertiser BOGOF Promo Banner */}
      <NewAdvertiserPromo />
      
      {/* Main Quick Quote Card */}
      <Card className="w-full border-2 border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
          <CardTitle className="flex items-center gap-3 text-2xl text-primary">
            <Calculator className="h-7 w-7" />
            Interactive Rate Card Calculator for New Advertisers
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Quickly explore pricing options using our slider controls below
          </p>
        </CardHeader>
        
        <CardContent className="p-6 space-y-8">
          {/* Ad Size Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-lg font-semibold text-foreground">Ad Size</label>
              <Badge variant="secondary" className="text-lg px-4 py-1 bg-yellow-100 text-yellow-800 border-yellow-300">
                {AD_SIZE_OPTIONS[adSizeIndex].label} Page
              </Badge>
            </div>
            <Slider
              value={[adSizeIndex]}
              onValueChange={(value) => setAdSizeIndex(value[0])}
              min={0}
              max={AD_SIZE_OPTIONS.length - 1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              {AD_SIZE_OPTIONS.map((option, idx) => (
                <span
                  key={option.label}
                  className={idx === adSizeIndex ? 'font-bold text-primary' : ''}
                >
                  {option.label}
                </span>
              ))}
            </div>
          </div>

          {/* Number of Areas Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-lg font-semibold text-foreground">Number of Areas</label>
              <Badge variant="secondary" className="text-lg px-4 py-1 bg-yellow-100 text-yellow-800 border-yellow-300">
                {numberOfAreas} {numberOfAreas === 1 ? 'Area' : 'Areas'}
              </Badge>
            </div>
            <Slider
              value={[numberOfAreas]}
              onValueChange={(value) => setNumberOfAreas(value[0])}
              min={1}
              max={7}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <span
                  key={num}
                  className={num === numberOfAreas ? 'font-bold text-primary' : ''}
                >
                  {num}
                </span>
              ))}
            </div>
          </div>

          {/* BOGOF Display */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Gift className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">
                  We DOUBLE the Areas for 6 months for New Advertisers
                </p>
                <p className="text-green-700 text-lg mt-1">
                  You get <span className="font-bold text-2xl text-green-600">{bogofAreas}</span> areas for the price of {numberOfAreas}!
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-primary/5 rounded-lg p-6 text-center border border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <PoundSterling className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Cost per month</span>
              </div>
              <p className="text-4xl font-bold text-primary">
                {formatPrice(monthlyPrice)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">+ VAT</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6 text-center border border-green-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <PoundSterling className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-700 uppercase tracking-wide">6 Month Campaign</span>
              </div>
              <p className="text-4xl font-bold text-green-600">
                {formatPrice(sixMonthTotal)}
              </p>
              <p className="text-sm text-green-600 mt-1">+ VAT (Total)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ROI Calculator Card */}
      <Card className="w-full border-2 border-blue-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <CardTitle className="flex items-center gap-3 text-2xl text-blue-700">
            <TrendingUp className="h-7 w-7" />
            Now, Let's Help You Calculate ROI for a 6 month Campaign...
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-8">
          {/* Customer Value Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-lg font-semibold text-foreground">Average Customer Value</label>
              <Badge variant="secondary" className="text-lg px-4 py-1 bg-blue-100 text-blue-800 border-blue-300">
                {formatPrice(customerValue)}
              </Badge>
            </div>
            <Slider
              value={[customerValue]}
              onValueChange={(value) => setCustomerValue(value[0])}
              min={100}
              max={5000}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>£100</span>
              <span>£1,000</span>
              <span>£2,500</span>
              <span>£5,000+</span>
            </div>
          </div>

          {/* Response Rate Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-lg font-semibold text-foreground">Expected Response Rate</label>
              <Badge variant="secondary" className="text-lg px-4 py-1 bg-blue-100 text-blue-800 border-blue-300">
                {responseRate.toFixed(1)}%
              </Badge>
            </div>
            <Slider
              value={[responseRate * 10]}
              onValueChange={(value) => setResponseRate(value[0] / 10)}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>0.1%</span>
              <span>1%</span>
              <span>2.5%</span>
              <span>5%</span>
            </div>
          </div>

          {/* ROI Results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-5 text-center border border-blue-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Potential Responses</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {roiCalculations.potentialResponses.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-indigo-50 rounded-lg p-5 text-center border border-indigo-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">Audience Reach</span>
              </div>
              <p className="text-3xl font-bold text-indigo-600">
                {roiCalculations.audience.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-5 text-center border-2 border-green-300 shadow-md">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">Potential ROI</span>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {roiCalculations.roi > 0 ? '+' : ''}{roiCalculations.roi}%
              </p>
              <p className="text-sm text-green-600 mt-1">
                ({formatPrice(roiCalculations.potentialRevenue)} revenue)
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center italic">
            * ROI calculations are estimates based on your inputs. Actual results may vary based on your business, offer, and market conditions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickQuoteCalculator;
