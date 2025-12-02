export function generateFallbackRecipe(ingredients) {
    const recipeNames = [
        "Delicious Fusion Dish",
        "Chef's Special Creation",
        "Gourmet Masterpiece",
        "Flavorful Combination",
        "Culinary Delight"
    ]
    
    const recipeName = recipeNames[Math.floor(Math.random() * recipeNames.length)]
    
    const instructions = [
        `Preheat your cooking surface and prepare your ${ingredients[0]}.`,
        `Heat a large pan or pot over medium heat.`,
        ingredients.some(ing => ing.toLowerCase().includes("meat") || ing.toLowerCase().includes("beef") || ing.toLowerCase().includes("chicken")) 
            ? `Cook any meat ingredients first until browned, then remove from pan.`
            : `Start by sautéing your base ingredients.`,
        `Add ${ingredients.filter((_, i) => i < 3).join(", ")} to the pan and cook until fragrant.`,
        ingredients.some(ing => ing.toLowerCase().includes("spice") || ing.toLowerCase().includes("spices"))
            ? `Season with your spices and stir well.`
            : `Add seasonings to taste.`,
        `Combine all remaining ingredients and let simmer for 10-15 minutes.`,
        ingredients.some(ing => ing.toLowerCase().includes("pasta") || ing.toLowerCase().includes("noodle"))
            ? `Cook pasta separately and combine with the sauce when ready.`
            : `Stir everything together until well combined.`,
        `Taste and adjust seasoning as needed, then serve hot.`
    ]
    
    return { 
        name: recipeName, 
        ingredients: ingredients,
        instructions 
    }
}

export async function fetchRecipeFromAPI(ingredients) {
    const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients })
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMsg = errorData.error || 'Failed to generate recipe'
        // Make API key errors more helpful
        if (errorMsg.includes('API key') || errorMsg.includes('not configured')) {
            throw new Error(`API Configuration Error: ${errorMsg}. Please check your .env file and ensure CLAUDE_API_KEY is set.`)
        }
        throw new Error(errorMsg)
    }

    const generatedRecipe = await response.json()
    
    // Ensure recipe has all required fields
    if (generatedRecipe.name && generatedRecipe.instructions) {
        return generatedRecipe
    } else {
        throw new Error('Invalid recipe format received')
    }
}

