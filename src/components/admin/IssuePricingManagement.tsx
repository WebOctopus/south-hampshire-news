import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DollarSign, Receipt } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useUpdateAdSizePricing, usePricingInvalidation } from '@/hooks/usePricingMutations';

interface AdSize {
  id: string;
  name: string;
  dimensions: string;
  base_price_per_area: number;
  base_price_per_month: number;
  fixed_pricing_per_issue: Record<string, number>;
  subscription_pricing_per_issue: Record<string, number>;
  available_for: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface IssuePricingManagementProps {
  onStatsUpdate: () => void;
}

const IssuePricingManagement = ({ onStatsUpdate }: IssuePricingManagementProps) => {
  const [adSizes, setAdSizes] = useState<AdSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [tempPricingUpdates, setTempPricingUpdates] = useState<Record<string, AdSize>>({});
  const { toast } = useToast();
  const updateAdSizePricingMutation = useUpdateAdSizePricing();
  const { invalidateSpecific } = usePricingInvalidation();

  useEffect(() => {
    loadAdSizes();
  }, []);

  const loadAdSizes = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_sizes')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        throw error;
      }

      // Transform the data to ensure JSON fields are properly parsed
      const transformedData = (data || []).map(item => ({
        ...item,
        fixed_pricing_per_issue: typeof item.fixed_pricing_per_issue === 'string' 
          ? JSON.parse(item.fixed_pricing_per_issue || '{}')
          : (item.fixed_pricing_per_issue || {}),
        subscription_pricing_per_issue: typeof item.subscription_pricing_per_issue === 'string'
          ? JSON.parse(item.subscription_pricing_per_issue || '{}')
          : (item.subscription_pricing_per_issue || {}),
        available_for: Array.isArray(item.available_for) 
          ? item.available_for 
          : (typeof item.available_for === 'string' 
            ? JSON.parse(item.available_for || '["fixed", "subscription"]') 
            : ['fixed', 'subscription'])
      }));

      setAdSizes(transformedData);
      if (onStatsUpdate) {
        onStatsUpdate();
      }
    } catch (error) {
      console.error('Error loading ad sizes:', error);
      toast({
        title: "Error",
        description: "Failed to load ad sizes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle updating issue pricing in local state
  const handleUpdateIssuePricing = (adSizeId: string, field: 'fixed_pricing_per_issue' | 'subscription_pricing_per_issue', updatedPricing: Record<string, number>) => {
    const currentAdSize = adSizes.find(size => size.id === adSizeId);
    if (!currentAdSize) return;

    const updatedAdSize = {
      ...currentAdSize,
      [field]: updatedPricing
    };

    // Update the main state
    setAdSizes(prev => prev.map(size => 
      size.id === adSizeId ? updatedAdSize : size
    ));

    // Track this change for later saving
    setTempPricingUpdates(prev => ({
      ...prev,
      [adSizeId]: updatedAdSize
    }));
  };

  const saveIssuePricing = async (adSizeId: string) => {
    const updatedAdSize = tempPricingUpdates[adSizeId];
    if (!updatedAdSize) return;

    try {
      await updateAdSizePricingMutation.mutateAsync({
        adSizeId,
        fixedPricing: updatedAdSize.fixed_pricing_per_issue,
        subscriptionPricing: updatedAdSize.subscription_pricing_per_issue
      });

      // Remove from temp updates
      setTempPricingUpdates(prev => {
        const newUpdates = { ...prev };
        delete newUpdates[adSizeId];
        return newUpdates;
      });

      // Trigger stats update and reload local data
      onStatsUpdate();
      await loadAdSizes();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">Loading issue pricing...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Receipt className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-xl font-heading font-bold">Area-Count Pricing Management</h2>
          <p className="text-sm text-muted-foreground">
            Configure pricing for each ad size based on number of areas selected
          </p>
        </div>
      </div>

      {/* Issue-Based Pricing Management with Accordion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Configure Pricing by Area Count
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Set specific pricing for each ad size based on the number of areas selected. Click to expand each section.
          </p>
        </CardHeader>
        <CardContent>
          {adSizes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No active ad sizes found.</p>
              <p className="text-sm mt-2">Add ad sizes in the "Ad Size & Pricing" section first.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {adSizes.map((adSize) => (
                <AccordionItem key={adSize.id} value={adSize.id} className="border rounded-lg mb-4 last:mb-0">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline bg-muted/50 rounded-t-lg data-[state=open]:rounded-b-none">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg">{adSize.name}</span>
                        <Badge variant="outline" className="bg-background">
                          {adSize.dimensions}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          Base Fixed: £{adSize.base_price_per_area.toFixed(2)}
                        </span>
                        <span>•</span>
                        <span>
                          Base Subscription: £{adSize.base_price_per_month.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-2 bg-background rounded-b-lg">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Fixed Rates Table */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                          Fixed Rates
                          <Badge variant="secondary" className="text-xs">
                            One-time booking
                          </Badge>
                        </h3>
                        <div className="overflow-x-auto">
                          <Table className="text-sm">
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-20">Areas</TableHead>
                                <TableHead>Price (£)</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Array.from({ length: 14 }, (_, i) => i + 1).map((issueCount) => {
                                const currentPrice = adSize.fixed_pricing_per_issue?.[issueCount.toString()] || 0;
                                return (
                                  <TableRow key={`fixed-${issueCount}`}>
                                    <TableCell className="font-medium">{issueCount}</TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={currentPrice}
                                        onChange={(e) => {
                                          const newPrice = parseFloat(e.target.value) || 0;
                                          const updatedPricing = {
                                            ...adSize.fixed_pricing_per_issue,
                                            [issueCount.toString()]: newPrice
                                          };
                                          handleUpdateIssuePricing(adSize.id, 'fixed_pricing_per_issue', updatedPricing);
                                        }}
                                        className="w-full h-8"
                                      />
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      {/* Subscription Rates Table */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                          Subscription Rates
                          <Badge variant="secondary" className="text-xs">
                            Monthly subscription
                          </Badge>
                        </h3>
                        <div className="overflow-x-auto">
                          <Table className="text-sm">
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-20">Areas</TableHead>
                                <TableHead>Price (£)</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Array.from({ length: 14 }, (_, i) => i + 1).map((issueCount) => {
                                const currentPrice = adSize.subscription_pricing_per_issue?.[issueCount.toString()] || 0;
                                return (
                                  <TableRow key={`subscription-${issueCount}`}>
                                    <TableCell className="font-medium">{issueCount}</TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={currentPrice}
                                        onChange={(e) => {
                                          const newPrice = parseFloat(e.target.value) || 0;
                                          const updatedPricing = {
                                            ...adSize.subscription_pricing_per_issue,
                                            [issueCount.toString()]: newPrice
                                          };
                                          handleUpdateIssuePricing(adSize.id, 'subscription_pricing_per_issue', updatedPricing);
                                        }}
                                        className="w-full h-8"
                                      />
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t">
                      <Button 
                        onClick={() => saveIssuePricing(adSize.id)}
                        className="w-full"
                        variant={tempPricingUpdates[adSize.id] ? "default" : "outline"}
                        disabled={!tempPricingUpdates[adSize.id]}
                      >
                        {tempPricingUpdates[adSize.id] ? "Save Changes" : "No Changes"} - {adSize.name} Pricing
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IssuePricingManagement;