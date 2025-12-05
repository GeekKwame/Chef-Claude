import { useState, useEffect, useMemo } from "react"

const COMMON_INGREDIENTS = [
    "chicken", "beef", "pork", "fish", "salmon", "tuna", "shrimp",
    "onion", "garlic", "tomato", "bell pepper", "carrot", "celery",
    "pasta", "rice", "bread", "flour", "sugar", "salt", "pepper",
    "olive oil", "butter", "cheese", "milk", "eggs", "yogurt",
    "oregano", "basil", "thyme", "rosemary", "paprika", "cumin",
    "lemon", "lime", "potato", "broccoli", "spinach", "mushroom",
    "avocado", "cucumber", "lettuce", "corn", "peas", "beans"
]

export function useIngredientAutocomplete(inputValue) {
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)

    const filteredSuggestions = useMemo(() => {
        if (!inputValue || inputValue.trim().length < 2) {
            return []
        }

        const lowerInput = inputValue.toLowerCase().trim()
        return COMMON_INGREDIENTS
            .filter(ingredient => 
                ingredient.toLowerCase().includes(lowerInput) &&
                ingredient.toLowerCase() !== lowerInput
            )
            .slice(0, 5)
    }, [inputValue])

    useEffect(() => {
        setSuggestions(filteredSuggestions)
        setShowSuggestions(filteredSuggestions.length > 0 && inputValue.trim().length >= 2)
    }, [filteredSuggestions, inputValue])

    return {
        suggestions,
        showSuggestions,
        setShowSuggestions
    }
}

