import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import BlurBackground from '@/components/layout/BlurBackground';
import authBackground from '/authbg.jpg';

import mcGoldenHeadArowana from '/public/Mc-Golden Head Arowana.png';
import mcGoldenHeadbulebase from '/public/Mc-Golden Head Bule Base.png';
import mcindosuperred from '/public/Mc-Indo Super Red.png';
import mcmalaysiancrossbackgolden from '/public/Mc-malaysian Crossback golden.png';
import arowanaCollectionBg from '/CA-Arowana Fishes -24012025.png';

interface ArowanaType {
  id: string;
  name: string;
  image: string;
  searchTerm: string; // Add this field for search
}

const arowanaTypes: ArowanaType[] = [
  {
    id: 'golden-head-blue-base',
    name: 'Golden Head Blue base',
    image: mcGoldenHeadbulebase,
    searchTerm: 'Golden Head Blue base'
  },
  {
    id: 'indo-super-red',
    name: 'Indo Super Red',
    image: mcindosuperred,
    searchTerm: 'Indo Super Red'
  },
  {
    id: 'golden-head',
    name: 'Golden Head Arowana',
    image: mcGoldenHeadArowana,
    searchTerm: 'Golden Head'
  },
  {
    id: 'malaysian-crossback',
    name: 'Malaysian Crossback Golden',
    image: mcmalaysiancrossbackgolden,
    searchTerm: 'Malaysian Crossback'
  },
];

const ArowanaTypes: React.FC = () => {
  const navigate = useNavigate();
  
  const handleCardClick = (type: ArowanaType) => {
    // Navigate to products page with search parameters
    navigate(`/products`, {
      state: { 
        initialCategory: 'Arowana',
        searchTerm: type.searchTerm,
        autoSearch: true
      }
    });
  };

  return (
    <BlurBackground>
      <div className="min-h-screen flex flex-col bg-transparent">
        {/* Add background image */}
        <div 
          className="fixed inset-0 z-[-1]"
          style={{
            backgroundImage: `url(${authBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30 backdrop-blur-[1px]"></div>

        <div className="relative z-10 w-full px-4">
          <div 
            className="mt-28 py-32 px-4 text-white relative h-[500px] rounded-2xl shadow-2xl overflow-hidden" 
            style={{
              backgroundImage: `url(${arowanaCollectionBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-aqua-900/30"></div>
            
            <div className="container mx-auto text-center relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Arowana Collection</h1>
              <p className="max-w-2xl mx-auto text-aqua-100">
                Explore our premium selection of exotic arowana species
              </p>
            </div>
          </div>
        </div>
        
        <section className="py-20 px-8">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {arowanaTypes.map((type) => (
                <Card 
                  key={type.id} 
                  className="group overflow-hidden transition-all duration-500 transform 
                           hover:-translate-y-2 bg-white rounded-2xl
                           shadow-lg hover:shadow-2xl max-w-sm mx-auto"
                  onClick={() => handleCardClick(type)}
                >
                  <div className="p-4">
                    <div className="relative h-60 rounded-xl overflow-hidden mb-4">
                      <img 
                        src={type.image} 
                        alt={type.name} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Premium badge */}
                      <div className="absolute top-4 right-4">
                        <span className="px-4 py-1.5 bg-white/90 backdrop-blur-sm rounded-full 
                                     text-sm font-semibold text-aqua-600 shadow-lg">
                          Premium
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 text-center">
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-aqua-600 
                                  transition-colors">{type.name}</h3>
                      
                      {/* Decorative line */}
                      <div className="flex items-center justify-center">
                        <div className="h-0.5 w-16 bg-aqua-500/50 rounded-full" />
                      </div>
                      
                      {/* Description - Added new */}
                      <p className="text-gray-600 text-sm">
                        Premium grade {type.name} with exceptional coloration and pattern
                      </p>

                      {/* Action button */}
                      <button 
                        className="w-full inline-flex items-center justify-center px-6 py-3 
                                 bg-gradient-to-r from-aqua-600 to-aqua-500 text-white 
                                 rounded-xl font-medium shadow-lg shadow-aqua-500/25
                                 hover:shadow-xl hover:shadow-aqua-500/35 
                                 transition-all duration-300"
                        onClick={() => handleCardClick(type)}
                      >
                        View Collection
                        <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" 
                             fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </BlurBackground>
  );
};

export default ArowanaTypes;
