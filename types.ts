
export interface RecipeData {
  recipeNumber: string;
  title: string;
  ingredients: string[];
  preparation: string[];
  nutritionInfo: string;
  tip: string;
  dietInfo: string;
  imagePrompt: string;
  hashtags: string[];
}

export interface ImagePart {
    inlineData: {
        data: string;
        mimeType: string;
    }
}