import LoadingSpinner from "./LoadingSpinner"
import RecipeContent from "./RecipeContent"

export default function RecipeSection({ 
    recipeShown, 
    loading, 
    recipe, 
    ingredients,
    recipeError,
    onCloseRecipe,
    onRetryRecipe
}) {
    if (!recipeShown) return null

    return (
        <section className="recipe-section">
            <div className="recipe-header">
                <h2>Recipe Generated {loading && "(Cooking...)"}</h2>
                {!loading && (
                    <button onClick={onCloseRecipe} className="close-recipe-btn">
                        ×
                    </button>
                )}
            </div>
            {loading ? (
                <LoadingSpinner />
            ) : recipe ? (
                <RecipeContent 
                    recipe={recipe}
                    ingredients={ingredients}
                    recipeError={recipeError}
                />
            ) : (
                <div className="error-state">
                    <p>Failed to generate recipe. Please try again.</p>
                    <button onClick={onRetryRecipe} className="retry-btn">
                        Try Again
                    </button>
                </div>
            )}
        </section>
    )
}

