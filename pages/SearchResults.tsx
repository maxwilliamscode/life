import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '@/components/ui/ProductCard';
import { products } from '@/data/products';
import { ShoppingBag, ArrowLeft, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url: string;
  category: string;
}

const SearchResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('query') || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const [sortOption, setSortOption] = useState('featured');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    setSearchTerm(query);
  }, [query]);
  
  useEffect(() => {
    let results = products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase()) ||
      product.description?.toLowerCase().includes(query.toLowerCase())
    );
    
    switch (sortOption) {
      case 'price-low':
        results = [...results].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        results = [...results].sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        results = [...results].sort((a, b) => {
          const idA = parseInt(a.id);
          const idB = parseInt(b.id);
          return isNaN(idA) || isNaN(idB) ? 0 : idB - idA;
        });
        break;
      default:
        break;
    }
    
    setFilteredProducts(results);
  }, [query, sortOption]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/products/search?query=${encodeURIComponent(searchTerm)}`);
  };
  
  const handleSortChange = (value: string) => {
    setSortOption(value);
  };
  
  const handleBackToProducts = () => {
    navigate('/products');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      
      <div className="pt-28 bg-gradient-to-r from-aqua-800 to-marine-700 py-16 px-4 text-white">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Search Results</h1>
          <p className="max-w-2xl mx-auto text-aqua-100">
            {query ? `Showing results for "${query}"` : 'All products'}
          </p>
          
          <div className="max-w-xl mx-auto mt-8">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search for products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-6 w-full bg-white/90 text-gray-800 rounded-full shadow-lg border-0 focus-visible:ring-aqua-500"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <section className="py-12 px-4 bg-slate-100 flex-1">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center">
              <button 
                onClick={handleBackToProducts} 
                className="flex items-center text-aqua-700 hover:text-aqua-800 mr-4"
              >
                <ArrowLeft size={18} className="mr-1" />
                Back to Products
              </button>
              <p className="text-gray-600">
                Found <span className="font-medium">{filteredProducts.length}</span> products
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-gray-700">Sort by:</span>
              <Select value={sortOption} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px] border-0 bg-white shadow-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id} className="transform transition-transform hover:-translate-y-1 duration-300">
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image_url={product.image_url}
                    category={product.category}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm p-8">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
              <p className="text-gray-500">Try different search terms or browse our categories</p>
              <button
                onClick={handleBackToProducts}
                className="mt-4 px-4 py-2 bg-aqua-600 hover:bg-aqua-700 text-white rounded-md transition-colors"
              >
                Browse All Products
              </button>
            </div>
          )}
        </div>
      </section>
      
    </div>
  );
};

export default SearchResults;
