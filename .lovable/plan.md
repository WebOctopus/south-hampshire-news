

## Media Library for Admin Dashboard

The project already has a `media_library` table in Supabase with columns: `id`, `file_name`, `file_path`, `file_type`, `file_size`, `alt_text`, `caption`, `uploaded_by`, `created_at`. RLS policies allow public SELECT and admin-only management. There's no dedicated storage bucket for the media library yet.

### Changes

1. **Create a `media-library` storage bucket** via migration — public, with RLS policies allowing admin uploads and public reads.

2. **Create `src/components/admin/MediaLibraryManagement.tsx`**:
   - Grid/list view of all uploaded media files
   - Upload zone (drag & drop or click) supporting images and documents (PDF, DOCX, etc.)
   - File metadata display: name, type, size, upload date, alt text, caption
   - Edit alt text and caption inline
   - Delete files (removes from both storage and DB)
   - Copy public URL to clipboard
   - Search/filter by file name or type
   - Thumbnail previews for images, icon placeholders for documents

3. **Add sidebar entry** in `AdminSidebar.tsx`:
   - Add "Media Library" item with `ImageIcon` (or `FolderOpen`), section: `media-library`

4. **Add case in `AdminDashboard.tsx`**:
   - Import and render `MediaLibraryManagement` for the `media-library` section

### Technical Details

- Upload flow: file → Supabase Storage (`media-library` bucket) → insert record into `media_library` table with file metadata and public URL
- File types: images (JPG, PNG, GIF, WebP), documents (PDF, DOCX, XLSX), max 20MB
- Storage bucket RLS: authenticated admin users can upload/delete; public can read
- The existing `media_library` table schema is sufficient — no DB migration needed for the table itself

