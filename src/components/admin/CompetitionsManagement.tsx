import { useState } from 'react';
import { useCompetitions, useCompetitionEntries, useCompetitionMutations, Competition } from '@/hooks/useCompetitions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Plus, Pencil, Trash2, Users, Calendar, Gift, Eye } from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';

const CATEGORIES = [
  { value: 'Travel', label: 'Travel' },
  { value: 'Food', label: 'Food & Dining' },
  { value: 'Family', label: 'Family' },
  { value: 'Shopping', label: 'Shopping' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Beauty', label: 'Beauty & Wellness' },
  { value: 'Other', label: 'Other' },
];

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    Travel: 'bg-blue-100 text-blue-800',
    Food: 'bg-orange-100 text-orange-800',
    Family: 'bg-purple-100 text-purple-800',
    Shopping: 'bg-pink-100 text-pink-800',
    Entertainment: 'bg-green-100 text-green-800',
    Beauty: 'bg-rose-100 text-rose-800',
    Other: 'bg-gray-100 text-gray-800',
  };
  return colors[category] || colors.Other;
};

export function CompetitionsManagement() {
  const { data: competitions, isLoading } = useCompetitions(true);
  const { createCompetition, updateCompetition, deleteCompetition, toggleActive } = useCompetitionMutations();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEntriesDialogOpen, setIsEntriesDialogOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [competitionToDelete, setCompetitionToDelete] = useState<Competition | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prize: '',
    category: 'Other',
    image_url: '',
    end_date: '',
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      prize: '',
      category: 'Other',
      image_url: '',
      end_date: '',
      is_active: true,
    });
    setSelectedCompetition(null);
  };

  const handleOpenDialog = (competition?: Competition) => {
    if (competition) {
      setSelectedCompetition(competition);
      setFormData({
        title: competition.title,
        description: competition.description,
        prize: competition.prize,
        category: competition.category,
        image_url: competition.image_url || '',
        end_date: competition.end_date.split('T')[0],
        is_active: competition.is_active,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      end_date: new Date(formData.end_date).toISOString(),
      image_url: formData.image_url || null,
    };

    if (selectedCompetition) {
      await updateCompetition.mutateAsync({ id: selectedCompetition.id, ...payload });
    } else {
      await createCompetition.mutateAsync(payload);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (competitionToDelete) {
      await deleteCompetition.mutateAsync(competitionToDelete.id);
      setIsDeleteDialogOpen(false);
      setCompetitionToDelete(null);
    }
  };

  const activeCompetitions = competitions?.filter(c => c.is_active && !isPast(new Date(c.end_date))) || [];
  const totalEntries = competitions?.reduce((sum, c) => sum + c.entry_count, 0) || 0;

  if (isLoading) {
    return <div className="p-6">Loading competitions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Competitions</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{competitions?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Competitions</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCompetitions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEntries}</div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Competitions</h2>
          <p className="text-muted-foreground">Manage competitions and view entries</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Competition
        </Button>
      </div>

      {/* Competitions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Prize</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-center">Entries</TableHead>
                <TableHead className="text-center">Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitions?.map((competition) => {
                const isExpired = isPast(new Date(competition.end_date));
                return (
                  <TableRow key={competition.id} className={isExpired ? 'opacity-60' : ''}>
                    <TableCell>
                      {competition.image_url ? (
                        <img
                          src={competition.image_url}
                          alt={competition.title}
                          className="h-12 w-12 rounded object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{competition.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getCategoryColor(competition.category)}>
                        {competition.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{competition.prize}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{format(new Date(competition.end_date), 'MMM d, yyyy')}</span>
                        <span className={`text-xs ${isExpired ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {isExpired ? 'Ended' : formatDistanceToNow(new Date(competition.end_date), { addSuffix: true })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCompetition(competition);
                          setIsEntriesDialogOpen(true);
                        }}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        {competition.entry_count}
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={competition.is_active}
                        onCheckedChange={(checked) => toggleActive.mutate({ id: competition.id, is_active: checked })}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(competition)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCompetitionToDelete(competition);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!competitions || competitions.length === 0) && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No competitions yet. Click "Add Competition" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedCompetition ? 'Edit Competition' : 'Add Competition'}</DialogTitle>
            <DialogDescription>
              {selectedCompetition ? 'Update the competition details below.' : 'Fill in the details to create a new competition.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Win a Weekend Getaway"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter to win an amazing prize..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prize">Prize *</Label>
                <Input
                  id="prize"
                  value={formData.prize}
                  onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                  placeholder="£500 Voucher"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label className="font-normal">{formData.is_active ? 'Active' : 'Inactive'}</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.title || !formData.description || !formData.prize || !formData.end_date}
            >
              {selectedCompetition ? 'Save Changes' : 'Create Competition'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Competition</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{competitionToDelete?.title}"? This action cannot be undone and will also delete all entries.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Entries Dialog */}
      {selectedCompetition && (
        <EntriesDialog
          competition={selectedCompetition}
          open={isEntriesDialogOpen}
          onOpenChange={setIsEntriesDialogOpen}
        />
      )}
    </div>
  );
}

function EntriesDialog({ competition, open, onOpenChange }: { competition: Competition; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: entries, isLoading } = useCompetitionEntries(competition.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Entries for "{competition.title}"</DialogTitle>
          <DialogDescription>
            {entries?.length || 0} total entries
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading entries...</div>
          ) : entries && entries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.name}</TableCell>
                    <TableCell>{entry.email}</TableCell>
                    <TableCell>{entry.phone || '-'}</TableCell>
                    <TableCell>{format(new Date(entry.created_at), 'MMM d, yyyy HH:mm')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No entries yet for this competition.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
