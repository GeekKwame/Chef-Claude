# Chef Claude 🧑‍🍳

A modern React recipe app powered by Claude AI that generates personalized recipes from your available ingredients.

## Features

- ✨ AI-powered recipe generation using Claude AI
- 🥘 Add and manage ingredients with an intuitive interface
- 🗑️ Remove individual ingredients or clear all at once
- ⚡ Real-time validation (prevents duplicates and empty entries)
- 🎨 Beautiful, responsive UI with loading states
- 🔄 Automatic fallback to local recipe generation if API is unavailable

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- A Claude API key from [Anthropic Console](https://console.anthropic.com/)

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
   - Open `.env` and add your Claude API key:
     ```
     CLAUDE_API_KEY=your_api_key_here
     ```

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
