import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { 
  Upload, 
  Image, 
  FileText, 
  Video, 
  Music, 
  Download, 
  Trash2, 
  Eye,
  Search,
  Filter
} from 'lucide-react';

interface MediaFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  alt_text?: string;
  caption?: string;
  created_at: string;
}

const MediaLibrary = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadMediaFiles();
  }, []);

  const loadMediaFiles = async () => {
    const { data, error } = await supabase
      .from('media_library')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load media files",
        variant: "destructive"
      });
    } else {
      setMediaFiles(data || []);
    }
    setLoading(false);
  };

  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    setUploadingFiles(fileArray);

    for (const file of fileArray) {
      try {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('business-images')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('business-images')
          .getPublicUrl(filePath);

        // Save to media library table
        const { error: dbError } = await supabase
          .from('media_library')
          .insert({
            file_name: file.name,
            file_path: publicUrl,
            file_type: file.type,
            file_size: file.size,
            uploaded_by: (await supabase.auth.getUser()).data.user?.id
          });

        if (dbError) {
          throw dbError;
        }

        toast({
          title: "Success",
          description: `${file.name} uploaded successfully`
        });

      } catch (error: any) {
        toast({
          title: "Error",
          description: `Failed to upload ${file.name}: ${error.message}`,
          variant: "destructive"
        });
      }
    }

    setUploadingFiles([]);
    setIsUploadDialogOpen(false);
    loadMediaFiles();
  };

  const deleteFile = async (fileId: string, filePath: string) => {
    try {
      // Extract file path from URL for storage deletion
      const pathMatch = filePath.match(/uploads\/[^?]+/);
      if (pathMatch) {
        await supabase.storage
          .from('business-images')
          .remove([pathMatch[0]]);
      }

      // Delete from database
      const { error } = await supabase
        .from('media_library')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "File deleted successfully"
      });
      loadMediaFiles();

    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete file: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (fileType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (fileType.startsWith('audio/')) return <Music className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getFileTypeColor = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'bg-green-100 text-green-800';
    if (fileType.startsWith('video/')) return 'bg-blue-100 text-blue-800';
    if (fileType.startsWith('audio/')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.file_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || file.file_type.startsWith(filterType);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div>Loading media library...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-heading font-bold">Media Library</h2>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Media Files</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="files">Select Files</Label>
                <Input
                  id="files"
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Supports images, videos, audio files, and documents
                </p>
              </div>
              {uploadingFiles.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Uploading files...</p>
                  <ul className="text-sm text-muted-foreground">
                    {uploadingFiles.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
            <option value="application">Documents</option>
          </select>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFiles.map((file) => (
          <Card key={file.id} className="overflow-hidden">
            <div className="aspect-square bg-muted flex items-center justify-center relative group">
              {file.file_type.startsWith('image/') ? (
                <img
                  src={file.file_path}
                  alt={file.alt_text || file.file_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  {getFileIcon(file.file_type)}
                  <span className="text-xs text-center truncate max-w-full px-2">
                    {file.file_name}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => window.open(file.file_path, '_blank')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = file.file_path;
                    link.download = file.file_name;
                    link.click();
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteFile(file.id, file.file_path)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm truncate">{file.file_name}</h3>
                  <Badge className={`text-xs ${getFileTypeColor(file.file_type)}`}>
                    {file.file_type.split('/')[0]}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatFileSize(file.file_size)}</span>
                  <span>{new Date(file.created_at).toLocaleDateString()}</span>
                </div>
                {file.alt_text && (
                  <p className="text-xs text-muted-foreground truncate">
                    Alt: {file.alt_text}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No media files found</h3>
          <p className="text-muted-foreground">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Upload your first media file to get started'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;