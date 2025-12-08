import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { usePricingData } from '@/hooks/usePricingData';
import { formatPrice } from '@/lib/pricingCalculator';
import { Calculator, TrendingUp, Users, Target, Gift, PoundSterling, Sparkles } from 'lucide-react';
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
      
      {/* Branded Container Wrapper */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-community-navy via-slate-800 to-community-navy p-1">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-community-green/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-community-green/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative bg-background rounded-xl overflow-hidden">
          {/* Main Quick Quote Card */}
          <Card className="w-full border-0 shadow-none">
            <CardHeader className="bg-gradient-to-r from-community-navy to-slate-800 border-b-4 border-community-green">
              <CardTitle className="flex items-center gap-3 text-2xl text-white">
                <div className="p-2 bg-community-green rounded-lg">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                Interactive Rate Card Calculator
              </CardTitle>
              <p className="text-slate-300 mt-2">
                Explore pricing options using our slider controls below
              </p>
            </CardHeader>
            
            <CardContent className="p-6 md:p-8 space-y-8">
              {/* Ad Size Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-lg font-semibold text-community-navy">Ad Size</label>
                  <Badge className="text-lg px-4 py-1.5 bg-community-navy text-white border-0 shadow-md">
                    {AD_SIZE_OPTIONS[adSizeIndex].label} Page
                  </Badge>
                </div>
                <Slider
                  value={[adSizeIndex]}
                  onValueChange={(value) => setAdSizeIndex(value[0])}
                  min={0}
                  max={AD_SIZE_OPTIONS.length - 1}
                  step={1}
                  variant="brand"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  {AD_SIZE_OPTIONS.map((option, idx) => (
                    <span
                      key={option.label}
                      className={idx === adSizeIndex ? 'font-bold text-community-green' : ''}
                    >
                      {option.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Number of Areas Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-lg font-semibold text-community-navy">Number of Areas</label>
                  <Badge className="text-lg px-4 py-1.5 bg-community-navy text-white border-0 shadow-md">
                    {numberOfAreas} {numberOfAreas === 1 ? 'Area' : 'Areas'}
                  </Badge>
                </div>
                <Slider
                  value={[numberOfAreas]}
                  onValueChange={(value) => setNumberOfAreas(value[0])}
                  min={1}
                  max={7}
                  step={1}
                  variant="brand"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <span
                      key={num}
                      className={num === numberOfAreas ? 'font-bold text-community-green' : ''}
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>

              {/* Celebratory BOGOF Display */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-community-green via-emerald-500 to-community-green p-[2px] animate-pulse-subtle">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                <div className="relative bg-gradient-to-r from-emerald-50 to-green-50 rounded-[10px] p-5">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-community-green/30 rounded-full animate-ping" />
                      <div className="relative p-3 bg-community-green rounded-full">
                        <Gift className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        <p className="font-bold text-community-navy text-lg">
                          Double Your Reach - FREE!
                        </p>
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                      </div>
                      <p className="text-community-navy">
                        You get{' '}
                        <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 bg-community-green text-white font-bold text-2xl rounded-lg shadow-lg mx-1 transform scale-110">
                          {bogofAreas}
                        </span>{' '}
                        areas for the price of{' '}
                        <span className="font-semibold">{numberOfAreas}</span>!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Display - Contrast Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative overflow-hidden rounded-xl bg-community-navy p-6 text-center shadow-xl">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-community-green/20 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <PoundSterling className="h-5 w-5 text-community-green" />
                      <span className="text-sm font-medium text-slate-300 uppercase tracking-wide">Cost per month</span>
                    </div>
                    <p className="text-5xl font-bold text-white">
                      {formatPrice(monthlyPrice)}
                    </p>
                    <p className="text-sm text-slate-400 mt-2">+ VAT</p>
                  </div>
                </div>
                
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-community-green to-emerald-600 p-6 text-center shadow-xl">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <PoundSterling className="h-5 w-5 text-white" />
                      <span className="text-sm font-medium text-white/80 uppercase tracking-wide">6 Month Campaign</span>
                    </div>
                    <p className="text-5xl font-bold text-white">
                      {formatPrice(sixMonthTotal)}
                    </p>
                    <p className="text-sm text-white/70 mt-2">+ VAT (Total)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ROI Calculator Card */}
          <Card className="w-full border-0 border-t-4 border-community-navy shadow-none rounded-none">
            <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50 border-b">
              <CardTitle className="flex items-center gap-3 text-2xl text-community-navy">
                <div className="p-2 bg-community-navy rounded-lg">
                  <TrendingUp className="h-6 w-6 text-community-green" />
                </div>
                Calculate Your Potential ROI
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Estimate your return based on your business metrics
              </p>
            </CardHeader>
            
            <CardContent className="p-6 md:p-8 space-y-8">
              {/* Customer Value Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-lg font-semibold text-community-navy">Average Customer Value</label>
                  <Badge className="text-lg px-4 py-1.5 bg-community-navy text-white border-0 shadow-md">
                    {formatPrice(customerValue)}
                  </Badge>
                </div>
                <Slider
                  value={[customerValue]}
                  onValueChange={(value) => setCustomerValue(value[0])}
                  min={100}
                  max={5000}
                  step={100}
                  variant="brand"
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
                  <label className="text-lg font-semibold text-community-navy">Expected Response Rate</label>
                  <Badge className="text-lg px-4 py-1.5 bg-community-navy text-white border-0 shadow-md">
                    {responseRate.toFixed(1)}%
                  </Badge>
                </div>
                <Slider
                  value={[responseRate * 10]}
                  onValueChange={(value) => setResponseRate(value[0] / 10)}
                  min={1}
                  max={50}
                  step={1}
                  variant="brand"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>0.1%</span>
                  <span>1%</span>
                  <span>2.5%</span>
                  <span>5%</span>
                </div>
              </div>

              {/* ROI Results - Contrast Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative overflow-hidden rounded-xl bg-slate-800 p-5 text-center shadow-lg">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-community-green/20 rounded-full blur-xl" />
                  <div className="relative">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-community-green" />
                      <span className="text-sm font-medium text-slate-300">Potential Responses</span>
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {roiCalculations.potentialResponses.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="relative overflow-hidden rounded-xl bg-community-navy p-5 text-center shadow-lg">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-community-green/20 rounded-full blur-xl" />
                  <div className="relative">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-community-green" />
                      <span className="text-sm font-medium text-slate-300">Audience Reach</span>
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {roiCalculations.audience.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-community-green to-emerald-600 p-5 text-center shadow-xl ring-2 ring-yellow-400/50">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full blur-xl" />
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="relative">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-white" />
                      <span className="text-sm font-medium text-white/90">Potential ROI</span>
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {roiCalculations.roi > 0 ? '+' : ''}{roiCalculations.roi}%
                    </p>
                    <p className="text-sm text-white/80 mt-1">
                      ({formatPrice(roiCalculations.potentialRevenue)} revenue)
                    </p>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-muted-foreground text-center italic">
                * ROI calculations are estimates based on your inputs. Actual results may vary based on your business, offer, and market conditions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuickQuoteCalculator;