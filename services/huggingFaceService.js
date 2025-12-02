export async function generateRecipeWithHuggingFace(ingredients, apiKey) {
    // Quick deprecation check - fail fast if API is deprecated
    try {
        const testResponse = await fetch(
            `https://api-inference.huggingface.co/models/gpt2`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: "test",
                    parameters: { max_new_tokens: 5 }
                })
            }
        );
        
        if (testResponse.status === 410) {
            const testText = await testResponse.text();
            if (testText.includes('no longer supported')) {
                throw new Error('Hugging Face free inference API has been deprecated. Using intelligent fallback recipe generation instead.');
            }
        }
    } catch (error) {
        if (error.message.includes('deprecated')) {
            throw error;
        }
        // Continue if it's a different error
    }

    const ingredientsList = ingredients.join(', ');
    
    // Better prompt for recipe generation
    const prompt = `Create a recipe with these ingredients: ${ingredientsList}

Recipe Name:`;

    // Try multiple reliable models, starting with the most suitable ones
    const models = [
        "gpt2",  // Most reliable and always available
        "distilgpt2",  // Faster alternative
        "bigscience/bloom-560m"  // Good for creative generation
    ];
    
    for (const model of models) {
        let retried = false;
        
        // Try each model up to 2 times (once normal, once after waiting if loading)
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                if (attempt > 0) {
                    console.log(`⏳ Retrying ${model} after waiting...`);
                } else {
                    console.log(`🤖 Trying Hugging Face model: ${model}`);
                }
                
                const response = await fetch(
                    `https://api-inference.huggingface.co/models/${model}`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            inputs: prompt,
                            parameters: {
                                max_new_tokens: 300,
                                return_full_text: false,
                                temperature: 0.9,
                                top_p: 0.95,
                                do_sample: true,
                            }
                        })
                    }
                );

                const responseText = await response.text();
                console.log(`📥 Response status: ${response.status}`);
                console.log(`📥 Response preview: ${responseText.substring(0, 200)}`);
                
                if (!response.ok) {
                    let errorData;
                    try {
                        errorData = JSON.parse(responseText);
                    } catch (e) {
                        errorData = { error: responseText };
                    }
                    
                    // Handle different error formats
                    let errorMessage = '';
                    if (typeof errorData.error === 'string') {
                        errorMessage = errorData.error;
                    } else if (errorData.error?.message) {
                        errorMessage = errorData.error.message;
                    } else if (errorData.message) {
                        errorMessage = errorData.message;
                    } else {
                        errorMessage = JSON.stringify(errorData);
                    }
                    
                    // Handle deprecated API (410) - fail immediately, no point trying other models
                    if (response.status === 410 || errorMessage.includes('no longer supported')) {
                        throw new Error('Hugging Face free inference API has been deprecated. Using intelligent fallback recipe generation instead.');
                    }
                    
                    // If model is loading and this is first attempt, wait and retry
                    if ((response.status === 503 || errorMessage.includes('loading') || errorMessage.includes('is currently loading')) && !retried) {
                        console.log(`⏳ Model ${model} is loading, waiting 5 seconds...`);
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        retried = true;
                        continue; // Retry this model
                    }
                    
                    // Handle rate limiting
                    if (response.status === 429) {
                        console.log(`⚠️ Rate limit hit for ${model}, trying next model...`);
                        break; // Move to next model
                    }
                    
                    // Other errors - move to next model
                    console.error(`❌ Model ${model} error:`, errorMessage);
                    break; // Move to next model
                }

                // Success! Parse the response
                try {
                    data = JSON.parse(responseText);
                } catch (e) {
                    console.error(`❌ Failed to parse JSON from ${model}:`, responseText);
                    break; // Move to next model
                }

            // Handle different response formats from Hugging Face
            let generatedText = '';
            if (Array.isArray(data)) {
                // Array format: [{generated_text: "..."}]
                if (data[0]?.generated_text) {
                    generatedText = data[0].generated_text;
                } else if (data[0]?.text) {
                    generatedText = data[0].text;
                }
            } else if (data.generated_text) {
                // Object format: {generated_text: "..."}
                generatedText = data.generated_text;
            } else if (data[0]?.summary_text) {
                // Some models return summary_text
                generatedText = data[0].summary_text;
            }

                if (!generatedText || generatedText.trim().length < 10) {
                    console.log(`⚠️ No valid text generated from ${model}, trying next attempt...`);
                    break; // Try next attempt or move to next model
                }

                console.log(`✅ Successfully generated text from ${model}`);
                
                // Parse and structure the recipe from generated text
                const fullText = prompt + generatedText;
                const recipe = parseRecipeFromText(fullText, ingredients);
                
                // Validate recipe has minimum requirements
                if (recipe.name && recipe.instructions && recipe.instructions.length >= 3) {
                    return recipe;
                } else {
                    console.log(`⚠️ Recipe from ${model} didn't meet quality standards, trying next model...`);
                    break; // Move to next model
                }
                
            } catch (error) {
                console.error(`❌ Error with model ${model} (attempt ${attempt + 1}):`, error.message);
                // If this is the second attempt, move to next model
                if (attempt === 1) {
                    break; // Move to next model
                }
                // Otherwise, continue to retry
                continue;
            }
        } // End of retry loop for this model
    } // End of model loop
    
    // If all models failed, throw error with helpful message
    throw new Error('Hugging Face free inference API has been deprecated. Using intelligent fallback recipe generation instead.');
}


