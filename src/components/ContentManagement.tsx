import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { 
  Settings, 
  Globe, 
  Navigation, 
  Palette, 
  Layout, 
  Image, 
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save
} from 'lucide-react';

interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: string;
  description: string;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  created_at: string;
  template: string;
}

interface ComponentSetting {
  id: string;
  component_name: string;
  is_enabled: boolean;
  settings: any;
}

const ContentManagement = () => {
  const [siteSettings, setSiteSettings] = useState<SiteSetting[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [componentSettings, setComponentSettings] = useState<ComponentSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSetting, setEditingSetting] = useState<SiteSetting | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadSiteSettings(),
      loadPages(),
      loadComponentSettings()
    ]);
    setLoading(false);
  };

  const loadSiteSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('setting_key');
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load site settings",
        variant: "destructive"
      });
    } else {
      setSiteSettings(data || []);
    }
  };

  const loadPages = async () => {
    const { data, error } = await supabase
      .from('pages')
      .select('id, title, slug, is_published, created_at, template')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load pages",
        variant: "destructive"
      });
    } else {
      setPages(data || []);
    }
  };

  const loadComponentSettings = async () => {
    const { data, error } = await supabase
      .from('component_settings')
      .select('*')
      .order('component_name');
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load component settings",
        variant: "destructive"
      });
    } else {
      setComponentSettings(data || []);
    }
  };

  const updateSiteSetting = async (setting: SiteSetting) => {
    const { error } = await supabase
      .from('site_settings')
      .update({
        setting_value: setting.setting_value,
      })
      .eq('id', setting.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Setting updated successfully"
      });
      loadSiteSettings();
      setIsDialogOpen(false);
      setEditingSetting(null);
    }
  };

  const toggleComponentStatus = async (componentId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('component_settings')
      .update({ is_enabled: !currentStatus })
      .eq('id', componentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update component status",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Component ${!currentStatus ? 'enabled' : 'disabled'} successfully`
      });
      loadComponentSettings();
    }
  };

  const togglePageStatus = async (pageId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('pages')
      .update({ is_published: !currentStatus })
      .eq('id', pageId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update page status",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Page ${!currentStatus ? 'published' : 'unpublished'} successfully`
      });
      loadPages();
    }
  };

  const renderSettingInput = (setting: SiteSetting) => {
    const value = typeof setting.setting_value === 'string' 
      ? setting.setting_value.replace(/"/g, '') 
      : setting.setting_value;

    switch (setting.setting_type) {
      case 'boolean':
        return (
          <Switch
            checked={value === true || value === 'true'}
            onCheckedChange={(checked) => setEditingSetting({
              ...setting,
              setting_value: checked
            })}
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => setEditingSetting({
              ...setting,
              setting_value: e.target.value
            })}
            rows={4}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => setEditingSetting({
              ...setting,
              setting_value: parseInt(e.target.value)
            })}
          />
        );
      default:
        return (
          <Input
            type={setting.setting_type === 'email' ? 'email' : 'text'}
            value={value}
            onChange={(e) => setEditingSetting({
              ...setting,
              setting_value: e.target.value
            })}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div>Loading content management...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-heading font-bold">Content Management</h2>
      </div>

      <Tabs defaultValue="site-settings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="site-settings" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Site Settings
          </TabsTrigger>
          <TabsTrigger value="pages" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="components" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Components
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme
          </TabsTrigger>
        </TabsList>

        <TabsContent value="site-settings">
          <Card>
            <CardHeader>
              <CardTitle>Global Site Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {siteSettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium capitalize">
                        {setting.setting_key.replace(/_/g, ' ')}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {setting.description}
                      </p>
                      <p className="text-sm mt-1">
                        Current: {typeof setting.setting_value === 'string' 
                          ? setting.setting_value.replace(/"/g, '') 
                          : String(setting.setting_value)}
                      </p>
                    </div>
                    <Dialog open={isDialogOpen && editingSetting?.id === setting.id} onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (!open) setEditingSetting(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingSetting(setting)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit {setting.setting_key.replace(/_/g, ' ')}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>{setting.description}</Label>
                            {editingSetting && renderSettingInput(editingSetting)}
                          </div>
                          <Button 
                            onClick={() => editingSetting && updateSiteSetting(editingSetting)}
                            className="w-full"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Page Management</span>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Page
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">{page.title}</TableCell>
                      <TableCell>/{page.slug}</TableCell>
                      <TableCell>{page.template}</TableCell>
                      <TableCell>
                        <Badge variant={page.is_published ? "default" : "secondary"}>
                          {page.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(page.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePageStatus(page.id, page.is_published)}
                          >
                            {page.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
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

        <TabsContent value="components">
          <Card>
            <CardHeader>
              <CardTitle>Component Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {componentSettings.map((component) => (
                  <div key={component.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium capitalize">
                        {component.component_name.replace(/_/g, ' ')}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {component.is_enabled ? 'Currently enabled' : 'Currently disabled'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={component.is_enabled}
                        onCheckedChange={() => toggleComponentStatus(component.id, component.is_enabled)}
                      />
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Theme Customization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Colors</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Primary Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input type="color" value="#059669" className="w-16 h-10" />
                        <Input value="#059669" />
                      </div>
                    </div>
                    <div>
                      <Label>Secondary Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input type="color" value="#0f172a" className="w-16 h-10" />
                        <Input value="#0f172a" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Typography</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Heading Font</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select font" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inter">Inter</SelectItem>
                          <SelectItem value="roboto">Roboto</SelectItem>
                          <SelectItem value="poppins">Poppins</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Body Font</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select font" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inter">Inter</SelectItem>
                          <SelectItem value="roboto">Roboto</SelectItem>
                          <SelectItem value="opensans">Open Sans</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Theme Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManagement;