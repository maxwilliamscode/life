import React from 'react';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Hero: React.FC = () => {
  const { data: settings } = useQuery({
    queryKey: ['page-settings', 'home', 'hero'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_settings')
        .select('*')
        .eq('page', 'home')
        .eq('section', 'hero')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {settings?.background_video ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={settings.background_video} type="video/mp4" />
        </video>
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${settings?.banner_image || '/bannerbg.jpg'})`,
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30 backdrop-blur-[1px]"></div>
      
      <div className="container mx-auto px-4 relative z-10 py-20 mt-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block rounded-full bg-aqua-600/20 backdrop-blur-sm px-4 py-1 text-aqua-200 text-sm font-medium border border-aqua-500/30 mb-6 animate-fade-in">
            Premium Aquatic Livestock
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight animate-slide-down" style={{ animationDelay: '100ms' }}>
            Bring the Underwater World <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-aqua-400 to-marine-300">
              to Your Home
            </span>
          </h1>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-down" style={{ animationDelay: '300ms' }}>
            <Link to="/products">
              <Button size="lg" className="w-full sm:w-auto">
                Shop Collection
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
