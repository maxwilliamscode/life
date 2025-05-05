import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

interface Offer {
  id: string;
  title: string;
  deadline: string;
  background_image: string;
  target_url?: string;
  product_name?: string;
  category?: string;
}

const OffersSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const { data: offers, isLoading } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Offer[];
    }
  });

  // Auto-slide effect
  useEffect(() => {
    if (!offers?.length) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % offers.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [offers]);

  if (isLoading || !offers || offers.length === 0) {
    return null;
  }

  return (
    <section className="py-16 relative bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Special Offers
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-aqua-400 to-aqua-600 mx-auto mb-6"></div>
        </motion.div>

        {/* Product Card Style Carousel */}
        <div className="w-full">
          <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl drop-shadow-xl transition-shadow overflow-hidden p-3">
            {/* Slides Container */}
            <div className="relative aspect-[21/9] w-full rounded-xl overflow-hidden">
              {offers.map((offer, index) => (
                <div
                  key={offer.id}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-500",
                    index === currentSlide ? "opacity-100" : "opacity-0"
                  )}
                >
                  {/* Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-no-repeat bg-center"
                    style={{ backgroundImage: `url(${offer.background_image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12">
                    <div className="max-w-3xl">
                      <h3 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        {offer.title}
                      </h3>
                      <div className="flex gap-4 mb-4">
                        <div className="inline-block px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full">
                          <span className="text-lg font-medium text-gray-900">
                            {offer.deadline}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={offer.target_url || '/products'} 
                    className="absolute inset-0 z-10"
                    aria-label={offer.title}
                    onClick={(e) => {
                      e.preventDefault(); // Always prevent default to handle navigation manually
                      
                      // Handle product-specific offers
                      if (offer.product_name) {
                        navigate('/products', {
                          state: {
                            searchTerm: offer.product_name,
                            autoSearch: true
                          }
                        });
                      }
                      // Handle category-specific offers
                      else if (offer.category && offer.category !== 'all') {
                        navigate('/products', {
                          state: {
                            initialCategory: offer.category,
                            autoSearch: true
                          }
                        });
                      }
                      // Handle general offers
                      else {
                        navigate('/products');
                      }
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-center gap-8 pt-6">
              <button
                onClick={() => setCurrentSlide((prev) => 
                  prev === 0 ? offers.length - 1 : prev - 1
                )}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              {/* Dots */}
              <div className="flex gap-2">
                {offers.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      index === currentSlide 
                        ? "bg-aqua-600 w-6" 
                        : "bg-gray-300 hover:bg-gray-400"
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentSlide((prev) => 
                  (prev + 1) % offers.length
                )}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OffersSection;
