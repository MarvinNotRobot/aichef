import React from 'react';

interface RecipeHeaderProps {
  title?: string;
  subtitle?: string;
}

export function RecipeHeader({ title = "Recipe Collection", subtitle }: RecipeHeaderProps) {
  return (
    <div className="relative h-64 md:h-72 lg:h-96 mb-8 rounded-lg overflow-hidden shadow-lg">
      <img
        src="https://dbzrsmlutpcbtcduqzkv.supabase.co/storage/v1/object/public/recipe-photos/assets/Funny-AI-Chef.webp"
        alt="Recipe Header"
        className="w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        {subtitle && (
          <div className="text-sm uppercase tracking-wide mb-1">{subtitle}</div>
        )}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mt-2">{title}</h1>
      </div>
    </div>
  );
}