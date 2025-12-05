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

// Rate limiting storage (simple in-memory, consider Redis for production)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 20; // 20 requests per window

// Simple rate limiting middleware
function rateLimit(req, res, next) {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitStore.has(clientId)) {
        rateLimitStore.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return next();
    }
    
    const clientData = rateLimitStore.get(clientId);
    
    // Reset if window expired
    if (now > clientData.resetTime) {
        clientData.count = 1;
        clientData.resetTime = now + RATE_LIMIT_WINDOW;
        return next();
    }
    
    // Check limit
    if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
        return res.status(429).json({ 
            error: 'Too many requests. Please try again later.' 
        });
    }
    
    clientData.count++;
    next();
}

// Cleanup old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, RATE_LIMIT_WINDOW);

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Limit request body size

// Input sanitization helper
function sanitizeInput(input) {
    if (typeof input === 'string') {
        // Remove potentially dangerous characters
        return input.trim().replace(/[<>]/g, '');
    }
    if (Array.isArray(input)) {
        return input.map(item => sanitizeInput(item));
    }
    return input;
}

// Recipe generation endpoint with automatic fallback
app.post('/api/generate-recipe', rateLimit, async (req, res) => {
    try {
        let { ingredients } = req.body;
        
        // Sanitize input
        ingredients = sanitizeInput(ingredients);

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

