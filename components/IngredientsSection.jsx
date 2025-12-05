import IngredientList from "./IngredientList"
import GetRecipeButton from "./GetRecipeButton"

export default function IngredientsSection({ 
    ingredients, 
    onRemoveIngredient, 
    onClearAll,
    onGetRecipe,
    loading,
    recipeShown
}) {
    if (ingredients.length === 0) return null

    return (
        <section className="ingredients-section">
            <div className="ingredients-header">
                <h2>Ingredients on hand <span aria-label={`${ingredients.length} ingredients`}>({ingredients.length})</span>:</h2>
                <button 
                    onClick={onClearAll} 
                    className="clear-btn"
                    aria-label="Clear all ingredients"
                >
                    Clear All
                </button>
            </div>
            <IngredientList 
                ingredients={ingredients}
                onRemove={onRemoveIngredient}
            />
            {ingredients.length > 3 && !recipeShown && (
                <GetRecipeButton 
                    onGetRecipe={onGetRecipe}
                    loading={loading}
                />
            )}
        </section>
    )
}

