
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { User } from '@supabase/supabase-js';
import { Shield, Users, Building2, Calendar } from 'lucide-react';

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
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

  useEffect(() => {
    if (isAdmin) {
      loadBusinesses();
      loadUsers();
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
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Businesses</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {businesses.filter(b => b.is_active).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="businesses" className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="businesses">Business Management</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
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
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
