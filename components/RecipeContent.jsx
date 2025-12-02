export default function RecipeContent({ recipe, ingredients, recipeError }) {
    // Check if this is a fallback recipe (API failed but recipe was generated)
    const isFallbackRecipe = recipeError && recipe;
    const isApiConfigError = recipeError?.includes('API Configuration Error') || 
                            recipeError?.includes('not configured');
    
    // Determine message type and text
    let messageType = null;
    let messageText = '';
    
    if (isApiConfigError) {
        messageType = 'warning';
        messageText = recipeError;
    } else if (isFallbackRecipe) {
        messageType = 'info';
        if (recipeError.includes('temporarily unavailable') || recipeError.includes('unavailable')) {
            messageText = 'Using intelligent recipe generation. Hugging Face free API has been deprecated. These recipes are tailored to your ingredients!';
        } else {
            messageText = 'Recipe generated using intelligent fallback method. These recipes are customized based on your ingredients!';
        }
    }
    
    return (
        <div className="recipe-content">
            {messageType === 'info' && (
                <div className="recipe-info">
                    <span>ℹ️</span> {messageText}
                </div>
            )}
            {messageType === 'warning' && (
                <div className="recipe-warning">
                    <span>⚠️</span> {messageText}
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
    )
}

