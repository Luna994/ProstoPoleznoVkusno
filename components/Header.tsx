
import React from 'react';
import { ChefHatIcon } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <ChefHatIcon className="h-8 w-8 text-orange-500 mr-3" />
          <h1 className="text-2xl md:text-3xl font-bold text-stone-800 tracking-tight">
            Генератор Рецептов - 2
          </h1>
        </div>
      </div>
    </header>
  );
};