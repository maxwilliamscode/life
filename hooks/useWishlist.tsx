import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { products } from '@/data/products';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  video_url?: string;
  category: string;
}

interface WishlistStore {
  wishlistItems: WishlistItem[];
  addToWishlist: (product: WishlistItem) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      wishlistItems: [],
      
      addToWishlist: (product) => {
        const { wishlistItems } = get();
        const existingItem = wishlistItems.find(item => item.id === product.id);
        
        if (!existingItem) {
          set({ 
            wishlistItems: [...wishlistItems, product] 
          });
        }
      },
      
      removeFromWishlist: (productId) => {
        const { wishlistItems } = get();
        set({ 
          wishlistItems: wishlistItems.filter(item => item.id !== productId) 
        });
      },
      
      clearWishlist: () => {
        set({ wishlistItems: [] });
      },
      
      isInWishlist: (productId) => {
        const { wishlistItems } = get();
        return wishlistItems.some(item => item.id === productId);
      }
    }),
    {
      name: 'wishlist-storage', // name of the item in localStorage
    }
  )
);

// Helper hook to add products directly from the products data
export const useWishlistActions = () => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const toggleProductInWishlist = (productId: string) => {
    const isAlreadyInWishlist = isInWishlist(productId);
    
    if (isAlreadyInWishlist) {
      removeFromWishlist(productId);
      return false;
    } else {
      const product = products.find(p => p.id === productId);
      if (product) {
        addToWishlist(product);
        return true;
      }
    }
    return false;
  };
  
  return { toggleProductInWishlist, isProductInWishlist: isInWishlist };
};
