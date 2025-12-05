import { useState, useEffect, useRef, useCallback } from "react"
import { fetchRecipeFromAPI, generateFallbackRecipe } from "../utils/recipeUtils"

export function useRecipeGenerator(ingredients) {
    const [recipeShown, setRecipeShown] = useState(false)
    const [recipe, setRecipe] = useState(null)
    const [loading, setLoading] = useState(false)
    const [recipeError, setRecipeError] = useState("")
    const abortControllerRef = useRef(null)

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [])

    const generateRecipe = useCallback(async () => {
        // Cancel any ongoing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController()
        
        setLoading(true)
        setRecipeError("")
        setRecipeShown(true)

        try {
            const generatedRecipe = await fetchRecipeFromAPI(ingredients, abortControllerRef.current)
            // Check if server indicated to use fallback
            if (generatedRecipe._fallback || generatedRecipe._useFallback) {
                // Server wants us to use fallback, don't set it as error
                setRecipe(generateFallbackRecipe(ingredients))
                setRecipeError('AI services unavailable. Using intelligent fallback recipe generation.')
            } else {
                setRecipe(generatedRecipe)
            }
        } catch (error) {
            // Don't handle errors if request was aborted
            if (error.name === 'AbortError') {
                return
            }
            
            console.error('Error fetching recipe:', error)
            const errorMsg = error.message || 'Failed to generate recipe'
            
            // Check if it's an API configuration error (should show warning)
            if (errorMsg.includes('API Configuration Error') || errorMsg.includes('not configured')) {
                setRecipeError(errorMsg)
            } else {
                // For other errors, use info message since fallback will work
                setRecipeError('AI service temporarily unavailable. Using local recipe generation.')
            }
            // Fallback to local recipe generation
            setRecipe(generateFallbackRecipe(ingredients))
        } finally {
            setLoading(false)
            abortControllerRef.current = null
        }
    }, [ingredients])

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

