
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PricingManagement from '@/components/PricingManagement';
import CostCalculatorManagement from '@/components/admin/CostCalculatorManagement';
import { User } from '@supabase/supabase-js';
import { Shield, Users, Building2, Calendar, FileText, Upload, Plus } from 'lucide-react';

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [isStoryDialogOpen, setIsStoryDialogOpen] = useState(false);
  const [storyForm, setStoryForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    area: '',
    featured_image_url: '',
    author_name: ''
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);

      // Check if user has admin role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single();

      if (!roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges to access this page.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    };

    checkAdminAuth();
  }, [navigate, toast]);

  const loadBusinesses = async () => {
    const { data } = await supabase
      .from('businesses')
      .select(`
        *,
        business_categories (
          name
        )
      `)
      .order('created_at', { ascending: false });
    
    if (data) {
      setBusinesses(data);
    }
  };

  const loadUsers = async () => {
    const { data } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        role,
        created_at
      `)
      .order('created_at', { ascending: false });
    
    if (data) {
      setUsers(data);
    }
  };

  const loadStories = async () => {
    const { data } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setStories(data);
    }
  };

  const createStory = async () => {
    const { error } = await supabase
      .from('stories')
      .insert([{
        ...storyForm,
        author_id: user?.id
      }]);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Story created successfully."
      });
      setIsStoryDialogOpen(false);
      setStoryForm({
        title: '',
        content: '',
        excerpt: '',
        category: '',
        area: '',
        featured_image_url: '',
        author_name: ''
      });
      loadStories();
    }
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const stories = lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const story: any = {};
      headers.forEach((header, index) => {
        story[header] = values[index] || '';
      });
      story.author_id = user?.id;
      return story;
    });

    const { error } = await supabase
      .from('stories')
      .insert(stories);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Successfully uploaded ${stories.length} stories.`
      });
      loadStories();
    }
  };

  const toggleStoryStatus = async (storyId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('stories')
      .update({ 
        is_published: !currentStatus,
        published_at: !currentStatus ? new Date().toISOString() : null
      })
      .eq('id', storyId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Story ${!currentStatus ? 'published' : 'unpublished'} successfully.`
      });
      loadStories();
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadBusinesses();
      loadUsers();
      loadStories();
    }
  }, [isAdmin]);

  const toggleBusinessStatus = async (businessId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('businesses')
      .update({ is_active: !currentStatus })
      .eq('id', businessId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Business ${!currentStatus ? 'activated' : 'deactivated'} successfully.`
      });
      loadBusinesses();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-community-green mr-2" />
              <h1 className="text-3xl font-heading font-bold">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-gray-600">
              Manage businesses, users, and platform content
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Businesses</p>
                    <p className="text-2xl font-bold text-gray-900">{businesses.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Stories</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stories.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="businesses" className="mb-8">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="businesses">Business Management</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="stories">Story Management</TabsTrigger>
              <TabsTrigger value="pricing">Pricing Management</TabsTrigger>
              <TabsTrigger value="calculator">Cost Calculator</TabsTrigger>
            </TabsList>

            <TabsContent value="businesses">
              <Card>
                <CardHeader>
                  <CardTitle>Business Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  {businesses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No business listings found.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Business Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {businesses.map((business) => (
                            <TableRow key={business.id}>
                              <TableCell className="font-medium">{business.name}</TableCell>
                              <TableCell>
                                {business.business_categories?.name || 'No category'}
                              </TableCell>
                              <TableCell>
                                {business.city ? `${business.city}${business.postcode ? ', ' + business.postcode : ''}` : 'No location'}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  business.is_active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {business.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </TableCell>
                              <TableCell>
                                {new Date(business.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant={business.is_active ? "destructive" : "default"}
                                  size="sm"
                                  onClick={() => toggleBusinessStatus(business.id, business.is_active)}
                                >
                                  {business.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Roles</CardTitle>
                </CardHeader>
                <CardContent>
                  {users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No users found.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((userRole) => (
                            <TableRow key={userRole.user_id}>
                              <TableCell className="font-mono text-sm">
                                {userRole.user_id}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  userRole.role === 'admin' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {userRole.role}
                                </span>
                              </TableCell>
                              <TableCell>
                                {new Date(userRole.created_at).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stories">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Story Management</span>
                    <div className="flex gap-2">
                      <Dialog open={isStoryDialogOpen} onOpenChange={setIsStoryDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Create Story
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Create New Story</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="title">Title</Label>
                              <Input
                                id="title"
                                value={storyForm.title}
                                onChange={(e) => setStoryForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Story title"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="excerpt">Excerpt</Label>
                              <Textarea
                                id="excerpt"
                                value={storyForm.excerpt}
                                onChange={(e) => setStoryForm(prev => ({ ...prev, excerpt: e.target.value }))}
                                placeholder="Brief excerpt"
                                rows={2}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Select 
                                  value={storyForm.category}
                                  onValueChange={(value) => setStoryForm(prev => ({ ...prev, category: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="news">News</SelectItem>
                                    <SelectItem value="community">Community</SelectItem>
                                    <SelectItem value="events">Events</SelectItem>
                                    <SelectItem value="business">Business</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="area">Area</Label>
                                <Input
                                  id="area"
                                  value={storyForm.area}
                                  onChange={(e) => setStoryForm(prev => ({ ...prev, area: e.target.value }))}
                                  placeholder="Area/Location"
                                />
                              </div>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="author_name">Author Name</Label>
                              <Input
                                id="author_name"
                                value={storyForm.author_name}
                                onChange={(e) => setStoryForm(prev => ({ ...prev, author_name: e.target.value }))}
                                placeholder="Author name"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="featured_image_url">Featured Image URL</Label>
                              <Input
                                id="featured_image_url"
                                value={storyForm.featured_image_url}
                                onChange={(e) => setStoryForm(prev => ({ ...prev, featured_image_url: e.target.value }))}
                                placeholder="https://..."
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="content">Content</Label>
                              <Textarea
                                id="content"
                                value={storyForm.content}
                                onChange={(e) => setStoryForm(prev => ({ ...prev, content: e.target.value }))}
                                placeholder="Story content"
                                rows={8}
                              />
                            </div>
                            <Button onClick={createStory} className="w-full">
                              Create Story
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <div className="relative">
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleCSVUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4 mr-1" />
                          Upload CSV
                        </Button>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stories.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No stories found. Create your first story or upload via CSV.</p>
                      <p className="text-sm mt-2">CSV format: title,content,excerpt,category,area,featured_image_url,author_name</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Area</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stories.map((story) => (
                            <TableRow key={story.id}>
                              <TableCell className="font-medium">{story.title}</TableCell>
                              <TableCell>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                  {story.category}
                                </span>
                              </TableCell>
                              <TableCell>{story.area}</TableCell>
                              <TableCell>{story.author_name || 'Unknown'}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  story.is_published 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {story.is_published ? 'Published' : 'Draft'}
                                </span>
                              </TableCell>
                              <TableCell>
                                {new Date(story.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant={story.is_published ? "outline" : "default"}
                                  size="sm"
                                  onClick={() => toggleStoryStatus(story.id, story.is_published)}
                                >
                                  {story.is_published ? 'Unpublish' : 'Publish'}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing">
              <PricingManagement />
            </TabsContent>

            <TabsContent value="calculator">
              <CostCalculatorManagement />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
