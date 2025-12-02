export default function GetRecipeButton({ onGetRecipe, loading }) {
    return (
        <div className="get-recipe-container">
            <div>
                <h3>Ready for a recipe?</h3>
                <p>Let Chef Claude AI generate a personalized recipe from your ingredients!</p>
            </div>
            <button 
                onClick={onGetRecipe} 
                className="get-recipe-btn"
                disabled={loading}
            >
                {loading ? "Generating..." : "Get a recipe"}
            </button>
        </div>
    )
}

