import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/pricingCalculator';
import { usePricingData } from '@/hooks/usePricingData';
import { useLeafletData } from '@/hooks/useLeafletData';
import { usePaymentOptions } from '@/hooks/usePaymentOptions';
import { useStepForm } from '@/components/StepForm';
import { getAreaGroupedSchedules } from '@/lib/issueSchedule';
import { calculatePaymentAmount as calcPaymentAmount } from '@/lib/paymentCalculations';
import { parse } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useBogofEligibility } from '@/hooks/useBogofEligibility';
import { supabase } from '@/integrations/supabase/client';

interface BookingSummaryStepProps {
  pricingModel: 'fixed' | 'bogof' | 'leafleting';
  selectedAreas: string[];
  bogofPaidAreas: string[];
  bogofFreeAreas: string[];
  selectedAdSize: string;
  selectedDuration: string;
  pricingBreakdown: any;
  selectedPaymentOption?: string;
  onPaymentOptionChange: (option: string) => void;
  selectedStartingIssue?: string;
  onStartingIssueChange?: (issue: string) => void;
  onNext?: () => void;
  // New props to ensure design fee shows in cost breakdown even if breakdown missing it
  needsDesign?: boolean;
  designFee?: number;
}

export const BookingSummaryStep: React.FC<BookingSummaryStepProps> = ({
  pricingModel,
  selectedAreas,
  bogofPaidAreas,
  bogofFreeAreas,
  selectedAdSize,
  selectedDuration,
  pricingBreakdown,
  selectedPaymentOption,
  onPaymentOptionChange,
  selectedStartingIssue,
  onStartingIssueChange,
  onNext,
  needsDesign = false,
  designFee = 0
}) => {
  const { areas, adSizes, durations } = usePricingData();
  const { leafletAreas, leafletSizes } = useLeafletData();
  const { data: paymentOptions = [] } = usePaymentOptions();
  const { nextStep } = useStepForm();
  
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [userPhone, setUserPhone] = useState<string | undefined>();
  const { data: eligibilityData, isLoading: checkingEligibility } = useBogofEligibility(userEmail, userPhone);

  // Get current user's email and phone for BOGOF eligibility check
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
        
        // Try to get phone from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (profile?.phone) {
          setUserPhone(profile.phone);
        }
      }
    };
    
    fetchUserData();
  }, []);

  // Helper function to parse and format dates from the schedule
  const parseScheduleDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      // Try parsing DD.MM.YYYY format first
      if (dateStr.includes('.')) {
        const parsed = parse(dateStr, 'dd.MM.yyyy', new Date());
        if (!isNaN(parsed.getTime())) {
          return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        }
      }
      // Try ISO date format (YYYY-MM-DD)
      if (dateStr.includes('-') && dateStr.length > 7) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        }
      }
      // Fallback to returning the original string (for old formats like "15th")
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Get available starting issue options from the first selected area
  const effectiveAreas = pricingModel === 'leafleting' ? leafletAreas : areas;
  const effectiveSelectedAreas = pricingModel === 'bogof' ? 
    [...bogofPaidAreas, ...bogofFreeAreas] : selectedAreas;
  const selectedAreaData = effectiveAreas?.filter(area => 
    effectiveSelectedAreas.includes(area.id)
  ) || [];
  
  // Get schedule options from the first area (all areas will use the same starting date)
  const areaGroupedSchedules = getAreaGroupedSchedules(selectedAreaData);
  const availableStartingIssues = areaGroupedSchedules.length > 0 ? areaGroupedSchedules[0].scheduleOptions : [];

  // Ensure a default starting issue is set (first available) if none chosen yet
  React.useEffect(() => {
    if (!selectedStartingIssue && availableStartingIssues.length > 0) {
      onStartingIssueChange?.(availableStartingIssues[0].value);
    }
  }, [selectedStartingIssue, availableStartingIssues, onStartingIssueChange]);

  // Get display names
  const getAdSizeName = () => {
    if (pricingModel === 'leafleting') {
      const leafletSize = leafletSizes?.find(size => size.id === selectedAdSize);
      return leafletSize?.label || 'Unknown Size';
    } else {
      const adSize = adSizes?.find(size => size.id === selectedAdSize);
      return adSize?.name || 'Unknown Size';
    }
  };

  const getDurationName = () => {
    if (pricingModel === 'bogof') {
      return '6 months';
    }
    const duration = durations?.find(d => d.id === selectedDuration);
    return duration?.name || 'Unknown Duration';
  };

  const getAreaName = (areaId: string) => {
    if (pricingModel === 'leafleting') {
      const area = leafletAreas?.find(area => area.id === areaId);
      return `Area ${area?.area_number} - ${area?.name}` || 'Unknown Area';
    } else {
      const area = areas?.find(area => area.id === areaId);
      return area?.name || 'Unknown Area';
    }
  };

  const getAreaNumber = (areaId: string) => {
    if (pricingModel === 'leafleting') {
      const area = leafletAreas?.find(area => area.id === areaId);
      return area?.area_number || 'N/A';
    } else {
      return 'N/A';
    }
  };

