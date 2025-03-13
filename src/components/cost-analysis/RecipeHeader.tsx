import React from 'react';

interface RecipeHeaderProps {
  category: string;
  customImageUrl?: string;
}

export function RecipeHeader({ category, customImageUrl }: RecipeHeaderProps) {
  // Map categories to header images
  const categoryImages = {
    Breakfast: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=1600&auto=format&fit=crop&q=80',
    Lunch: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1600&auto=format&fit=crop&q=80',
    Dinner: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=1600&auto=format&fit=crop&q=80',
    Dessert: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1600&auto=format&fit=crop&q=80'
  };

  const defaultImage = 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=1600&auto=format&fit=crop&q=80';
  
  // Use custom image if provided, otherwise fall back to category image
  const headerImage = customImageUrl || categoryImages[category as keyof typeof categoryImages] || defaultImage;

  return (
    <div className="relative h-48 md:h-64 lg:h-80 mb-8 rounded-lg overflow-hidden shadow-lg">
      <img
        src={headerImage}
        alt={`${category} Recipe`}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="text-sm uppercase tracking-wide">{category}</div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mt-2">Recipe Cost Analysis</h1>
      </div>
    </div>
  );
}