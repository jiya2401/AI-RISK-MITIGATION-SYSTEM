# AI Risk Mitigation System - Frontend Quick Start

## 🚀 Get Started in 3 Steps

This is the production-ready React frontend for the AI Risk Mitigation System.

### 1️⃣ Install Dependencies

```bash
cd mitigation/BaatGPT/frontend
npm install
```

### 2️⃣ Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:5173**

### 3️⃣ Test the Application

1. Enter AI-generated text in the textarea
2. Click "Analyze Risk" (or press Ctrl+Enter)
3. View the comprehensive risk analysis results

## 📋 Sample Test Content

Try this high-risk content to see all features:

```
This medication is absolutely guaranteed to cure all diseases without any 
side effects. You will definitely see results in 24 hours. All patients 
have been cured. Act now before this limited time offer expires! 
Contact me at john.doe@email.com or call 555-1234-5678.
```

**Expected Results:**
- 🔴 HIGH hallucination risk
- 🔴 HIGH fraud risk
- ⚠️ PII detected
- Detailed summary with recommendations

## 📦 Production Build

```bash
npm run build
```

Optimized production build created in `dist/` directory.

## 🌐 Backend API

The frontend connects to the deployed backend:
```
https://ai-risk-mitigation-system-2.onrender.com/analyze
```

**No configuration needed!** The API URL is pre-configured.

## 🎨 Features

✅ **Modern UI** - Dark theme with smooth animations  
✅ **Responsive** - Works on all devices  
✅ **Real-time Analysis** - Instant risk detection  
✅ **Professional** - Production-grade error handling  
✅ **Fast** - Optimized with Vite  

## 📚 Documentation

- **[README.md](mitigation/BaatGPT/frontend/README.md)** - Complete documentation
- **[DEPLOYMENT.md](mitigation/BaatGPT/frontend/DEPLOYMENT.md)** - Deployment guides

## 🔧 Tech Stack

- React 19
- Vite 7
- Tailwind CSS
- Native Fetch API

## ✨ What You Get

- 🎯 Landing page with input form
- 📊 Results dashboard with color-coded risk cards
- 🔄 Loading states with animated spinner
- ⚠️ Professional error handling
- 🛡️ Six risk categories analyzed:
  - Hallucination Risk
  - Bias Risk
  - Toxicity Risk
  - Fraud Risk
  - PII Leak Detection
  - Overall Confidence Score

## 🚢 Ready to Deploy?

Deploy to any platform:
- Vercel (1 command: `vercel`)
- Netlify (drag & drop `dist/`)
- Render (connect GitHub repo)
- GitHub Pages
- AWS S3

See [DEPLOYMENT.md](mitigation/BaatGPT/frontend/DEPLOYMENT.md) for instructions.

## 🎉 That's It!

You now have a production-ready AI risk analysis frontend!

**Need help?** Check the [full README](mitigation/BaatGPT/frontend/README.md)
