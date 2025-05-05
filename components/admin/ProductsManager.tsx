import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShadcnButton } from '@/components/ui/shadcn-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, Plus, Search, Save, Loader2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product } from '@/types/products';
import { formatPrice } from '@/utils/priceFormatter';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Simplified file upload function
const uploadMedia = async (file: File, type: 'fish' | 'accessories' | 'food'): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const bucket = `${type}_media`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

const FISH_TYPES = [
  { value: 'arowana', label: 'Arowana' },
  { value: 'discus', label: 'Discus' },
  { value: 'silver_dollar', label: 'Silver Dollar' },
];

const FISH_CATEGORIES = [
  { value: 'arowana', label: 'Arowana' },
  { value: 'discus', label: 'Discus' },
  { value: 'silver_dollar', label: 'Silver Dollar' },
];

const ProductForm = ({ data, onChange, type }: any) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadMedia(file, type);
      onChange({
        ...data,
        [fileType === 'image' ? 'image_url' : 'video_url']: url
      });
      toast({ title: `${fileType} uploaded successfully` });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const commonFields = (
    <>
      <div className="space-y-2">
        <Label>Title*</Label>
        <Input
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Product title"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Price*</Label>
          <Input
            type="number"
            value={data.price || 0}
            onChange={(e) => onChange({ ...data, price: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>Stock*</Label>
          <Input
            type="number"
            value={data.stock_quantity || 0}
            onChange={(e) => onChange({ ...data, stock_quantity: Number(e.target.value) })}
          />
        </div>
      </div>
    </>
  );

  const mediaSection = (
    <div className="space-y-4">
      <div>
        <Label>Image</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, 'image')}
        />
        {data.image_url && (
          <img src={data.image_url} alt="Preview" className="mt-2 h-32 w-32 object-cover rounded" />
        )}
      </div>
      <div>
        <Label>Video</Label>
        <Input
          type="file"
          accept="video/*"
          onChange={(e) => handleFileChange(e, 'video')}
        />
        {data.video_url && (
          <video src={data.video_url} className="mt-2 h-32 w-32 object-cover rounded" controls />
        )}
      </div>
    </div>
  );

  const uploadStatus = isUploading && (
    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-yellow-800 flex items-center">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Please wait while media is being uploaded...
      </p>
    </div>
  );

  const fishFields = (
    <>
      {commonFields}
      {mediaSection}
      {uploadStatus}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Type*</Label>
            <Select 
              value={data.type || ''} 
              onValueChange={(value) => onChange({ ...data, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fish type" />
              </SelectTrigger>
              <SelectContent>
                {FISH_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Species*</Label>
            <Input
              value={data.species || ''}
              onChange={(e) => onChange({ ...data, species: e.target.value })}
              placeholder="Enter fish species"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Size*</Label>
            <Input
              value={data.size || ''}
              onChange={(e) => onChange({ ...data, size: e.target.value })}
              placeholder="Enter fish size"
            />
          </div>
          <div className="space-y-2">
            <Label>Origin</Label>
            <Input
              value={data.origin || ''}
              onChange={(e) => onChange({ ...data, origin: e.target.value })}
            />
          </div>
        </div>
      </div>
    </>
  );

  const accessoryFields = (
    <>
      {commonFields}
      {mediaSection}
      {uploadStatus}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Brand</Label>
            <Input
              value={data.brand || ''}
              onChange={(e) => onChange({ ...data, brand: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Material</Label>
            <Input
              value={data.material || ''}
              onChange={(e) => onChange({ ...data, material: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Dimensions</Label>
          <Input
            value={data.dimensions || ''}
            onChange={(e) => onChange({ ...data, dimensions: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Compatibility</Label>
          <Textarea
            value={data.compatibility || ''}
            onChange={(e) => onChange({ ...data, compatibility: e.target.value })}
            rows={3}
          />
        </div>
      </div>
    </>
  );

  const foodFields = (
    <>
      {commonFields}
      {mediaSection}
      {uploadStatus}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Brand</Label>
            <Input
              value={data.brand || ''}
              onChange={(e) => onChange({ ...data, brand: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Weight</Label>
            <Input
              value={data.weight || ''}
              onChange={(e) => onChange({ ...data, weight: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Suitable For</Label>
          <Input
            value={data.suitable_for || ''}
            onChange={(e) => onChange({ ...data, suitable_for: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Feeding Instructions</Label>
          <Textarea
            value={data.feeding_instructions || ''}
            onChange={(e) => onChange({ ...data, feeding_instructions: e.target.value })}
            rows={3}
          />
        </div>
        <div className="space-y-2 mt-4">
          <Label>Description</Label>
          <Textarea
            value={data.description || ''}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            placeholder="Enter product description"
            rows={4}
          />
        </div>
      </div>
    </>
  );

  switch (type) {
    case 'fish':
      return fishFields;
    case 'accessories':
      return accessoryFields;
    case 'food':
      return foodFields;
    default:
      return null;
  }
};

const ProductsManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    title: '',
    category: 'fish' as 'fish' | 'accessories' | 'food',
    type: '', // This is for fish type (arowana, discus, etc.)
    price: 0,
    stock_quantity: 0,
    description: '',
    image_url: '',
    video_url: '',
    species: '',
    size: '',
    origin: '',
    care_level: '',
    lifespan: '',
    tank_size: '',
    water_parameters: '',
    brand: '',
    dimensions: '',
    material: '',
    compatibility: '',
    weight: '',
    suitable_for: '',
    ingredients: '',
    feeding_instructions: ''
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const [fish, accessories, food] = await Promise.all([
          supabase.from('fish').select('*').order('created_at', { ascending: false }),
          supabase.from('accessories').select('*').order('created_at', { ascending: false }),
          supabase.from('food').select('*').order('created_at', { ascending: false })
        ]);

        if (fish.error) throw fish.error;
        if (accessories.error) throw accessories.error;
        if (food.error) throw food.error;

        return [
          ...fish.data.map(p => ({ ...p, category: 'fish' })),
          ...accessories.data.map(p => ({ ...p, category: 'accessories' })),
          ...food.data.map(p => ({ ...p, category: 'food' }))
        ];
      } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
    }
  });

  const addProductMutation = useMutation({
    mutationFn: async (product: any) => {
      const tableName = product.category;
      const { category, ...insertData } = product;
      
      // Define allowed fields for each product type
      const allowedFields: { [key: string]: string[] } = {
        fish: ['title', 'price', 'stock_quantity', 'image_url', 'video_url', 'type', 'species', 'size', 'origin'],
        accessories: ['title', 'price', 'stock_quantity', 'image_url', 'video_url', 'brand', 'material', 'dimensions', 'compatibility'],
        food: ['title', 'price', 'stock_quantity', 'image_url', 'video_url', 'brand', 'weight', 'suitable_for', 'feeding_instructions', 'description']
      };

      // Filter out fields that don't belong to the specific product type
      const cleanedData = Object.keys(insertData).reduce((acc, key) => {
        if (allowedFields[tableName].includes(key) && insertData[key] !== undefined) {
          acc[key] = insertData[key];
        }
        return acc;
      }, {} as any);

      const { data, error } = await supabase
        .from(tableName)
        .insert([{
          ...cleanedData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "Product added successfully" });
      setIsAddDialogOpen(false);
      setNewProduct({
        title: '',
        category: 'fish',
        type: '',
        price: 0,
        stock_quantity: 0,
        description: '',
        image_url: '',
        video_url: '',
        species: '',
        size: '',
        origin: '',
        care_level: '',
        lifespan: '',
        tank_size: '',
        water_parameters: '',
        brand: '',
        dimensions: '',
        material: '',
        compatibility: '',
        weight: '',
        suitable_for: '',
        ingredients: '',
        feeding_instructions: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error adding product",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async (product: any) => {
      const tableName = product.category;
      const { category, ...updateData } = product;

      // Define allowed fields for each product type
      const allowedFields: { [key: string]: string[] } = {
        fish: ['title', 'price', 'stock_quantity', 'image_url', 'video_url', 'type', 'species', 'size', 'origin'],
        accessories: ['title', 'price', 'stock_quantity', 'image_url', 'video_url', 'brand', 'material', 'dimensions', 'compatibility'],
        food: ['title', 'price', 'stock_quantity', 'image_url', 'video_url', 'brand', 'weight', 'suitable_for', 'feeding_instructions', 'description']
      };

      // Filter out fields that don't belong to the specific product type
      const cleanedData = Object.keys(updateData).reduce((acc, key) => {
        if (allowedFields[tableName].includes(key) && updateData[key] !== undefined) {
          acc[key] = updateData[key];
        }
        return acc;
      }, {} as any);
      
      const { data, error } = await supabase
        .from(tableName)
        .update({
          ...cleanedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "Product updated successfully" });
      setIsEditDialogOpen(false);
      setEditingProduct(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error updating product",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (product: Product) => {
      await supabase.from(product.category).delete().eq('id', product.id);
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "Product deleted successfully" });
    }
  });

  const filteredProducts = products?.filter(product => 
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (product: Product) => {
    const editProduct = {
      ...product,
      image_url: product.image_url || '',
      video_url: product.video_url || ''
    };
    setEditingProduct(editProduct);
    setIsEditDialogOpen(true);
  };

  const renderMedia = (product: Product) => {
    if (product.video_url) {
      return (
        <div className="relative w-20 h-20 sm:w-16 sm:h-16 rounded-lg shadow-md overflow-hidden">
          <video 
            src={product.video_url}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
      );
    }
    if (product.image_url) {
      return (
        <div className="relative w-20 h-20 sm:w-16 sm:h-16 rounded-lg shadow-md overflow-hidden">
          <img 
            src={product.image_url} 
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 p-2">
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center p-3">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <ShadcnButton 
          onClick={() => setIsAddDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </ShadcnButton>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Media</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Species</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{renderMedia(product)}</TableCell>
                        <TableCell className="font-medium">{product.title}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.category === 'fish' ? product.species : '-'}</TableCell>
                        <TableCell>{formatPrice(product.price)}</TableCell>
                        <TableCell>{product.stock_quantity}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <ShadcnButton size="sm" variant="outline" onClick={() => handleEdit(product)}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </ShadcnButton>
                            <ShadcnButton size="sm" variant="destructive" onClick={() => deleteProductMutation.mutate(product)}>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </ShadcnButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white/5 p-4 rounded-lg space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {renderMedia(product)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.title}</p>
                        <p className="text-sm text-gray-500">
                          {product.category}
                          {product.category === 'fish' && product.species && ` • ${product.species}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-white/5 p-2 rounded">
                        <p className="text-gray-500">Price</p>
                        <p className="font-medium">{formatPrice(product.price)}</p>
                      </div>
                      <div className="bg-white/5 p-2 rounded">
                        <p className="text-gray-500">Stock</p>
                        <p className="font-medium">{product.stock_quantity}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <ShadcnButton 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </ShadcnButton>
                      <ShadcnButton 
                        size="sm" 
                        variant="destructive"
                        className="flex-1"
                        onClick={() => deleteProductMutation.mutate(product)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </ShadcnButton>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Fill in the product details. Required fields are marked with an asterisk (*).
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="fish" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="fish">Fish</TabsTrigger>
              <TabsTrigger value="accessories">Accessories</TabsTrigger>
              <TabsTrigger value="food">Food</TabsTrigger>
            </TabsList>
            
            <TabsContent value="fish">
              <ProductForm 
                data={newProduct} 
                onChange={setNewProduct}
                type="fish"
              />
              <DialogFooter className="mt-4">
                <ShadcnButton variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </ShadcnButton>
                <ShadcnButton 
                  onClick={() => addProductMutation.mutate({...newProduct, category: 'fish'})}
                  disabled={!newProduct.title || !newProduct.price || !newProduct.type || !newProduct.species}
                >
                  Add Fish
                </ShadcnButton>
              </DialogFooter>
            </TabsContent>
            
            <TabsContent value="accessories">
              <ProductForm 
                data={newProduct} 
                onChange={setNewProduct}
                type="accessories"
              />
              <DialogFooter className="mt-4">
                <ShadcnButton variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </ShadcnButton>
                <ShadcnButton 
                  onClick={() => addProductMutation.mutate({...newProduct, category: 'accessories'})}
                  disabled={!newProduct.title || !newProduct.price || !newProduct.brand}
                >
                  Add Accessory
                </ShadcnButton>
              </DialogFooter>
            </TabsContent>
            
            <TabsContent value="food">
              <ProductForm 
                data={newProduct} 
                onChange={setNewProduct}
                type="food"
              />
              <div className="space-y-2 mt-4">
                <Label>Description</Label>
                <Textarea
                  value={newProduct.description || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Enter product description"
                  rows={4}
                />
              </div>
              <DialogFooter className="mt-4">
                <ShadcnButton variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </ShadcnButton>
                <ShadcnButton 
                  onClick={() => addProductMutation.mutate({...newProduct, category: 'food'})}
                  disabled={!newProduct.title || !newProduct.price || !newProduct.brand}
                >
                  Add Food
                </ShadcnButton>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {editingProduct && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update the product information below.
              </DialogDescription>
            </DialogHeader>
            <ProductForm 
              data={editingProduct} 
              onChange={setEditingProduct}
              type={editingProduct.category}
            />
            <DialogFooter>
              <ShadcnButton variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </ShadcnButton>
              <ShadcnButton 
                onClick={() => updateProductMutation.mutate(editingProduct)}
                disabled={updateProductMutation.isPending || isLoading}
              >
                {updateProductMutation.isPending || isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLoading ? 'Uploading Media...' : 'Saving Changes...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </ShadcnButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProductsManager;
