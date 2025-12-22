import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Upload, 
  Download, 
  Pencil, 
  Trash2, 
  Calendar,
  MapPin,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Link as LinkIcon,
  X,
  Inbox,
  CheckCircle,
  XCircle,
  ExternalLink,
  Clock,
  Mail
} from 'lucide-react';
import { useEvents, Event, EventFormData, EventLink, EVENT_CATEGORIES, EVENT_TYPES } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function EventsManagement() {
  const { events, loading, fetchEvents, createEvent, updateEvent, deleteEvent, togglePublished, toggleFeatured, bulkCreateEvents } = useEvents();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'submissions'>('all');
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    excerpt: '',
    full_description: '',
    date: '',
    time: '',
    end_time: '',
    location: '',
    area: '',
    postcode: '',
    category: '',
    type: '',
    image: '',
    organizer: '',
    links: [],
    ticket_url: '',
    contact_email: '',
    contact_phone: '',
    is_published: false,
    featured: false
  });
  const [links, setLinks] = useState<EventLink[]>([]);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [csvPreviewData, setCsvPreviewData] = useState<EventFormData[]>([]);
  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Filter for pending user submissions (not published AND has user_id OR contact_email from public submission)
  const pendingSubmissions = events.filter(e => !e.is_published && (e.user_id || e.contact_email));
  const adminEvents = events.filter(e => e.is_published || (!e.user_id && !e.contact_email));

  const handleApprove = async (event: Event) => {
    const result = await updateEvent(event.id, { is_published: true });
    if (result) {
      toast({
        title: 'Event Approved',
        description: `"${event.title}" has been published.`,
      });
      fetchEvents();
    }
  };

  const handleReject = async (event: Event) => {
    if (confirm(`Are you sure you want to reject and delete "${event.title}"? This cannot be undone.`)) {
      const result = await deleteEvent(event.id);
      if (result) {
        toast({
          title: 'Event Rejected',
          description: 'The submission has been removed.',
        });
        fetchEvents();
      }
    }
  };

  const handleEditAndApprove = (event: Event) => {
    openEditDialog(event);
    // Set is_published to true so it will be published when saved
    setFormData(prev => ({ ...prev, is_published: true }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      excerpt: '',
      full_description: '',
      date: '',
      time: '',
      end_time: '',
      location: '',
      area: '',
      postcode: '',
      category: '',
      type: '',
      image: '',
      organizer: '',
      links: [],
      ticket_url: '',
      contact_email: '',
      contact_phone: '',
      is_published: false,
      featured: false
    });
    setLinks([]);
    setEditingEvent(null);
  };

  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      excerpt: event.excerpt || '',
      full_description: event.full_description || '',
      date: event.date,
      time: event.time,
      end_time: event.end_time || '',
      location: event.location,
      area: event.area,
      postcode: event.postcode || '',
      category: event.category,
      type: event.type,
      image: event.image || '',
      organizer: event.organizer || '',
      ticket_url: event.ticket_url || '',
      contact_email: event.contact_email || '',
      contact_phone: event.contact_phone || '',
      is_published: event.is_published,
      featured: event.featured
    });
    setLinks(event.links || []);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData = {
      ...formData,
      links
    };

    if (editingEvent) {
      const result = await updateEvent(editingEvent.id, eventData);
      if (result) {
        setIsDialogOpen(false);
        resetForm();
        fetchEvents();
      }
    } else {
      const result = await createEvent(eventData);
      if (result) {
        setIsDialogOpen(false);
        resetForm();
        fetchEvents();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      const result = await deleteEvent(id);
      if (result) {
        fetchEvents();
      }
    }
  };

  const addLink = () => {
    if (newLinkLabel && newLinkUrl) {
      setLinks([...links, { label: newLinkLabel, url: newLinkUrl }]);
      setNewLinkLabel('');
      setNewLinkUrl('');
    }
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `events/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image: publicUrl }));
      toast({ title: 'Image uploaded successfully' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload image',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadCsvTemplate = () => {
    const headers = 'title,date,time,end_time,location,area,postcode,category,type,excerpt,description,organizer,ticket_url,contact_email,contact_phone';
    const example = '"Summer Festival","2025-07-15","10:00","18:00","Central Park","Downtown","AB12 3CD","Community","Festival","Join us for a day of fun!","Full description here...","Local Council","https://tickets.example.com","events@example.com","01onal234567890"';
    const csvContent = `${headers}\n${example}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'events_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const parsedEvents: EventFormData[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        const cleanedValues = values.map(v => v.replace(/^"|"$/g, '').trim());
        
        const event: any = {};
        headers.forEach((header, index) => {
          event[header] = cleanedValues[index] || '';
        });
        
        if (event.title && event.date && event.time && event.location && event.area && event.category && event.type) {
          parsedEvents.push({
            title: event.title,
            date: event.date,
            time: event.time,
            end_time: event.end_time || undefined,
            location: event.location,
            area: event.area,
            postcode: event.postcode || undefined,
            category: event.category,
            type: event.type,
            excerpt: event.excerpt || undefined,
            description: event.description || undefined,
            organizer: event.organizer || undefined,
            ticket_url: event.ticket_url || undefined,
            contact_email: event.contact_email || undefined,
            contact_phone: event.contact_phone || undefined,
            is_published: false,
            featured: false,
            links: []
          });
        }
      }
      
      setCsvPreviewData(parsedEvents);
      setShowCsvPreview(true);
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const confirmCsvImport = async () => {
    const result = await bulkCreateEvents(csvPreviewData);
    if (result) {
      setShowCsvPreview(false);
      setCsvPreviewData([]);
      fetchEvents();
    }
  };

  const stats = {
    total: events.length,
    published: events.filter(e => e.is_published).length,
    upcoming: events.filter(e => new Date(e.date) >= new Date()).length,
    featured: events.filter(e => e.featured).length,
    pending: pendingSubmissions.length
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Events Management</h2>
        <p className="text-muted-foreground">Create and manage community events.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{stats.published}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">{stats.upcoming}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold">{stats.featured}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-colors ${stats.pending > 0 ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' : ''}`}
          onClick={() => stats.pending > 0 && setActiveTab('submissions')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Inbox className={`h-8 w-8 ${stats.pending > 0 ? 'text-amber-600' : 'text-muted-foreground'}`} />
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="links">Links & Contact</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="title">Event Title *</Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="date">Date *</Label>
                          <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="time">Start Time *</Label>
                            <Input
                              id="time"
                              type="time"
                              value={formData.time}
                              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="end_time">End Time</Label>
                            <Input
                              id="end_time"
                              type="time"
                              value={formData.end_time}
                              onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="category">Category *</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {EVENT_CATEGORIES.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="type">Event Type *</Label>
                          <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {EVENT_TYPES.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="location">Location *</Label>
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="Venue name or address"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="area">Area *</Label>
                          <Input
                            id="area"
                            value={formData.area}
                            onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                            placeholder="Town or district"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="postcode">Postcode</Label>
                          <Input
                            id="postcode"
                            value={formData.postcode}
                            onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="organizer">Organizer</Label>
                          <Input
                            id="organizer"
                            value={formData.organizer}
                            onChange={(e) => setFormData(prev => ({ ...prev, organizer: e.target.value }))}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="excerpt">Excerpt (Short description for cards)</Label>
                        <Textarea
                          id="excerpt"
                          value={formData.excerpt}
                          onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                          placeholder="Brief description (150 characters recommended)"
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label htmlFor="full_description">Full Description</Label>
                        <Textarea
                          id="full_description"
                          value={formData.full_description}
                          onChange={(e) => setFormData(prev => ({ ...prev, full_description: e.target.value }))}
                          placeholder="Detailed event description..."
                          rows={6}
                        />
                      </div>

                      <div>
                        <Label>Event Image</Label>
                        <div className="flex gap-4 items-start">
                          {formData.image && (
                            <img 
                              src={formData.image} 
                              alt="Event preview" 
                              className="w-32 h-24 object-cover rounded-md"
                            />
                          )}
                          <div className="flex-1">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={uploading}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {uploading ? 'Uploading...' : 'Upload an image for the event'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                          <Switch
                            id="is_published"
                            checked={formData.is_published}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                          />
                          <Label htmlFor="is_published">Published</Label>
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            id="featured"
                            checked={formData.featured}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                          />
                          <Label htmlFor="featured">Featured</Label>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="links" className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="ticket_url">Ticket/Booking URL</Label>
                        <Input
                          id="ticket_url"
                          type="url"
                          value={formData.ticket_url}
                          onChange={(e) => setFormData(prev => ({ ...prev, ticket_url: e.target.value }))}
                          placeholder="https://..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contact_email">Contact Email</Label>
                          <Input
                            id="contact_email"
                            type="email"
                            value={formData.contact_email}
                            onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="contact_phone">Contact Phone</Label>
                          <Input
                            id="contact_phone"
                            type="tel"
                            value={formData.contact_phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Additional Links</Label>
                        {links.map((link, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                            <LinkIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{link.label}</span>
                            <span className="text-sm text-muted-foreground truncate flex-1">{link.url}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLink(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        
                        <div className="flex gap-2">
                          <Input
                            placeholder="Label (e.g., Website)"
                            value={newLinkLabel}
                            onChange={(e) => setNewLinkLabel(e.target.value)}
                          />
                          <Input
                            placeholder="URL"
                            value={newLinkUrl}
                            onChange={(e) => setNewLinkUrl(e.target.value)}
                          />
                          <Button type="button" variant="outline" onClick={addLink}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingEvent ? 'Update Event' : 'Create Event'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={downloadCsvTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="hidden"
                id="csv-upload"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CSV Preview Dialog */}
      <Dialog open={showCsvPreview} onOpenChange={setShowCsvPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview CSV Import ({csvPreviewData.length} events)</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {csvPreviewData.map((event, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>{event.time}{event.end_time && ` - ${event.end_time}`}</TableCell>
                    <TableCell>{event.location}, {event.area}</TableCell>
                    <TableCell>{event.category}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCsvPreview(false)}>
              Cancel
            </Button>
            <Button onClick={confirmCsvImport}>
              Import {csvPreviewData.length} Events
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'submissions')}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="submissions" className="relative">
            Pending Submissions
            {stats.pending > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-amber-500 rounded-full">
                {stats.pending}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* All Events Tab */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Events</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading events...</div>
              ) : events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No events found. Create your first event!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {event.image && (
                                <img 
                                  src={event.image} 
                                  alt={event.title}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div>
                                <p className="font-medium">{event.title}</p>
                                <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                  {event.excerpt || event.description || 'No description'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p>{formatDate(event.date)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {event.time}{event.end_time && ` - ${event.end_time}`}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p>{event.location}</p>
                                <p className="text-sm text-muted-foreground">{event.area}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{event.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge variant={event.is_published ? "default" : "secondary"}>
                                {event.is_published ? 'Published' : 'Draft'}
                              </Badge>
                              {event.featured && (
                                <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                                  Featured
                                </Badge>
                              )}
                              {!event.is_published && (event.user_id || event.contact_email) && (
                                <Badge variant="outline" className="border-amber-500 text-amber-600">
                                  User Submission
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(event)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  await togglePublished(event.id, event.is_published);
                                  fetchEvents();
                                }}
                              >
                                {event.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  await toggleFeatured(event.id, event.featured);
                                  fetchEvents();
                                }}
                              >
                                {event.featured ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(event.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
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

        {/* Pending Submissions Tab */}
        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="h-5 w-5 text-amber-600" />
                Pending Event Submissions
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Review and approve events submitted by users. These events will not appear publicly until approved.
              </p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading submissions...</div>
              ) : pendingSubmissions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-70" />
                  <p className="text-lg font-medium">All caught up!</p>
                  <p className="text-sm">No pending submissions to review.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingSubmissions.map((event) => (
                    <div 
                      key={event.id} 
                      className="border rounded-lg p-4 bg-card hover:border-amber-300 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Event Image */}
                        {event.image && (
                          <img 
                            src={event.image} 
                            alt={event.title}
                            className="w-full lg:w-32 h-32 object-cover rounded-lg"
                          />
                        )}
                        
                        {/* Event Details */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-lg">{event.title}</h3>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <Badge variant="outline" className="border-amber-500 text-amber-600">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending Review
                                </Badge>
                                <Badge variant="outline">{event.category}</Badge>
                                <Badge variant="secondary">{event.type}</Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(event.date)} at {event.time}{event.end_time && ` - ${event.end_time}`}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}, {event.area}</span>
                            </div>
                            {event.organizer && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <span className="font-medium">Organizer:</span>
                                <span>{event.organizer}</span>
                              </div>
                            )}
                            {event.contact_email && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <a href={`mailto:${event.contact_email}`} className="text-primary hover:underline">
                                  {event.contact_email}
                                </a>
                              </div>
                            )}
                          </div>
                          
                          {(event.excerpt || event.description) && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {event.excerpt || event.description}
                            </p>
                          )}
                          
                          <div className="text-xs text-muted-foreground">
                            Submitted: {new Date(event.created_at).toLocaleDateString('en-GB', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex lg:flex-col gap-2 lg:min-w-[140px]">
                          <Button 
                            onClick={() => handleApprove(event)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => handleEditAndApprove(event)}
                            className="flex-1"
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit & Approve
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => handleReject(event)}
                            className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          {event.ticket_url && (
                            <Button 
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(event.ticket_url!, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Link
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
