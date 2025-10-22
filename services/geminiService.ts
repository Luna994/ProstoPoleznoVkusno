
import { GoogleGenAI, Type, Part } from "@google/genai";
import type { RecipeData, ImagePart } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const recipeSchema = {
    type: Type.OBJECT,
    properties: {
        recipeNumber: { type: Type.STRING, description: 'Номер рецепта, извлеченный из текста (число перед заголовком).' },
        title: { type: Type.STRING, description: 'Название рецепта.' },
        ingredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Список ингредиентов, адаптированный для домашнего приготовления (на 2-4 порции).'
        },
        preparation: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Список из 3-4 шагов приготовления.'
        },
        nutritionInfo: { 
            type: Type.STRING, 
            description: 'Рассчитанный КБЖУ на одну порцию в виде одной строки. Например: "Калорийность - 400 ккал, Б - 30 г, Ж - 20 г, У - 30 г".' 
        },
        tip: { type: Type.STRING, description: 'Короткий полезный совет или лайфхак по приготовлению.' },
        dietInfo: { type: Type.STRING, description: 'Номера диет и/или медицинские показания, к которым относится рецепт (например, "Диета №5, гастрит").' },
        imagePrompt: { type: Type.STRING, description: 'Промпт для генерации фото-реалистичного изображения готового блюда. Должен быть на английском языке.' },
        hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Список релевантных хэштегов, включая "#ВкусноПростоПолезно" и "#Диета№N", где N - номер диеты из рецепта.'
        }
    },
    required: ['recipeNumber', 'title', 'ingredients', 'preparation', 'nutritionInfo', 'tip', 'dietInfo', 'imagePrompt', 'hashtags']
};

export async function generateRecipePost(text: string, image: ImagePart | null): Promise<RecipeData> {
    const systemInstruction = `You are an expert culinary AI specializing in adapting professional dietary recipes for home cooking. Your task is to analyze the user's recipe (from text or image) and convert it into a structured Instagram post format. You must strictly adhere to the provided JSON schema for your output. The tone should be warm, encouraging, and clear for a home cook. Calculate nutritional values based on standard food data for the adapted ingredient quantities.`;
    
    const prompt = `Пожалуйста, проанализируй следующий рецепт из общепита. Адаптируй его для домашнего приготовления на 2-4 порции и создай пост для Instagram в формате JSON. Пост должен содержать: номер рецепта, заголовок, список ингредиентов, 3-4 шага приготовления, КБЖУ на 1 порцию в виде одной строки, полезный совет, информацию о диете/показаниях, промпт для генерации визуала (на английском) и хэштеги, включая #ВкусноПростоПолезно и #Диета№N.`;
    
    const contents: Part[] = [];
    if (text) {
        contents.push({ text: `${prompt}\n\nТекст рецепта:\n${text}` });
    } else {
        contents.push({ text: prompt });
    }

    if (image) {
        contents.push(image);
    }
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: contents },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: recipeSchema,
                temperature: 0.5,
            },
        });
        
        const jsonString = response.text.trim();
        const parsedJson = JSON.parse(jsonString);
        if (parsedJson.nutrition && typeof parsedJson.nutrition === 'object') {
            parsedJson.nutritionInfo = `Калорийность - ${parsedJson.nutrition.calories}, Б - ${parsedJson.nutrition.protein}, Ж - ${parsedJson.nutrition.fat}, У - ${parsedJson.nutrition.carbs}`;
            delete parsedJson.nutrition;
        }

        return parsedJson as RecipeData;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('API_KEY_INVALID'))) {
             throw new Error("Неверный API ключ. Пожалуйста, проверьте ключ в настройках Netlify.");
        }
        throw new Error("Не удалось сгенерировать рецепт. Возможно, модель не может обработать эти данные или API ключ недействителен.");
    }
}