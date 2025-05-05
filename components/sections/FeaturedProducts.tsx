import React, { useState } from 'react';
import ProductCard from '../ui/ProductCard';
import Button from '../ui/Button';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/utils/priceFormatter';
import type { BaseProduct } from '@/types/products';

type Category = 'All' | 'Arowana' | 'Discus' | 'Silver Dollar' | 'Fish Food' | 'Accessories';

export interface Product {
  id: number;
  name?: string;
  title?: string;
  price: number;
  image_url: string;
  video_url?: string;
  type: string;
}

interface EnhancedProduct extends Product {
  tableName?: 'fish' | 'accessories' | 'food';
  category?: string;
  species?: string;
  size?: string;
  stock_quantity?: number;
}

const FeaturedProducts: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: async () => {
      try {
        // Get 2 products each from specific categories
        const [arowanaResult, discusResult, silverDollarResult, foodResult] = await Promise.all([
          supabase
            .from('fish')
            .select('*')
            .eq('type', 'arowana')
            .gt('stock_quantity', 0)
            .order('created_at', { ascending: false })
            .limit(2),

          supabase
            .from('fish')
            .select('*')
            .eq('type', 'discus')
            .gt('stock_quantity', 0)
            .order('created_at', { ascending: false })
            .limit(2),

          supabase
            .from('fish')
            .select('*')
            .eq('type', 'silver_dollar')
            .gt('stock_quantity', 0)
            .order('created_at', { ascending: false })
            .limit(2),

          supabase
            .from('food')
            .select('*')
            .gt('stock_quantity', 0)
            .order('created_at', { ascending: false })
            .limit(2)
        ]);

        if (arowanaResult.error) throw arowanaResult.error;
        if (discusResult.error) throw discusResult.error;
        if (silverDollarResult.error) throw silverDollarResult.error;
        if (foodResult.error) throw foodResult.error;

        const allProducts: EnhancedProduct[] = [
          ...(arowanaResult.data?.map(item => ({
            ...item,
            tableName: 'fish' as const,
            type: 'fish',
            category: 'Arowana',
            video_url: item.video_url || undefined,
            size: item.size
          })) || []),
          ...(discusResult.data?.map(item => ({
            ...item,
            tableName: 'fish' as const,
            type: 'fish',
            category: 'Discus',
            video_url: item.video_url || undefined,
            size: item.size
          })) || []),
          ...(silverDollarResult.data?.map(item => ({
            ...item,
            tableName: 'fish' as const,
            type: 'fish',
            category: 'Silver Dollar',
            video_url: item.video_url || undefined,
            size: item.size
          })) || []),
          ...(foodResult.data?.map(item => ({
            ...item,
            tableName: 'food' as const,
            type: 'food',
            category: 'Fish Food'
          })) || [])
        ];

        return allProducts;
      } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
    }
  });

  const filterProducts = () => {
    if (!products) return [];
    let results = [...products];
    
    // First filter out of stock products
    results = results.filter(product => product.stock_quantity > 0);
    
    // Then apply category filter
    if (activeCategory !== 'All') {
      results = results.filter(product => {
        switch (activeCategory) {
          case 'Arowana':
            return product.type === 'fish' && 
                   (product.species?.toLowerCase().includes('arowana') ||
                    product.title?.toLowerCase().includes('arowana'));
          case 'Discus':
            return product.type === 'fish' && 
                   (product.species?.toLowerCase().includes('discus') ||
                    product.title?.toLowerCase().includes('discus'));
          case 'Silver Dollar':
            return product.type === 'fish' && 
                   (product.species?.toLowerCase().includes('silver dollar') ||
                    product.title?.toLowerCase().includes('silver dollar'));
          case 'Fish Food':
            return product.type === 'food';
          case 'Accessories':
            return product.type === 'accessories';
          default:
            return true;
        }
      });
    }
    
    return results;
  };

  const filteredProducts = filterProducts();

  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-72"/>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error('Error loading products:', error);
    return null;
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <span className="relative">
              Latest Collection
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-aqua-500 rounded-full"></div>
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our premium selection of exotic Arowana varieties and other rare fish species.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {(['All', 'Arowana', 'Discus', 'Silver Dollar', 'Fish Food', 'Accessories'] as Category[]).map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-aqua-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts?.map((product) => (
            <div key={product.id} className="keen-slider__slide">
              <ProductCard
                id={`${product.tableName}_${product.id}`}
                title={product.title || 'Unnamed Product'}
                price={product.price}
                formattedPrice={formatPrice(product.price)}
                image_url={product.image_url}
                video_url={product.video_url}
                category={product.category || product.type || 'unknown'}
                type={product.tableName}
                size={product.size}
                stock_quantity={product.stock_quantity} // Add this prop
              />
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link to="/products">
            <Button variant="outline" size="lg" className="group">
              View All Products
              <ChevronRight className="ml-1 transition-transform group-hover:translate-x-1" size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
