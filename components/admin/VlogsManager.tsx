import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShadcnButton } from '@/components/ui/shadcn-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, Loader2, PlayCircle, Video, Save } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Vlog {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  thumbnail_url?: string;
  duration?: string;
  views_count?: string;
  active: boolean;
  featured: boolean;  // Add this new property
}

const VlogsManager: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVlog, setEditingVlog] = useState<Vlog | null>(null);
  const [newVlog, setNewVlog] = useState<Omit<Vlog, 'id'>>({
    title: '',
    description: '',
    youtube_url: '',
    thumbnail_url: '',
    duration: '',
    views_count: '0',
    active: true,
    featured: false, // Add this new property
  });

  const queryClient = useQueryClient();

  // Fetch vlogs
  const { data: vlogs, isLoading } = useQuery({
    queryKey: ['vlogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vlogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Modified add vlog mutation
  const addVlogMutation = useMutation({
    mutationFn: async (vlog: Omit<Vlog, 'id'>) => {
      try {
        // Validate YouTube URL
        const url = new URL(vlog.youtube_url);
        const videoId = url.searchParams.get('v');
        
        if (!videoId) {
          throw new Error('Invalid YouTube URL. Please provide a valid video URL.');
        }

        // Get video thumbnail
        const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

        // Prepare data for insertion
        const insertData = {
          title: vlog.title,
          description: vlog.description,
          youtube_url: vlog.youtube_url,
          thumbnail_url: thumbnail,
          duration: vlog.duration || null,
          views_count: vlog.views_count || '0',
          active: vlog.active,
          featured: vlog.featured, // Add this new property
        };

        console.log('Inserting vlog with data:', insertData);

        const { data, error } = await supabase
          .from('vlogs')
          .insert([insertData])
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Successfully added vlog:', data);
        return data;
      } catch (error) {
        console.error('Error in addVlogMutation:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vlogs'] });
      setIsAddDialogOpen(false);
      setNewVlog({
        title: '',
        description: '',
        youtube_url: '',
        thumbnail_url: '',
        duration: '',
        views_count: '0',
        active: true,
        featured: false, // Add this new property
      });
      toast({
        title: 'Success',
        description: 'Vlog added successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add vlog',
        variant: 'destructive'
      });
    }
  });

  const handleAddVlog = async () => {
    if (!newVlog.title || !newVlog.youtube_url) {
      toast({
        title: 'Validation Error',
        description: 'Title and YouTube URL are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      await addVlogMutation.mutateAsync(newVlog);
    } catch (error) {
      console.error('Error in handleAddVlog:', error);
    }
  };

  // Update vlog mutation
  const updateVlogMutation = useMutation({
    mutationFn: async (vlog: Vlog) => {
      const { data, error } = await supabase
        .from('vlogs')
        .update(vlog)
        .eq('id', vlog.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vlogs'] });
      setIsEditDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Vlog updated successfully'
      });
    }
  });

  // Delete vlog mutation
  const deleteVlogMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vlogs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vlogs'] });
      toast({
        title: 'Success',
        description: 'Vlog deleted successfully'
      });
    }
  });

  const handleDeleteVlog = (id: string) => {
    if (window.confirm('Are you sure you want to delete this vlog?')) {
      deleteVlogMutation.mutate(id);
    }
  };

  const handleEdit = (vlog: Vlog) => {
    setEditingVlog(vlog);
    setIsEditDialogOpen(true);
  };

  const handleUpdateVlog = async () => {
    if (!editingVlog) return;

    try {
      console.log('Updating vlog with:', editingVlog);
      
      const { data, error } = await supabase
        .from('vlogs')
        .update({
          title: editingVlog.title,
          description: editingVlog.description,
          youtube_url: editingVlog.youtube_url,
          thumbnail_url: editingVlog.thumbnail_url,
          duration: editingVlog.duration,
          views_count: editingVlog.views_count,
          active: editingVlog.active,
          featured: editingVlog.featured
        })
        .eq('id', editingVlog.id)
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vlog updated successfully"
      });

      setIsEditDialogOpen(false);
      setEditingVlog(null);
      queryClient.invalidateQueries({ queryKey: ['vlogs'] });

    } catch (error: any) {
      console.error('Error updating vlog:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update vlog",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {/* Add New Vlog Card */}
        <Card className="border-2 border-dashed bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <CardContent className="flex flex-col items-center justify-center h-full py-8">
            <Plus className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-600">Add New Vlog</p>
          </CardContent>
        </Card>

        {/* Vlog Cards */}
        {vlogs?.map((vlog) => (
          <Card key={vlog.id} className="overflow-hidden">
            <div className="aspect-video relative group">
              {vlog.thumbnail_url ? (
                <img
                  src={vlog.thumbnail_url}
                  alt={vlog.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <Video className="h-8 w-8 text-gray-400" />
                </div>
              )}
              {vlog.featured && (
                <div className="absolute top-2 left-2 z-10">
                  <Badge 
                    variant="secondary" 
                    className="bg-aqua-500/90 text-white border-none"
                  >
                    Featured
                  </Badge>
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <ShadcnButton size="sm" variant="secondary" onClick={() => handleEdit(vlog)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </ShadcnButton>
                <ShadcnButton size="sm" variant="destructive" onClick={() => handleDeleteVlog(vlog.id)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </ShadcnButton>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium line-clamp-1">{vlog.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                {vlog.description}
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">
                  {new Date(vlog.created_at).toLocaleDateString()}
                </span>
                <Badge variant={vlog.active ? "default" : "secondary"}>
                  {vlog.active ? 'Published' : 'Draft'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Vlog Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Vlog</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid-cols-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newVlog.title}
                  onChange={(e) => setNewVlog({...newVlog, title: e.target.value})}
                  placeholder="Enter vlog title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="youtube_url">YouTube URL</Label>
                <Input
                  id="youtube_url"
                  value={newVlog.youtube_url}
                  onChange={(e) => setNewVlog({...newVlog, youtube_url: e.target.value})}
                  placeholder="e.g. https://youtube.com/watch?v=..."
                />
                <p className="text-sm text-gray-500">
                  Full YouTube video URL (thumbnail will be automatically generated)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newVlog.description}
                  onChange={(e) => setNewVlog({...newVlog, description: e.target.value})}
                  placeholder="Enter vlog description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={newVlog.duration}
                    onChange={(e) => setNewVlog({...newVlog, duration: e.target.value})}
                    placeholder="e.g. 12:34"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="views_count">Initial Views</Label>
                  <Input
                    id="views_count"
                    value={newVlog.views_count}
                    onChange={(e) => setNewVlog({...newVlog, views_count: e.target.value})}
                    placeholder="e.g. 1.2K"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={newVlog.active}
                    onCheckedChange={(checked) => setNewVlog({...newVlog, active: checked})}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
                <div className="flex items-center space-x-2 ml-6">
                  <Switch
                    id="featured"
                    checked={newVlog.featured}
                    onCheckedChange={(checked) => setNewVlog({...newVlog, featured: checked})}
                  />
                  <Label htmlFor="featured">Featured on Homepage</Label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <ShadcnButton
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setNewVlog({
                  title: '',
                  description: '',
                  youtube_url: '',
                  thumbnail_url: '',
                  duration: '',
                  views_count: '0',
                  active: true,
                  featured: false, // Add this new property
                });
              }}
            >
              Cancel
            </ShadcnButton>
            <ShadcnButton
              onClick={handleAddVlog}
              disabled={!newVlog.title || !newVlog.youtube_url || addVlogMutation.isPending}
            >
              {addVlogMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vlog
                </>
              )}
            </ShadcnButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Vlog Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setEditingVlog(null);
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Vlog</DialogTitle>
            <DialogDescription>
              Update vlog details
            </DialogDescription>
          </DialogHeader>
          
          {editingVlog && (
            <div className="grid gap-4 py-4">
              <div className="grid-cols-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingVlog.title}
                    onChange={(e) => setEditingVlog({...editingVlog, title: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-youtube_url">YouTube URL</Label>
                  <Input
                    id="edit-youtube_url"
                    value={editingVlog.youtube_url}
                    onChange={(e) => setEditingVlog({...editingVlog, youtube_url: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingVlog.description}
                    onChange={(e) => setEditingVlog({...editingVlog, description: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-duration">Duration</Label>
                    <Input
                      id="edit-duration"
                      value={editingVlog.duration}
                      onChange={(e) => setEditingVlog({...editingVlog, duration: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-views_count">Views</Label>
                    <Input
                      id="edit-views_count"
                      value={editingVlog.views_count}
                      onChange={(e) => setEditingVlog({...editingVlog, views_count: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-active"
                      checked={editingVlog.active}
                      onCheckedChange={(checked) => setEditingVlog({...editingVlog, active: checked})}
                    />
                    <Label htmlFor="edit-active">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2 ml-6">
                    <Switch
                      id="edit-featured"
                      checked={editingVlog.featured}
                      onCheckedChange={(checked) => setEditingVlog({...editingVlog, featured: checked})}
                    />
                    <Label htmlFor="edit-featured">Featured on Homepage</Label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <ShadcnButton variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </ShadcnButton>
            <ShadcnButton
              onClick={handleUpdateVlog}
              disabled={updateVlogMutation.isPending}
            >
              {updateVlogMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Vlog
                </>
              )}
            </ShadcnButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VlogsManager;
