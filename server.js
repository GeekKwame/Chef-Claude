import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { generateRecipeWithClaude } from './services/claudeService.js';
import { generateRecipeWithHuggingFace } from './services/huggingFaceService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Recipe generation endpoint with automatic fallback
app.post('/api/generate-recipe', async (req, res) => {
    try {
        const { ingredients } = req.body;

        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ error: 'Please provide a list of ingredients' });
        }

        const claudeApiKey = process.env.CLAUDE_API_KEY;
        const huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY;
        
        // Check if at least one API key is configured
        const hasClaudeKey = claudeApiKey && claudeApiKey !== 'your_api_key_here';
        const hasHuggingFaceKey = huggingFaceApiKey && huggingFaceApiKey !== 'your_huggingface_token_here';
        
        if (!hasClaudeKey && !hasHuggingFaceKey) {
            return res.status(500).json({ 
                error: 'No API keys configured. Please set either CLAUDE_API_KEY or HUGGINGFACE_API_KEY in your .env file. Get keys from: Claude (https://console.anthropic.com/) or Hugging Face (https://huggingface.co/settings/tokens)' 
            });
        }

        let recipe;
        let provider = '';

        // Try Claude first if available
        if (hasClaudeKey) {
            try {
                console.log('🍽️  Attempting recipe generation with Claude API...');
                recipe = await generateRecipeWithClaude(ingredients, claudeApiKey);
                provider = 'Claude';
                console.log('✅ Recipe generated successfully with Claude');
            } catch (claudeError) {
                console.warn('⚠️  Claude API failed:', claudeError.message);
                // Fall through to try Hugging Face
            }
        }

        // If Claude failed or not available, try Hugging Face
        // Note: Hugging Face free API is deprecated, so this will likely fail gracefully
        if (!recipe && hasHuggingFaceKey) {
            try {
                console.log('🍽️  Attempting recipe generation with Hugging Face API...');
                console.log(`📋 Ingredients: ${ingredients.join(', ')}`);
                recipe = await generateRecipeWithHuggingFace(ingredients, huggingFaceApiKey);
                provider = 'Hugging Face';
                console.log('✅ Recipe generated successfully with Hugging Face');
                console.log(`📝 Recipe name: ${recipe.name}`);
            } catch (hfError) {
                // Hugging Face API is deprecated, so this is expected
                console.log('ℹ️  Hugging Face API unavailable (deprecated):', hfError.message);
                if (!hasClaudeKey) {
                    // If we don't have Claude key, don't throw - let frontend use fallback
                    // The frontend will handle the fallback gracefully
                }
            }
        }

        // If both APIs failed/unavailable, frontend will use intelligent fallback
        // Don't throw error - let frontend handle graceful fallback
        if (!recipe) {
            // Return error that triggers fallback, but make it clear it's expected
            return res.status(200).json({ 
                error: 'AI services unavailable. Using intelligent fallback recipe generation.',
                _fallback: true 
            });
        }

        // Validate recipe structure
        if (!recipe.name || !recipe.instructions || !Array.isArray(recipe.instructions)) {
            throw new Error('Invalid recipe format received from API');
        }

        // Add provider info to response
        res.json({
            ...recipe,
            _provider: provider, // Which API was used
            _fallback: false     // This is from an API, not fallback
        });
    } catch (error) {
        console.error('Error generating recipe:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to generate recipe. Please try again.' 
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('');
    
    const claudeApiKey = process.env.CLAUDE_API_KEY;
    const huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY;
    
    const hasClaudeKey = claudeApiKey && claudeApiKey !== 'your_api_key_here';
    const hasHuggingFaceKey = huggingFaceApiKey && huggingFaceApiKey !== 'your_huggingface_token_here';
    
    if (hasClaudeKey) {
        console.log(`✅ Claude API key configured`);
    } else {
        console.log(`⚠️  Claude API key not configured`);
        console.log(`   Get your key from: https://console.anthropic.com/`);
    }
    
    if (hasHuggingFaceKey) {
        console.log(`✅ Hugging Face API key configured`);
    } else {
        console.log(`⚠️  Hugging Face API key not configured`);
        console.log(`   Get your token from: https://huggingface.co/settings/tokens`);
    }
    
    console.log('');
    if (!hasClaudeKey && !hasHuggingFaceKey) {
        console.log(`❌ WARNING: No API keys configured! Please set at least one API key in your .env file.`);
    } else {
        console.log(`💡 The app will try ${hasClaudeKey ? 'Claude first' : 'Hugging Face'}${hasClaudeKey && hasHuggingFaceKey ? ', then fallback to Hugging Face if needed' : ''}.`);
    }
});

