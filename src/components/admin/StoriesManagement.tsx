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
  FileText,
  Eye,
  EyeOff,
  Star,
  StarOff,
  MapPin
} from 'lucide-react';
import { useStories, Story, StoryFormData, STORY_CATEGORIES, useStoryAreas, cleanAreaName } from '@/hooks/useStories';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function StoriesManagement() {
  const { stories, loading, fetchStories, createStory, updateStory, deleteStory, togglePublished, toggleFeatured, bulkCreateStories } = useStories();
  const { areas } = useStoryAreas();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [formData, setFormData] = useState<StoryFormData>({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    area: '',
    featured_image_url: '',
    author_name: '',
    is_published: false,
    featured: false
  });
  const [csvPreviewData, setCsvPreviewData] = useState<StoryFormData[]>([]);
  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const [uploading, setUploading] = useState(false);

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: '',
      area: '',
      featured_image_url: '',
      author_name: '',
      is_published: false,
      featured: false
    });
    setEditingStory(null);
  };

  const openEditDialog = (story: Story) => {
    setEditingStory(story);
    setFormData({
      title: story.title,
      excerpt: story.excerpt || '',
      content: story.content,
      category: story.category,
      area: story.area,
      featured_image_url: story.featured_image_url || '',
      author_name: story.author_name || '',
      is_published: story.is_published,
      featured: story.featured
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingStory) {
      const result = await updateStory(editingStory.id, formData);
      if (result) {
        setIsDialogOpen(false);
        resetForm();
        fetchStories();
      }
    } else {
      const result = await createStory(formData);
      if (result) {
        setIsDialogOpen(false);
        resetForm();
        fetchStories();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this story?')) {
      const result = await deleteStory(id);
      if (result) {
        fetchStories();
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `stories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('story-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('story-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, featured_image_url: publicUrl }));
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
    const headers = 'title,excerpt,content,category,area,author_name';
    const example = '"New Community Garden Opens","Local residents celebrate the opening...","Full article content here...","Community","FAREHAM & SURROUNDS","Emma Thompson"';
    const csvContent = `${headers}\n${example}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stories_template.csv';
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
      
      const parsedStories: StoryFormData[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        const cleanedValues = values.map(v => v.replace(/^"|"$/g, '').trim());
        
        const story: any = {};
        headers.forEach((header, index) => {
          story[header] = cleanedValues[index] || '';
        });
        
        if (story.title && story.content && story.category && story.area) {
          parsedStories.push({
            title: story.title,
            excerpt: story.excerpt || '',
            content: story.content,
            category: story.category,
            area: story.area,
            author_name: story.author_name || '',
            is_published: false,
            featured: false
          });
        }
      }
      
      setCsvPreviewData(parsedStories);
      setShowCsvPreview(true);
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const confirmCsvImport = async () => {
    const result = await bulkCreateStories(csvPreviewData);
    if (result) {
      setShowCsvPreview(false);
      setCsvPreviewData([]);
      fetchStories();
    }
  };

  const stats = {
    total: stories.length,
    published: stories.filter(s => s.is_published).length,
    draft: stories.filter(s => !s.is_published).length,
    featured: stories.filter(s => s.featured).length
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
        <h2 className="text-2xl font-bold mb-2">Stories Management</h2>
        <p className="text-muted-foreground">Create and manage community stories and news.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Stories</p>
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
              <EyeOff className="h-8 w-8 text-gray-500" />
              <div>
                <p className="text-sm text-muted-foreground">Draft</p>
                <p className="text-2xl font-bold">{stats.draft}</p>
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
                  Add Story
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingStory ? 'Edit Story' : 'Add New Story'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="media">Media</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="title">Story Title *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          required
                        />
                      </div>
                      
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

                      <div className="grid grid-cols-2 gap-4">
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
                              {STORY_CATEGORIES.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="area">Area *</Label>
                          <Select
                            value={formData.area}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, area: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select area" />
                            </SelectTrigger>
                            <SelectContent>
                              {areas.map(area => (
                                <SelectItem key={area.id} value={area.name}>{area.cleanName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="author_name">Author Name</Label>
                        <Input
                          id="author_name"
                          value={formData.author_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="content" className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="content">Full Content *</Label>
                        <Textarea
                          id="content"
                          value={formData.content}
                          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Write the full story content here..."
                          rows={12}
                          required
                        />
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

                    <TabsContent value="media" className="space-y-4 mt-4">
                      <div>
                        <Label>Featured Image</Label>
                        <div className="flex gap-4 items-start">
                          {formData.featured_image_url && (
                            <img 
                              src={formData.featured_image_url} 
                              alt="Story preview" 
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
                              {uploading ? 'Uploading...' : 'Upload an image for the story'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingStory ? 'Update Story' : 'Create Story'}
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
                id="csv-upload-stories"
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
            <DialogTitle>Preview CSV Import ({csvPreviewData.length} stories)</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Author</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {csvPreviewData.map((story, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{story.title}</TableCell>
                    <TableCell>{story.category}</TableCell>
                    <TableCell>{story.area}</TableCell>
                    <TableCell>{story.author_name || '-'}</TableCell>
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
              Import {csvPreviewData.length} Stories
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stories Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Stories</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading stories...</div>
          ) : stories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No stories found. Create your first story!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Story</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stories.map((story) => (
                    <TableRow key={story.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {story.featured_image_url && (
                            <img 
                              src={story.featured_image_url} 
                              alt={story.title}
                              className="w-12 h-8 object-cover rounded"
                            />
                          )}
                          <div className="max-w-xs">
                            <p className="font-medium truncate">{story.title}</p>
                            {story.excerpt && (
                              <p className="text-xs text-muted-foreground truncate">{story.excerpt}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{story.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-32">{story.area}</span>
                        </div>
                      </TableCell>
                      <TableCell>{story.author_name || '-'}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            await togglePublished(story.id, story.is_published);
                            fetchStories();
                          }}
                        >
                          {story.is_published ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            await toggleFeatured(story.id, story.featured);
                            fetchStories();
                          }}
                        >
                          {story.featured ? (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          ) : (
                            <StarOff className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(story.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(story)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(story.id)}
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
    </div>
  );
}
