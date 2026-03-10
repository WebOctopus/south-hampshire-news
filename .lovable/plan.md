

## Add Drag-and-Drop Reordering to Package Features

### Change

Add drag handles (GripVertical icons, already imported) to each feature row and wire up `@dnd-kit/sortable` for reordering -- the same pattern already used in `MagazineEditionsManagement`.

### File: `src/components/admin/ProductDesignerManagement.tsx`

1. **Import** `DndContext`, `closestCenter`, `KeyboardSensor`, `PointerSensor`, `useSensor`, `useSensors` from `@dnd-kit/core` and `SortableContext`, `useSortable`, `verticalListSortingStrategy`, `arrayMove` from `@dnd-kit/sortable`
2. **Extract** each feature row into a `SortableFeatureRow` component that uses `useSortable` with `id={index}` and renders a `GripVertical` drag handle + existing inputs
3. **Wrap** the features list in `<DndContext>` + `<SortableContext>` with `verticalListSortingStrategy`
4. **Handle `onDragEnd`**: use `arrayMove` to reorder `formData.features` array and update state -- no database call needed since features are saved as JSONB when the form is submitted

No new dependencies (dnd-kit already installed). No database changes.

