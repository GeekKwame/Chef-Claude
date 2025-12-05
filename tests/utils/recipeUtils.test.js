import { describe, it, expect } from 'vitest'
import { generateFallbackRecipe } from '../../utils/recipeUtils'

describe('recipeUtils', () => {
    describe('generateFallbackRecipe', () => {
        it('should generate a recipe with name, ingredients, and instructions', () => {
            const ingredients = ['chicken', 'onion', 'garlic', 'tomato']
            const recipe = generateFallbackRecipe(ingredients)

            expect(recipe).toHaveProperty('name')
            expect(recipe).toHaveProperty('ingredients')
            expect(recipe).toHaveProperty('instructions')
            expect(recipe.name).toBeTruthy()
            expect(Array.isArray(recipe.ingredients)).toBe(true)
            expect(Array.isArray(recipe.instructions)).toBe(true)
            expect(recipe.ingredients).toEqual(ingredients)
        })

        it('should include meat-specific instructions when meat is present', () => {
            const ingredients = ['beef', 'onion', 'garlic']
            const recipe = generateFallbackRecipe(ingredients)

            const hasMeatInstruction = recipe.instructions.some(inst =>
                inst.toLowerCase().includes('meat') || inst.toLowerCase().includes('browned')
            )
            expect(hasMeatInstruction).toBe(true)
        })

        it('should include pasta-specific instructions when pasta is present', () => {
            const ingredients = ['pasta', 'tomato', 'garlic']
            const recipe = generateFallbackRecipe(ingredients)

            const hasPastaInstruction = recipe.instructions.some(inst =>
                inst.toLowerCase().includes('pasta')
            )
            expect(hasPastaInstruction).toBe(true)
        })
    })
})

