

## Plan: Add Searchable Business Dropdown Filter

### Overview
Replace the standard `Select` component for "Link to Business Directory" with a searchable combobox using the existing `Popover` + `Command` (cmdk) components. This allows admins to quickly filter and find businesses by typing.

---

### Technical Approach

The project already has the `cmdk` library installed and the `Command` UI components configured. We'll use the standard Shadcn combobox pattern:

```text
+------------------------------------------+
| Link to Business Directory               |
+------------------------------------------+
| [Search businesses...]           🔍      |
+------------------------------------------+
| ✓ DJ Summers Plumbing                    |
|   Edwards Conservatory Ltd               |
|   All-Tech Motors                        |
|   Allan Light Homes and Gardens          |
|   ...                                    |
+------------------------------------------+
```

---

### Implementation Details

**File: `src/components/admin/FeaturedAdvertisersManagement.tsx`**

1. **Add new imports:**
   - `Popover`, `PopoverContent`, `PopoverTrigger` from `@/components/ui/popover`
   - `Command`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem` from `@/components/ui/command`
   - `Check`, `ChevronsUpDown` from `lucide-react`

2. **Add state for dropdown open/close:**
   ```tsx
   const [businessSearchOpen, setBusinessSearchOpen] = useState(false);
   ```

3. **Replace the `<Select>` component with Combobox pattern:**

   **Before (lines 336-359 and 410-433):**
   ```tsx
   <Select
     value={formData.business_id || 'none'}
     onValueChange={...}
   >
     <SelectTrigger>
       <SelectValue placeholder="Select a business (optional)" />
     </SelectTrigger>
     <SelectContent className="max-h-60">
       <SelectItem value="none">No business linked</SelectItem>
       {businesses?.map((business) => (
         <SelectItem key={business.id} value={business.id}>
           {business.name}
         </SelectItem>
       ))}
     </SelectContent>
   </Select>
   ```

   **After (searchable combobox):**
   ```tsx
   <Popover open={businessSearchOpen} onOpenChange={setBusinessSearchOpen}>
     <PopoverTrigger asChild>
       <Button
         variant="outline"
         role="combobox"
         aria-expanded={businessSearchOpen}
         className="w-full justify-between"
       >
         {formData.business_id
           ? businesses?.find((b) => b.id === formData.business_id)?.name
           : "No business linked"}
         <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
       </Button>
     </PopoverTrigger>
     <PopoverContent className="w-full p-0" align="start">
       <Command>
         <CommandInput placeholder="Search businesses..." />
         <CommandList>
           <CommandEmpty>No business found.</CommandEmpty>
           <CommandGroup>
             <CommandItem
               value="none"
               onSelect={() => {
                 setFormData((prev) => ({ ...prev, business_id: null }));
                 setBusinessSearchOpen(false);
               }}
             >
               <Check
                 className={cn(
                   "mr-2 h-4 w-4",
                   !formData.business_id ? "opacity-100" : "opacity-0"
                 )}
               />
               No business linked
             </CommandItem>
             {businesses?.map((business) => (
               <CommandItem
                 key={business.id}
                 value={business.name}
                 onSelect={() => {
                   setFormData((prev) => ({ ...prev, business_id: business.id }));
                   setBusinessSearchOpen(false);
                 }}
               >
                 <Check
                   className={cn(
                     "mr-2 h-4 w-4",
                     formData.business_id === business.id ? "opacity-100" : "opacity-0"
                   )}
                 />
                 {business.name}
               </CommandItem>
             ))}
           </CommandGroup>
         </CommandList>
       </Command>
     </PopoverContent>
   </Popover>
   ```

4. **Handle both Add and Edit dialogs** - the same combobox component will be used in both dialogs.

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/FeaturedAdvertisersManagement.tsx` | Replace Select with searchable Combobox |

---

### User Experience

- Admin clicks dropdown → sees search input at top
- Typing filters the list in real-time
- Matching businesses appear below as user types
- Clicking a business selects it and closes dropdown
- "No business linked" option remains available at top
- Checkmark shows currently selected business

---

### Benefits

- **Fast filtering** through large business database
- **Familiar pattern** - standard combobox UX
- **Existing components** - no new dependencies needed
- **Keyboard accessible** - arrow keys, enter to select

