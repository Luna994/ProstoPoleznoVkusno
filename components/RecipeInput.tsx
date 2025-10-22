
import React, { useState, useRef } from 'react';
import { GenerateIcon, ImageIcon, TextIcon } from './Icons';

interface RecipeInputProps {
  onGenerate: (text: string, imageFile: File | null) => void;
  isLoading: boolean;
}

type InputMode = 'text' | 'image';

export const RecipeInput: React.FC<RecipeInputProps> = ({ onGenerate, isLoading }) => {
  const [mode, setMode] = useState<InputMode>('text');
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateClick = () => {
    onGenerate(text, imageFile);
  };

  const TabButton: React.FC<{
    currentMode: InputMode;
    targetMode: InputMode;
    onClick: () => void;
    children: React.ReactNode;
  }> = ({ currentMode, targetMode, onClick, children }) => (
    <button
      onClick={onClick}
      className={`flex-1 py-2 px-4 text-sm font-semibold rounded-t-lg flex items-center justify-center gap-2 transition-colors ${
        currentMode === targetMode
          ? 'bg-white text-orange-600 border-b-2 border-orange-500'
          : 'bg-amber-100 text-stone-500 hover:bg-amber-200'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full">
      <h2 className="text-xl font-bold mb-4 text-stone-700">1. Добавьте рецепт</h2>
      <div className="flex border-b border-stone-200">
        <TabButton currentMode={mode} targetMode="text" onClick={() => setMode('text')}>
          <TextIcon className="h-5 w-5" /> Текст
        </TabButton>
        <TabButton currentMode={mode} targetMode="image" onClick={() => setMode('image')}>
          <ImageIcon className="h-5 w-5" /> Скриншот
        </TabButton>
      </div>

      <div className="pt-4">
        {mode === 'text' && (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Вставьте сюда текст рецепта из сборника..."
            className="w-full h-48 p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition bg-white"
            disabled={isLoading}
          />
        )}
        {mode === 'image' && (
          <div className="text-center">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              disabled={isLoading}
            />
            {imagePreview ? (
              <div className="relative group">
                 <img src={imagePreview} alt="Recipe preview" className="mx-auto max-h-48 rounded-lg border border-stone-200" />
                 <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    Изменить фото
                 </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-stone-300 rounded-lg flex flex-col items-center justify-center text-stone-500 hover:bg-amber-50 hover:border-orange-400 transition"
                disabled={isLoading}
              >
                <ImageIcon className="h-10 w-10 mb-2" />
                <span>Нажмите, чтобы загрузить скриншот</span>
              </button>
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleGenerateClick}
        disabled={isLoading || (!text && !imageFile)}
        className="mt-6 w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-orange-600 transition-all transform hover:scale-105 disabled:bg-stone-300 disabled:cursor-not-allowed disabled:scale-100"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Генерация...
          </>
        ) : (
          <>
            <GenerateIcon className="h-5 w-5" />
            Создать пост
          </>
        )}
      </button>
    </div>
  );
};