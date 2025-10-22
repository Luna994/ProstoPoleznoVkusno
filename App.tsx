
import React, { useState } from 'react';
import { Header } from './components/Header';
import { RecipeInput } from './components/RecipeInput';
import { RecipeOutput } from './components/RecipeOutput';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Footer } from './components/Footer';
import { generateRecipePost } from './services/geminiService';
import type { RecipeData } from './types';
import { fileToBase64 } from './utils/fileUtils';

const App: React.FC = () => {
  const [recipeData, setRecipeData] = useState<RecipeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (text: string, imageFile: File | null) => {
    setIsLoading(true);
    setError(null);
    setRecipeData(null);

    try {
      let imagePart = null;
      if (imageFile) {
        const { base64, mimeType } = await fileToBase64(imageFile);
        imagePart = {
          inlineData: {
            data: base64,
            mimeType: mimeType,
          },
        };
      }
      
      if (!text && !imagePart) {
        throw new Error("Please provide a recipe text or an image.");
      }

      const result = await generateRecipePost(text, imagePart);
      setRecipeData(result);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 text-stone-800">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="w-full">
            <RecipeInput onGenerate={handleGenerate} isLoading={isLoading} />
          </div>
          <div className="w-full">
            {isLoading && <LoadingSpinner />}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <p className="font-bold">Ошибка</p>
                <p>{error}</p>
              </div>
            )}
            {recipeData && <RecipeOutput recipe={recipeData} />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;