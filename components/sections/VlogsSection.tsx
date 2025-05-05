import React from 'react';
import { Play, Eye, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { ShadcnButton } from '@/components/ui/shadcn-button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface Vlog {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  thumbnail_url: string;
  duration?: string;
  views_count?: string;
  active: boolean;
  featured: boolean;
}

const VlogsSection: React.FC = () => {
  const { data: vlogs, isLoading, error } = useQuery({
    queryKey: ['vlogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vlogs')
        .select('*')
        .eq('active', true)
        .eq('featured', true) // Only fetch featured vlogs
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Vlog[];
    }
  });

  // Don't show section if no featured vlogs
  if (isLoading) {
    return (
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-aqua-600" />
        </div>
      </section>
    );
  }

  if (error || !vlogs || vlogs.length === 0) {
    return null; // Don't show the section if there are no vlogs
  }

  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Video Gallery
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-aqua-400 to-aqua-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600">
            Explore our collection of informative and entertaining videos about Arowanas and aquatic life.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vlogs.map((vlog, index) => (
            <motion.div
              key={vlog.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative">
                  {/* Add featured badge */}
                  {vlog.featured && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge 
                        variant="secondary" 
                        className="bg-aqua-500/90 text-white border-none"
                      >
                        Featured
                      </Badge>
                    </div>
                  )}
                  <img 
                    src={vlog.thumbnail_url} 
                    alt={vlog.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                  {vlog.duration && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-2 text-white text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{vlog.duration}</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {vlog.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {vlog.description}
                  </p>
                  <div className="flex items-center justify-between">
                    {vlog.views_count && (
                      <div className="flex items-center text-gray-500 text-sm">
                        <Eye className="w-4 h-4 mr-1" />
                        <span>{vlog.views_count} views</span>
                      </div>
                    )}
                    <ShadcnButton 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(vlog.youtube_url, '_blank')}
                    >
                      Watch Now
                    </ShadcnButton>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <ShadcnButton
            onClick={() => window.open('https://youtube.com/@lifestyleaqua', '_blank')}
            className="bg-red-600 hover:bg-red-700"
          >
            <Play className="mr-2 h-4 w-4" />
            Visit Our YouTube Channel
          </ShadcnButton>
        </div>
      </div>
    </section>
  );
};

export default VlogsSection;
