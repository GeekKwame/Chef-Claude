# Quick Setup Guide for Chef Claude

## The Error You're Seeing

If you're getting a "Failed to generate recipe" error, it's most likely because no API keys are configured.

## Quick Fix (3 Steps)

### Step 1: Get Your API Key (Choose One Option)

**Option A: Hugging Face (FREE & RECOMMENDED)**
1. Go to [Hugging Face](https://huggingface.co/)
2. Sign up for a free account
3. Go to [Settings > Access Tokens](https://huggingface.co/settings/tokens)
4. Create a new token (choose "Read" permissions)
5. Copy the token (it starts with `hf_...`)

**Option B: Claude API (Premium - Better Quality)**
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (it starts with `sk-ant-...`)

### Step 2: Configure the API Key
1. Open the `.env` file in the project root (I've created it for you)
2. Add **at least one** API key:
   ```
   # For Hugging Face (FREE):
   HUGGINGFACE_API_KEY=hf_your_actual_token_here
   
   # OR for Claude (Premium):
   CLAUDE_API_KEY=sk-ant-your-actual-key-here
   
   # You can add both - app will use Claude first, then fallback to Hugging Face
   ```
3. Save the file

### Step 3: Restart the Server
1. Stop the server (Ctrl+C in the terminal)
2. Start it again:
   ```bash
   npm run dev:all
   ```
   Or if running separately:
   ```bash
   npm run server
   ```

## Verify It's Working

1. Make sure the backend server is running (you should see "✅ [API] key configured" in the terminal)
2. Add 4+ ingredients in the app
3. Click "Get a recipe"
4. You should see a loading spinner, then a recipe will appear!
   
   > **Note:** Check the server terminal logs - you'll see which API provider was used (Claude or Hugging Face)

## Common Issues

### "API key not configured" or "No API keys configured"
- **Fix:** Make sure your `.env` file exists and has **at least one** of these:
  - `HUGGINGFACE_API_KEY=your_token_here` (FREE - recommended)
  - `CLAUDE_API_KEY=your_key_here` (Premium)
- Make sure there are no spaces around the `=` sign
- Make sure the file is in the project root (same folder as `package.json`)
- **Pro Tip:** Start with Hugging Face - it's free and works great!

### "Server not running"
- **Fix:** Make sure you've run `npm run server` or `npm run dev:all`
- Check that port 3001 is not being used by another application

### "Network error" or "Failed to fetch"
- **Fix:** Make sure both frontend (port 5173) and backend (port 3001) are running
- Check your internet connection
- Verify the server is running in a separate terminal

## Testing Without API Key

The app has a fallback feature - if both APIs fail, it will generate a basic recipe using your ingredients. However, to get AI-powered personalized recipes, you need to configure at least one API key.

**Recommended:** Use Hugging Face - it's completely free and works great for recipe generation!

## Need Help?

Check the server terminal for detailed error messages - they will tell you exactly what's wrong!

