import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShadcnButton } from '@/components/ui/shadcn-button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { motion } from 'framer-motion';

const Wishlist: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Add formatPrice helper function
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(price);
  };

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to view your wishlist",
        variant: "destructive"
      });
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleAddToCart = (itemId: string) => {
      const item = wishlistItems.find(item => item.id === itemId);
      if (item) {
        // Default to 'accessories' if type is not available
        addToCart(item.id, 'accessories');
      toast({
        title: "Added to cart",
        description: `${item.name} has been added to your cart`
      });
    }
  };

  const handleRemoveFromWishlist = (itemId: string, itemName: string) => {
    removeFromWishlist(itemId);
    toast({
      title: "Removed from wishlist",
      description: `${itemName} has been removed from your wishlist`
    });
  };

  const handleViewDetails = (itemId: string) => {
    navigate(`/product/${itemId}`);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      
      
      {/* Hero Banner - Remove negative margin from content below */}
      <div className="relative pt-20 pb-32 overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/authbg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-marine-900/90 to-marine-800/90 backdrop-blur-sm"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Your Wishlist
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-marine-100 text-lg"
            >
              {wishlistItems.length ? 
                `You have ${wishlistItems.length} item${wishlistItems.length > 1 ? 's' : ''} saved` : 
                'Start saving your favorite aquatic treasures'}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Main Content - Remove negative margin */}
      <div className="flex-1 container mx-auto px-4 py-12">
        {wishlistItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-2xl mx-auto"
          >
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-marine-50 rounded-full mx-auto flex items-center justify-center">
                <Heart className="h-12 w-12 text-marine-500" />
              </div>
              <div className="absolute -bottom-2 right-1/2 transform translate-x-1/2">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-4xl">🐟</span>
                </motion.div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Save your favorite items for later and keep track of what you love
            </p>
            <ShadcnButton 
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-marine-500 to-marine-600 text-white hover:from-marine-600 hover:to-marine-700"
            >
              Explore Products
            </ShadcnButton>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {wishlistItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="relative h-48">
                    {item.image_url.endsWith('.mp4') ? (
                      <video
                        src={item.image_url}
                        className="w-full h-full object-cover rounded-t-lg"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    )}
                    <button 
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 flex items-center justify-center text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveFromWishlist(item.id, item.name)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{item.name}</h3>
                    <p className="text-aqua-700 font-bold mb-3">{formatPrice(item.price)}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <ShadcnButton 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAddToCart(item.id)}
                      >
                        <ShoppingCart size={16} className="mr-1" />
                        Add to Cart
                      </ShadcnButton>
                      <ShadcnButton 
                        size="sm" 
                        onClick={() => handleViewDetails(item.id)}
                      >
                        View Details
                      </ShadcnButton>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      
    
    </div>
  );
};

export default Wishlist;
