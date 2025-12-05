const STORAGE_KEY = 'chef-claude-recipes'
const MAX_SAVED_RECIPES = 50

export function saveRecipe(recipe) {
    try {
        const recipes = getSavedRecipes()
        const recipeWithTimestamp = {
            ...recipe,
            id: Date.now().toString(),
            savedAt: new Date().toISOString()
        }
        
        // Add to beginning of array
        recipes.unshift(recipeWithTimestamp)
        
        // Keep only the most recent recipes
        const trimmedRecipes = recipes.slice(0, MAX_SAVED_RECIPES)
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedRecipes))
        return recipeWithTimestamp
    } catch (error) {
        console.error('Failed to save recipe:', error)
        return null
    }
}

export function getSavedRecipes() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        return stored ? JSON.parse(stored) : []
    } catch (error) {
        console.error('Failed to load saved recipes:', error)
        return []
    }
}

export function deleteSavedRecipe(recipeId) {
    try {
        const recipes = getSavedRecipes()
        const filtered = recipes.filter(r => r.id !== recipeId)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
        return true
    } catch (error) {
        console.error('Failed to delete recipe:', error)
        return false
    }
}

export function clearAllSavedRecipes() {
    try {
        localStorage.removeItem(STORAGE_KEY)
        return true
    } catch (error) {
        console.error('Failed to clear recipes:', error)
        return false
    }
}

