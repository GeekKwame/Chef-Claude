export default function IngredientItem({ ingredient, index, onRemove }) {
    return (
        <li key={`${ingredient}-${index}`} className="ingredient-item">
            <span>{ingredient}</span>
            <button 
                onClick={() => onRemove(index)}
                className="remove-btn"
                aria-label={`Remove ${ingredient}`}
            >
                ×
            </button>
        </li>
    )
}

