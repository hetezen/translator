# Multi-Language Translator

A React app that translates English text into multiple languages simultaneously using DeepL API.

## Deploy to Netlify

### Option 1: Deploy via GitHub (Recommended)

1. **Create a GitHub repository** and push this code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/translator.git
   git push -u origin main
   ```

2. **Go to [Netlify](https://app.netlify.com/)** and sign up/log in

3. Click **"Add new site"** → **"Import an existing project"**

4. Connect to GitHub and select your repository

5. Netlify will auto-detect the settings. Just click **"Deploy site"**

6. Wait 1-2 minutes — your site will be live at `https://random-name.netlify.app`

### Option 2: Deploy via Drag & Drop

1. Run locally first to build:
   ```bash
   npm install
   npm run build
   ```

2. Go to [Netlify Drop](https://app.netlify.com/drop)

3. Drag the `dist` folder to the browser

4. Your site is live!

**Note:** This method won't include the serverless function. Use Option 1 for full functionality.

---

## Features

- Translate to 24+ languages at once
- Add/remove languages as needed
- 🔊 Pronunciation (text-to-speech)
- Translation history (saved locally)
- API key saved in browser
- Works on desktop and mobile

## Get Your DeepL API Key

1. Go to [deepl.com/pro-api](https://www.deepl.com/pro-api)
2. Sign up for free (no credit card needed)
3. Copy your API key
4. Paste it in the app

Free tier: 500,000 characters/month

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173
