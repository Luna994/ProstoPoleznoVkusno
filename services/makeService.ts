import type { RecipeData } from '../types';

const WEBHOOK_URL = "https://hook.eu2.make.com/jo52w67and9w23pahdk86vdbiaqtzfcd";

function formatRecipeForMake(recipe: RecipeData) {
    const { 
        recipeNumber, 
        title, 
        ingredients, 
        preparation, 
        tip, 
        nutritionInfo,
        dietInfo, 
        imagePrompt, 
        hashtags 
    } = recipe;

    const recipeText = `Ингредиенты:\n${ingredients.map(i => `- ${i}`).join('\n')}\n\nПриготовление:\n${preparation.map((step, i) => `${i + 1}. ${step}`).join('\n')}`;
    const hashtagsText = hashtags.join(' ');

    return {
        post_content: {
            "Номер": recipeNumber,
            "Заголовок": title,
            "Рецепт": recipeText,
            "Совет": tip,
            "ДопИнфа": nutritionInfo,
            "Диеты": dietInfo,
            "Промпт": imagePrompt,
            "Хэштеги": hashtagsText,
        }
    };
}

export async function sendToMake(recipe: RecipeData): Promise<void> {
    const payload = formatRecipeForMake(recipe);

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`);
        }
        
        // Make.com often returns "Accepted." as text, so we don't need to parse JSON
        console.log("Данные успешно отправлены в Make.com");

    } catch (error) {
        console.error("Не удалось отправить данные в Make.com:", error);
        throw new Error("Не удалось сохранить данные. Проверьте консоль для получения подробной информации.");
    }
}