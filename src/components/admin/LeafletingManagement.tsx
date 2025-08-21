import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  FileText, 
  Calendar, 
  Clock 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { leafletAreas, leafletSizes, LeafletArea, LeafletSize } from '@/data/leafletingPricing';

interface LeafletingManagementProps {
  onStatsUpdate?: () => void;
}

const LeafletingManagement: React.FC<LeafletingManagementProps> = ({ onStatsUpdate }) => {
  const [activeTab, setActiveTab] = useState('areas');
  const [editingArea, setEditingArea] = useState<LeafletArea | null>(null);
  const [editingSize, setEditingSize] = useState<LeafletSize | null>(null);
  const [isAreaDialogOpen, setIsAreaDialogOpen] = useState(false);
  const [isSizeDialogOpen, setIsSizeDialogOpen] = useState(false);
  
  const { toast } = useToast();

  // Mock data - in real implementation, this would come from Supabase
  const [areas, setAreas] = useState<LeafletArea[]>(leafletAreas);
  const [sizes, setSizes] = useState<LeafletSize[]>(leafletSizes);

  const handleSaveArea = (area: LeafletArea) => {
    if (editingArea) {
      setAreas(areas.map(a => a.id === area.id ? area : a));
      toast({ title: "Area updated successfully" });
    } else {
      setAreas([...areas, { ...area, id: `leaflet-area-${Date.now()}` }]);
      toast({ title: "Area created successfully" });
    }
    setIsAreaDialogOpen(false);
    setEditingArea(null);
    onStatsUpdate?.();
  };

  const handleSaveSize = (size: LeafletSize) => {
    if (editingSize) {
      setSizes(sizes.map(s => s.id === size.id ? size : s));
      toast({ title: "Size updated successfully" });
    } else {
      setSizes([...sizes, { ...size, id: `size-${Date.now()}` }]);
      toast({ title: "Size created successfully" });
    }
    setIsSizeDialogOpen(false);
    setEditingSize(null);
    onStatsUpdate?.();
  };

  const handleDeleteArea = (areaId: string) => {
    setAreas(areas.filter(a => a.id !== areaId));
    toast({ title: "Area deleted successfully", variant: "destructive" });
    onStatsUpdate?.();
  };

  const handleDeleteSize = (sizeId: string) => {
    setSizes(sizes.filter(s => s.id !== sizeId));
    toast({ title: "Size deleted successfully", variant: "destructive" });
    onStatsUpdate?.();
  };

  const AreaDialog = () => {
    const [formData, setFormData] = useState({
      areaNumber: editingArea?.areaNumber || 0,
      name: editingArea?.name || '',
      postcodes: editingArea?.postcodes || '',
      bimonthlyCirculation: editingArea?.bimonthlyCirculation || 0,
      priceWithVat: editingArea?.priceWithVat || 0,
      schedule: editingArea?.schedule || [
        { month: 'September 2025', copyDeadline: '', printDeadline: '', delivery: '', circulation: 70600 },
        { month: 'November 2025', copyDeadline: '', printDeadline: '', delivery: '', circulation: 70600 },
        { month: 'January 2026', copyDeadline: '', printDeadline: '', delivery: '', circulation: 70600 }
      ]
    });

    return (
      <Dialog open={isAreaDialogOpen} onOpenChange={setIsAreaDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingArea ? 'Edit Distribution Area' : 'Add New Distribution Area'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="areaNumber">Area Number</Label>
              <Input
                id="areaNumber"
                type="number"
                value={formData.areaNumber}
                onChange={(e) => setFormData({...formData, areaNumber: parseInt(e.target.value)})}
              />
            </div>
            
            <div>
              <Label htmlFor="name">Area Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="postcodes">Postcodes</Label>
              <Input
                id="postcodes"
                value={formData.postcodes}
                onChange={(e) => setFormData({...formData, postcodes: e.target.value})}
                placeholder="SO15, SO16, SO17"
              />
            </div>
            
            <div>
              <Label htmlFor="circulation">Bi-monthly Circulation</Label>
              <Input
                id="circulation"
                type="number"
                value={formData.bimonthlyCirculation}
                onChange={(e) => setFormData({...formData, bimonthlyCirculation: parseInt(e.target.value)})}
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="price">Price (£ + VAT)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.priceWithVat}
                onChange={(e) => setFormData({...formData, priceWithVat: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Schedule Management</h3>
            <div className="space-y-4">
              {formData.schedule.map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">{item.month}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label>Copy Deadline</Label>
                        <Input
                          value={item.copyDeadline}
                          onChange={(e) => {
                            const newSchedule = [...formData.schedule];
                            newSchedule[index].copyDeadline = e.target.value;
                            setFormData({...formData, schedule: newSchedule});
                          }}
                          placeholder="19 Sept"
                        />
                      </div>
                      <div>
                        <Label>Print Deadline</Label>
                        <Input
                          value={item.printDeadline}
                          onChange={(e) => {
                            const newSchedule = [...formData.schedule];
                            newSchedule[index].printDeadline = e.target.value;
                            setFormData({...formData, schedule: newSchedule});
                          }}
                          placeholder="19 Sept"
                        />
                      </div>
                      <div>
                        <Label>Delivery</Label>
                        <Input
                          value={item.delivery}
                          onChange={(e) => {
                            const newSchedule = [...formData.schedule];
                            newSchedule[index].delivery = e.target.value;
                            setFormData({...formData, schedule: newSchedule});
                          }}
                          placeholder="7 Oct"
                        />
                      </div>
                      <div>
                        <Label>Circulation</Label>
                        <Input
                          type="number"
                          value={item.circulation}
                          onChange={(e) => {
                            const newSchedule = [...formData.schedule];
                            newSchedule[index].circulation = parseInt(e.target.value);
                            setFormData({...formData, schedule: newSchedule});
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsAreaDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleSaveArea(formData as LeafletArea)}>
              Save Area
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const SizeDialog = () => {
    const [formData, setFormData] = useState({
      label: editingSize?.label || '',
      description: editingSize?.description || ''
    });

    return (
      <Dialog open={isSizeDialogOpen} onOpenChange={setIsSizeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSize ? 'Edit Leaflet Size' : 'Add New Leaflet Size'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Size Label</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({...formData, label: e.target.value})}
                placeholder="A5 single sided"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Standard A5 leaflet, single sided"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsSizeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleSaveSize(formData as LeafletSize)}>
              Save Size
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-community-navy">
            Leafleting Service Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage distribution areas, sizes, pricing and schedules
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="areas" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Distribution Areas
          </TabsTrigger>
          <TabsTrigger value="sizes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Leaflet Sizes
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Campaign Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="areas" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Distribution Areas</CardTitle>
                <Button 
                  onClick={() => {
                    setEditingArea(null);
                    setIsAreaDialogOpen(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Area
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Area #</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Postcodes</TableHead>
                    <TableHead>Circulation</TableHead>
                    <TableHead>Price (£)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {areas.map((area) => (
                    <TableRow key={area.id}>
                      <TableCell>{area.areaNumber}</TableCell>
                      <TableCell className="font-medium">{area.name}</TableCell>
                      <TableCell>{area.postcodes}</TableCell>
                      <TableCell>{area.bimonthlyCirculation.toLocaleString()}</TableCell>
                      <TableCell>£{area.priceWithVat}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingArea(area);
                              setIsAreaDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteArea(area.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sizes" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Leaflet Sizes</CardTitle>
                <Button 
                  onClick={() => {
                    setEditingSize(null);
                    setIsSizeDialogOpen(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Size
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Size Label</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sizes.map((size) => (
                    <TableRow key={size.id}>
                      <TableCell className="font-medium">{size.label}</TableCell>
                      <TableCell>{size.description}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingSize(size);
                              setIsSizeDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteSize(size.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Duration Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">1 Issue = 2 months</h4>
                      <p className="text-sm text-gray-600">Single issue campaign</p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">3 Issues = 6 months</h4>
                      <p className="text-sm text-gray-600">Standard campaign</p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Volume Discounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">2+ Areas</h4>
                      <p className="text-sm text-gray-600">10% discount for multi-area bookings</p>
                    </div>
                    <Badge variant="secondary">10% Off</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <AreaDialog />
      <SizeDialog />
    </div>
  );
};

export default LeafletingManagement;