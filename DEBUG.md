# Debugging Guide - Hugging Face API Issues

## Check Server Logs

When you try to generate a recipe, check the server terminal output. You should see:

1. `🍽️ Attempting recipe generation with Hugging Face API...`
2. `📋 Ingredients: ...`
3. Model attempts and responses
4. Any error messages

## Common Issues and Fixes

### Issue 1: "Model is loading" or 503 errors

**Problem:** Hugging Face models go to sleep when not used and need to "wake up"

**Solution:** 
- Wait 10-20 seconds and try again
- The app automatically tries multiple models, so it should work on retry

### Issue 2: "All Hugging Face models failed"

**Check:**
1. Verify your API key in `.env` file:
   ```
   HUGGINGFACE_API_KEY=hf_your_actual_token_here
   ```
2. Make sure there are no spaces or quotes around the token
3. Restart the server after adding/changing the API key

### Issue 3: "Unexpected response format"

**Problem:** The model returned data in an unexpected format

**Solution:** 
- The app automatically tries 3 different models
- If all fail, check server logs for the specific error
- Try restarting the server

### Issue 4: Recipe generated but empty or incomplete

**Problem:** The AI model generated text but it wasn't parsed correctly

**Solution:**
- The app has fallback logic that creates reasonable recipes even if parsing fails
- Check the server logs to see what text was generated

## Manual Testing

You can test your Hugging Face API key manually:

```bash
curl https://api-inference.huggingface.co/models/gpt2 \
  -X POST \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"inputs": "Hello world"}'
```

Replace `YOUR_TOKEN_HERE` with your actual token from `.env`

## Server Restart Required

**Important:** After changing `.env` file, you MUST restart the server:

1. Stop the server (Ctrl+C)
2. Start again: `npm run server` or `npm run dev:all`

## Still Not Working?

1. Check server terminal for detailed error messages
2. Verify your token is valid at: https://huggingface.co/settings/tokens
3. Make sure you have "Read" permissions on the token
4. Try generating a new token if the current one doesn't work

