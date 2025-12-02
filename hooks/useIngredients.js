import { useState } from "react"

export function useIngredients(initialIngredients = []) {
    const [ingredients, setIngredients] = useState(initialIngredients)
    const [inputValue, setInputValue] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    function validateIngredient(ingredient) {
        const trimmed = ingredient.trim()
        
        if (!trimmed) {
            return "Please enter an ingredient"
        }
        
        if (ingredients.some(ing => ing.toLowerCase() === trimmed.toLowerCase())) {
            return "This ingredient is already in your list"
        }
        
        return null
    }

    function addIngredient() {
        const error = validateIngredient(inputValue)
        if (error) {
            setErrorMessage(error)
            return false
        }

        const trimmed = inputValue.trim()
        setIngredients(prev => [...prev, trimmed])
        setInputValue("")
        setErrorMessage("")
        return true
    }

    function removeIngredient(index) {
        setIngredients(prev => prev.filter((_, i) => i !== index))
    }

    function clearAll() {
        setIngredients([])
        setInputValue("")
        setErrorMessage("")
    }

    function handleInputChange(e) {
        setInputValue(e.target.value)
        setErrorMessage("")
    }

    return {
        ingredients,
        inputValue,
        errorMessage,
        addIngredient,
        removeIngredient,
        clearAll,
        handleInputChange
    }
}

