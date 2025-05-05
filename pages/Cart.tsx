import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShadcnButton } from '@/components/ui/shadcn-button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Trash2, ShoppingBag, ArrowRight, ExternalLink } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { CartItem, useCart } from '@/hooks/useCart';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { orderService } from '@/services/orderService';
import { formatPrice } from '@/utils/priceFormatter';

const Cart: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to view your cart",
        variant: "destructive"
      });
      navigate('/auth');
    }
  }, [user, navigate]);

  const calculateItemTotal = (item: CartItem) => {
    return item.price * item.quantity;
  };

  const calculateSubtotal = () => {
    return formatPrice(
      cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    );
  };

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to checkout",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const orderInput = {
        customer_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        customer_email: user.email || '',
        shipping_address: "Default Address",
        payment_method: "Cash on Delivery",
        items: cartItems.map(item => ({
          product_id: item.id,
          product_name: item.title,
          product_type: item.productType,
          quantity: item.quantity,
          price: item.price,
          size: item.size // Will be undefined for non-fish products
        }))
      };

      await orderService.createOrder(orderInput, user.id);
      
      toast({
        title: "Order placed successfully",
        description: "Thank you for your purchase!"
      });
      
      clearCart();
      // Navigate to profile page with orders tab active
      navigate('/profile', { 
        replace: true, 
        state: { activeTab: 'orders' } 
      });
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateToProductDetail = (productPath: string) => {
    window.open(`/product/${productPath}`, '_blank');
  };

  const getProductDetails = (item: CartItem) => {
    let productUrl = `/product/${item.productType}/${item.id}`;
    let categoryText = '';

    switch (item.productType) {
      case 'fish':
        categoryText = 'Aquarium Fish';
        break;
      case 'food':
        categoryText = 'Fish Food';
        break;
      case 'accessories':
        categoryText = 'Aquarium Accessories';
        break;
    }

    let sizeText = '';
    if (item.productType === 'fish' && item.size) {
      sizeText = ` • Size: ${item.size}`;
    }

    return { productUrl, categoryText, sizeText };
  };

  const getProductMedia = (item: CartItem) => {
    if (item.video_url && item.productType === 'fish') {
      return (
        <video 
          src={item.video_url}
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
        src={item.image_url || item.video_url || '/placeholder.jpg'} 
        alt={item.title}
        className="w-full h-full object-cover"
      />
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      
      {/* Hero Banner */}
      <div className="relative pt-20 pb-32 overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/authbg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-aqua-900/90 to-aqua-800/90 backdrop-blur-sm"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Your Shopping Cart</h1>
            <p className="text-aqua-100 text-lg">
              {cartItems.length ? 
                `You have ${cartItems.length} item${cartItems.length > 1 ? 's' : ''} in your cart` : 
                'Your cart is waiting to be filled with amazing aquatic treasures'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-12">
        {cartItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-2xl mx-auto"
          >
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-aqua-50 rounded-full mx-auto flex items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-aqua-500" />
              </div>
              <div className="absolute -bottom-2 right-1/2 transform translate-x-1/2">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-4xl">🐠</span>
                </motion.div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Discover our amazing collection of exotic fish and aquarium supplies
            </p>
            <ShadcnButton 
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-aqua-500 to-aqua-600 text-white hover:from-aqua-600 hover:to-aqua-700"
            >
              Explore Products
            </ShadcnButton>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold mb-6">Shopping Cart ({cartItems.length} items)</h2>
              
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div 
                          className="w-full sm:w-32 h-32 cursor-pointer relative group"
                          onClick={() => navigateToProductDetail(`${item.productType}/${item.id}`)}
                        >
                          {getProductMedia(item)}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                            <ExternalLink size={20} className="text-white" />
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3>{item.title}</h3>
                              <div className="text-sm text-gray-500">
                                {getProductDetails(item).categoryText}
                                {getProductDetails(item).sizeText}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">
                                {formatPrice(item.price)}
                                <span className="text-sm text-gray-500 ml-1">× {item.quantity}</span>
                              </div>
                              <div className="text-sm font-medium text-aqua-700">
                                Total: {formatPrice(calculateItemTotal(item))}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center border rounded">
                              <button 
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>
                              <span className="px-3 py-1 border-x">{item.quantity}</span>
                              <button 
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                            <button 
                              className="text-red-500 hover:text-red-700"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{calculateSubtotal()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">Free</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-aqua-700">{calculateSubtotal()}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <ShadcnButton 
                    className="w-full"
                    onClick={handleCheckout}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Proceed to Checkout'}
                    {!loading && <ArrowRight size={16} className="ml-2" />}
                  </ShadcnButton>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
      
      
    </div>
  );
};

export default Cart;
