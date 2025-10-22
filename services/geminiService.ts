import type { RecipeData, ImagePart } from '../types';

export async function generateRecipePost(text: string, image: ImagePart | null): Promise<RecipeData> {
    try {
        const response = await fetch('/.netlify/functions/generate-recipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, image }),
        });

        const responseBody = await response.json();

        if (!response.ok) {
            console.error("Server error response:", responseBody);
            // Используем сообщение об ошибке от сервера, если оно есть
            const errorMessage = responseBody.error || `Ошибка сервера: ${response.status}`;
            throw new Error(errorMessage);
        }

        return responseBody as RecipeData;

    } catch (error) {
        console.error("Error calling Netlify function:", error);
        if (error instanceof Error) {
            // Передаем более понятное сообщение в UI
            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                throw new Error("Ошибка сети. Проверьте ваше интернет-соединение.");
            }
            throw new Error(error.message);
        }
        throw new Error("Произошла неизвестная ошибка при отправке запроса.");
    }
}
