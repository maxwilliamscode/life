import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { ShadcnButton } from '@/components/ui/shadcn-button';
import { useAuth } from '@/context/AuthContext';

// Add WishlistItem interface or import it from types
interface WishlistItem {
  id: string;
  name: string; // Note: using 'name' instead of 'title'
  price: number;
  image_url: string;
  video_url?: string;
  category?: string;
}

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  formattedPrice: string;
  image_url: string;
  video_url?: string;
  category?: string;
  type?: 'fish' | 'accessories' | 'food';
  size?: string;
  stock_quantity: number; // Add this prop
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  price,
  formattedPrice,
  image_url,
  video_url,
  category,
  type,
  size,
  stock_quantity,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isWishlisted = user ? isInWishlist(id) : false;

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isHovering) {
        videoRef.current.play().catch(() => {
          // Handle any autoplay restrictions gracefully
        });
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovering]);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to add items to wishlist",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    try {
      if (isWishlisted) {
        removeFromWishlist(id);
        toast({
          title: "Removed from wishlist",
          description: "Item removed successfully",
        });
      } else {
        addToWishlist({
          id,
          name: title,
          price,
          image_url,
          video_url,
          category
        });
        toast({
          title: "Added to wishlist",
          description: "Item added successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to add items to cart",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    try {
      // Extract the actual ID if it's a combined ID
      const actualId = id.includes('_') ? id.split('_')[1] : id;
      
      if (type && stock_quantity && stock_quantity > 0) {
        await addToCart(actualId, type);
        toast({
          title: "Added to cart",
          description: "Item added successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Product is out of stock",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  return (
    <div 
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Link to={`/product/${id}`}>
        <div className="relative aspect-[16/9] overflow-hidden p-2">
          {video_url ? (
            <video
              ref={videoRef}
              src={video_url}
              className="w-full h-full object-cover rounded-lg"
              loop
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={image_url}
              alt={title}
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors shadow-md"
          >
            <Heart 
              className={`h-5 w-5 ${user && isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-600'}`}
            />
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link to={`/product/${id}`}>
          <h3 className="font-medium text-gray-900 mb-1 truncate hover:text-aqua-600 transition-colors">
            {title}
          </h3>
        </Link>
        <div className="space-y-2">
          <div className="flex flex-col">
            <span className="text-gray-600 text-sm">{category}</span>
            {type === 'fish' && size && (
              <span className="text-sm text-aqua-600">Size: {size}</span>
            )}
            <span className="font-bold text-aqua-700 mt-1">{formattedPrice}</span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {stock_quantity > 0 ? (
              <ShadcnButton
                variant="default"
                size="sm"
                className="flex-1"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add to Cart
              </ShadcnButton>
            ) : (
              <ShadcnButton
                variant="outline"
                size="sm"
                className="flex-1 bg-gray-50 text-gray-500"
                disabled
              >
                Out of Stock
              </ShadcnButton>
            )}
            <Link to={`/product/${id}`} className="flex-1">
              <ShadcnButton
                variant="outline"
                size="sm"
                className="w-full"
              >
                View Details
              </ShadcnButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