// Calculate pricing options based on admin-configured payment options
// The baseTotal already includes the design fee in finalTotal
const baseTotal = pricingBreakdown?.finalTotal || 0;
const cpmRate = pricingBreakdown?.cpm || 0;

// Show design fee as add-on in breakdown while keeping total inclusive
const designFeeToShow = (pricingBreakdown?.designFee ?? 0) || (needsDesign ? (designFee || 0) : 0);
const campaignCostExclDesign = pricingBreakdown?.finalTotalBeforeDesign ?? (designFeeToShow > 0 ? Math.max(0, baseTotal - designFeeToShow) : baseTotal);

  const effectivePaidAreas = pricingModel === 'bogof' ? bogofPaidAreas : selectedAreas;
  const effectiveFreeAreas = pricingModel === 'bogof' ? bogofFreeAreas : [];

  const handleNext = () => {
    if (!selectedPaymentOption) {
      return; // Validation handled by form
    }
    nextStep();
  };

  const isBogof = pricingModel === 'bogof';
  const showBogofWarning = isBogof && eligibilityData && !eligibilityData.isEligible;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {showBogofWarning && (
        <Alert className="bg-pink-50 border-pink-200 dark:bg-pink-950/20 dark:border-pink-800">
          <AlertCircle className="h-4 w-4 text-pink-600 dark:text-pink-400" />
          <AlertDescription className="text-pink-800 dark:text-pink-300">
            <strong>Returning Customer</strong> — You've previously used this offer. Complete your booking and our team will contact you with exclusive returning customer rates!
          </AlertDescription>
        </Alert>
      )}
      
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">YOUR BASKET</h2>
        <p className="text-muted-foreground">Review your selection and choose your payment option</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Booking Details */}
        <div className="space-y-6">
          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Advert Size</Label>
                <p className="font-medium">{getAdSizeName()}</p>
                {(() => {
                  if (pricingModel === 'leafleting') {
                    return null; // Leaflet sizes don't have dimensions
                  }
                  const adSize = adSizes?.find(size => size.id === selectedAdSize);
                  return adSize?.dimensions ? (
                    <div className="mt-1">
                      <Label className="text-sm font-medium text-muted-foreground">Dimensions</Label>
                      <p className="text-sm">{adSize.dimensions}</p>
                    </div>
                  ) : null;
                })()}
              </div>
              
              {pricingModel === 'bogof' && (
                <>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Booking Type</Label>
                    <p className="font-medium">3+ Repeat Package for New Advertisers including Buy One Area Get One Area Free</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Minimum Duration</Label>
                    <p className="font-medium">3 issues per area = 6 months</p>
                  </div>
                </>
              )}
              
              {!pricingModel && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                  <p className="font-medium">{getDurationName()}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <Label className="text-sm font-medium text-muted-foreground">When Would You like Your Advertising to Start?</Label>
                <p className="text-xs text-muted-foreground">Choose one:</p>
                {availableStartingIssues.length > 0 ? (
                  <div className="border rounded-lg p-4">
                    <RadioGroup 
                      value={selectedStartingIssue || availableStartingIssues[0]?.value} 
                      onValueChange={(value) => onStartingIssueChange?.(value)}
                      className="space-y-2"
                    >
                      {availableStartingIssues.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="text-sm font-medium cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ) : (
                  <p className="font-medium">Next available issue</p>
                )}
              </div>

              {/* Campaign Schedule Section */}
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    {pricingModel === 'bogof' ? 'Campaign Schedule—Months 1-6' : 'Campaign Schedule'}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    A full schedule with copy deadlines, print and delivery dates will be available to download in your account
                  </p>
                </div>

                {/* Sort areas: paid first, then free for BOGOF */}
                {(pricingModel === 'bogof' 
                  ? [...selectedAreaData].sort((a, b) => {
                      const aIsPaid = bogofPaidAreas.includes(a.id);
                      const bIsPaid = bogofPaidAreas.includes(b.id);
                      if (aIsPaid && !bIsPaid) return -1;
                      if (!aIsPaid && bIsPaid) return 1;
                      return 0;
                    })
                  : selectedAreaData
                ).map((area, displayIndex) => {
                  // Get the original index for alternating logic
                  const areaIndex = selectedAreaData.findIndex(a => a.id === area.id);
                  const schedule = area.schedule || [];
                  
                  // For BOGOF packages, determine the correct starting month for this area
                  // based on whether it should start in odd or even months
                  let startMonth = selectedStartingIssue || availableStartingIssues[0]?.value || '';
                  
                  // If the selected start month doesn't exist in this area's schedule,
                  // find the first available month at or after the selected start date
                  if (startMonth && !schedule.some((s: any) => s.month === startMonth)) {
                    const baseStartDate = new Date(startMonth + '-01');
                    const futureMonth = schedule.find((s: any) => {
                      const scheduleDate = new Date(s.month + '-01');
                      return scheduleDate >= baseStartDate;
                    });
                    if (futureMonth) {
                      startMonth = futureMonth.month;
                    }
                  }
                  
                  // Get the starting index in the schedule
                  const startIndex = schedule.findIndex((s: any) => s.month === startMonth);
                  if (startIndex === -1) {
                    // Fallback: use the first available month in the schedule that's not in the past
                    const today = new Date();
                    const futureSchedules = schedule.filter((s: any) => {
                      let dateStr: string;
                      if (s.month && s.month.includes('-')) {
                        dateStr = s.month + '-01';
                      } else if (s.month && s.year) {
                        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                            'July', 'August', 'September', 'October', 'November', 'December'];
                        const monthIndex = monthNames.indexOf(s.month);
                        if (monthIndex !== -1) {
                          const monthNum = String(monthIndex + 1).padStart(2, '0');
                          dateStr = `${s.year}-${monthNum}-01`;
                        } else {
                          dateStr = s.month + '-01';
                        }
                      } else {
                        dateStr = s.month + '-01';
                      }
                      return new Date(dateStr) >= today;
                    });
                    if (futureSchedules.length === 0) return null;
                    startMonth = futureSchedules[0].month;
                  }
                  
                  const finalStartIndex = schedule.findIndex((s: any) => s.month === startMonth);
                  if (finalStartIndex === -1) return null;

                  // Get the next 3 issues for this area (for BOGOF or first period)
                  const issueCount = pricingModel === 'bogof' ? 3 : parseInt(selectedDuration) || 3;
                  const issues = schedule.slice(finalStartIndex, finalStartIndex + issueCount);

                  // Determine if this area is paid or free
                  const isPaidArea = pricingModel === 'bogof' ? bogofPaidAreas.includes(area.id) : true;
                  const isFreeArea = pricingModel === 'bogof' ? bogofFreeAreas.includes(area.id) : false;

                  return (
                    <div key={area.id} className="space-y-2 pb-3">
                      <div className="flex items-center gap-2">
                        {pricingModel === 'bogof' && isPaidArea && (
                          <Badge variant="default" className="bg-primary">Paid</Badge>
                        )}
                        {pricingModel === 'bogof' && isFreeArea && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">Free</Badge>
                        )}
                        <p className="font-medium">
                          {pricingModel === 'leafleting' && 'area_number' in area ? `Area ${area.area_number}—` : ''}{area.name}
                        </p>
                      </div>
                      <p className="text-sm">
                        <span className="font-medium">Issues: </span>
                        {issues.map((issue: any, idx: number) => {
                          // Handle both "YYYY-MM" format and month name format
                          let dateStr: string;
                          if (issue.month && issue.month.includes('-')) {
                            // Already in YYYY-MM format
                            dateStr = issue.month + '-01';
                          } else if (issue.month && issue.year) {
                            // Convert month name to YYYY-MM format
                            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                                'July', 'August', 'September', 'October', 'November', 'December'];
                            const monthIndex = monthNames.indexOf(issue.month);
                            if (monthIndex !== -1) {
                              const monthNum = String(monthIndex + 1).padStart(2, '0');
                              dateStr = `${issue.year}-${monthNum}-01`;
                            } else {
                              dateStr = issue.month + '-01';
                            }
                          } else {
                            dateStr = issue.month + '-01';
                          }
                          
                          const date = new Date(dateStr);
                          const monthYear = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
                          return idx === issues.length - 1 ? monthYear : `${monthYear}, `;
                        })}
                      </p>
                      {(() => {
                        // Show only the selected month's copy deadline (first issue)
                        const firstIssue = issues[0];
                        const copyDeadline = firstIssue?.copyDeadline || firstIssue?.copy_deadline;
                        if (!copyDeadline) return null;
                        return (
                          <p className="text-sm">
                            <span className="font-medium">Copy deadline: </span>
                            {parseScheduleDate(copyDeadline)}
                          </p>
                        );
                      })()}
                      {(() => {
                        // Show only the selected month's print deadline (first issue)
                        const firstIssueForPrint = issues[0];
                        const printDeadline = firstIssueForPrint?.printDeadline || firstIssueForPrint?.print_deadline;
                        if (!printDeadline) return null;
                        return (
                          <p className="text-sm">
                            <span className="font-medium">Print deadline: </span>
                            {parseScheduleDate(printDeadline)}
                          </p>
                        );
                      })()}
                      {(() => {
                        // Show only the selected month's delivery date (first issue)
                        const firstIssueForDelivery = issues[0];
                        const deliveryDate = firstIssueForDelivery?.deliveryDate || firstIssueForDelivery?.delivery_date;
                        if (!deliveryDate) return null;
                        return (
                          <p className="text-sm">
                            <span className="font-medium">Week Commencing: </span>
                            {parseScheduleDate(deliveryDate)}
                          </p>
                        );
                      })()}
                    </div>
                  );
                })}

                {/* Months 7+ Section for BOGOF */}
                {pricingModel === 'bogof' && bogofPaidAreas.length > 0 && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Campaign Schedule—Months 7 onwards until cancellation</h3>
                      <p className="text-sm text-muted-foreground mb-4">You are free to opt out after Months 1-6</p>
                    </div>

                    {bogofPaidAreas.map((areaId, paidAreaIndex) => {
                      const area = selectedAreaData.find(a => a.id === areaId);
                      if (!area) return null;
                      
                      const areaIndex = selectedAreaData.findIndex(a => a.id === areaId);
                      const schedule = area.schedule || [];
                      
                      // Determine the correct starting month for this area (same logic as above)
                      let startMonth = selectedStartingIssue || availableStartingIssues[0]?.value || '';
                      
                      if (pricingModel === 'bogof' && startMonth) {
                        const shouldUseNextMonth = areaIndex % 2 !== 0;
                        if (shouldUseNextMonth) {
                          const baseStartIndex = schedule.findIndex((s: any) => s.month === startMonth);
                          if (baseStartIndex >= 0 && baseStartIndex + 1 < schedule.length) {
                            startMonth = schedule[baseStartIndex + 1].month;
                          }
                        }
                      }
                      
                      let startIndex = schedule.findIndex((s: any) => s.month === startMonth);
                      if (startIndex === -1) {
                        const today = new Date();
                        const futureSchedules = schedule.filter((s: any) => {
                          let dateStr: string;
                          if (s.month && s.month.includes('-')) {
                            dateStr = s.month + '-01';
                          } else if (s.month && s.year) {
                            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                                'July', 'August', 'September', 'October', 'November', 'December'];
                            const monthIndex = monthNames.indexOf(s.month);
                            if (monthIndex !== -1) {
                              const monthNum = String(monthIndex + 1).padStart(2, '0');
                              dateStr = `${s.year}-${monthNum}-01`;
                            } else {
                              dateStr = s.month + '-01';
                            }
                          } else {
                            dateStr = s.month + '-01';
                          }
                          return new Date(dateStr) >= today;
                        });
                        if (futureSchedules.length === 0) return null;
                        startMonth = futureSchedules[0].month;
                        startIndex = schedule.findIndex((s: any) => s.month === startMonth);
                        if (startIndex === -1) return null;
                      }
                      
                      // Get the 4th issue (index 3) which is month 7
                      // If not available in schedule, calculate it
                      let month7Issue = schedule[startIndex + 3];
                      let monthYear: string;
                      
                      if (month7Issue) {
                        // Handle both "YYYY-MM" format and month name format
                        let dateStr: string;
                        if (month7Issue.month && month7Issue.month.includes('-')) {
                          dateStr = month7Issue.month + '-01';
                        } else if (month7Issue.month && month7Issue.year) {
                          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                              'July', 'August', 'September', 'October', 'November', 'December'];
                          const monthIndex = monthNames.indexOf(month7Issue.month);
                          if (monthIndex !== -1) {
                            const monthNum = String(monthIndex + 1).padStart(2, '0');
                            dateStr = `${month7Issue.year}-${monthNum}-01`;
                          } else {
                            dateStr = month7Issue.month + '-01';
                          }
                        } else {
                          dateStr = month7Issue.month + '-01';
                        }
                        const date = new Date(dateStr);
                        monthYear = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
                      } else {
                        // Calculate month 7 manually (6 months after start, since bi-monthly = 3 issues * 2 months)
                        // Handle both date formats for startMonth
                        let startDateStr: string;
                        if (startMonth.includes('-')) {
                          startDateStr = startMonth + '-01';
                        } else {
                          // Try to find the schedule item to get the year
                          const scheduleItem = schedule.find((s: any) => s.month === startMonth);
                          if (scheduleItem && scheduleItem.year) {
                            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                                'July', 'August', 'September', 'October', 'November', 'December'];
                            const monthIndex = monthNames.indexOf(startMonth);
                            if (monthIndex !== -1) {
                              const monthNum = String(monthIndex + 1).padStart(2, '0');
                              startDateStr = `${scheduleItem.year}-${monthNum}-01`;
                            } else {
                              startDateStr = startMonth + '-01';
                            }
                          } else {
                            startDateStr = startMonth + '-01';
                          }
                        }
                        const startDate = new Date(startDateStr);
                        const month7Date = new Date(startDate);
                        month7Date.setMonth(startDate.getMonth() + 6);
                        monthYear = month7Date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
                      }

                      return (
                        <div key={areaId} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="default" className="bg-primary">Paid</Badge>
                            <p className="font-medium">{area.name}</p>
                          </div>
                          <p className="text-sm">{monthYear} and bi-monthly thereafter</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Circulation Total */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Label className="text-sm font-medium text-muted-foreground">
                  Total Number of Homes Reached{pricingModel === 'bogof' && ' (Months 1-6)'}
                </Label>
                <p className="text-2xl font-bold text-primary">
                  {pricingBreakdown?.totalCirculation?.toLocaleString() || 0} homes
                </p>
                {pricingModel === 'bogof' && (() => {
                  const duration = durations?.find(d => d.id === selectedDuration);
                  const durationMonths = duration?.duration_value || 0;
                  const issues = durationMonths;
                  const totalImpressions = (pricingBreakdown?.totalCirculation || 0) * issues;
                  if (issues > 1) {
                    return (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-muted-foreground">
                          Your advert will be published <span className="font-semibold text-foreground">{issues} times</span> over {durationMonths} months
                        </p>
                        <p className="text-lg font-semibold text-primary mt-2">
                          {totalImpressions.toLocaleString()} total impressions
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Commitment Terms (BOGOF only) */}
          {pricingModel === 'bogof' && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-lg text-amber-800">Commitment Terms</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-amber-700 space-y-3">
                <p className="font-medium">After six months you have three choices:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Continue with the paid for areas at the same cost</li>
                  <li>Change your campaign at a revised cost</li>
                  <li>Cancel and nothing more to pay!</li>
                </ol>
                <p className="text-xs">
                  Hopefully, you will want to continue and we'll do all we can to ensure you get the best from your investment in Discover.
                </p>
                <p className="font-medium">
                  Minimum commitment: 3 issues in each area = 6 months of advertising
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Payment Options */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">3 Payment Options</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={selectedPaymentOption} 
                onValueChange={onPaymentOptionChange}
                className="space-y-4"
              >
                {paymentOptions
                  .sort((a, b) => {
                    // Custom sorting: monthly first, then 6 months, then 12 months
                    const getOrder = (option: any) => {
                      if (option.option_type === 'monthly') return 1;
                      if (option.display_name?.includes('6 Months')) return 2;
                      if (option.display_name?.includes('12 Months')) return 3;
                      return 4; // fallback for any other options
                    };
                    return getOrder(a) - getOrder(b);
                  })
                  .map((option) => {
                  const amount = calcPaymentAmount(
                    baseTotal,
                    option,
                    pricingModel,
                    paymentOptions,
                    designFeeToShow
                  );
                  const savings = option.discount_percentage > 0 ? baseTotal - amount : 0;
                  
                  return (
                      <div key={option.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value={option.option_type} id={option.option_type} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={option.option_type} className="font-medium cursor-pointer">
                            {option.option_type === 'monthly' ? 'Monthly Payment Plan' : option.display_name}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {option.option_type === 'monthly' ? 'Direct Debit' : option.description}
                          </p>
                          <p className="text-lg font-bold text-primary">
                            {formatPrice(amount)} + VAT
                          </p>
                          {savings > 0 && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                              Save {formatPrice(savings)}
                            </Badge>
                          )}
                          {option.minimum_payments && (
                            <div className="text-sm text-muted-foreground mt-1 space-y-1">
                              <p>• Minimum number of payments = {option.minimum_payments}</p>
                            </div>
                          )}
                        </div>
                      </div>
                  );
                })}
              </RadioGroup>

              {/* Amazing Value Section */}
              <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border">
                <div className="text-center">
                  <h4 className="font-bold text-lg mb-2">🎯 Amazing Value!</h4>
                  <p className="text-xl font-bold text-primary">
                    {(() => {
                      if (pricingBreakdown?.totalCirculation) {
                        // Get the monthly payment amount
                        const monthlyOption = paymentOptions.find(opt => opt.option_type === 'monthly');
                        if (monthlyOption) {
                          const monthlyAmount = calcPaymentAmount(
                            baseTotal,
                            monthlyOption,
                            pricingModel,
                            paymentOptions,
                            designFeeToShow
                          );
                          // Formula: (monthly × 2) / total homes × 1000
                          const costPer1000 = ((monthlyAmount * 2) / pricingBreakdown.totalCirculation) * 1000;
                          return `Only ${formatPrice(costPer1000)} + VAT per 1,000 homes reached`;
                        }
                      }
                      return `Only ${formatPrice(cpmRate)} + VAT per 1,000 homes reached`;
                    })()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-4">
                <h4 className="font-semibold text-lg text-center">What to Do Next</h4>
                
                <button
                  onClick={() => {
                    window.open('tel:02380266388', '_self');
                  }}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/80 font-medium py-3 px-6 rounded-md transition-colors"
                >
                  Call Discover Team for Advice 023 8026 6388
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={!selectedPaymentOption}
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium py-3 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Quote
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={!selectedPaymentOption}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Book Now
                </button>
              </div>

              {/* What You're Booking */}
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-medium">📦</span>
                  <div>
                    <p className="font-medium">WHAT YOU'RE BOOKING:</p>
                    <p className="text-muted-foreground">A complete advertising package including professional ad design, guaranteed distribution to your selected areas, and placement in our trusted local publication</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-primary font-medium">💰</span>
                  <div>
                    <p className="font-medium">INVESTMENT SHOWN:</p>
                    <p className="text-muted-foreground">Your total includes all costs - ad creation, distribution, and VAT. No hidden fees or surprise charges</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-primary font-medium">⚡</span>
                  <div>
                    <p className="font-medium">IMMEDIATE CONFIRMATION:</p>
                    <p className="text-muted-foreground">Book now for instant campaign confirmation and priority page position or call us for help and advice.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-primary font-medium">🎨</span>
                  <div>
                    <p className="font-medium">FREE DESIGN SERVICE:</p>
                    <p className="text-muted-foreground">By booking online you get free advert design. Our professional design team creates stunning ads at no extra cost - just provide your content, images, logo and branding kit if you have one.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-primary font-medium">🎯</span>
                  <div>
                    <p className="font-medium">GUARANTEED REACH:</p>
                    <p className="text-muted-foreground">Your ad will reach every household in your selected areas during the scheduled distribution period, on time, every time.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingSummaryStep;