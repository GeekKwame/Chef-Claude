import { useEffect, useRef } from "react"
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
    const sectionRef = useRef(null)
    const closeButtonRef = useRef(null)

    // Focus management for accessibility
    useEffect(() => {
        if (recipeShown && !loading && sectionRef.current) {
            // Focus the section when recipe is shown
            sectionRef.current.focus()
        }
    }, [recipeShown, loading])

    // Focus close button when recipe loads
    useEffect(() => {
        if (recipeShown && !loading && recipe && closeButtonRef.current) {
            closeButtonRef.current.focus()
        }
    }, [recipeShown, loading, recipe])

    if (!recipeShown) return null

    return (
        <section 
            ref={sectionRef}
            className="recipe-section"
            role="region"
            aria-labelledby="recipe-heading"
            tabIndex={-1}
        >
            <div className="recipe-header">
                <h2 id="recipe-heading">
                    Recipe Generated {loading && <span aria-label="Cooking">(Cooking...)</span>}
                </h2>
                {!loading && (
                    <button 
                        ref={closeButtonRef}
                        onClick={onCloseRecipe} 
                        className="close-recipe-btn"
                        aria-label="Close recipe"
                    >
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
                <div className="error-state" role="alert">
                    <p>Failed to generate recipe. Please try again.</p>
                    <button 
                        onClick={onRetryRecipe} 
                        className="retry-btn"
                        aria-label="Retry recipe generation"
                    >
                        Try Again
                    </button>
                </div>
            )}
        </section>
    )
}

