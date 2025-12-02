import IngredientItem from "./IngredientItem"

export default function IngredientList({ ingredients, onRemove }) {
    return (
        <ul className="ingredients-list" aria-live="polite">
            {ingredients.map((ingredient, index) => (
                <IngredientItem
                    key={`${ingredient}-${index}`}
                    ingredient={ingredient}
                    index={index}
                    onRemove={onRemove}
                />
            ))}
        </ul>
    )
}

