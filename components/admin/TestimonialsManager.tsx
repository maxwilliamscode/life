import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShadcnButton } from '@/components/ui/shadcn-button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, StarOff, Edit, Trash2, Plus, User, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';

interface Testimonial {
  id: string;
  name: string;
  role?: string;
  company?: string;
  content: string;
  rating: number;
  avatar_url?: string;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

const emptyTestimonial: Omit<Testimonial, 'id'> = {
  name: '',
  role: '',
  company: '',
  content: '',
  rating: 5,
  avatar_url: '',
  is_featured: false
};

const TestimonialsManager: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState<Omit<Testimonial, 'id'>>(emptyTestimonial);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  // Fetch testimonials
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching testimonials:', error);
        toast({
          title: "Error",
          description: "Failed to load testimonials: " + error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      return data as Testimonial[];
    }
  });

  // Add testimonial mutation
  const addTestimonialMutation = useMutation({
    mutationFn: async (testimonial: Omit<Testimonial, 'id'>) => {
      const { data, error } = await supabase
        .from('testimonials')
        .insert([{
          ...testimonial,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      setIsAddDialogOpen(false);
      setNewTestimonial(emptyTestimonial);
      toast({
        title: "Success",
        description: "Testimonial added successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add testimonial",
        variant: "destructive"
      });
    }
  });

  // Update testimonial mutation
  const updateTestimonialMutation = useMutation({
    mutationFn: async (testimonial: Testimonial) => {
      const { data, error } = await supabase
        .from('testimonials')
        .update({
          ...testimonial,
          updated_at: new Date().toISOString()
        })
        .eq('id', testimonial.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      setIsEditDialogOpen(false);
      setEditingTestimonial(null);
      toast({
        title: "Success",
        description: "Testimonial updated successfully"
      });
    }
  });

  // Delete testimonial mutation
  const deleteTestimonialMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      toast({
        title: "Success",
        description: "Testimonial deleted successfully"
      });
    }
  });

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      deleteTestimonialMutation.mutate(id);
    }
  };

  const handleAddTestimonial = () => {
    if (!newTestimonial.name || !newTestimonial.content) {
      toast({
        title: "Validation error",
        description: "Name and content are required fields",
        variant: "destructive"
      });
      return;
    }
    
    addTestimonialMutation.mutate(newTestimonial);
  };

  const handleUpdateTestimonial = () => {
    if (!editingTestimonial) return;
    
    if (!editingTestimonial.name || !editingTestimonial.content) {
      toast({
        title: "Validation error",
        description: "Name and content are required fields",
        variant: "destructive"
      });
      return;
    }
    
    updateTestimonialMutation.mutate(editingTestimonial);
  };

  const renderRatingStars = (rating: number, interactive = false, onChange?: (value: number) => void) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (interactive) {
        stars.push(
          <button
            key={i}
            type="button"
            onClick={() => onChange && onChange(i)}
            className="focus:outline-none"
          >
            {i <= rating ? (
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            ) : (
              <StarOff className="h-5 w-5 text-gray-300" />
            )}
          </button>
        );
      } else {
        stars.push(
          i <= rating ? (
            <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
          ) : (
            <StarOff key={i} className="h-5 w-5 text-gray-300" />
          )
        );
      }
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-aqua-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center p-6">
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="mt-2">You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2">
      <div className="flex justify-between items-center p-3">
        <h2 className="text-2xl font-bold">Testimonials</h2>
        <ShadcnButton onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Testimonial
        </ShadcnButton>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials && testimonials.length > 0 ? (
          testimonials.map((testimonial) => (
            <Card key={testimonial.id} className={`overflow-hidden ${testimonial.is_featured ? 'border-aqua-500' : ''}`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    {testimonial.avatar_url ? (
                      <img 
                        src={testimonial.avatar_url} 
                        alt={testimonial.name} 
                        className="h-10 w-10 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-aqua-100 flex items-center justify-center text-aqua-800 font-medium mr-3">
                        {testimonial.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{testimonial.name}</h3>
                      <div className="text-sm text-gray-500">
                        {testimonial.role && testimonial.company 
                          ? `${testimonial.role}, ${testimonial.company}`
                          : testimonial.role || testimonial.company}
                      </div>
                    </div>
                  </div>
                  {testimonial.is_featured && (
                    <Badge variant="secondary" className="bg-aqua-100 text-aqua-800">
                      Featured
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center mb-4">
                  {renderRatingStars(testimonial.rating)}
                </div>
                
                <blockquote className="text-gray-700 mb-4">
                  "{testimonial.content}"
                </blockquote>
                
                <div className="flex justify-end space-x-2 mt-4">
                  <ShadcnButton variant="outline" size="sm" onClick={() => handleEdit(testimonial)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </ShadcnButton>
                  <ShadcnButton 
                    variant="outline" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(testimonial.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </ShadcnButton>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            No testimonials found. Click "Add Testimonial" to create one.
          </div>
        )}
      </div>
      
      {/* Add Testimonial Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Testimonial</DialogTitle>
            <DialogDescription>
              Add a new customer testimonial to showcase on your website
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name*</Label>
                <Input
                  id="name"
                  value={newTestimonial.name}
                  onChange={(e) => setNewTestimonial({...newTestimonial, name: e.target.value})}
                  placeholder="Customer name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input
                  id="avatar_url"
                  value={newTestimonial.avatar_url || ''}
                  onChange={(e) => setNewTestimonial({...newTestimonial, avatar_url: e.target.value})}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role/Position</Label>
                <Input
                  id="role"
                  value={newTestimonial.role || ''}
                  onChange={(e) => setNewTestimonial({...newTestimonial, role: e.target.value})}
                  placeholder="CEO"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={newTestimonial.company || ''}
                  onChange={(e) => setNewTestimonial({...newTestimonial, company: e.target.value})}
                  placeholder="Acme Inc."
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Testimonial Content*</Label>
              <Textarea
                id="content"
                value={newTestimonial.content}
                onChange={(e) => setNewTestimonial({...newTestimonial, content: e.target.value})}
                placeholder="What did the customer say about your products or services?"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex space-x-1">
                {renderRatingStars(newTestimonial.rating, true, (value) => 
                  setNewTestimonial({...newTestimonial, rating: value})
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="is_featured" 
                checked={newTestimonial.is_featured}
                onCheckedChange={(checked) => 
                  setNewTestimonial({...newTestimonial, is_featured: checked as boolean})
                }
              />
              <Label htmlFor="is_featured">Feature this testimonial on the website</Label>
            </div>
          </div>
          
          <DialogFooter>
            <ShadcnButton variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setNewTestimonial(emptyTestimonial);
            }}>
              Cancel
            </ShadcnButton>
            <ShadcnButton 
              onClick={handleAddTestimonial}
              disabled={addTestimonialMutation.isPending}
            >
              {addTestimonialMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Testimonial'
              )}
            </ShadcnButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Testimonial Dialog */}
      {editingTestimonial && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Testimonial</DialogTitle>
              <DialogDescription>
                Update the testimonial details
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name*</Label>
                  <Input
                    id="edit-name"
                    value={editingTestimonial.name}
                    onChange={(e) => setEditingTestimonial({...editingTestimonial, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-avatar_url">Avatar URL</Label>
                  <Input
                    id="edit-avatar_url"
                    value={editingTestimonial.avatar_url || ''}
                    onChange={(e) => setEditingTestimonial({...editingTestimonial, avatar_url: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role/Position</Label>
                  <Input
                    id="edit-role"
                    value={editingTestimonial.role || ''}
                    onChange={(e) => setEditingTestimonial({...editingTestimonial, role: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-company">Company</Label>
                  <Input
                    id="edit-company"
                    value={editingTestimonial.company || ''}
                    onChange={(e) => setEditingTestimonial({...editingTestimonial, company: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-content">Testimonial Content*</Label>
                <Textarea
                  id="edit-content"
                  value={editingTestimonial.content}
                  onChange={(e) => setEditingTestimonial({...editingTestimonial, content: e.target.value})}
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex space-x-1">
                  {renderRatingStars(editingTestimonial.rating, true, (value) => 
                    setEditingTestimonial({...editingTestimonial, rating: value})
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="edit-is_featured" 
                  checked={editingTestimonial.is_featured}
                  onCheckedChange={(checked) => 
                    setEditingTestimonial({...editingTestimonial, is_featured: checked as boolean})
                  }
                />
                <Label htmlFor="edit-is_featured">Feature this testimonial on the website</Label>
              </div>
            </div>
            
            <DialogFooter>
              <ShadcnButton variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </ShadcnButton>
              <ShadcnButton 
                onClick={handleUpdateTestimonial}
                disabled={updateTestimonialMutation.isPending}
              >
                {updateTestimonialMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Testimonial'
                )}
              </ShadcnButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TestimonialsManager;
