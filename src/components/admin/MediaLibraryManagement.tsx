import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Upload, Search, Trash2, Copy, Edit, X, Loader2,
  FileText, FileSpreadsheet, File, Grid, List, Image as ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';

const ACCEPTED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const MAX_SIZE_MB = 20;

function getFileIcon(fileType: string) {
  if (fileType.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-primary" />;
  if (fileType.includes('pdf')) return <FileText className="h-8 w-8 text-destructive" />;
  if (fileType.includes('sheet') || fileType.includes('excel')) return <FileSpreadsheet className="h-8 w-8 text-green-600" />;
  return <File className="h-8 w-8 text-muted-foreground" />;
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return 'Unknown';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibraryManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [editingFile, setEditingFile] = useState<any>(null);
  const [editAltText, setEditAltText] = useState('');
  const [editCaption, setEditCaption] = useState('');

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['media-library', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm.trim()) {
        query = query.or(`file_name.ilike.%${searchTerm}%,file_type.ilike.%${searchTerm}%,alt_text.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (file: any) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('media-library')
        .remove([file.file_path]);
      if (storageError) console.warn('Storage delete warning:', storageError);

      // Delete from DB
      const { error: dbError } = await supabase
        .from('media_library')
        .delete()
        .eq('id', file.id);
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      toast({ title: 'File deleted' });
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, alt_text, caption }: { id: string; alt_text: string; caption: string }) => {
      const { error } = await supabase
        .from('media_library')
        .update({ alt_text, caption })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'File updated' });
      setEditingFile(null);
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const handleUpload = useCallback(async (fileList: FileList | File[]) => {
    const filesToUpload = Array.from(fileList);
    const invalid = filesToUpload.filter(f => !ACCEPTED_TYPES.includes(f.type) || f.size > MAX_SIZE_MB * 1024 * 1024);
    if (invalid.length) {
      toast({ title: 'Invalid files', description: `${invalid.map(f => f.name).join(', ')} — unsupported type or too large`, variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      for (const file of filesToUpload) {
        const ext = file.name.split('.').pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('media-library')
          .upload(path, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('media-library')
          .getPublicUrl(path);

        const { error: dbError } = await supabase
          .from('media_library')
          .insert({
            file_name: file.name,
            file_path: path,
            file_type: file.type,
            file_size: file.size,
            uploaded_by: user?.id || null,
          });
        if (dbError) throw dbError;
      }

      toast({ title: `${filesToUpload.length} file(s) uploaded` });
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  }, [toast, queryClient]);

  const getPublicUrl = (filePath: string) => {
    return supabase.storage.from('media-library').getPublicUrl(filePath).data.publicUrl;
  };

  const copyUrl = (filePath: string) => {
    navigator.clipboard.writeText(getPublicUrl(filePath));
    toast({ title: 'URL copied to clipboard' });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
  }, [handleUpload]);

  const handleFileInput = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = ACCEPTED_TYPES.join(',');
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files?.length) handleUpload(files);
    };
    input.click();
  };

  const openEdit = (file: any) => {
    setEditingFile(file);
    setEditAltText(file.alt_text || '');
    setEditCaption(file.caption || '');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Media Library</h2>
        <p className="text-muted-foreground">Upload, manage, and organise all your media files.</p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={handleFileInput}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Uploading…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">Drag & drop files here or click to browse</p>
            <p className="text-xs text-muted-foreground">Images (JPG, PNG, GIF, WebP), PDF, Word, Excel — max {MAX_SIZE_MB}MB</p>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-1">
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}>
            <List className="h-4 w-4" />
          </Button>
        </div>
        <Badge variant="secondary">{files.length} file{files.length !== 1 ? 's' : ''}</Badge>
      </div>

      {/* Files */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : files.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No files found. Upload your first file above.
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map((file: any) => (
            <Card key={file.id} className="overflow-hidden group relative">
              <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                {file.file_type.startsWith('image/') ? (
                  <img
                    src={getPublicUrl(file.file_path)}
                    alt={file.alt_text || file.file_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  getFileIcon(file.file_type)
                )}
              </div>
              <CardContent className="p-2">
                <p className="text-xs font-medium truncate" title={file.file_name}>{file.file_name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</p>
              </CardContent>
              {/* Hover actions */}
              <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="icon" variant="outline" onClick={() => copyUrl(file.file_path)} title="Copy URL">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" onClick={() => openEdit(file)} title="Edit metadata">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => deleteMutation.mutate(file)} title="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {files.map((file: any) => (
                <div key={file.id} className="flex items-center gap-4 p-3 hover:bg-muted/50">
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {file.file_type.startsWith('image/') ? (
                      <img src={getPublicUrl(file.file_path)} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      getFileIcon(file.file_type)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.file_size)} • {format(new Date(file.created_at), 'dd MMM yyyy')}
                      {file.alt_text && ` • ${file.alt_text}`}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => copyUrl(file.file_path)}><Copy className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(file)}><Edit className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(file)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingFile} onOpenChange={(open) => !open && setEditingFile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit File Metadata</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>File Name</Label>
              <p className="text-sm text-muted-foreground">{editingFile?.file_name}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="alt_text">Alt Text</Label>
              <Input id="alt_text" value={editAltText} onChange={(e) => setEditAltText(e.target.value)} placeholder="Describe the image…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Input id="caption" value={editCaption} onChange={(e) => setEditCaption(e.target.value)} placeholder="Optional caption…" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1"
                onClick={() => editingFile && updateMutation.mutate({ id: editingFile.id, alt_text: editAltText, caption: editCaption })}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save
              </Button>
              <Button variant="outline" onClick={() => setEditingFile(null)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
