import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';

// Product type data
const productTypeData = {
  arowana: {
    title: 'Arowana',
    description: 'Explore our premium selection of exotic arowana species',
    bannerImage: '/CA-Arowana Fishes -24012025.png',
    types: [
      {
        id: 'golden-head-bluebase',
        name: 'Golden Head Bluebase',
        image: '/Mc-Golden Head Bule Base.png',
        searchTerm: 'Golden Head Bluebase'
      },
      {
        id: 'indo-super-red',
        name: 'Indo Super Red',
        image: '/Mc-Indo Super Red.png',
        searchTerm: 'Indo Super Red'
      },
      {
        id: 'golden-head',
        name: 'Golden Head Arowana',
        image: '/Mc-Golden Head Arowana.png',
        searchTerm: 'Golden Head'
      },
      {
        id: 'malaysian-crossback',
        name: 'Malaysian Crossback Golden',
        image: '/Mc-malaysian Crossback golden.png',
        searchTerm: 'Malaysian Crossback'
      }
    ]
  },
  discus: {
    title: 'Discus',
    description: 'Discover our beautiful collection of discus fish',
    bannerImage: '/discus-banner.jpg',
    types: [
      {
        id: 'turkish-blue',
        name: 'Turkish Blue Discus',
        image: '/mc-turkish-blue-discus.png',
        searchTerm: 'Turkish Blue Discus'
      },
      {
        id: 'red-pigeon',
        name: 'Red Pigeon Discus',
        image: '/mc-red-pigeon-discus.png',
        searchTerm: 'Red Pigeon Discus'
      },
      {
        id: 'snake-skin',
        name: 'Snake Skin Discus',
        image: '/mc-snake-skin-discus.png',
        searchTerm: 'Snake Skin Discus'
      },
      {
        id: 'red-melon',
        name: 'Red Melon Discus',
        image: '/mc-red-melon-discus.png',
        searchTerm: 'Red Melon Discus'
      }
    ]
  },
  silverDollar: {
    title: 'Silver Dollar',
    description: 'Browse our selection of silver dollar fish',
    bannerImage: '/silver-dollar-banner.jpg',
    types: [
      {
        id: 'red-hook',
        name: 'Red Hook Silver Dollar',
        image: '/mc-red-hook-silver-dollar.png',
        searchTerm: 'Red Hook Silver Dollar'
      },
      {
        id: 'tiger',
        name: 'Tiger Silver Dollar',
        image: '/mc-tiger-silver-dollar.png',
        searchTerm: 'Tiger Silver Dollar'
      },
      {
        id: 'spotted',
        name: 'Spotted Silver Dollar',
        image: '/mc-spotted-silver-dollar.png',
        searchTerm: 'Spotted Silver Dollar'
      },
      {
        id: 'golden',
        name: 'Golden Silver Dollar',
        image: '/mc-golden-silver-dollar.png',
        searchTerm: 'Golden Silver Dollar'
      }
    ]
  },
  food: {
    title: 'Fish Food',
    description: 'Premium quality food for your aquatic pets',
    bannerImage: '/food-banner.jpg',
    types: [
      // Add food types here
    ]
  },
  accessories: {
    title: 'Accessories',
    description: 'Essential accessories for your aquarium',
    bannerImage: '/accessories-banner.jpg',
    types: [
      // Add accessories types here
    ]
  }
};

const ProductTypes = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  
  const categoryData = category ? productTypeData[category as keyof typeof productTypeData] : null;

  if (!categoryData) {
    navigate('/products');
    return null;
  }

  const handleCardClick = (type: { searchTerm: string }) => {
    navigate('/products', {
      state: { 
        initialCategory: categoryData.title,
        searchTerm: type.searchTerm,
        autoSearch: true
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="pt-20 relative">
        <div className="relative h-[500px] w-full shadow-xl">
          <img 
            src={categoryData.bannerImage} 
            alt={`${categoryData.title} Banner`} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70">
            <div className="container mx-auto h-full flex flex-col items-center justify-center px-4 pt-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center text-white drop-shadow-lg">
                {categoryData.title} Collection
              </h1>
              <p className="max-w-2xl mx-auto text-center text-white/90 drop-shadow-md">
                {categoryData.description}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <section className="py-20 px-8 bg-gradient-to-b from-gray-50 to-white flex-1">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {categoryData.types.map((type) => (
              <Card 
                key={type.id} 
                className="group overflow-hidden transition-all duration-500 transform 
                         hover:-translate-y-2 bg-white rounded-3xl shadow-lg hover:shadow-2xl"
                onClick={() => handleCardClick(type)}
              >
                {/* Card content from ArowanaTypes */}
                <div className="p-6">
                  <div className="relative h-80 rounded-2xl overflow-hidden mb-6">
                    <img 
                      src={type.image} 
                      alt={type.name} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  <div className="space-y-4 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-aqua-600 transition-colors">
                      {type.name}
                    </h3>
                    
                    <div className="flex items-center justify-center">
                      <div className="h-0.5 w-16 bg-aqua-500/50 rounded-full" />
                    </div>
                    
                    <button 
                      className="w-full inline-flex items-center justify-center px-6 py-3 
                               bg-gradient-to-r from-aqua-600 to-aqua-500 text-white 
                               rounded-xl font-medium shadow-lg shadow-aqua-500/25
                               hover:shadow-xl hover:shadow-aqua-500/35 
                               transition-all duration-300"
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
  );
};

export default ProductTypes;
