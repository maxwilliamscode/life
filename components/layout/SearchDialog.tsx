import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from '@/utils/priceFormatter';

interface SearchResult {
  id: string;
  title?: string;
  name?: string;
  type: string;
  species?: string;
  image_url: string;
  video_url?: string;
  price: number;
  tableName: 'fish' | 'accessories' | 'food';
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchDialog: React.FC<SearchDialogProps> = ({ open, onOpenChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();

  const { data: allProducts, isLoading } = useQuery({
    queryKey: ['all-products-search'],
    queryFn: async () => {
      try {
        const [fishResult, accessoryResult, foodResult] = await Promise.all([
          supabase.from('fish').select('*'),
          supabase.from('accessories').select('*'),
          supabase.from('food').select('*')
        ]);

        const fish = (fishResult.data || []).map(item => ({
          ...item,
          tableName: 'fish' as const,
          type: 'fish',
          title: item.title || item.species
        }));

        const accessories = (accessoryResult.data || []).map(item => ({
          ...item,
          tableName: 'accessories' as const,
          type: 'accessories'
        }));

        const food = (foodResult.data || []).map(item => ({
          ...item,
          tableName: 'food' as const,
          type: 'food'
        }));

        return [...fish, ...accessories, ...food] as SearchResult[];
      } catch (error) {
        console.error('Error fetching products:', error);
        return [];
      }
    }
  });

  useEffect(() => {
    if (searchQuery.trim() && allProducts) {
      const query = searchQuery.toLowerCase();
      const results = allProducts.filter(product => {
        const searchableFields = [
          product.title,
          product.name,
          product.species,
          product.type,
        ].filter(Boolean).map(field => field?.toLowerCase());

        return searchableFields.some(field => field?.includes(query));
      });
      setFilteredResults(results);
    } else {
      setFilteredResults([]);
    }
  }, [searchQuery, allProducts]);

  const handleSelect = (result: SearchResult) => {
    onOpenChange(false);
    setSearchQuery('');
    // Format the ID correctly for the product detail page
    const formattedId = `${result.tableName}_${result.id}`;
    navigate(`/product/${formattedId}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenChange(false);
    setSearchQuery('');
    navigate('/products', {
      state: { 
        searchTerm: searchQuery,
        autoSearch: true
      }
    });
  };

  const renderMedia = (result: SearchResult) => {
    if (!result.image_url && !result.video_url) {
      return (
        <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">
          <Search className="w-6 h-6 text-gray-400" />
        </div>
      );
    }

    return (
      <>
        <img
          src={result.image_url}
          alt={result.title || result.name}
          className="w-12 h-12 object-cover rounded-md"
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            const target = e.currentTarget;
            if (result.video_url && target.parentElement) {
              const videoElement = document.createElement('video');
              videoElement.src = result.video_url;
              videoElement.className = "w-12 h-12 object-cover rounded-md";
              videoElement.autoplay = true;
              videoElement.loop = true;
              videoElement.muted = true;
              videoElement.playsInline = true;
              target.parentElement.replaceChild(videoElement, target);
            }
          }}
        />
      </>
    );
  };

  const categories = {
    all: filteredResults,
    fish: filteredResults.filter(r => r.tableName === 'fish'),
    accessories: filteredResults.filter(r => r.tableName === 'accessories'),
    food: filteredResults.filter(r => r.tableName === 'food')
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <div className="p-4 border-b">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search products..."
                className="pl-10 pr-12 py-6 w-full text-lg border-2 focus:border-aqua-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {isLoading ? (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-gray-400" />
              ) : searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          </form>
        </div>

        {searchQuery && (
          <Tabs defaultValue="all" className="flex-1 overflow-hidden">
            <div className="px-2 border-b">
              <TabsList className="p-0 h-12">
                {Object.entries(categories).map(([key, items]) => (
                  <TabsTrigger 
                    key={key} 
                    value={key}
                    disabled={items.length === 0}
                    className="data-[state=active]:bg-aqua-50 relative px-4"
                  >
                    <span className="capitalize">{key}</span>
                    {items.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {items.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {Object.entries(categories).map(([key, items]) => (
                <TabsContent key={key} value={key} className="m-0 p-2">
                  {items.length > 0 ? (
                    <div className="grid gap-2">
                      {items.map((result) => (
                        <button
                          key={`${result.tableName}_${result.id}`}
                          onClick={() => handleSelect(result)}
                          className="w-full p-3 hover:bg-gray-50 rounded-lg flex items-center gap-4 text-left border border-transparent hover:border-gray-200 transition-all"
                        >
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {renderMedia(result)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {result.title || result.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="capitalize">
                                {result.species || result.type}
                              </Badge>
                              <p className="text-sm text-aqua-600 font-semibold">
                                {formatPrice(result.price)}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-1">No results found</p>
                      <p className="text-gray-500">
                        Try different keywords or browse categories
                      </p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        )}

        {!searchQuery && (
          <div className="p-4 text-center text-gray-500 flex-1 flex items-center justify-center flex-col">
            <Search className="h-12 w-12 mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-900 mb-1">Search products</p>
            <p>Start typing to search for products</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
