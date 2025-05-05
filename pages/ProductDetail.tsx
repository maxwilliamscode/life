import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, ArrowLeft, Star, Info, Truck, Shield, Loader2 } from 'lucide-react';
import { ShadcnButton } from '@/components/ui/shadcn-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Review } from '@/types/Review';
import { Rating } from '@mui/material';
import { TextField } from '@mui/material';
import { formatPrice } from '@/utils/priceFormatter';

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editReviewData, setEditReviewData] = useState({ rating: 0, comment: '' });

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      setLoading(true);
      try {
        // Split the combined ID to get table name and actual ID
        const [tableName, actualId] = productId.split('_');
        
        if (!tableName || !actualId) {
          throw new Error('Invalid product ID format');
        }

        // Validate table name
        const validTables = ['fish', 'accessories', 'food'];
        if (!validTables.includes(tableName)) {
          throw new Error('Invalid product category');
        }

        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', actualId)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Product not found');

        // Include the table name as category in the product data
        setProduct({ ...data, category: tableName });
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive"
        });
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, navigate]);

  const isInWishlistAlready = productId ? isInWishlist(productId) : false;

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to add items to your cart",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    if (product && productId) {
      try {
        const [tableName, actualId] = productId.split('_');
        await addToCart(actualId, tableName as 'fish' | 'food' | 'accessories');
        toast({
          title: "Added to cart",
          description: `${product.title} has been added to your cart`
        });
      } catch (error) {
        console.error('Error adding to cart:', error);
        toast({
          title: "Error",
          description: "Failed to add item to cart",
          variant: "destructive"
        });
      }
    }
  };

  const handleWishlistToggle = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to add items to your wishlist",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    if (product) {
      const productForWishlist = {
        id: productId || '',
        name: product.title || product.name,
        price: product.price,
        image_url: product.image_url,
        video_url: product.video_url,
        category: product.category
      };

      if (isInWishlistAlready) {
        removeFromWishlist(productId || '');
        toast({
          title: "Removed from wishlist",
          description: `${product.title || product.name} has been removed from your wishlist`
        });
      } else {
        addToWishlist(productForWishlist);
        toast({
          title: "Added to wishlist",
          description: `${product.title || product.name} has been added to your wishlist`
        });
      }
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to add a review",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (newReview.rating === 0 || !newReview.comment.trim()) {
      toast({
        title: "Invalid review",
        description: "Please provide both rating and comment",
        variant: "destructive"
      });
      return;
    }

    const review: Review = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.email?.split('@')[0] || 'Anonymous',
      rating: newReview.rating,
      comment: newReview.comment,
      createdAt: new Date()
    };

    setReviews(prev => [...prev, review]);
    setNewReview({ rating: 0, comment: '' });
    toast({
      title: "Review added",
      description: "Thank you for your review!"
    });
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review.id);
    setEditReviewData({ rating: review.rating, comment: review.comment });
  };

  const handleUpdateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;

    setReviews(prev => prev.map(review => 
      review.id === editingReview
        ? {
            ...review,
            rating: editReviewData.rating,
            comment: editReviewData.comment,
          }
        : review
    ));

    setEditingReview(null);
    setEditReviewData({ rating: 0, comment: '' });
    toast({
      title: "Review updated",
      description: "Your review has been updated successfully!"
    });
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews(prev => prev.filter(review => review.id !== reviewId));
    toast({
      title: "Review deleted",
      description: "Your review has been deleted successfully!"
    });
  };

  const renderMedia = () => {
    if (product.image_url) {
      return (
        <div className="flex items-center justify-center w-full h-full min-h-[400px] p-4">
          <img
            src={product.image_url}
            alt={product.title || product.name}
            className="max-w-full max-h-[600px] h-auto object-contain rounded-xl shadow-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              if (product.video_url) {
                const videoContainer = target.parentNode as HTMLElement;
                if (videoContainer) {
                  videoContainer.innerHTML = renderVideo();
                }
              }
            }}
          />
        </div>
      );
    } else if (product.video_url) {
      return (
        <div className="flex items-center justify-center w-full h-full min-h-[400px] p-4">
          <div className="w-full max-w-[800px] rounded-xl shadow-lg overflow-hidden">
            <video
              className="w-full h-auto"
              controls
              preload="metadata"
              playsInline
            >
              <source src={product.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px]">
        <div className="bg-gray-100 rounded-xl shadow-lg p-8">
          <span className="text-gray-400">No media available</span>
        </div>
      </div>
    );
  };

  const renderVideo = () => {
    return `
      <video
        class="w-full h-auto object-cover rounded-lg"
        controls
        preload="metadata"
        playsInline
      >
        <source src="${product.video_url}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    `;
  };

  const renderReview = (review: Review) => {
    const isOwnReview = user?.id === review.userId;
    
    if (editingReview === review.id) {
      return (
        <form onSubmit={handleUpdateReview} className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <Rating
              value={editReviewData.rating}
              onChange={(_, value) => setEditReviewData(prev => ({ ...prev, rating: value || 0 }))}
              size="large"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Your Review</label>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={editReviewData.comment}
              onChange={(e) => setEditReviewData(prev => ({ ...prev, comment: e.target.value }))}
              className="mb-4"
            />
          </div>
          <div className="flex gap-2">
            <ShadcnButton type="submit">Save Changes</ShadcnButton>
            <ShadcnButton 
              type="button" 
              variant="outline"
              onClick={() => setEditingReview(null)}
            >
              Cancel
            </ShadcnButton>
          </div>
        </form>
      );
    }

    return (
      <div className="border-b pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Rating value={review.rating} readOnly size="small" />
            <span className="font-semibold">{review.userName}</span>
          </div>
          {isOwnReview && (
            <div className="flex gap-2">
              <button
                onClick={() => handleEditReview(review)}
                className="text-aqua-600 hover:text-aqua-700 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteReview(review.id)}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          )}
        </div>
        <p className="text-gray-700 mb-2">{review.comment}</p>
        <p className="text-sm text-gray-500">
          {new Date(review.createdAt).toLocaleDateString()}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-aqua-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <ShadcnButton onClick={() => navigate('/products')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </ShadcnButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      
      <div className="pt-28 flex-1">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center text-gray-600 hover:text-aqua-700 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Product Image */}
            <div className="bg-white rounded-xl overflow-hidden shadow-xl">
              {renderMedia()}
            </div>
            
            {/* Product Info */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="inline-block rounded-md bg-aqua-50 px-2 py-1 text-xs font-medium uppercase tracking-wider text-aqua-700 mb-2">
                  {product.category}
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{product.title || product.name}</h1>
                <p className="text-lg font-semibold text-gray-700">{product.name}</p>
              </div>
              
              <div className="text-3xl font-bold text-aqua-700">{formatPrice(product.price)}</div>
              
              <div className="border-t border-b border-gray-200 py-4">
                <p className="text-gray-700">
                  {product.description || `Premium quality ${product.name} selected for your aquarium. Guaranteed health and stunning colors that will enrich your aquatic environment.`}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {product.stock_quantity > 0 ? (
                    <ShadcnButton 
                      className="w-full py-6" 
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </ShadcnButton>
                  ) : (
                    <ShadcnButton 
                      className="w-full py-6" 
                      variant="outline"
                      disabled
                    >
                      Out of Stock
                    </ShadcnButton>
                  )}
                  
                  <ShadcnButton 
                    variant={isInWishlistAlready ? "destructive" : "outline"} 
                    className="w-full py-6" 
                    onClick={handleWishlistToggle}
                  >
                    <Heart 
                      className="mr-2 h-5 w-5" 
                      fill={isInWishlistAlready ? "currentColor" : "none"}
                    />
                    {isInWishlistAlready ? (
                      <span className="flex items-center gap-2">
                        Remove from Wishlist
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Add to Wishlist
                      </span>
                    )}
                  </ShadcnButton>
                </div>
              </div>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-gray-700">
                  <Truck className="h-5 w-5 text-aqua-600" />
                  <span>Free shipping on orders over ₹5000</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Shield className="h-5 w-5 text-aqua-600" />
                  <span>100% health guarantee</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Info className="h-5 w-5 text-aqua-600" />
                  <span>Expert care advice included</span>
                </div>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="description" className="mt-12">
            <TabsList className="mb-8">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="care">Care Guide</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="bg-white shadow rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Product Description</h3>
              <p className="text-gray-700 mb-4">
                The {product.name} is a magnificent addition to any premium aquarium. Known for its vibrant coloration and graceful swimming patterns, this species will instantly become the centerpiece of your aquatic display.
              </p>
              <p className="text-gray-700">
                Each specimen is carefully selected for health, coloration, and ideal proportions. We guarantee that your {product.name} will arrive in excellent condition, ready to thrive in your well-maintained aquarium environment.
              </p>
            </TabsContent>
            
            <TabsContent value="specs" className="bg-white shadow rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Specifications</h3>
              <div className="space-y-4">
                {/* Basic details for all products */}
                <div className="grid grid-cols-2 border-b pb-2">
                  <span className="font-medium">Name:</span>
                  <span>{product.title || product.name}</span>
                </div>
                <div className="grid grid-cols-2 border-b pb-2">
                  <span className="font-medium">Category:</span>
                  <span className="capitalize">{product.category}</span>
                </div>

                {/* Fish-specific details */}
                {product.category === 'fish' && (
                  <>
                    <div className="grid grid-cols-2 border-b pb-2">
                      <span className="font-medium">Species:</span>
                      <span>{product.species}</span>
                    </div>
                    <div className="grid grid-cols-2 border-b pb-2">
                      <span className="font-medium">Size:</span>
                      <span>{product.size}</span>
                    </div>
                    {product.origin && (
                      <div className="grid grid-cols-2 border-b pb-2">
                        <span className="font-medium">Origin:</span>
                        <span>{product.origin}</span>
                      </div>
                    )}
                    {product.care_level && (
                      <div className="grid grid-cols-2 border-b pb-2">
                        <span className="font-medium">Care Level:</span>
                        <span>{product.care_level}</span>
                      </div>
                    )}
                    {product.tank_size && (
                      <div className="grid grid-cols-2 border-b pb-2">
                        <span className="font-medium">Tank Size:</span>
                        <span>{product.tank_size}</span>
                      </div>
                    )}
                  </>
                )}

                {/* Accessories-specific details */}
                {product.category === 'accessories' && (
                  <>
                    {product.brand && (
                      <div className="grid grid-cols-2 border-b pb-2">
                        <span className="font-medium">Brand:</span>
                        <span>{product.brand}</span>
                      </div>
                    )}
                    {product.dimensions && (
                      <div className="grid grid-cols-2 border-b pb-2">
                        <span className="font-medium">Dimensions:</span>
                        <span>{product.dimensions}</span>
                      </div>
                    )}
                    {product.material && (
                      <div className="grid grid-cols-2 border-b pb-2">
                        <span className="font-medium">Material:</span>
                        <span>{product.material}</span>
                      </div>
                    )}
                  </>
                )}

                {/* Food-specific details */}
                {product.category === 'food' && (
                  <>
                    {product.brand && (
                      <div className="grid grid-cols-2 border-b pb-2">
                        <span className="font-medium">Brand:</span>
                        <span>{product.brand}</span>
                      </div>
                    )}
                    {product.weight && (
                      <div className="grid grid-cols-2 border-b pb-2">
                        <span className="font-medium">Weight:</span>
                        <span>{product.weight}</span>
                      </div>
                    )}
                    {product.ingredients && (
                      <div className="grid grid-cols-2 border-b pb-2">
                        <span className="font-medium">Ingredients:</span>
                        <span>{product.ingredients}</span>
                      </div>
                    )}
                  </>
                )}

                {/* Availability status */}
                <div className="grid grid-cols-2 border-b pb-2">
                  <span className="font-medium">Availability:</span>
                  <span>{product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}</span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="care" className="bg-white shadow rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Care Guide</h3>
              <div className="space-y-4">
                <p className="text-gray-700">
                  To ensure the health and longevity of your {product.name}, follow these essential care guidelines:
                </p>
                <div>
                  <h4 className="font-semibold mb-2">Tank Setup</h4>
                  <p className="text-gray-700">
                    Provide a spacious tank with minimal decoration to allow swimming space. Use a tight-fitting lid as these fish are known jumpers. A quality filtration system is essential.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Water Quality</h4>
                  <p className="text-gray-700">
                    Maintain pristine water conditions with regular water changes (20-30% weekly). Keep ammonia and nitrite at 0 ppm, and nitrate below 20 ppm.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Feeding</h4>
                  <p className="text-gray-700">
                    Feed high-quality pelleted food specifically formulated for Arowana, supplemented with live or frozen foods like shrimp, crickets, and small fish.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="bg-white shadow rounded-lg p-6">
              <div className="space-y-6">
                {/* Add Review Form */}
                <form onSubmit={handleAddReview} className="border-b pb-6">
                  <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Rating</label>
                      <Rating
                        value={newReview.rating}
                        onChange={(_, value) => setNewReview(prev => ({ ...prev, rating: value || 0 }))}
                        size="large"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Your Review</label>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={newReview.comment}
                        onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                        placeholder="Share your thoughts about this product..."
                        className="mb-4"
                      />
                    </div>
                    <ShadcnButton type="submit" disabled={!user}>
                      Submit Review
                    </ShadcnButton>
                  </div>
                </form>

                {/* Reviews List */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Customer Reviews</h3>
                  {reviews.length === 0 ? (
                    <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((review) => renderReview(review))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
     
    </div>
  );
};

export default ProductDetail;
