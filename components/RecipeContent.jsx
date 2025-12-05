import React, { useState } from "react"
import { saveRecipe } from "../utils/recipeStorage"

export default function RecipeContent({ recipe, ingredients, recipeError }) {
    const [saved, setSaved] = useState(false)
    const [copySuccess, setCopySuccess] = useState(false)
    // Check if this is a fallback recipe (API failed but recipe was generated)
    const isFallbackRecipe = recipeError && recipe;
    const isApiConfigError = recipeError?.includes('API Configuration Error') || 
                            recipeError?.includes('not configured');
    
    // Determine message type and text
    let messageType = null;
    let messageText = '';
    
    if (isApiConfigError) {
        messageType = 'warning';
        messageText = recipeError;
    } else if (isFallbackRecipe) {
        messageType = 'info';
        if (recipeError.includes('temporarily unavailable') || recipeError.includes('unavailable')) {
            messageText = 'Using intelligent recipe generation. Hugging Face free API has been deprecated. These recipes are tailored to your ingredients!';
        } else {
            messageText = 'Recipe generated using intelligent fallback method. These recipes are customized based on your ingredients!';
        }
    }
    
    const handleSave = () => {
        const savedRecipe = saveRecipe(recipe)
        if (savedRecipe) {
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        }
    }

    const handleCopy = async () => {
        const recipeText = formatRecipeForExport(recipe, ingredients)
        try {
            await navigator.clipboard.writeText(recipeText)
            setCopySuccess(true)
            setTimeout(() => setCopySuccess(false), 2000)
        } catch (error) {
            console.error('Failed to copy:', error)
        }
    }

    const handlePrint = () => {
        const printWindow = window.open('', '_blank')
        const recipeText = formatRecipeForExport(recipe, ingredients)
        printWindow.document.write(`
            <html>
                <head>
                    <title>${recipe.name}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #333; }
                        h2 { color: #666; margin-top: 20px; }
                        ul, ol { line-height: 1.6; }
                    </style>
                </head>
                <body>
                    <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${escapeHtml(recipeText)}</pre>
                </body>
            </html>
        `)
        printWindow.document.close()
        printWindow.print()
    }

    return (
        <div className="recipe-content">
            {messageType === 'info' && (
                <div className="recipe-info" role="status">
                    <span aria-hidden="true">ℹ️</span> {messageText}
                </div>
            )}
            {messageType === 'warning' && (
                <div className="recipe-warning" role="alert">
                    <span aria-hidden="true">⚠️</span> {messageText}
                </div>
            )}
            <div className="recipe-header-actions">
                <h3>{recipe.name}</h3>
                <div className="recipe-actions">
                    <button 
                        onClick={handleSave}
                        className="save-recipe-btn"
                        aria-label={saved ? "Recipe saved" : "Save recipe"}
                    >
                        {saved ? "✓ Saved" : "💾 Save"}
                    </button>
                    <button 
                        onClick={handleCopy}
                        className="copy-recipe-btn"
                        aria-label={copySuccess ? "Copied to clipboard" : "Copy recipe"}
                    >
                        {copySuccess ? "✓ Copied" : "📋 Copy"}
                    </button>
                    <button 
                        onClick={handlePrint}
                        className="print-recipe-btn"
                        aria-label="Print recipe"
                    >
                        🖨️ Print
                    </button>
                </div>
            </div>
            <div className="recipe-details">
                <div className="recipe-ingredients">
                    <h4>Ingredients:</h4>
                    <ul>
                        {(recipe.ingredients || ingredients).map((ingredient, index) => (
                            <li key={index}>{sanitizeHtml(ingredient)}</li>
                        ))}
                    </ul>
                </div>
                <div className="recipe-instructions">
                    <h4>Instructions:</h4>
                    <ol>
                        {recipe.instructions.map((instruction, index) => (
                            <li key={index}>{sanitizeHtml(instruction)}</li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    )
}

function formatRecipeForExport(recipe, ingredients) {
    return `${recipe.name}

INGREDIENTS:
${(recipe.ingredients || ingredients).map(ing => `- ${ing}`).join('\n')}

INSTRUCTIONS:
${recipe.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Generated by Chef Claude`
}

function sanitizeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
}

function escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
}

