import { GoogleGenAI, Type, Part } from "@google/genai";
import type { Handler, HandlerEvent } from "@netlify/functions";

// Эти переменные и константы определяются один раз при инициализации функции
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set in Netlify function environment.");
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

const systemInstruction = `You are an expert culinary AI specializing in adapting professional dietary recipes for home cooking. Your task is to analyze the user's recipe (from text or image) and convert it into a structured Instagram post format. You must strictly adhere to the provided JSON schema for your output. The tone should be warm, encouraging, and clear for a home cook. Calculate nutritional values based on standard food data for the adapted ingredient quantities.`;
const promptTemplate = `Пожалуйста, проанализируй следующий рецепт из общепита. Адаптируй его для домашнего приготовления на 2-4 порции и создай пост для Instagram в формате JSON. Пост должен содержать: номер рецепта, заголовок, список ингредиентов, 3-4 шага приготовления, КБЖУ на 1 порцию в виде одной строки, полезный совет, информацию о диете/показаниях, промпт для генерации визуала (на английском) и хэштеги, включая #ВкусноПростоПолезно и #Диета№N.`;


const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Request body is missing.' }) };
    }

    const { text, image } = JSON.parse(event.body);

    if (!text && !image) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Please provide a recipe text or an image.' }) };
    }

    const contents: Part[] = [];
    if (text) {
        contents.push({ text: `${promptTemplate}\n\nТекст рецепта:\n${text}` });
    } else {
        contents.push({ text: promptTemplate });
    }

    if (image) {
        contents.push(image);
    }
    
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

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsedJson),
    };

  } catch (error) {
    console.error("Error in Netlify function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Не удалось сгенерировать рецепт на сервере.", details: errorMessage }),
    };
  }
};

export { handler };
