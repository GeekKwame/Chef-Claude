export async function generateRecipeWithClaude(ingredients, apiKey) {
    const ingredientsList = ingredients.join(', ');
    
    const prompt = `You are Chef Claude, a professional chef. Generate a delicious, creative recipe using these ingredients: ${ingredientsList}.

Please provide:
1. An appealing recipe name (keep it concise, max 6 words)
2. A list of all ingredients needed (include the provided ingredients plus any common pantry staples like salt, pepper, oil if needed)
3. Clear, step-by-step cooking instructions (6-8 steps)

Format your response as JSON with this structure:
{
    "name": "Recipe Name",
    "ingredients": ["ingredient 1", "ingredient 2", ...],
    "instructions": ["Step 1", "Step 2", ...]
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2048,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        })
    });

    const responseText = await response.text();
    
    if (!response.ok) {
        let errorData;
        try {
            errorData = JSON.parse(responseText);
        } catch (e) {
            errorData = { error: { message: responseText } };
        }
        throw new Error(errorData.error?.message || errorData.error || `Claude API error: ${response.statusText}`);
    }

    let data;
    try {
        data = JSON.parse(responseText);
    } catch (e) {
        throw new Error('Invalid JSON response from Claude API');
    }
    
    const content = data.content[0].text;

    // Parse the JSON response from Claude
    let recipe;
    try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                         content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[1] : content;
        recipe = JSON.parse(jsonString);
    } catch (parseError) {
        // If parsing fails, create a structured response from the text
        const lines = content.split('\n').filter(line => line.trim());
        recipe = {
            name: lines.find(line => line.includes('name') || line.length < 50) || 'Chef\'s Special Creation',
            ingredients: ingredients,
            instructions: lines.filter(line => 
                line.match(/^\d+\./) || 
                line.toLowerCase().includes('step') ||
                (line.length > 20 && !line.includes(':'))
            ).slice(0, 8).map(line => line.replace(/^\d+\.\s*/, '').trim())
        };
    }

    // Validate recipe structure
    if (!recipe.name || !recipe.instructions || !Array.isArray(recipe.instructions)) {
        throw new Error('Invalid recipe format received from Claude API');
    }

    return recipe;
}

