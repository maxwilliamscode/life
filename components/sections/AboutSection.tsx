import React from 'react';
import { ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AboutSection: React.FC = () => {
  const { data: settings } = useQuery({
    queryKey: ['page-settings', 'home', 'about'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_settings')
        .select('*')
        .eq('page', 'home')
        .eq('section', 'about')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const renderMedia = (url: string | undefined, fallback: string, alt: string) => {
    if (!url) return <img src={fallback} alt={alt} className="w-full h-full object-cover" />;
    
    if (url.includes('.mp4')) {
      return (
        <video
          src={url}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
      );
    }
    
    return <img src={url} alt={alt} className="w-full h-full object-cover" />;
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Design Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-aqua-100/40 via-transparent to-transparent"></div>
      <div className="absolute right-0 top-1/4 w-96 h-96 bg-aqua-200/20 rounded-full blur-3xl"></div>
      <div className="absolute left-0 bottom-1/4 w-64 h-64 bg-marine-200/20 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block rounded-full bg-aqua-100 px-3 py-1 text-sm font-medium text-aqua-800 mb-4">
            Our Story
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Committed to Aquatic Excellence
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-aqua-400 to-aqua-600 mx-auto mb-6"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Side with Multiple Images */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300 h-48">
                  {renderMedia(settings?.about_image1, "/bgtest3.jpg", "Premium Arowana")}
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300 h-64">
                  {renderMedia(settings?.about_image2, "/authbg.jpg", "Professional Setup")}
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300 h-64">
                  {renderMedia(settings?.about_image3, "/bgtest2.jpg", "Exotic Species")}
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300 h-48">
                  {renderMedia(settings?.about_image4, "/bannerbg.jpg", "Aquatic Beauty")}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:pl-8"
          >
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              At <span className="text-aqua-600 font-semibold">LifestyleAqua</span>, we bring the mesmerizing world of aquatic life into your space. With over 15 years of dedicated experience, we've mastered the art of sourcing and nurturing the most extraordinary aquatic species.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  icon: <ShieldCheck className="w-6 h-6" />,
                  title: "Quality Guarantee",
                  description: "Premium, healthy specimens"
                },
                {
                  icon: <Truck className="w-6 h-6" />,
                  title: "Secure Shipping",
                  description: "Specialized delivery methods"
                },
                {
                  icon: <RefreshCw className="w-6 h-6" />,
                  title: "Live Arrival",
                  description: "100% guarantee coverage"
                },
                {
                  icon: <Award className="w-6 h-6" />,
                  title: "Expert Support",
                  description: "24/7 guidance & care"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                    <div className="bg-gradient-to-br from-aqua-500 to-marine-500 text-white rounded-lg p-3 w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
