import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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
import EmailTemplatesManagement from '@/components/admin/EmailTemplatesManagement';
import MediaLibraryManagement from '@/components/admin/MediaLibraryManagement';
import ArtworkManagement from '@/components/admin/ArtworkManagement';
import { User } from '@supabase/supabase-js';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Users, Building2, Calendar, FileText, Upload, Plus, BarChart3, Search, Edit, ChevronLeft, ChevronRight, X, Loader2, Trash2, KeyRound, UserPlus } from 'lucide-react';

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [businessCount, setBusinessCount] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});
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
  
  // User management states
  const [isSetPasswordOpen, setIsSetPasswordOpen] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [sendPasswordEmail, setSendPasswordEmail] = useState(false);
  const [userActionLoading, setUserActionLoading] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  // Create user states
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({ email: '', password: '', displayName: '' });
  const [sendCreateEmail, setSendCreateEmail] = useState(false);
  
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
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at');

      if (rolesError) {
        console.error('Error loading user roles:', rolesError);
      }

      const combinedUsers = (profilesData || []).map(profile => ({
        ...profile,
        user_roles: (rolesData || []).filter(role => role.user_id === profile.user_id)
      }));

      setUsers(combinedUsers);

      // Fetch emails via edge function
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: emailData, error: emailError } = await supabase.functions.invoke('admin-manage-user', {
            body: { action: 'list_users_with_email', user_id: 'all' },
          });
          if (!emailError && emailData?.emailMap) {
            setUserEmails(emailData.emailMap);
          }
        }
      } catch (e) {
        console.error('Failed to fetch user emails:', e);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    }
  };

  const invokeAdminAction = async (action: string, userId: string, extraData?: Record<string, any>) => {
    setUserActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-user', {
        body: { action, user_id: userId, ...extraData },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleDeleteUser = async (targetUser: any) => {
    try {
      await invokeAdminAction('delete_user', targetUser.user_id);
      toast({ title: "Success", description: "User deleted successfully." });
      loadUsers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSetPassword = async () => {
    if (!passwordTarget || !newPassword) return;
    try {
      const targetEmail = userEmails[passwordTarget.user_id];
      await invokeAdminAction('set_password', passwordTarget.user_id, { 
        password: newPassword,
        send_email: sendPasswordEmail,
        user_email: targetEmail
      });
      const emailMsg = sendPasswordEmail && targetEmail ? ` Email sent to ${targetEmail}.` : '';
      toast({ title: "Success", description: `Password updated successfully.${emailMsg}` });
      setIsSetPasswordOpen(false);
      setNewPassword('');
      setSendPasswordEmail(false);
      setPasswordTarget(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdateRole = async (targetUser: any, newRole: string) => {
    try {
      await invokeAdminAction('update_role', targetUser.user_id, { role: newRole });
      toast({ title: "Success", description: `Role updated to ${newRole}.` });
      loadUsers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleCreateUser = async () => {
    if (!createUserForm.email || !createUserForm.password) return;
    setUserActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-user', {
        body: {
          action: 'create_user',
          user_id: 'new',
          email: createUserForm.email,
          password: createUserForm.password,
          display_name: createUserForm.displayName || undefined,
          send_email: sendCreateEmail,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const emailMsg = sendCreateEmail ? ` Credentials sent to ${createUserForm.email}.` : '';
      toast({ title: "Success", description: `User created successfully.${emailMsg}` });
      setIsCreateUserOpen(false);
      setCreateUserForm({ email: '', password: '', displayName: '' });
      setSendCreateEmail(false);
      loadUsers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUserActionLoading(false);
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
              <p className="text-muted-foreground">Manage user roles, permissions, and agency memberships. These settings control access to the booking & quote dashboard.</p>
            </div>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>User Roles & Agency Management</CardTitle>
                <Button onClick={() => { setCreateUserForm({ email: '', password: '', displayName: '' }); setSendCreateEmail(false); setIsCreateUserOpen(true); }}>
                  <UserPlus className="h-4 w-4 mr-2" /> Create User
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Search by display name or company..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
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
                          <TableHead>Company</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Agency Status</TableHead>
                          <TableHead>Agency Name</TableHead>
                          <TableHead>Discount %</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.filter((u) => {
                          if (!userSearchTerm.trim()) return true;
                          const term = userSearchTerm.toLowerCase();
                          return (u.display_name || '').toLowerCase().includes(term) ||
                                 (u.company || '').toLowerCase().includes(term);
                        }).map((u) => {
                          const currentRole = u.user_roles && u.user_roles.length > 0 ? u.user_roles[0].role : 'user';
                          return (
                            <TableRow key={u.user_id}>
                              <TableCell className="font-medium">
                                {u.display_name || 'No name'}
                              </TableCell>
                              <TableCell>
                                {u.company || '-'}
                              </TableCell>
                              <TableCell className="text-sm">
                                {userEmails[u.user_id] || <span className="text-muted-foreground italic">Loading...</span>}
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={currentRole}
                                  onValueChange={(val) => handleUpdateRole(u, val)}
                                >
                                  <SelectTrigger className="w-[110px] h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  u.is_agency_member 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-muted text-muted-foreground'
                                }`}>
                                  {u.is_agency_member ? 'Agency Member' : 'Regular User'}
                                </span>
                              </TableCell>
                              <TableCell>
                                {u.agency_name || '-'}
                              </TableCell>
                              <TableCell>
                                {u.is_agency_member ? `${u.agency_discount_percent || 0}%` : '-'}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingUser(u);
                                      setIsUserEditDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="h-3 w-3 mr-1" /> Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                              setPasswordTarget(u);
                                      setNewPassword('');
                                      setSendPasswordEmail(false);
                                      setIsSetPasswordOpen(true);
                                    }}
                                  >
                                    <KeyRound className="h-3 w-3 mr-1" /> Password
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive" size="sm">
                                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will permanently delete the account for <strong>{u.display_name || userEmails[u.user_id] || 'this user'}</strong>. 
                                          All their bookings, quotes, and data will be removed. This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteUser(u)}>
                                          Delete User
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Set Password Dialog */}
            <Dialog open={isSetPasswordOpen} onOpenChange={setIsSetPasswordOpen}>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Set User Password</DialogTitle>
                  <DialogDescription>
                    Set a new password for {passwordTarget?.display_name || userEmails[passwordTarget?.user_id] || 'this user'}.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      minLength={6}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="send-password-email"
                      checked={sendPasswordEmail}
                      onCheckedChange={(checked) => setSendPasswordEmail(checked === true)}
                    />
                    <Label htmlFor="send-password-email" className="text-sm font-normal cursor-pointer">
                      Send password to user via email
                    </Label>
                  </div>
                  {sendPasswordEmail && (
                    <p className="text-xs text-muted-foreground">
                      An email will be sent to {userEmails[passwordTarget?.user_id] || 'the user'} with their new password.
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSetPassword} 
                      disabled={newPassword.length < 6 || userActionLoading}
                      className="flex-1"
                    >
                      {userActionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Set Password
                    </Button>
                    <Button variant="outline" onClick={() => setIsSetPasswordOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Create User Dialog */}
            <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account. The user will be able to log in immediately.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-email">Email</Label>
                    <Input
                      id="create-email"
                      type="email"
                      value={createUserForm.email}
                      onChange={(e) => setCreateUserForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-display-name">Display Name (optional)</Label>
                    <Input
                      id="create-display-name"
                      value={createUserForm.displayName}
                      onChange={(e) => setCreateUserForm(f => ({ ...f, displayName: e.target.value }))}
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-password">Password</Label>
                    <Input
                      id="create-password"
                      type="password"
                      value={createUserForm.password}
                      onChange={(e) => setCreateUserForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="Minimum 6 characters"
                      minLength={6}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="send-create-email"
                      checked={sendCreateEmail}
                      onCheckedChange={(checked) => setSendCreateEmail(checked === true)}
                    />
                    <Label htmlFor="send-create-email" className="text-sm font-normal cursor-pointer">
                      Send credentials to user via email
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateUser}
                      disabled={!createUserForm.email || createUserForm.password.length < 6 || userActionLoading}
                      className="flex-1"
                    >
                      {userActionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                      Create User
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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

      case 'email-templates':
        return <EmailTemplatesManagement />;

      case 'artwork':
        return <ArtworkManagement />;

      case 'media-library':
        return <MediaLibraryManagement />;

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
      company: formData.get('company') as string || '',
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
                <Label htmlFor="company">Company Name</Label>
                <Input
                  name="company"
                  defaultValue={editingUser?.company || ''}
                  placeholder="Enter company name"
                />
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