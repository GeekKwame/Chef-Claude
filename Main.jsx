import React from "react"

export default function Main() {

    const [ingredients, setIngredients] = React.useState(
        ["all the main spices", "pasta", "ground beef", "tomato paste"]
    )
    const [recipeShown, setRecipeShown] = React.useState(false)
    const [recipe, setRecipe] = React.useState(null)
    const [inputValue, setInputValue] = React.useState("")
    const [errorMessage, setErrorMessage] = React.useState("")
    const [loading, setLoading] = React.useState(false)
    const [recipeError, setRecipeError] = React.useState("")

    const ingredientsListItems = ingredients.map((ingredient, index) => (
        <li key={`${ingredient}-${index}`} className="ingredient-item">
            <span>{ingredient}</span>
            <button 
                onClick={() => removeIngredient(index)}
                className="remove-btn"
                aria-label={`Remove ${ingredient}`}
            >
                ×
            </button>
        </li>
    ))

    function handleSubmit(e) {
        e.preventDefault()
        const trimmedIngredient = inputValue.trim()
        
        // Validation
        if (!trimmedIngredient) {
            setErrorMessage("Please enter an ingredient")
            return
        }
        
        if (ingredients.some(ing => ing.toLowerCase() === trimmedIngredient.toLowerCase())) {
            setErrorMessage("This ingredient is already in your list")
            return
        }
        
        setIngredients(prevIngredients => [...prevIngredients, trimmedIngredient])
        setInputValue("")
        setErrorMessage("")
        if (recipeShown) {
            handleCloseRecipe()
        }
    }

    function removeIngredient(index) {
        setIngredients(prevIngredients => prevIngredients.filter((_, i) => i !== index))
        if (recipeShown) {
            handleCloseRecipe()
        }
    }

    function handleClearAll() {
        setIngredients([])
        handleCloseRecipe()
        setInputValue("")
        setErrorMessage("")
    }

    async function handleGetRecipe() {
        setLoading(true)
        setRecipeError("")
        setRecipeShown(true)

        try {
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
                setRecipe(generatedRecipe)
            } else {
                throw new Error('Invalid recipe format received')
            }
        } catch (error) {
            console.error('Error fetching recipe:', error)
            setRecipeError(error.message || 'Failed to generate recipe. Using fallback recipe.')
            // Fallback to local recipe generation
            setRecipe(generateFallbackRecipe())
        } finally {
            setLoading(false)
        }
    }

    function generateFallbackRecipe() {
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

    function handleCloseRecipe() {
        setRecipeShown(false)
        setRecipe(null)
        setRecipeError("")
    }

    return (
        <main>
            <form onSubmit={handleSubmit} className="add-ingredient-form">
                <div className="input-container">
                    <input
                        type="text"
                        placeholder="e.g. oregano, chicken, garlic..."
                        aria-label="Add ingredient"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value)
                            setErrorMessage("")
                        }}
                    />
                    {errorMessage && <span className="error-message">{errorMessage}</span>}
                </div>
                <button type="submit">Add ingredient</button>
            </form>
            
            {ingredients.length > 0 && (
                <section className="ingredients-section">
                    <div className="ingredients-header">
                        <h2>Ingredients on hand ({ingredients.length}):</h2>
                        <button onClick={handleClearAll} className="clear-btn">Clear All</button>
                    </div>
                    <ul className="ingredients-list" aria-live="polite">
                        {ingredientsListItems}
                    </ul>
                    {ingredients.length > 3 && !recipeShown && (
                        <div className="get-recipe-container">
                            <div>
                                <h3>Ready for a recipe?</h3>
                                <p>Let Chef Claude AI generate a personalized recipe from your ingredients!</p>
                            </div>
                            <button 
                                onClick={handleGetRecipe} 
                                className="get-recipe-btn"
                                disabled={loading}
                            >
                                {loading ? "Generating..." : "Get a recipe"}
                            </button>
                        </div>
                    )}
                </section>
            )}
            
            {recipeShown && (
                <section className="recipe-section">
                    <div className="recipe-header">
                        <h2>Recipe Generated {loading && "(Cooking...)"}</h2>
                        {!loading && (
                            <button onClick={handleCloseRecipe} className="close-recipe-btn">
                                ×
                            </button>
                        )}
                    </div>
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Chef Claude is creating a delicious recipe for you...</p>
                        </div>
                    ) : recipe ? (
                        <div className="recipe-content">
                            {recipeError && (
                                <div className="recipe-warning">
                                    <span>⚠️</span> {recipeError}
                                </div>
                            )}
                            <h3>{recipe.name}</h3>
                            <div className="recipe-details">
                                <div className="recipe-ingredients">
                                    <h4>Ingredients:</h4>
                                    <ul>
                                        {(recipe.ingredients || ingredients).map((ingredient, index) => (
                                            <li key={index}>{ingredient}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="recipe-instructions">
                                    <h4>Instructions:</h4>
                                    <ol>
                                        {recipe.instructions.map((instruction, index) => (
                                            <li key={index}>{instruction}</li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="error-state">
                            <p>Failed to generate recipe. Please try again.</p>
                            <button onClick={handleGetRecipe} className="retry-btn">
                                Try Again
                            </button>
                        </div>
                    )}
                </section>
            )}
            
            {ingredients.length === 0 && (
                <div className="empty-state">
                    <p>Start adding ingredients to generate a recipe!</p>
                </div>
            )}
        </main>
    )
}