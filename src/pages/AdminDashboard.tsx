import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CostCalculatorManagement from '@/components/admin/CostCalculatorManagement';
import AlertsManagement from '@/components/admin/AlertsManagement';
import AdPreviewImageManagement from '@/components/admin/AdPreviewImageManagement';
import MagazineEditionsManagement from '@/components/admin/MagazineEditionsManagement';
import { CompetitionsManagement } from '@/components/admin/CompetitionsManagement';
import { CSVImportManagement } from '@/components/admin/CSVImportManagement';
import { EventsManagement } from '@/components/admin/EventsManagement';
import { StoriesManagement } from '@/components/admin/StoriesManagement';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { BusinessEditForm } from '@/components/admin/BusinessEditForm';
import { ClaimRequestsManagement } from '@/components/admin/ClaimRequestsManagement';
import FeaturedAdvertisersManagement from '@/components/admin/FeaturedAdvertisersManagement';
import { User } from '@supabase/supabase-js';
import { Shield, Users, Building2, Calendar, FileText, Upload, Plus, BarChart3, Search, Edit, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [businessCount, setBusinessCount] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState('overview');
  const [isStoryDialogOpen, setIsStoryDialogOpen] = useState(false);
  const [isUserEditDialogOpen, setIsUserEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingBusiness, setEditingBusiness] = useState<any>(null);
  const [isBusinessEditOpen, setIsBusinessEditOpen] = useState(false);
  const [businessSearchTerm, setBusinessSearchTerm] = useState('');
  const [businessSearchOpen, setBusinessSearchOpen] = useState(false);
  const debouncedBusinessSearch = useDebounce(businessSearchTerm, 300);
  const [businessPage, setBusinessPage] = useState(0);
  const BUSINESSES_PER_PAGE = 25;
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

  // Predictive search suggestions query
  const { data: searchSuggestions = [], isLoading: suggestionsLoading } = useQuery({
    queryKey: ['business-suggestions', debouncedBusinessSearch],
    queryFn: async () => {
      if (!debouncedBusinessSearch || debouncedBusinessSearch.length < 2) return [];
      
      const { data } = await supabase
        .from('businesses')
        .select(`
          id,
          name,
          city,
          postcode,
          business_categories (name)
        `)
        .or(`name.ilike.%${debouncedBusinessSearch}%,email.ilike.%${debouncedBusinessSearch}%,postcode.ilike.%${debouncedBusinessSearch}%,city.ilike.%${debouncedBusinessSearch}%`)
        .order('name')
        .limit(20);
      
      return data || [];
    },
    enabled: isAdmin && debouncedBusinessSearch.length >= 2,
  });

  const loadBusinesses = async () => {
    // Get total count first
    const { count } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true });
    
    setBusinessCount(count || 0);

    // Build query with search and pagination
    let query = supabase
      .from('businesses')
      .select(`
        *,
        business_categories (
          name
        )
      `)
      .order('created_at', { ascending: false })
      .range(businessPage * BUSINESSES_PER_PAGE, (businessPage + 1) * BUSINESSES_PER_PAGE - 1);

    // Apply search filter if term exists
    if (businessSearchTerm.trim()) {
      query = query.or(`name.ilike.%${businessSearchTerm}%,email.ilike.%${businessSearchTerm}%,postcode.ilike.%${businessSearchTerm}%,city.ilike.%${businessSearchTerm}%`);
    }

    const { data } = await query;
    
    if (data) {
      setBusinesses(data);
    }
  };

  const loadUsers = async () => {
    try {
      // First get all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        throw profilesError;
      }

      // Then get all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at');

      if (rolesError) {
        console.error('Error loading user roles:', rolesError);
        // Continue even if roles fail to load
      }

      // Combine the data
      const combinedUsers = (profilesData || []).map(profile => ({
        ...profile,
        user_roles: (rolesData || []).filter(role => role.user_id === profile.user_id)
      }));

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
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

  // Reload businesses when page changes
  useEffect(() => {
    if (isAdmin) {
      loadBusinesses();
    }
  }, [businessPage]);

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

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Dashboard Overview</h2>
              <p className="text-muted-foreground">Welcome to the admin dashboard. Manage all aspects of your platform from here.</p>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Building2 className="h-8 w-8 text-primary" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Businesses</p>
                      <p className="text-2xl font-bold">{businesses.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-primary" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold">{users.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Stories</p>
                      <p className="text-2xl font-bold">{stories.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'businesses':
        const totalPages = Math.ceil(businessCount / BUSINESSES_PER_PAGE);
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Business Management</h2>
              <p className="text-muted-foreground">Manage business listings. Total: {businessCount.toLocaleString()} businesses</p>
            </div>
            
            {/* Search and Add */}
            <div className="flex gap-4 flex-wrap items-center">
              <Popover open={businessSearchOpen} onOpenChange={setBusinessSearchOpen}>
                <PopoverTrigger asChild>
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                    <Input
                      placeholder="Type to search businesses..."
                      value={businessSearchTerm}
                      onChange={(e) => {
                        setBusinessSearchTerm(e.target.value);
                        setBusinessPage(0);
                        if (e.target.value.length >= 2) {
                          setBusinessSearchOpen(true);
                        }
                      }}
                      onFocus={() => {
                        if (businessSearchTerm.length >= 2) {
                          setBusinessSearchOpen(true);
                        }
                      }}
                      className="pl-10 pr-10"
                    />
                    {businessSearchTerm && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBusinessSearchTerm('');
                          setBusinessPage(0);
                          setBusinessSearchOpen(false);
                          loadBusinesses();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                  <Command shouldFilter={false}>
                    <CommandList>
                      {suggestionsLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                        </div>
                      ) : searchSuggestions.length === 0 ? (
                        <CommandEmpty>
                          {debouncedBusinessSearch.length < 2 
                            ? "Type at least 2 characters to search..."
                            : "No businesses found."
                          }
                        </CommandEmpty>
                      ) : (
                        <CommandGroup heading={`${searchSuggestions.length} result${searchSuggestions.length === 1 ? '' : 's'}`}>
                          {searchSuggestions.map((business: any) => (
                            <CommandItem
                              key={business.id}
                              value={business.name}
                              onSelect={() => {
                                setBusinessSearchTerm(business.name);
                                setBusinessSearchOpen(false);
                                setBusinessPage(0);
                                loadBusinesses();
                              }}
                              className="flex items-center justify-between py-3 cursor-pointer"
                            >
                              <div className="flex flex-col gap-1">
                                <span className="font-medium">{business.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {[business.city, business.postcode].filter(Boolean).join(' • ') || 'No location'}
                                </span>
                              </div>
                              {business.business_categories?.name && (
                                <Badge variant="secondary" className="text-xs ml-2">
                                  {business.business_categories.name}
                                </Badge>
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              <Button onClick={loadBusinesses}>
                <Search className="h-4 w-4 mr-2" /> Search
              </Button>
              <Button onClick={() => { setEditingBusiness(null); setIsBusinessEditOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Add Business
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Business Listings</CardTitle>
              </CardHeader>
              <CardContent>
                {businesses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No businesses found.</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Business Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {businesses.map((business) => (
                            <TableRow key={business.id}>
                              <TableCell 
                                className="font-medium cursor-pointer hover:text-primary"
                                onClick={() => { setEditingBusiness(business); setIsBusinessEditOpen(true); }}
                              >
                                {business.name}
                              </TableCell>
                              <TableCell>{business.business_categories?.name || '-'}</TableCell>
                              <TableCell>{business.city || business.postcode || '-'}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${business.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {business.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button size="sm" variant="outline" onClick={() => { setEditingBusiness(business); setIsBusinessEditOpen(true); }}>
                                  <Edit className="h-4 w-4 mr-1" /> Edit
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        Page {businessPage + 1} of {totalPages || 1}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={businessPage === 0} onClick={() => setBusinessPage(p => p - 1)}>
                          <ChevronLeft className="h-4 w-4" /> Previous
                        </Button>
                        <Button variant="outline" size="sm" disabled={businessPage >= totalPages - 1} onClick={() => setBusinessPage(p => p + 1)}>
                          Next <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Business Edit/Add Dialog */}
            <Dialog open={isBusinessEditOpen} onOpenChange={setIsBusinessEditOpen}>
              <DialogContent className="max-w-3xl max-h-[90vh]">
                <BusinessEditForm
                  business={editingBusiness}
                  onClose={() => setIsBusinessEditOpen(false)}
                  onSave={() => { setIsBusinessEditOpen(false); loadBusinesses(); }}
                />
              </DialogContent>
            </Dialog>
          </div>
        );

      case 'claim-requests':
        return <ClaimRequestsManagement />;

      case 'users':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">User Management</h2>
              <p className="text-muted-foreground">Manage user roles, permissions, and agency memberships.</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>User Roles & Agency Management</CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No users found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Display Name</TableHead>
                          <TableHead>User ID</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Agency Status</TableHead>
                          <TableHead>Agency Name</TableHead>
                          <TableHead>Discount %</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.user_id}>
                            <TableCell className="font-medium">
                              {user.display_name || 'No name'}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {user.user_id?.slice(0, 8)}...
                            </TableCell>
                            <TableCell>
                              {user.user_roles && user.user_roles.length > 0 ? (
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  user.user_roles[0].role === 'admin' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {user.user_roles[0].role}
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                  user
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.is_agency_member 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.is_agency_member ? 'Agency Member' : 'Regular User'}
                              </span>
                            </TableCell>
                            <TableCell>
                              {user.agency_name || '-'}
                            </TableCell>
                            <TableCell>
                              {user.is_agency_member ? `${user.agency_discount_percent || 0}%` : '-'}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingUser(user);
                                  setIsUserEditDialogOpen(true);
                                }}
                              >
                                Edit
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
          </div>
        );

      case 'stories':
        return <StoriesManagement />;

      case 'calculator':
        return <CostCalculatorManagement />;

      case 'alerts':
        return <AlertsManagement />;

      case 'ad-preview-images':
        return <AdPreviewImageManagement />;

      case 'magazine-editions':
        return <MagazineEditionsManagement />;

      case 'featured-advertisers':
        return <FeaturedAdvertisersManagement />;

      case 'competitions':
        return <CompetitionsManagement />;

      case 'csv-import':
        return <CSVImportManagement />;

      case 'events':
        return <EventsManagement />;

      default:
        return <div>Section not found</div>;
    }
  };

  const updateUserAgencyInfo = async (userId: string, agencyData: {
    is_agency_member: boolean;
    agency_discount_percent: number;
    agency_name: string;
  }) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(agencyData)
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Database error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "User agency information updated successfully."
      });
      setIsUserEditDialogOpen(false);
      setEditingUser(null);
      loadUsers();
    }
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const discountType = formData.get('discount_type') as string;
    
    const agencyData = {
      discount_type: discountType,
      is_agency_member: discountType === 'agency',
      agency_discount_percent: parseFloat(formData.get('agency_discount_percent') as string) || 0,
      agency_name: formData.get('agency_name') as string || '',
    };

    updateUserAgencyInfo(editingUser.user_id, agencyData);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b bg-background px-6 py-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Manage your platform with ease
                </p>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 bg-muted/10">
            {renderContent()}
          </main>
        </div>

        {/* User Edit Dialog */}
        <Dialog open={isUserEditDialogOpen} onOpenChange={setIsUserEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User Agency Information</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>User: {editingUser?.display_name || 'Unknown'}</Label>
                <p className="text-sm text-muted-foreground font-mono">
                  {editingUser?.user_id}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discount_type">User Status</Label>
                <Select 
                  name="discount_type" 
                  defaultValue={editingUser?.discount_type || 'none'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Regular User</SelectItem>
                    <SelectItem value="agency">Agency Member</SelectItem>
                    <SelectItem value="charity">Charity</SelectItem>
                    <SelectItem value="discretionary">Discretionary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agency_name">Agency Name</Label>
                <Input
                  name="agency_name"
                  defaultValue={editingUser?.agency_name || ''}
                  placeholder="Enter agency name (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agency_discount_percent">Discount Percentage</Label>
                <Input
                  name="agency_discount_percent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  defaultValue={editingUser?.agency_discount_percent || 0}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">
                  Enter percentage (0-100). Only applies when user has a discount status.
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Update User
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsUserEditDialogOpen(false);
                    setEditingUser(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;