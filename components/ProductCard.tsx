import React from 'react';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/components/ui/use-toast';

interface ProductCardProps {
  product: {
    id: string;
    title?: string;
    name?: string;
    price: number;
    image_url?: string;
    thumbnail?: string;
    category?: string;
    type?: string;
    size?: string;  // Add size property
  };
  productType: 'fish' | 'food' | 'accessories';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, productType }) => {
  const { addToCart } = useCart();
  
  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, productType);
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart",
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="product-card">
      <img src={product.image_url || product.thumbnail || '/placeholder.jpg'} alt={product.name || product.title} />
      <h3>{product.name || product.title}</h3>
      <p>{product.category}</p>
      {productType === 'fish' && product.size && (
        <p className="text-sm text-gray-600">Size: {product.size}</p>
      )}
      <p>{product.price}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
};

export default ProductCard;