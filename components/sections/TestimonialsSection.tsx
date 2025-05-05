
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Star, StarHalf, StarOff } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Testimonial {
  id: string;
  name: string;
  role?: string;
  company?: string;
  content: string;
  rating: number;
  avatar_url?: string;
  is_featured: boolean;
}

const fetchTestimonials = async (): Promise<Testimonial[]> => {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('is_featured', { ascending: false })
    .limit(6);
  
  if (error) {
    console.error('Error fetching testimonials:', error);
    throw error;
  }
  
  return data || [];
};

const TestimonialsSection: React.FC = () => {
  const { data: testimonials, isLoading, error } = useQuery({
    queryKey: ['testimonials'],
    queryFn: fetchTestimonials,
  });

  const renderRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<StarHalf key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />);
      } else {
        stars.push(<StarOff key={i} className="h-5 w-5 text-gray-300" />);
      }
    }
    return stars;
  };

  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse w-full max-w-2xl">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-6"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-100 p-6 rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <div className="mb-2 inline-block rounded-full bg-aqua-100 px-3 py-1 text-sm font-medium text-aqua-800">
            Customer Testimonials
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="max-w-2xl mx-auto text-gray-600">
            Don't just take our word for it - hear from our satisfied customers about their experiences with LifestyleAqua.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className={`
                bg-white p-6 rounded-xl shadow-md relative 
                ${testimonial.is_featured ? 'border-2 border-aqua-500' : 'border border-gray-100'}
              `}
            >
              {testimonial.is_featured && (
                <div className="absolute top-4 right-4 bg-aqua-500 text-white text-xs font-bold px-2 py-1 rounded">
                  Featured
                </div>
              )}
              
              <div className="flex items-center mb-4">
                {renderRatingStars(testimonial.rating)}
              </div>
              
              <blockquote className="text-gray-700 mb-6">
                "{testimonial.content}"
              </blockquote>
              
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {testimonial.avatar_url ? (
                    <img 
                      src={testimonial.avatar_url} 
                      alt={testimonial.name} 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-aqua-100 flex items-center justify-center text-aqua-800 font-medium">
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{testimonial.name}</p>
                  <div className="text-xs text-gray-500">
                    {testimonial.role && testimonial.company 
                      ? `${testimonial.role}, ${testimonial.company}`
                      : testimonial.role || testimonial.company || ''}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
