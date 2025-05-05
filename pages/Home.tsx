import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category: string) => {
    navigate('/products', {
      state: { initialCategory: category }
    });
  };

  return (
    <div>
      {/* Example category cards */}
      <div onClick={() => handleCategoryClick('Arowana')}>Arowana</div>
      <div onClick={() => handleCategoryClick('Discus')}>Discus</div>
      <div onClick={() => handleCategoryClick('Accessories')}>Accessories</div>
    </div>
  );
};

export default Home;