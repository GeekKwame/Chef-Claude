import React from "react"

export default function IngredientForm({ 
    inputValue, 
    errorMessage, 
    onInputChange, 
    onSubmit 
}) {
    return (
        <form onSubmit={onSubmit} className="add-ingredient-form">
            <div className="input-container">
                <input
                    type="text"
                    placeholder="e.g. oregano, chicken, garlic..."
                    aria-label="Add ingredient"
                    value={inputValue}
                    onChange={onInputChange}
                />
                {errorMessage && <span className="error-message">{errorMessage}</span>}
            </div>
            <button type="submit">Add ingredient</button>
        </form>
    )
}

