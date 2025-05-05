import React from 'react';

interface BlurBackgroundProps {
  children: React.ReactNode;
  imagePath?: string;
}

const BlurBackground: React.FC<BlurBackgroundProps> = ({ 
  children, 
  imagePath = '/authbg.jpg' 
}) => {
  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-[-1]"
        style={{
          backgroundImage: `url(${imagePath})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />
      {/* Overlay */}
      <div className="fixed inset-0 z-[-1] bg-gradient-to-b from-black/50 to-black/30 backdrop-blur-[1px]" />
      
      {/* Content */}
      <div className="relative z-0">
        {children}
      </div>
    </div>
  );
};

export default BlurBackground;
