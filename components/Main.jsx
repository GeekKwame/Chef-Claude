import React from "react"
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
    } = useIngredients(["all the main spices", "pasta", "ground beef", "tomato paste"])

    const {
        recipeShown,
        recipe,
        loading,
        recipeError,
        generateRecipe,
        closeRecipe,
        resetRecipe
    } = useRecipeGenerator(ingredients)

    function handleSubmit(e) {
        e.preventDefault()
        const added = addIngredient()
        if (added) {
            resetRecipe()
        }
    }

    function handleRemoveIngredient(index) {
        removeIngredient(index)
        resetRecipe()
    }

    function handleClearAll() {
        clearAll()
        closeRecipe()
    }

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
            
            {ingredients.length === 0 && <EmptyState />}
        </main>
    )
}

