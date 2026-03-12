import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Upload, Search, Trash2, Copy, Edit, Loader2,
  FileText, FileSpreadsheet, File, Grid, List, Image as ImageIcon,
  FolderDown, FolderOpen
} from 'lucide-react';
import { format } from 'date-fns';

const ACCEPTED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const MAX_SIZE_MB = 20;

const BUCKET_FOLDER_MAP: Record<string, string> = {
  'business-images': 'Business Images',
  'event-images': 'Event Images',
  'story-images': 'Story Images',
  'magazine-covers': 'Magazine Covers',
  'ad-preview-images': 'Ad Previews',
  'competition-images': 'Competition Images',
};

const STATIC_UPLOADS: { path: string; name: string; folder: string }[] = [
  { path: '/lovable-uploads/discover-logo.png', name: 'Discover Logo', folder: 'Logos' },
  { path: '/lovable-uploads/discover-logo-2.png', name: 'Discover Logo 2', folder: 'Logos' },
];

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

function getMimeFromName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp',
    pdf: 'application/pdf', doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  return map[ext || ''] || 'application/octet-stream';
}

export default function MediaLibraryManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [folderFilter, setFolderFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [editingFile, setEditingFile] = useState<any>(null);
  const [editAltText, setEditAltText] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editFolder, setEditFolder] = useState('');
  const [isBackfilling, setIsBackfilling] = useState(false);
  const [backfillProgress, setBackfillProgress] = useState(0);
  const [backfillStatus, setBackfillStatus] = useState('');

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['media-library', searchTerm, folderFilter],
    queryFn: async () => {
      let query = supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm.trim()) {
        query = query.or(`file_name.ilike.%${searchTerm}%,file_type.ilike.%${searchTerm}%,alt_text.ilike.%${searchTerm}%`);
      }

      if (folderFilter && folderFilter !== 'all') {
        if (folderFilter === 'uncategorised') {
          query = query.is('folder', null);
        } else {
          query = query.eq('folder', folderFilter);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Get unique folders for filter
  const { data: allFiles = [] } = useQuery({
    queryKey: ['media-library-folders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_library')
        .select('folder');
      if (error) throw error;
      return data || [];
    },
  });

  const folders = Array.from(new Set(allFiles.map((f: any) => f.folder).filter(Boolean))).sort() as string[];

  const deleteMutation = useMutation({
    mutationFn: async (file: any) => {
      // Only delete from storage if it's a storage path (not a static /lovable-uploads path)
      if (!file.file_path.startsWith('/')) {
        const { error: storageError } = await supabase.storage
          .from('media-library')
          .remove([file.file_path]);
        if (storageError) console.warn('Storage delete warning:', storageError);
      }
      const { error: dbError } = await supabase.from('media_library').delete().eq('id', file.id);
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
    mutationFn: async ({ id, alt_text, caption, folder }: { id: string; alt_text: string; caption: string; folder: string }) => {
      const { error } = await supabase
        .from('media_library')
        .update({ alt_text, caption, folder: folder || null } as any)
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

  const handleBackfill = useCallback(async () => {
    setIsBackfilling(true);
    setBackfillProgress(0);
    let imported = 0;
    let skipped = 0;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const buckets = Object.keys(BUCKET_FOLDER_MAP);
      const totalSteps = buckets.length + 1; // +1 for static uploads
      let step = 0;

      // Get existing file paths to avoid duplicates
      const { data: existing } = await supabase.from('media_library').select('file_path');
      const existingPaths = new Set((existing || []).map((e: any) => e.file_path));

      // Scan storage buckets
      for (const bucket of buckets) {
        step++;
        setBackfillStatus(`Scanning ${bucket}…`);
        setBackfillProgress(Math.round((step / totalSteps) * 100));

        try {
          const { data: bucketFiles, error } = await supabase.storage.from(bucket).list('', { limit: 1000 });
          if (error) {
            console.warn(`Could not list ${bucket}:`, error);
            continue;
          }

          for (const sf of (bucketFiles || [])) {
            if (!sf.name || sf.id === null) continue; // skip folders
            const filePath = `${bucket}/${sf.name}`;
            if (existingPaths.has(filePath)) {
              skipped++;
              continue;
            }

            const { error: dbError } = await supabase.from('media_library').insert({
              file_name: sf.name,
              file_path: filePath,
              file_type: getMimeFromName(sf.name),
              file_size: (sf.metadata as any)?.size || null,
              uploaded_by: user?.id || null,
              folder: BUCKET_FOLDER_MAP[bucket],
            } as any);

            if (dbError) {
              console.warn('Insert error:', dbError);
            } else {
              imported++;
              existingPaths.add(filePath);
            }
          }
        } catch (err) {
          console.warn(`Error scanning ${bucket}:`, err);
        }
      }

      // Register static uploads
      step++;
      setBackfillStatus('Registering static assets…');
      setBackfillProgress(Math.round((step / totalSteps) * 100));

      for (const s of STATIC_UPLOADS) {
        if (existingPaths.has(s.path)) {
          skipped++;
          continue;
        }
        const { error: dbError } = await supabase.from('media_library').insert({
          file_name: s.name,
          file_path: s.path,
          file_type: getMimeFromName(s.path),
          file_size: null,
          uploaded_by: user?.id || null,
          folder: s.folder,
          alt_text: s.name,
        } as any);

        if (!dbError) {
          imported++;
          existingPaths.add(s.path);
        }
      }

      toast({
        title: 'Backfill complete',
        description: `Imported ${imported} file(s), skipped ${skipped} duplicate(s).`,
      });
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
    } catch (err: any) {
      toast({ title: 'Backfill failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsBackfilling(false);
      setBackfillStatus('');
      setBackfillProgress(0);
    }
  }, [toast, queryClient]);

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

        const { error: uploadError } = await supabase.storage.from('media-library').upload(path, file);
        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase.from('media_library').insert({
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
    // Static assets use direct path
    if (filePath.startsWith('/')) return filePath;
    // Storage bucket files — check if path contains a known bucket prefix
    for (const bucket of Object.keys(BUCKET_FOLDER_MAP)) {
      if (filePath.startsWith(`${bucket}/`)) {
        const path = filePath.slice(bucket.length + 1);
        return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
      }
    }
    // Default: media-library bucket
    return supabase.storage.from('media-library').getPublicUrl(filePath).data.publicUrl;
  };

  const copyUrl = (filePath: string) => {
    const url = getPublicUrl(filePath);
    navigator.clipboard.writeText(url);
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
    setEditFolder((file as any).folder || '');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Media Library</h2>
          <p className="text-muted-foreground">Upload, manage, and organise all your media files.</p>
        </div>
        <Button
          variant="outline"
          onClick={handleBackfill}
          disabled={isBackfilling}
        >
          {isBackfilling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FolderDown className="h-4 w-4 mr-2" />}
          Backfill from Storage
        </Button>
      </div>

      {/* Backfill progress */}
      {isBackfilling && (
        <Card>
          <CardContent className="py-4 space-y-2">
            <p className="text-sm font-medium">{backfillStatus}</p>
            <Progress value={backfillProgress} />
          </CardContent>
        </Card>
      )}

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
        <Select value={folderFilter} onValueChange={setFolderFilter}>
          <SelectTrigger className="w-[180px]">
            <FolderOpen className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All folders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All folders</SelectItem>
            <SelectItem value="uncategorised">Uncategorised</SelectItem>
            {folders.map(f => (
              <SelectItem key={f} value={f}>{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                <div className="flex items-center gap-1 mt-0.5">
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</p>
                  {(file as any).folder && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">{(file as any).folder}</Badge>
                  )}
                </div>
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
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.file_size)} • {format(new Date(file.created_at), 'dd MMM yyyy')}
                      </p>
                      {(file as any).folder && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">{(file as any).folder}</Badge>
                      )}
                    </div>
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
            <div className="space-y-2">
              <Label htmlFor="folder">Folder</Label>
              <Input id="folder" value={editFolder} onChange={(e) => setEditFolder(e.target.value)} placeholder="e.g. Logos, Magazine Covers…" list="folder-suggestions" />
              <datalist id="folder-suggestions">
                {folders.map(f => <option key={f} value={f} />)}
              </datalist>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1"
                onClick={() => editingFile && updateMutation.mutate({ id: editingFile.id, alt_text: editAltText, caption: editCaption, folder: editFolder })}
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
