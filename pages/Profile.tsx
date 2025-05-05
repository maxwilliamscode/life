import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShadcnButton } from '@/components/ui/shadcn-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { User, Package, Heart, ShoppingCart, Settings, Edit, Check, Trash2, Loader2, Eye, Camera } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadProfilePicture, deleteProfilePicture } from '@/lib/storage-helpers';
import { formatPrice } from '@/utils/priceFormatter';

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
}

interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

const Profile: React.FC = () => {
  const { user, refreshSession, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isViewOrderDialogOpen, setIsViewOrderDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.user_metadata?.name || '',
      email: user?.email || '',
      phone: user?.user_metadata?.phone || '',
      address: user?.user_metadata?.address || '',
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.user_metadata?.name || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        address: user.user_metadata?.address || '',
      });
    }
  }, [user, reset]);

  // Fetch orders for the current user
  const { data: orders = [], isLoading: isOrdersLoading, error: ordersError } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // For each order, fetch its items
      const ordersWithItems = await Promise.all(data.map(async (order) => {
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);
        
        if (itemsError) throw itemsError;
        
        return {
          ...order,
          items: items || []
        };
      }));
      
      return ordersWithItems;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to view your profile",
        variant: "destructive"
      });
      navigate('/auth');
    }
  }, [user, navigate]);

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: data.name,
          phone: data.phone,
          address: data.address
        }
      });
      
      if (error) throw error;
      
      await refreshSession();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully"
      });
      
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWishlist = (itemId: string, itemName: string) => {
    removeFromWishlist(itemId);
    toast({
      title: "Item removed",
      description: `${itemName} has been removed from your wishlist`
    });
  };

  const handleViewOrder = (order: Order) => {
    setCurrentOrder(order);
    setIsViewOrderDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      const publicUrl = await uploadProfilePicture(user.id, file);
      
      // Update user profile in Supabase auth
      await updateProfile({ avatar_url: publicUrl });
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile picture",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!user) return;

    try {
      setUploading(true);
      await deleteProfilePicture(user.id);
      await updateProfile({ avatar_url: null });
      
      toast({
        title: "Success",
        description: "Profile picture removed successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove profile picture",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  const getUserInitials = () => {
    if (!user || !user.email) return 'U';
    const name = user.user_metadata?.name;
    if (name) {
      const nameParts = name.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return name[0].toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  };

  const getProductMedia = (item: { image_url: string; video_url?: string }) => {
    if (item.image_url?.endsWith('.mp4') || item.video_url) {
      return (
        <video
          src={item.video_url || item.image_url}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
      );
    }
    return (
      <img 
        src={item.image_url} 
        alt="Product"
        className="w-full h-full object-cover"
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
     
      <div className="pt-28 bg-gradient-to-b from-aqua-800 to-aqua-900 py-16 px-4 text-white">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">My Profile</h1>
          <p className="max-w-2xl mx-auto text-aqua-100">
            Manage your account details and view your orders
          </p>
        </div>
      </div>
      
      <div className="flex-1 container mx-auto py-12 px-4">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <Card>
                  <CardContent className="pt-6 flex flex-col items-center">
                    <div className="relative inline-block">
                      <Avatar className="h-24 w-24 mb-4 border-4 border-white shadow-lg cursor-pointer">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback className="text-2xl bg-aqua-100 text-aqua-700">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      
                      {uploading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                          <Loader2 className="h-8 w-8 text-white animate-spin" />
                        </div>
                      ) : (
                        <button
                          onClick={handleProfilePictureClick}
                          className="absolute bottom-0 right-0 p-2 bg-aqua-500 text-white rounded-full shadow-lg hover:bg-aqua-600 transition-colors"
                        >
                          <Camera className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    
                    {user?.user_metadata?.avatar_url && (
                      <button
                        onClick={handleRemoveProfilePicture}
                        className="mt-4 text-red-500 hover:text-red-700 flex items-center gap-2 mx-auto"
                        disabled={uploading}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove Picture
                      </button>
                    )}
                    <h3 className="text-xl font-semibold">{user.user_metadata?.name || user.email}</h3>
                    <p className="text-gray-500 mb-4">{user.email}</p>
                    
                    <div className="grid grid-cols-2 w-full gap-4 mt-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <ShoppingCart className="h-5 w-5 mx-auto mb-1 text-aqua-600" />
                        <p className="text-sm text-gray-600">Cart</p>
                        <p className="font-semibold">{cartItems.length} items</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Heart className="h-5 w-5 mx-auto mb-1 text-aqua-600" />
                        <p className="text-sm text-gray-600">Wishlist</p>
                        <p className="font-semibold">{wishlistItems.length} items</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your profile details</CardDescription>
                    </div>
                    <ShadcnButton 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? <Check className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
                    </ShadcnButton>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          disabled={!isEditing}
                          {...register('name', { required: 'Name is required' })}
                        />
                        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          disabled={true}
                          {...register('email')}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          disabled={!isEditing}
                          {...register('phone')}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input 
                          id="address" 
                          disabled={!isEditing}
                          {...register('address')}
                        />
                      </div>
                      
                      {isEditing && (
                        <div className="pt-4">
                          <ShadcnButton type="submit" disabled={isLoading}>
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              'Save Changes'
                            )}
                          </ShadcnButton>
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View and track your orders</CardDescription>
              </CardHeader>
              <CardContent>
                {isOrdersLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-aqua-600" />
                  </div>
                ) : ordersError ? (
                  <div className="text-center py-8 text-red-500">
                    <p>Error loading orders. Please try again.</p>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left">Order ID</th>
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-left">Items</th>
                          <th className="px-4 py-3 text-left">Total</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-4">#{order.id.slice(0, 8)}</td>
                            <td className="px-4 py-4">{formatDate(order.created_at)}</td>
                            <td className="px-4 py-4">{order.items?.length || 0} items</td>
                            <td className="px-4 py-4">{formatCurrency(order.total_amount)}</td>
                            <td className="px-4 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'delivered' 
                                  ? 'bg-green-100 text-green-800' 
                                  : order.status === 'processing'
                                  ? 'bg-blue-100 text-blue-800'
                                  : order.status === 'shipped'
                                  ? 'bg-purple-100 text-purple-800'
                                  : order.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <ShadcnButton 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewOrder(order)}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                View Details
                              </ShadcnButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
                    <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                    <ShadcnButton onClick={() => navigate('/products')}>Shop Now</ShadcnButton>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="wishlist">
            <Card>
              <CardHeader>
                <CardTitle>My Wishlist</CardTitle>
                <CardDescription>Items you've saved for later</CardDescription>
              </CardHeader>
              <CardContent>
                {wishlistItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlistItems.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <div className="h-48 relative">
                          {getProductMedia(item)}
                          <button 
                            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 flex items-center justify-center text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveFromWishlist(item.id, item.name)}
                            aria-label="Remove from wishlist"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{item.name}</h3>
                          <p className="text-aqua-700 font-bold mb-2">{formatPrice(item.price)}</p>
                          <ShadcnButton 
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-2"
                            onClick={() => navigate(`/product/${item.id}`)}
                          >
                            View Details
                          </ShadcnButton>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Your wishlist is empty</h3>
                    <p className="text-gray-500 mb-6">Start saving your favorite items for later!</p>
                    <ShadcnButton onClick={() => navigate('/products')}>Browse Products</ShadcnButton>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Order Details Dialog */}
      <Dialog open={isViewOrderDialogOpen} onOpenChange={setIsViewOrderDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Showing details for order #{currentOrder?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          
          {currentOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Order Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Order ID:</span>
                      <span className="text-sm font-medium">{currentOrder.id.slice(0, 8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Date:</span>
                      <span className="text-sm font-medium">{formatDate(currentOrder.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className="text-sm font-medium">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          currentOrder.status === 'delivered' 
                            ? 'bg-green-100 text-green-800' 
                            : currentOrder.status === 'processing'
                            ? 'bg-blue-100 text-blue-800'
                            : currentOrder.status === 'shipped'
                            ? 'bg-purple-100 text-purple-800'
                            : currentOrder.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Payment Method:</span>
                      <span className="text-sm font-medium">Credit Card</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Total:</span>
                      <span className="text-sm font-medium">{formatCurrency(currentOrder.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Order Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOrder.items && currentOrder.items.length > 0 ? (
                      currentOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.product_name}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">No items available</TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">Total</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(currentOrder.total_amount)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <ShadcnButton onClick={() => setIsViewOrderDialogOpen(false)}>
              Close
            </ShadcnButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      
    </div>
  );
};

export default Profile;
