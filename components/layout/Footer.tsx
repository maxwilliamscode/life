import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category: string) => {
    navigate(`/products/category/${encodeURIComponent(category)}`);
  };

  return (
    <div className="pb-1 relative z-10">
      <footer className="bg-gray-900/95 backdrop-blur-sm text-white pt-16 pb-8 rounded-3xl mx-1 shadow-xl">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">LifestyleAqua</h3>
              <p className="text-gray-400 mb-4">
                Premium quality exotic fish and aquarium supplies for the discerning aquarist.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-aqua-400 transition-colors">
                  <Facebook size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-aqua-400 transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-aqua-400 transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-aqua-400 transition-colors">
                  <Youtube size={20} />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Our Collection</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => navigate('/arowana-types')}
                    className="text-gray-400 hover:text-aqua-400 transition-colors"
                  >
                    Arowana
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleCategoryClick('Discus')}
                    className="text-gray-400 hover:text-aqua-400 transition-colors"
                  >
                    Discus
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleCategoryClick('Silver Dollar')}
                    className="text-gray-400 hover:text-aqua-400 transition-colors"
                  >
                    Silver Dollar
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleCategoryClick('Fish Food')}
                    className="text-gray-400 hover:text-aqua-400 transition-colors"
                  >
                    Fish Food
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleCategoryClick('Accessories')}
                    className="text-gray-400 hover:text-aqua-400 transition-colors"
                  >
                    Accessories
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-aqua-400 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-gray-400 hover:text-aqua-400 transition-colors">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link to="/certification" className="text-gray-400 hover:text-aqua-400 transition-colors">
                    Arowana Authenticator
                  </Link>
                </li>
                <li>
                  <a href="#about" className="text-gray-400 hover:text-aqua-400 transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-gray-400 hover:text-aqua-400 transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <MapPin size={20} className="mr-2 text-aqua-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-400">LIFE STYLE AQUARIUM, No. 269 B, KIADB, Bommasandra Industrial Area, Bengaluru - 560099</span>
                </li>
                <li className="flex items-center">
                  <Phone size={20} className="mr-2 text-aqua-400 flex-shrink-0" />
                  <span className="text-gray-400">+91-9738276569</span>
                </li>
                <li className="flex items-center">
                  <Mail size={20} className="mr-2 text-aqua-400 flex-shrink-0" />
                  <span className="text-gray-400">support@lifestyleaqua.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <hr className="border-gray-800 my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} LifestyleAqua. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy-policy" className="text-gray-500 text-sm hover:text-aqua-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-conditions" className="text-gray-500 text-sm hover:text-aqua-400 transition-colors">
                Terms & Conditions
              </Link>
              <a href="#" className="text-gray-500 text-sm hover:text-aqua-400 transition-colors">
                Shipping Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