function parseRecipeFromText(text, ingredients) {
    console.log('📝 Parsing recipe from text:', text.substring(0, 300));
    
    // Extract recipe name - try multiple patterns
    let recipeName = 'Chef\'s Special Creation';
    
    // Pattern 1: After "Recipe Name:"
    const nameMatch1 = text.match(/Recipe Name:\s*([^\n]+)/i);
    if (nameMatch1) {
        recipeName = nameMatch1[1].trim();
    }
    
    // Pattern 2: First line after prompt
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const promptEndIndex = lines.findIndex(l => l.toLowerCase().includes('recipe name'));
    if (promptEndIndex >= 0 && lines[promptEndIndex + 1]) {
        const candidate = lines[promptEndIndex + 1];
        if (candidate.length < 80 && candidate.length > 3) {
            recipeName = candidate;
        }
    }
    
    // Clean up recipe name
    recipeName = recipeName
        .replace(/^[^\w]*/, '') // Remove leading non-word chars
        .replace(/[^\w\s&-]/g, '') // Remove special chars except & and -
        .trim()
        .substring(0, 60);
    
    if (!recipeName || recipeName.length < 3) {
        // Generate a creative name from ingredients
        const mainIngredient = ingredients[0] || 'ingredients';
        recipeName = `Delicious ${mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1)} Dish`;
    }

    // Extract instructions - get everything after recipe name or prompt
    let instructionsText = text;
    
    // Remove the prompt part
    const promptEnd = text.indexOf('Recipe Name:') + 12;
    if (promptEnd > 12) {
        instructionsText = text.substring(promptEnd);
    }
    
    // Remove recipe name from instructions
    instructionsText = instructionsText.replace(new RegExp(recipeName, 'i'), '').trim();
    
    // Split into lines and filter
    let instructions = instructionsText
        .split(/[\n\.]+/)
        .map(line => line.trim())
        .filter(line => {
            // Keep lines that look like instructions
            return line.length >= 15 && 
                   line.length < 200 &&
                   !line.toLowerCase().includes('recipe name') &&
                   !line.toLowerCase().includes('ingredients:') &&
                   (/^(add|mix|heat|cook|season|serve|stir|combine|preheat|prepare|chop|dice|slice|sauté|bake|roast|boil|simmer|garnish|place|put|pour|drizzle|sprinkle)/i.test(line) ||
                    line.match(/^\d+[\.\)]/) || 
                    line.match(/^[-•*]/));
        })
        .slice(0, 8)
        .map(line => {
            // Clean up each instruction
            return line
                .replace(/^\d+[\.\)]\s*/, '') // Remove numbered prefixes
                .replace(/^[-•*]\s*/, '') // Remove bullet points
                .replace(/^[A-Z][a-z]+\s+/, '') // Remove common prefixes
                .trim();
        })
        .filter(line => line.length >= 10); // Final filter for length

    // If we don't have good instructions, create intelligent ones based on ingredients
    if (instructions.length < 3) {
        const hasMeat = ingredients.some(ing => 
            /meat|beef|chicken|pork|turkey|lamb|fish|salmon|tuna/i.test(ing)
        );
        const hasPasta = ingredients.some(ing => 
            /pasta|noodle|spaghetti|penne|macaroni/i.test(ing)
        );
        const hasSpices = ingredients.some(ing => 
            /spice|herb|oregano|basil|thyme|rosemary|paprika/i.test(ing)
        );
        
        instructions = [];
        
        if (hasMeat) {
            instructions.push(`Cook the meat in a large pan over medium-high heat until browned, about 5-7 minutes.`);
        } else {
            instructions.push(`Heat a large pan or pot over medium heat with a tablespoon of oil.`);
        }
        
        instructions.push(`Add ${ingredients.slice(0, Math.min(3, ingredients.length)).join(', ')} and cook until fragrant, about 2-3 minutes.`);
        
        if (hasSpices) {
            instructions.push(`Season with your spices and stir well to combine.`);
        }
        
        if (hasPasta) {
            instructions.push(`Meanwhile, cook pasta separately according to package directions.`);
            instructions.push(`Combine the pasta with the sauce when both are ready.`);
        } else {
            instructions.push(`Add remaining ingredients and stir well.`);
            instructions.push(`Let everything simmer together for 10-15 minutes until well combined.`);
        }
        
        instructions.push(`Taste and adjust seasoning as needed, then serve hot.`);
    }

    return {
        name: recipeName,
        ingredients: ingredients,
        instructions: instructions
    };
}

