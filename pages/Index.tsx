import React from 'react';
import Hero from '@/components/sections/Hero';
import FeaturedProducts from '@/components/sections/FeaturedProducts';
import AboutSection from '@/components/sections/AboutSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import ContactSection from '@/components/sections/ContactSection';
import OffersSection from '@/components/sections/OffersSection';
import VlogsSection from '@/components/sections/VlogsSection';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      
      <main>
        <Hero />
        <OffersSection />
        <FeaturedProducts />
        <VlogsSection />
        <section id="about" className="scroll-mt-20">
          <AboutSection />
        </section>
        <TestimonialsSection />
        <section id="contact" className="scroll-mt-20">
          <ContactSection />
        </section>
      </main>
    </div>
  );
};

export default Index;
