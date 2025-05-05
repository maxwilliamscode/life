import React, { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { ShadcnButton } from '@/components/ui/shadcn-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, Plus, Save, Eye, Tag, Calendar, Gift, Clock, Loader2, Upload, Image as ImageIcon, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

const categoryOptions = [
  { value: "all", label: "All Products" },
  { value: "arowana", label: "Arowana" },
  { value: "discus", label: "Discus" },
  { value: "silver-dollar", label: "Silver Dollar" },
  { value: "fish-food", label: "Fish Food" },
  { value: "accessories", label: "Accessories" }
];

interface Offer {
  id: string;
  title: string;
  deadline: string;
  background_image: string;
  category: string;
  target_url: string;
  product_name?: string;
  created_at?: string;
  updated_at?: string;
}

const OffersForm = {
  title: "",
  deadline: "",
  background_image: "",
  category: "all",
  target_url: "/products",
  product_name: "",
};

const OffersManager: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newOffer, setNewOffer] = useState<typeof OffersForm>(OffersForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>('');

  const queryClient = useQueryClient();

  const { data: offers, isLoading } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Offer[];
    }
  });

  const addOfferMutation = useMutation({
    mutationFn: async (offer: typeof newOffer) => {
      if (!imageFile) {
        throw new Error('Please upload an image');
      }

      const imageUrl = await uploadImage(imageFile);

      const { data, error } = await supabase
        .from('offers')
        .insert([{
          ...offer,
          background_image: imageUrl
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      setIsAddDialogOpen(false);
      setNewOffer(OffersForm);
      setImageFile(null);
      setImagePreview('');
      toast({ title: "Success", description: "Offer added successfully" });
    }
  });

  const editOfferMutation = useMutation({
    mutationFn: async (offer: Offer) => {
      let imageUrl = offer.background_image;

      if (editImageFile) {
        try {
          imageUrl = await uploadImage(editImageFile);
        } catch (error) {
          console.error('Error uploading new image:', error);
          throw error;
        }
      }

      const { id, ...updateData } = offer;
      const { data, error } = await supabase
        .from('offers')
        .update({
          ...updateData,
          background_image: imageUrl
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      setIsEditDialogOpen(false);
      setEditingOffer(null);
      setEditImageFile(null);
      setEditImagePreview('');
      toast({ title: "Success", description: "Offer updated successfully" });
    }
  });

  const deleteOfferMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast({ title: "Success", description: "Offer deleted successfully" });
    }
  });

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      setIsUploading(true);
      const { error: uploadError, data } = await supabase.storage
        .from('offers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('offers')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleEditImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEditImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setEditImagePreview(previewUrl);
    }
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setEditImagePreview('');
    setEditImageFile(null);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-2">
      <div className="flex justify-end p-3">
        <ShadcnButton onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Offer
        </ShadcnButton>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Special Offers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {offers?.map((offer) => (
                <div key={offer.id} className="bg-white rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{offer.title}</h3>
                      <p className="text-sm text-gray-500">{offer.deadline}</p>
                      {offer.product_name && (
                        <span className="inline-block px-2 py-1 mt-2 text-xs bg-aqua-50 text-aqua-600 rounded-full">
                          Product: {offer.product_name}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <ShadcnButton 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(offer)}
                      >
                        <Edit className="h-4 w-4" />
                      </ShadcnButton>
                      <ShadcnButton 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteOfferMutation.mutate(offer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </ShadcnButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Offer</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title*</Label>
              <Input
                id="title"
                value={editingOffer?.title || ''}
                onChange={(e) => editingOffer && setEditingOffer({...editingOffer, title: e.target.value})}
                placeholder="e.g. Summer Sale"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline*</Label>
              <Input
                id="deadline"
                value={editingOffer?.deadline || ''}
                onChange={(e) => editingOffer && setEditingOffer({...editingOffer, deadline: e.target.value})}
                placeholder="e.g. Until August 31st"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Product Category*</Label>
              <Select
                value={editingOffer?.category}
                onValueChange={(value) => {
                  if (editingOffer) {
                    setEditingOffer({
                      ...editingOffer,
                      category: value,
                      target_url: value === 'all' 
                        ? '/products'
                        : `/products/category/${value}`
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_name">Specific Product Name (Optional)</Label>
              <Input
                id="product_name"
                value={editingOffer?.product_name || ''}
                onChange={(e) => editingOffer && setEditingOffer({
                  ...editingOffer,
                  product_name: e.target.value,
                  target_url: e.target.value 
                    ? `/products/search?query=${encodeURIComponent(e.target.value)}`
                    : editingOffer.target_url
                })}
                placeholder="e.g. Golden Arowana"
              />
              <p className="text-xs text-gray-500">
                Enter a specific product name to filter the offer
              </p>
            </div>

            <div className="space-y-2">
              <Label>Banner Image</Label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                {editImagePreview ? (
                  <div className="relative w-full aspect-[21/9]">
                    <img
                      src={editImagePreview}
                      alt="New preview"
                      className="rounded-lg object-cover w-full h-full"
                    />
                    <button
                      onClick={() => {
                        setEditImageFile(null);
                        setEditImagePreview('');
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-gray-900/50 text-white hover:bg-gray-900/75"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : editingOffer?.background_image ? (
                  <div className="relative w-full aspect-[21/9]">
                    <img
                      src={editingOffer.background_image}
                      alt="Current"
                      className="rounded-lg object-cover w-full h-full"
                    />
                    <button
                      onClick={() => {
                        if (editingOffer) {
                          setEditingOffer({
                            ...editingOffer,
                            background_image: ''
                          });
                        }
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-gray-900/50 text-white hover:bg-gray-900/75"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                      <label
                        htmlFor="edit-file-upload"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-aqua-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-aqua-600 focus-within:ring-offset-2 hover:text-aqua-500"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8" />
                          <span>Upload new banner image</span>
                          <input
                            id="edit-file-upload"
                            name="edit-file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleEditImageChange}
                          />
                          <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB</p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <ShadcnButton variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </ShadcnButton>
            <ShadcnButton 
              onClick={() => editingOffer && editOfferMutation.mutate(editingOffer)}
              disabled={editOfferMutation.isPending}
            >
              {editOfferMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : 'Update Offer'}
            </ShadcnButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] p-4 overflow-hidden">
          <DialogHeader>
            <DialogTitle>Add New Offer</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4 overflow-y-auto p-5 max-h-[calc(90vh-200px)] pr-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title*</Label>
              <Input
                id="title"
                value={newOffer.title}
                onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                placeholder="e.g. Summer Sale"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline*</Label>
              <Input
                id="deadline"
                value={newOffer.deadline}
                onChange={(e) => setNewOffer({...newOffer, deadline: e.target.value})}
                placeholder="e.g. Until August 31st"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Banner Image*</Label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                {imagePreview ? (
                  <div className="relative w-full aspect-[21/9]">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="rounded-lg object-cover w-full h-full"
                    />
                    <button
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview('');
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-gray-900/50 text-white hover:bg-gray-900/75"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-aqua-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-aqua-600 focus-within:ring-offset-2 hover:text-aqua-500"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8" />
                          <span>Upload banner image</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                          <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB</p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Product Category*</Label>
              <Select
                value={newOffer.category}
                onValueChange={(value) => {
                  setNewOffer({
                    ...newOffer,
                    category: value,
                    target_url: value === 'all' 
                      ? '/products'
                      : `/products/category/${value}`
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Select which products this offer applies to
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_name">Specific Product Name (Optional)</Label>
              <Input
                id="product_name"
                value={newOffer.product_name}
                onChange={(e) => {
                  const productName = e.target.value;
                  setNewOffer({
                    ...newOffer,
                    product_name: productName,
                    target_url: productName 
                      ? `/products/search?query=${encodeURIComponent(productName)}`
                      : `/products/category/${newOffer.category}`
                  });
                }}
                placeholder="e.g. Golden Arowana"
              />
              <p className="text-xs text-gray-500">
                Enter a specific product name to create a targeted offer
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <ShadcnButton variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setImageFile(null);
              setImagePreview('');
            }}>
              Cancel
            </ShadcnButton>
            <ShadcnButton 
              onClick={() => addOfferMutation.mutate(newOffer)}
              disabled={addOfferMutation.isPending || isUploading || !imageFile}
            >
              {(addOfferMutation.isPending || isUploading) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? 'Uploading...' : 'Adding...'}
                </>
              ) : (
                'Add Offer'
              )}
            </ShadcnButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OffersManager;
