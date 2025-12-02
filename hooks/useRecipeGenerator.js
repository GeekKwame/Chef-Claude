import { useState } from "react"
import { fetchRecipeFromAPI, generateFallbackRecipe } from "../utils/recipeUtils"

export function useRecipeGenerator(ingredients) {
    const [recipeShown, setRecipeShown] = useState(false)
    const [recipe, setRecipe] = useState(null)
    const [loading, setLoading] = useState(false)
    const [recipeError, setRecipeError] = useState("")

    async function generateRecipe() {
        setLoading(true)
        setRecipeError("")
        setRecipeShown(true)

        try {
            const generatedRecipe = await fetchRecipeFromAPI(ingredients)
            setRecipe(generatedRecipe)
        } catch (error) {
            console.error('Error fetching recipe:', error)
            setRecipeError(error.message || 'Failed to generate recipe. Using fallback recipe.')
            // Fallback to local recipe generation
            setRecipe(generateFallbackRecipe(ingredients))
        } finally {
            setLoading(false)
        }
    }

    function closeRecipe() {
        setRecipeShown(false)
        setRecipe(null)
        setRecipeError("")
    }

    function resetRecipe() {
        if (recipeShown) {
            closeRecipe()
        }
    }

    return {
        recipeShown,
        recipe,
        loading,
        recipeError,
        generateRecipe,
        closeRecipe,
        resetRecipe
    }
}

