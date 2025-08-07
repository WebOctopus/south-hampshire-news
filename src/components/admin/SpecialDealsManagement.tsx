import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Edit, Gift, Eye } from 'lucide-react';

interface SpecialDeal {
  id: string;
  name: string;
  description: string;
  deal_type: string;
  deal_value: number;
  min_areas: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function SpecialDealsManagement() {
  const [specialDeals, setSpecialDeals] = useState<SpecialDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadSpecialDeals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('special_deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSpecialDeals(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load special deals: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpecialDeals();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (validUntil: string) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  const getStatusBadge = (deal: SpecialDeal) => {
    if (!deal.is_active) {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          Inactive
        </Badge>
      );
    }
    
    if (isExpired(deal.valid_until)) {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800">
          Expired
        </Badge>
      );
    }
    
    return (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Active
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Special Deals</h2>
          <p className="text-muted-foreground">Quick view of all special deals and promotions.</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading special deals...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Special Deals</h2>
          <p className="text-muted-foreground">Quick view of all special deals and promotions.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => window.location.hash = '#calculator-subscriptions'}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Manage Deals
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Gift className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Deals</p>
                <p className="text-2xl font-bold">{specialDeals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Deals</p>
                <p className="text-2xl font-bold">
                  {specialDeals.filter(deal => deal.is_active && !isExpired(deal.valid_until)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Gift className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Expired/Inactive</p>
                <p className="text-2xl font-bold">
                  {specialDeals.filter(deal => !deal.is_active || isExpired(deal.valid_until)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Special Deals ({specialDeals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {specialDeals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No special deals found.</p>
              <p className="text-sm mt-2">Create deals in the Subscription Settings section.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Min Areas</TableHead>
                    <TableHead>Valid Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {specialDeals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{deal.name}</div>
                          {deal.description && (
                            <div className="text-sm text-muted-foreground">{deal.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {deal.deal_type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {deal.deal_type === 'percentage' ? `${deal.deal_value}%` : `£${deal.deal_value}`}
                      </TableCell>
                      <TableCell>{deal.min_areas}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {deal.valid_from && deal.valid_until ? (
                            <>
                              <div>From: {formatDate(deal.valid_from)}</div>
                              <div>Until: {formatDate(deal.valid_until)}</div>
                            </>
                          ) : (
                            'No expiry'
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(deal)}
                      </TableCell>
                      <TableCell>
                        {formatDate(deal.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}