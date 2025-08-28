import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  MapPin, 
  FileText, 
  Calendar, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import {
  useLeafletAreas,
  useLeafletCampaignDurations,
  type LeafletArea,
  type LeafletDuration
} from '@/hooks/useLeafletData';

interface LeafletingManagementProps {
  onStatsUpdate?: () => void;
}

const LeafletingManagement: React.FC<LeafletingManagementProps> = ({ onStatsUpdate }) => {
  const [activeTab, setActiveTab] = useState('areas');
  
  // Supabase hooks
  const { data: areas = [], isLoading: areasLoading, isError: areasError } = useLeafletAreas();
  const { data: durations = [], isLoading: durationsLoading, isError: durationsError } = useLeafletCampaignDurations();

  const isLoading = areasLoading || durationsLoading;
  const hasError = areasError || durationsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading leafleting data...
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
        <p className="text-lg font-medium text-destructive mb-2">Error Loading Data</p>
        <p className="text-sm text-muted-foreground">Failed to load leafleting management data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-community-navy">
            Leafleting Service Management
          </h2>
          <p className="text-gray-600 mt-1">
            View distribution areas and campaign settings (Read-only)
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="areas" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Distribution Areas ({areas.length})
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Campaign Settings ({durations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="areas" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribution Areas</CardTitle>
            </CardHeader>
            <CardContent>
              {areas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No distribution areas configured yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Area #</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Households</TableHead>
                      <TableHead>Price per 1000</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {areas.map((area) => (
                      <TableRow key={area.id}>
                        <TableCell className="font-medium">{area.area_number}</TableCell>
                        <TableCell>{area.name}</TableCell>
                        <TableCell>{area.household_count?.toLocaleString() || 'N/A'}</TableCell>
                        <TableCell>£{area.price_per_thousand}</TableCell>
                        <TableCell>
                          <Badge variant={area.is_active ? "default" : "secondary"}>
                            {area.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Duration Settings</CardTitle>
            </CardHeader>
            <CardContent>
              {durations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No campaign durations configured yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Price Multiplier</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {durations.map((duration) => (
                      <TableRow key={duration.id}>
                        <TableCell className="font-medium">{duration.name}</TableCell>
                        <TableCell>{duration.months} month{duration.months > 1 ? 's' : ''}</TableCell>
                        <TableCell>×1.0</TableCell>
                        <TableCell>
                          <Badge variant={duration.is_active ? "default" : "secondary"}>
                            {duration.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <h4 className="font-medium text-sm">Read-Only Mode</h4>
            <p className="text-sm text-muted-foreground mt-1">
              This interface currently displays data in read-only mode. Full management capabilities will be available in a future update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeafletingManagement;