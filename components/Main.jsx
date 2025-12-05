import React, { useCallback, useMemo } from "react"
import IngredientForm from "./IngredientForm"
import IngredientsSection from "./IngredientsSection"
import RecipeSection from "./RecipeSection"
import EmptyState from "./EmptyState"
import { useIngredients } from "../hooks/useIngredients"
import { useRecipeGenerator } from "../hooks/useRecipeGenerator"

export default function Main() {
    const {
        ingredients,
        inputValue,
        errorMessage,
        addIngredient,
        removeIngredient,
        clearAll,
        handleInputChange
    } = useIngredients([])

    const {
        recipeShown,
        recipe,
        loading,
        recipeError,
        generateRecipe,
        closeRecipe,
        resetRecipe
    } = useRecipeGenerator(ingredients)

    const handleSubmit = useCallback((e) => {
        e.preventDefault()
        const added = addIngredient()
        if (added) {
            resetRecipe()
        }
    }, [addIngredient, resetRecipe])

    const handleRemoveIngredient = useCallback((index) => {
        removeIngredient(index)
        resetRecipe()
    }, [removeIngredient, resetRecipe])

    const handleClearAll = useCallback(() => {
        clearAll()
        closeRecipe()
    }, [clearAll, closeRecipe])

    const showEmptyState = useMemo(() => ingredients.length === 0, [ingredients.length])

    return (
        <main>
            <IngredientForm
                inputValue={inputValue}
                errorMessage={errorMessage}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
            />
            
            <IngredientsSection
                ingredients={ingredients}
                onRemoveIngredient={handleRemoveIngredient}
                onClearAll={handleClearAll}
                onGetRecipe={generateRecipe}
                loading={loading}
                recipeShown={recipeShown}
            />
            
            <RecipeSection
                recipeShown={recipeShown}
                loading={loading}
                recipe={recipe}
                ingredients={ingredients}
                recipeError={recipeError}
                onCloseRecipe={closeRecipe}
                onRetryRecipe={generateRecipe}
            />
            
            {showEmptyState && <EmptyState />}
        </main>
    )
}

