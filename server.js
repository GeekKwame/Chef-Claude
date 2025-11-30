import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Recipe generation endpoint
app.post('/api/generate-recipe', async (req, res) => {
    try {
        const { ingredients } = req.body;

        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ error: 'Please provide a list of ingredients' });
        }

        const apiKey = process.env.CLAUDE_API_KEY;
        if (!apiKey || apiKey === 'your_api_key_here') {
            console.error('API Key Missing:', !apiKey ? 'No API key found' : 'API key not configured');
            return res.status(500).json({ 
                error: 'Claude API key not configured. Please set CLAUDE_API_KEY in your .env file. Get your key from https://console.anthropic.com/' 
            });
        }

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
        console.log('API Response Status:', response.status);
        console.log('API Response:', responseText.substring(0, 500));

        if (!response.ok) {
            let errorData;
            try {
                errorData = JSON.parse(responseText);
            } catch (e) {
                errorData = { error: { message: responseText } };
            }
            console.error('API Error:', errorData);
            throw new Error(errorData.error?.message || errorData.error || `API error: ${response.statusText} (${response.status})`);
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            throw new Error('Invalid JSON response from API');
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
            throw new Error('Invalid recipe format received from API');
        }

        res.json(recipe);
    } catch (error) {
        console.error('Error generating recipe:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to generate recipe. Please try again.' 
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
        console.log(`⚠️  WARNING: CLAUDE_API_KEY not configured in .env file`);
        console.log(`📝 To fix: 1. Create .env file in project root`);
        console.log(`📝         2. Add: CLAUDE_API_KEY=your_actual_api_key`);
        console.log(`📝         3. Get your key from: https://console.anthropic.com/`);
    } else {
        console.log(`✅ Claude API key configured`);
    }
});

