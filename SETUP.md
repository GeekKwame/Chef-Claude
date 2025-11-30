# Quick Setup Guide for Chef Claude

## The Error You're Seeing

If you're getting a "Failed to generate recipe" error, it's most likely because the Claude API key is not configured.

## Quick Fix (3 Steps)

### Step 1: Get Your Claude API Key
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (it starts with `sk-ant-...`)

### Step 2: Configure the API Key
1. Open the `.env` file in the project root (I've created it for you)
2. Replace `your_api_key_here` with your actual API key:
   ```
   CLAUDE_API_KEY=sk-ant-your-actual-key-here
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

1. Make sure the backend server is running (you should see "✅ Claude API key configured" in the terminal)
2. Add 4+ ingredients in the app
3. Click "Get a recipe"
4. You should see a loading spinner, then a recipe will appear!

## Common Issues

### "API key not configured"
- **Fix:** Make sure your `.env` file exists and has `CLAUDE_API_KEY=your_key_here`
- Make sure there are no spaces around the `=` sign
- Make sure the file is in the project root (same folder as `package.json`)

### "Server not running"
- **Fix:** Make sure you've run `npm run server` or `npm run dev:all`
- Check that port 3001 is not being used by another application

### "Network error" or "Failed to fetch"
- **Fix:** Make sure both frontend (port 5173) and backend (port 3001) are running
- Check your internet connection
- Verify the server is running in a separate terminal

## Testing Without API Key

The app has a fallback feature - if the API fails, it will generate a basic recipe using your ingredients. However, to get AI-powered personalized recipes, you need to configure the API key.

## Need Help?

Check the server terminal for detailed error messages - they will tell you exactly what's wrong!

