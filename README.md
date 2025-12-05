# Chef Claude 🧑‍🍳

A modern React recipe app powered by Claude AI that generates personalized recipes from your available ingredients.

## Features

- ✨ AI-powered recipe generation using Claude AI
- 🥘 Add and manage ingredients with an intuitive interface
- 🔍 Ingredient autocomplete with 40+ common ingredients
- 🗑️ Remove individual ingredients or clear all at once
- ⚡ Real-time validation (prevents duplicates and empty entries)
- 🎨 Beautiful, responsive UI with loading states
- 🔄 Automatic fallback to local recipe generation if API is unavailable
- 💾 Save recipes to browser storage
- 📋 Copy recipes to clipboard
- 🖨️ Print recipes in formatted view
- ♿ Full accessibility support (ARIA, keyboard navigation, screen readers)
- 🛡️ Error boundary for graceful error handling
- ⏱️ Request timeout and cancellation
- 🔒 Rate limiting and input sanitization for security

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- **At least one** of the following API keys:
  - **Claude API key** from [Anthropic Console](https://console.anthropic.com/) (Premium option)
  - **Hugging Face token** from [Hugging Face Settings](https://huggingface.co/settings/tokens) (Free alternative)
  
  > 💡 **Tip:** The app will automatically use Claude if available, and fallback to Hugging Face if Claude is not configured or fails.

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and add **at least one** API key:
     ```
     # Option 1: Claude API (Premium - better quality)
     CLAUDE_API_KEY=your_api_key_here
     
     # Option 2: Hugging Face API (Free alternative)
     HUGGINGFACE_API_KEY=your_huggingface_token_here
     ```
     
     > **Note:** You only need ONE API key. The app will use Claude first if available, then fallback to Hugging Face automatically.

3. **Run the application:**
   
   **Option A: Run both servers together (recommended):**
   ```bash
   npm run dev:all
   ```
   
   **Option B: Run servers separately:**
   
   Terminal 1 (Backend):
   ```bash
   npm run server
   ```
   
   Terminal 2 (Frontend):
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## Usage

1. Add ingredients one by one using the input form
2. Once you have 4+ ingredients, click "Get a recipe"
3. Chef Claude AI will generate a personalized recipe based on your ingredients
4. View the recipe with ingredients list and step-by-step instructions

## Project Structure

```
Chef-Claude/
├── server.js          # Express backend server (Claude API proxy)
├── App.jsx            # Main app component
├── Header.jsx         # Header component
├── Main.jsx           # Main content component (ingredients & recipes)
├── index.css          # Global styles
├── vite.config.js     # Vite configuration with API proxy
└── .env               # Environment variables (not committed)
```

## API Integration

The app uses Claude AI (Anthropic API) to generate intelligent recipes. The backend server acts as a secure proxy to protect your API key. If the API is unavailable, the app automatically falls back to local recipe generation.

## Scripts

- `npm run dev` - Start Vite dev server (frontend only)
- `npm run server` - Start Express backend server
- `npm run dev:all` - Run both frontend and backend concurrently
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Check for linting errors
- `npm run lint:fix` - Auto-fix linting errors
- `npm run format` - Format code with Prettier

## Technologies

- **Frontend:** React 19, Vite
- **Backend:** Express.js, Node.js
- **AI:** Claude AI (Anthropic API)
- **Styling:** CSS3 with modern features

## Notes

- The API key is kept secure on the backend - never exposed to the frontend
- The app includes fallback recipe generation if the API is unavailable
- All API calls are proxied through the backend server in development

---

Happy Cooking! 👨‍🍳👩‍🍳
