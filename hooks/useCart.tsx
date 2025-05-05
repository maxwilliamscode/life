import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image_url: string;
  video_url?: string;
  quantity: number;
  productType: 'fish' | 'food' | 'accessories';
  type: string;
  size?: string;
}

interface CartStore {
  cartItems: CartItem[];
  addToCart: (productId: string, productType: 'fish' | 'food' | 'accessories') => Promise<void>;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],

      addToCart: async (productId, productType) => {
        try {
          if (!productId || !productType) {
            throw new Error('Invalid product ID or type');
          }

          // Extract the actual ID if it's a combined ID (e.g., "fish_123" -> "123")
          const actualId = productId.includes('_') ? productId.split('_')[1] : productId;

          const { data: product, error } = await supabase
            .from(productType)
            .select('*')
            .eq('id', actualId)
            .single();

          if (error) throw error;
          if (!product) throw new Error('Product not found');

          // Check stock quantity
          if (product.stock_quantity <= 0) {
            throw new Error('Product is out of stock');
          }

          const newCartItem: CartItem = {
            id: actualId,
            title: product.title || product.name || '',
            price: product.price,
            image_url: product.image_url || '',
            video_url: product.video_url,
            size: productType === 'fish' ? product.size : undefined,
            quantity: 1,
            productType,
            type: productType
          };

          const { cartItems } = get();
          const existingItemIndex = cartItems.findIndex(item => 
            item.id === actualId && item.productType === productType
          );

          if (existingItemIndex >= 0) {
            // Update existing item
            const updatedItems = [...cartItems];
            updatedItems[existingItemIndex].quantity += 1;
            set({ cartItems: updatedItems });
          } else {
            // Add new item
            set({ cartItems: [...cartItems, newCartItem] });
          }
        } catch (error) {
          console.error('Error in addToCart:', error);
          throw error;
        }
      },

      removeFromCart: (productId) => {
        const { cartItems } = get();
        set({ cartItems: cartItems.filter(item => item.id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        const { cartItems } = get();
        set({
          cartItems: cartItems.map(item =>
            item.id === productId ? { ...item, quantity } : item
          )
        });
      },

      clearCart: () => set({ cartItems: [] })
    }),
    {
      name: 'cart-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage)
    }
  )
);
