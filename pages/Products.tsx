import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import ProductCard from '@/components/ui/ProductCard';
import { products as fallbackProducts } from '@/data/products';
import { supabase } from '@/integrations/supabase/client';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Filter, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import type { BaseProduct } from '@/types/products';
import { formatPrice } from '@/utils/priceFormatter';
import bannerBg from '/bannerbg1.jpg';

interface EnhancedProduct extends Product {
  tableName?: 'fish' | 'accessories' | 'food';
  category?: string;
  species?: string;
  type?: string;
  size?: string;
  stock_quantity?: number; // Add stock_quantity field
}
export interface Product {
  id: string;
  title?: string;
  name?: string;
  price: number;
  image_url: string;
  video_url?: string;
  type?: string;
  species?: string;
  created_at?: string;
}

const Products: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialSearchTerm = searchParams.get('search') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [sortOption, setSortOption] = useState('newest'); // Change default sort to 'newest'
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  
  useEffect(() => {
    // Update searchTerm when URL changes
    const newSearchTerm = new URLSearchParams(location.search).get('search') || '';
    setSearchTerm(newSearchTerm);
    setActiveCategory('All'); // Reset category when search changes
  }, [location.search]);

  // Update categories constant to match exact values used in product data
  const categories = [
    'All',
    'Arowana',
    'Discus',
    'Silver Dollar',
    'Fish Food',
    'Accessories'
  ];
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['all-products'],
    queryFn: async () => {
      try {
        const [fishResult, accessoryResult, foodResult] = await Promise.all([
          supabase
            .from('fish')
            .select('*')
            .order('created_at', { ascending: false }), // Add order by created_at
          supabase
            .from('accessories')
            .select('*')
            .order('created_at', { ascending: false }), // Add order by created_at
          supabase
            .from('food')
            .select('*')
            .order('created_at', { ascending: false }) // Add order by created_at
        ]);

        if (fishResult.error) throw fishResult.error;
        if (accessoryResult.error) throw accessoryResult.error;
        if (foodResult.error) throw foodResult.error;

        // Transform the data to normalize the type/category field
        const allProducts: EnhancedProduct[] = [
          ...(fishResult.data?.map(item => ({
            ...item,
            tableName: 'fish',
            type: 'fish',
            category: item.species || 'fish' // Use species as category for fish
          })) || []),
          ...(accessoryResult.data?.map(item => ({
            ...item,
            tableName: 'accessories',
            type: 'accessories',
            category: 'Accessories'
          })) || []),
          ...(foodResult.data?.map(item => ({
            ...item,
            tableName: 'food',
            type: 'food',
            category: 'Fish Food'
          })) || [])
        ];

        console.log('Fetched and normalized products:', allProducts);
        return allProducts;
      } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
    }
  });

  useEffect(() => {
    if (products) {
      let results = [...products];
      
      // If there's a search term, filter by type or title
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        results = results.filter(product => 
          product.type?.toLowerCase().includes(search) ||
          product.title?.toLowerCase().includes(search) ||
          product.category?.toLowerCase().includes(search)
        );
      }
      
      // Apply existing category filter if active
      if (activeCategory !== 'All') {
        results = results.filter(product => {
          const productCategory = product.category?.toLowerCase();
          return productCategory === activeCategory.toLowerCase();
        });
      }
      
      // Apply sorting
      switch (sortOption) {
        case 'price-low':
          results.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          results.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          results.sort((a, b) => 
            new Date(b.created_at || '').getTime() - 
            new Date(a.created_at || '').getTime()
          );
          break;
      }

      // Sort out-of-stock products to the end
      results.sort((a, b) => {
        if (a.stock_quantity === 0 && b.stock_quantity > 0) return 1;
        if (a.stock_quantity > 0 && b.stock_quantity === 0) return -1;
        return 0;
      });
      
      setFilteredProducts(results);
    }
  }, [products, searchTerm, activeCategory, sortOption]);

  const handleSortChange = (value: string) => {
    setSortOption(value);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Update URL with search param
    const newSearchParams = new URLSearchParams(location.search);
    if (value) {
      newSearchParams.set('search', value);
    } else {
      newSearchParams.delete('search');
    }
    navigate(`?${newSearchParams.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No need to do anything else since the useEffect will handle filtering
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.delete('search');
    navigate(`?${newSearchParams.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navbar />
      <div 
        className="pt-28 bg-gradient-to-b from-aqua-800 to-aqua-900 py-16 px-4 text-white relative"
        style={{
          backgroundImage: `url(${bannerBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Add an overlay */}
        <div className="absolute inset-0 bg-aqua-900/30"></div>
        
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Collection</h1>
          <p className="max-w-2xl mx-auto text-aqua-100">
            Explore our premium selection of exotic fish species and aquarium supplies
          </p>
          
          {/* Search Box - Centered and prominent */}
          <div className="max-w-xl mx-auto mt-8">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search for products..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 py-6 w-full bg-white/90 text-gray-800 rounded-full shadow-lg border-0 focus-visible:ring-aqua-500"
                />
                {searchTerm && (
                  <button 
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto py-8 px-4">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Category filter buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 overflow-x-auto py-2">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-gradient-to-r from-aqua-600 to-marine-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <p className="text-gray-600">
              Showing <span className="font-medium">{filteredProducts.length}</span> products
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-500" />
            <span className="text-gray-700">Sort by:</span>
            <Select value={sortOption} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px] border-0 bg-white shadow-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product: EnhancedProduct) => (
              <div key={`${product.tableName}_${product.id}`} className="transform transition-transform hover:-translate-y-1 duration-300">
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
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm p-8">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
            <p className="text-gray-500">
              {searchTerm ? 
                `No results for "${searchTerm}". Try different search terms or browse categories.` : 
                'Try browsing categories or check back later for new products.'}
            </p>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="mt-4 px-4 py-2 bg-aqua-600 hover:bg-aqua-700 text-white rounded-md transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
      <div className="flex-1"></div>
    </div>
  );
};

export default Products;
