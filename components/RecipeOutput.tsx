import React, { useState, useEffect } from 'react';
import type { RecipeData } from '../types';
import { sendToMake } from '../services/makeService';
import { ClipboardIcon, CheckIcon, SendIcon } from './Icons';

interface RecipeOutputProps {
  recipe: RecipeData;
}

const inputClasses = "w-full p-2 border border-stone-300 rounded-md focus:ring-1 focus:ring-orange-400 focus:border-orange-400 transition bg-white text-sm";
const textareaClasses = `${inputClasses} min-h-[100px] resize-y`;

const EditableField: React.FC<{label: string; children: React.ReactNode; htmlFor?: string}> = ({label, children, htmlFor}) => (
  <div>
    <label htmlFor={htmlFor} className="block font-semibold text-sm text-orange-600 mb-1">{label}</label>
    {children}
  </div>
);

export const RecipeOutput: React.FC<RecipeOutputProps> = ({ recipe }) => {
  const [editedRecipe, setEditedRecipe] = useState<RecipeData>(recipe);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  useEffect(() => {
    setEditedRecipe(recipe);
  }, [recipe]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedRecipe(prev => ({...prev, [name]: value } as RecipeData));
  };

  const handleListChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedRecipe(prev => ({ ...prev, [name]: value.split('\n') } as RecipeData));
  };
  
  const handleHashtagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedRecipe(prev => ({ ...prev, hashtags: e.target.value.split(' ') }));
  };

  const formatRecipeForClipboard = () => {
    const r = editedRecipe;
    return `
Рецепт №${r.recipeNumber}: ${r.title}

🥑 Ингредиенты:
${r.ingredients.map(ing => `- ${ing}`).join('\n')}

🍳 Приготовление:
${r.preparation.map((step, i) => `${i + 1}. ${step}`).join('\n')}

🩺 Показания: ${r.dietInfo}

📊 КБЖУ на 1 порцию: ${r.nutritionInfo}

💡 Совет:
${r.tip}

📸 Промпт для визуала:
${r.imagePrompt}

${r.hashtags.join(' ')}
    `.trim();
  };
  
  const handleCopy = () => {
    const textToCopy = formatRecipeForClipboard();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
  };
  
  const handleSave = async () => {
      setIsSaving(true);
      setSaveSuccess(false);
      setSaveError(null);
      try {
          await sendToMake(editedRecipe);
          setSaveSuccess(true);
      } catch (error) {
          setSaveError(error instanceof Error ? error.message : "Произошла неизвестная ошибка");
      } finally {
          setIsSaving(false);
      }
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);
  
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  if (!editedRecipe) {
    return null;
  }

  return (
    <div className="bg-amber-50/50 border border-amber-200 rounded-xl shadow-lg p-6 animate-fade-in">
       <h2 className="text-xl font-bold mb-4 text-stone-700">2. Отредактируйте и сохраните пост</h2>
      
      <div className="space-y-4">
        {saveError && (
             <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md text-sm" role="alert">
                <p><span className="font-bold">Ошибка сохранения:</span> {saveError}</p>
              </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
                <EditableField label="Номер рецепта" htmlFor="recipeNumber">
                    <input type="text" id="recipeNumber" name="recipeNumber" value={editedRecipe.recipeNumber} onChange={handleTextChange} className={inputClasses} />
                </EditableField>
            </div>
            <div className="sm:col-span-2">
                <EditableField label="Заголовок" htmlFor="title">
                    <input type="text" id="title" name="title" value={editedRecipe.title} onChange={handleTextChange} className={inputClasses} />
                </EditableField>
            </div>
        </div>

        <EditableField label="🥑 Ингредиенты" htmlFor="ingredients">
          <textarea id="ingredients" name="ingredients" value={editedRecipe.ingredients.join('\n')} onChange={handleListChange} className={textareaClasses} />
        </EditableField>

        <EditableField label="🍳 Приготовление" htmlFor="preparation">
          <textarea id="preparation" name="preparation" value={editedRecipe.preparation.join('\n')} onChange={handleListChange} className={textareaClasses} />
        </EditableField>

        <EditableField label="🩺 Диеты / Показания" htmlFor="dietInfo">
           <input type="text" id="dietInfo" name="dietInfo" value={editedRecipe.dietInfo} onChange={handleTextChange} className={inputClasses} />
        </EditableField>

        <EditableField label="📊 ДопИнфа (КБЖУ на 1 порцию)" htmlFor="nutritionInfo">
           <input type="text" id="nutritionInfo" name="nutritionInfo" value={editedRecipe.nutritionInfo} onChange={handleTextChange} className={inputClasses} />
        </EditableField>
        
        <EditableField label="💡 Совет" htmlFor="tip">
          <textarea id="tip" name="tip" value={editedRecipe.tip} onChange={handleTextChange} className={textareaClasses} />
        </EditableField>

        <EditableField label="📸 Промпт для визуала" htmlFor="imagePrompt">
          <textarea id="imagePrompt" name="imagePrompt" value={editedRecipe.imagePrompt} onChange={handleTextChange} className={`${textareaClasses} font-mono`} />
        </EditableField>

        <EditableField label="Хэштеги" htmlFor="hashtags">
           <input type="text" id="hashtags" name="hashtags" value={editedRecipe.hashtags.join(' ')} onChange={handleHashtagsChange} className={inputClasses} />
        </EditableField>
      </div>

       <div className="mt-6 flex justify-end items-center gap-2">
            <button
                onClick={handleCopy}
                className="bg-amber-100 text-amber-800 p-2 rounded-full hover:bg-amber-200 transition"
                title="Скопировать"
            >
                {copied ? <CheckIcon className="h-5 w-5 text-green-600" /> : <ClipboardIcon className="h-5 w-5" />}
            </button>
            <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-1.5 bg-orange-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-orange-600 transition disabled:bg-stone-300`}
                title="Отправить в таблицу"
            >
                {isSaving ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : saveSuccess ? (
                   <CheckIcon className="h-5 w-5" />
                ) : (
                   <SendIcon className="h-5 w-5" />
                )}
                <span className="hidden sm:inline">{isSaving ? "Отправка..." : saveSuccess ? "Сохранено!" : "Отправить"}</span>
            </button>
       </div>
    </div>
  );
};