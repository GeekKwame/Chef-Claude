import React, { useRef, useEffect } from "react"
import { useIngredientAutocomplete } from "../hooks/useIngredientAutocomplete"

export default function IngredientForm({ 
    inputValue, 
    errorMessage, 
    onInputChange, 
    onSubmit 
}) {
    const inputId = "ingredient-input"
    const errorId = "ingredient-error"
    const suggestionsRef = useRef(null)
    const { suggestions, showSuggestions, setShowSuggestions } = useIngredientAutocomplete(inputValue)

    const handleSuggestionClick = (suggestion) => {
        onInputChange({ target: { value: suggestion } })
        setShowSuggestions(false)
        // Focus back on input
        document.getElementById(inputId)?.focus()
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setShowSuggestions(false)
        }
    }

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false)
            }
        }

        if (showSuggestions) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showSuggestions, setShowSuggestions])

    return (
        <form onSubmit={onSubmit} className="add-ingredient-form" noValidate>
            <div className="input-container">
                <label htmlFor={inputId} className="sr-only">
                    Add ingredient
                </label>
                <input
                    id={inputId}
                    type="text"
                    placeholder="e.g. oregano, chicken, garlic..."
                    aria-label="Add ingredient"
                    aria-describedby={errorMessage ? errorId : undefined}
                    aria-invalid={!!errorMessage}
                    aria-autocomplete="list"
                    aria-expanded={showSuggestions}
                    value={inputValue}
                    onChange={onInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (suggestions.length > 0) {
                            setShowSuggestions(true)
                        }
                    }}
                    autoComplete="off"
                />
                {errorMessage && (
                    <span 
                        id={errorId}
                        className="error-message" 
                        role="alert"
                        aria-live="polite"
                    >
                        {errorMessage}
                    </span>
                )}
                {showSuggestions && suggestions.length > 0 && (
                    <ul 
                        ref={suggestionsRef}
                        className="autocomplete-suggestions"
                        role="listbox"
                        aria-label="Ingredient suggestions"
                    >
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={suggestion}
                                role="option"
                                onClick={() => handleSuggestionClick(suggestion)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        handleSuggestionClick(suggestion)
                                    }
                                }}
                                tabIndex={0}
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <button type="submit" aria-label="Add ingredient to list">
                Add ingredient
            </button>
        </form>
    )
}

