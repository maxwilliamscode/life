import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import BlurBackground from '@/components/layout/BlurBackground';

import discus from '/public/SC-Discus.png';
import discusCollectionBg from '/public/CA-Discus fishes 24012025.png';
import authBackground from '/authbg.jpg';

interface DiscusType {
  id: string;
  name: string;
  image: string;
  searchTerm: string;
}

const discusTypes: DiscusType[] = [
  {
    id: 'Discus',
    name: 'Discus',
    image: discus,
    searchTerm: 'Discus'
  },
];

const DiscusTypes: React.FC = () => {
  const navigate = useNavigate();
  
  const handleCardClick = (type: DiscusType) => {
    navigate(`/products`, {
      state: { 
        initialCategory: 'Discus',
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
              backgroundImage: `url(${discusCollectionBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-aqua-900/30"></div>
            
            <div className="container mx-auto text-center relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Discus Collection</h1>
              <p className="max-w-2xl mx-auto text-aqua-100">
                Explore our premium selection of exotic discus species
              </p>
            </div>
          </div>
        </div>
        
        <section className="py-20 px-8">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {discusTypes.map((type) => (
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
                      
                      <div className="flex items-center justify-center">
                        <div className="h-0.5 w-16 bg-aqua-500/50 rounded-full" />
                      </div>
                      
                      <p className="text-gray-600 text-sm">
                        Premium grade {type.name} with exceptional coloration and pattern
                      </p>

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

export default DiscusTypes;
