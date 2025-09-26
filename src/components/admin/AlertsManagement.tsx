import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  message: string;
  alert_type: 'deadline' | 'premium_slot';
  is_active: boolean;
  priority: number;
  badge_text: string | null;
  badge_color: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

const AlertsManagement = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [alertForm, setAlertForm] = useState({
    title: '',
    message: '',
    alert_type: 'premium_slot' as 'deadline' | 'premium_slot',
    is_active: true,
    priority: 0,
    badge_text: '',
    badge_color: 'red',
    expires_at: ''
  });
  const { toast } = useToast();

  const badgeColors = [
    { value: 'red', label: 'Red', class: 'bg-red-600' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-600' },
    { value: 'yellow', label: 'Yellow', class: 'bg-yellow-600' },
    { value: 'green', label: 'Green', class: 'bg-green-600' },
    { value: 'blue', label: 'Blue', class: 'bg-blue-600' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-600' }
  ];

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('priority', { ascending: true });

      if (error) throw error;
      setAlerts((data || []).map(item => ({
        ...item,
        alert_type: item.alert_type as 'deadline' | 'premium_slot'
      })));
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast({
        title: "Error",
        description: "Failed to load alerts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const resetForm = () => {
    setAlertForm({
      title: '',
      message: '',
      alert_type: 'premium_slot',
      is_active: true,
      priority: 0,
      badge_text: '',
      badge_color: 'red',
      expires_at: ''
    });
    setEditingAlert(null);
  };

  const handleCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (alert: Alert) => {
    setEditingAlert(alert);
    setAlertForm({
      title: alert.title,
      message: alert.message,
      alert_type: alert.alert_type,
      is_active: alert.is_active,
      priority: alert.priority,
      badge_text: alert.badge_text || '',
      badge_color: alert.badge_color,
      expires_at: alert.expires_at ? new Date(alert.expires_at).toISOString().split('T')[0] : ''
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const alertData = {
        ...alertForm,
        expires_at: alertForm.expires_at ? new Date(alertForm.expires_at).toISOString() : null,
        badge_text: alertForm.badge_text || null
      };

      let error;
      if (editingAlert) {
        ({ error } = await supabase
          .from('alerts')
          .update(alertData)
          .eq('id', editingAlert.id));
      } else {
        ({ error } = await supabase
          .from('alerts')
          .insert([alertData]));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Alert ${editingAlert ? 'updated' : 'created'} successfully`
      });

      setIsDialogOpen(false);
      resetForm();
      loadAlerts();
    } catch (error) {
      console.error('Error saving alert:', error);
      toast({
        title: "Error",
        description: "Failed to save alert",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;

    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alert deleted successfully"
      });

      loadAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast({
        title: "Error",
        description: "Failed to delete alert",
        variant: "destructive"
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Alert ${!currentStatus ? 'activated' : 'deactivated'}`
      });

      loadAlerts();
    } catch (error) {
      console.error('Error updating alert:', error);
      toast({
        title: "Error",
        description: "Failed to update alert",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Alerts Management</h2>
          <p className="text-muted-foreground">Manage deadline alerts and premium slot notifications</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Alert
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No alerts configured yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Badge</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">{alert.title}</TableCell>
                    <TableCell>
                      <Badge variant={alert.alert_type === 'deadline' ? 'destructive' : 'default'}>
                        {alert.alert_type === 'deadline' ? 'Deadline' : 'Premium Slot'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={alert.is_active ? 'default' : 'secondary'}>
                        {alert.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{alert.priority}</TableCell>
                    <TableCell>
                      {alert.badge_text && (
                        <Badge className={`${badgeColors.find(c => c.value === alert.badge_color)?.class} text-white`}>
                          {alert.badge_text}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {alert.expires_at ? new Date(alert.expires_at).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(alert)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant={alert.is_active ? "secondary" : "default"}
                          size="sm"
                          onClick={() => toggleActive(alert.id, alert.is_active)}
                        >
                          {alert.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(alert.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAlert ? 'Edit Alert' : 'Create New Alert'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={alertForm.title}
                  onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
                  placeholder="e.g., DEADLINE ALERT!"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alert_type">Alert Type</Label>
                <Select 
                  value={alertForm.alert_type} 
                  onValueChange={(value) => setAlertForm({ ...alertForm, alert_type: value as 'deadline' | 'premium_slot' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deadline">Deadline Alert</SelectItem>
                    <SelectItem value="premium_slot">Premium Slot Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={alertForm.message}
                onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
                placeholder="Enter the alert message..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={alertForm.priority}
                  onChange={(e) => setAlertForm({ ...alertForm, priority: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="badge_text">Badge Text</Label>
                <Input
                  id="badge_text"
                  value={alertForm.badge_text}
                  onChange={(e) => setAlertForm({ ...alertForm, badge_text: e.target.value })}
                  placeholder="e.g., Urgent"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="badge_color">Badge Color</Label>
                <Select 
                  value={alertForm.badge_color} 
                  onValueChange={(value) => setAlertForm({ ...alertForm, badge_color: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {badgeColors.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${color.class} mr-2`} />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expires_at">Expiry Date (Optional)</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={alertForm.expires_at}
                  onChange={(e) => setAlertForm({ ...alertForm, expires_at: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  checked={alertForm.is_active}
                  onCheckedChange={(checked) => setAlertForm({ ...alertForm, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingAlert ? 'Update' : 'Create'} Alert
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AlertsManagement;