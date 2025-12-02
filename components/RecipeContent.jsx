export default function RecipeContent({ recipe, ingredients, recipeError }) {
    return (
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
    )
}

