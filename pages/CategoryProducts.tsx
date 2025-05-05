import React from 'react';
import { useParams, Params } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import ProductGrid from '@/components/ProductGrid';
import Loader from '@/components/ui/loader'

interface RouteParams extends Params {
  category: string;
}

const CategoryProducts: React.FC = () => {
  const { category } = useParams<RouteParams>();
  const { products, loading, error } = useProducts();

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-500 p-4">{error.message}</div>;

  const filteredProducts = products.filter(
    product => product.category?.toLowerCase() === category?.toLowerCase()
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 capitalize">{category} Products</h1>
      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500">No products found in this category</p>
      ) : (
        <ProductGrid products={filteredProducts} />
      )}
    </div>
  );
};

export default CategoryProducts;
