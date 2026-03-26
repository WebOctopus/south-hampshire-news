

## Rename "File" Column to "Message" & Remove Filename

**File: `src/components/admin/ArtworkManagement.tsx`**

- Rename the "File" table header from `File` to `Message`
- In the table cell, remove the file name link (`artwork.file_name`) and keep only the user's notes text (`artwork.notes`)
- If no notes exist, show a dash or "No message" placeholder

