
import React, { useState } from 'react';
import ProductCard from '../ui/ProductCard';
import { Search, Filter, ShoppingBag } from 'lucide-react';
import { products } from '@/data/products';

interface ProductsListProps {
  sortOption?: string;
}

const ProductsList: React.FC<ProductsListProps> = ({ sortOption = 'featured' }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const categories = ['All', 'Arowana', 'Discus', 'Silver Dollar', 'Fish Food', 'Accessories'];

  let filteredProducts = products
    .filter(product => activeCategory === 'All' || product.category === activeCategory)
    .filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Sort products based on the sortOption
  if (sortOption === 'price-low') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  } else if (sortOption === 'price-high') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  } else if (sortOption === 'newest') {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      if (a.id && b.id) {
        return parseInt(b.id) - parseInt(a.id); // Higher id means newer product
      }
      return 0;
    });
  }
  // 'featured' is the default, no special sorting needed

  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">All Products</h1>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 w-full md:w-64 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-aqua-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              
              <button 
                className="bg-white p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={20} />
              </button>
            </div>
          </div>
          
          {/* Category Filter */}
          <div className={`bg-white p-4 rounded-xl shadow-md mb-6 transition-all duration-300 ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <h3 className="font-medium text-gray-800 mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
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
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Showing <span className="font-medium">{filteredProducts.length}</span> products
            </p>
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-700">Sort by:</span>
              <select 
                className="text-sm border-0 focus:ring-0 rounded bg-transparent text-gray-700 font-medium cursor-pointer pr-8"
                value={sortOption}
                disabled
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Latest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="transform transition-transform hover:-translate-y-1 duration-300">
                <ProductCard
                  {...product}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
            <p className="text-gray-500">Try changing your search or filter criteria</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsList;
