# AI Risk Mitigation System - Frontend

A production-ready React + Vite frontend for analyzing AI-generated content for potential risks and biases.

## 🚀 Quick Start

### Install Dependencies
```bash
cd frontend
npm install
```

### Development Server
```bash
npm run dev
```
Open http://localhost:5173 in your browser.

### Production Build
```bash
npm run build
```
Build output will be in `frontend/dist/`

### Preview Production Build
```bash
npm run preview
```

## 🏗️ Project Structure

```
frontend/
├── package.json           # Dependencies and scripts
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
├── index.html            # HTML entry point
├── src/
│   ├── main.jsx          # React entry point
│   ├── App.jsx           # Main application component
│   ├── index.css         # Global styles with Tailwind
│   └── components/
│       ├── Analyzer.jsx      # Text input form
│       ├── RiskBadge.jsx     # Risk level indicator
│       └── ResultPanel.jsx   # Analysis results display
└── dist/                 # Production build output
```

## 🎨 Features

- **Dark Theme UI**: Modern dark interface with smooth animations
- **Real-time Analysis**: Instant risk assessment of AI-generated content
- **Color-coded Risk Badges**: Visual indicators for different risk levels
  - 🔴 HIGH (Red)
  - 🟡 MEDIUM (Yellow)
  - 🟢 LOW (Green)
- **PII Detection Alert**: Warning when personally identifiable information is found
- **Confidence Score**: Visual progress bar showing analysis confidence
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Error Handling**: Clear error messages for failed requests
- **Loading States**: Visual feedback during analysis

## 🔧 Configuration

The backend API URL is configured at the top of `src/App.jsx`:

```javascript
const API_URL = 'https://ai-risk-mitigation-system-2.onrender.com'
```

Change this URL to point to your backend deployment.

## 📡 API Integration

The frontend consumes the POST `/analyze` endpoint expecting:

**Request:**
```json
{
  "text": "AI-generated content to analyze"
}
```

**Response:**
```json
{
  "hallucination_risk": "HIGH",
  "bias_risk": "LOW",
  "toxicity_risk": "LOW",
  "pii_leak": true,
  "fraud_risk": "HIGH",
  "confidence_score": 0.905,
  "summary": "Analysis summary...",
  "engine_used": "heuristics",
  "processing_time_ms": 0.3
}
```

## 🧪 Testing

Try this sample high-risk content:

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

## 🚢 Deployment

### Render Static Site

1. Connect your GitHub repository to Render
2. Set build command: `cd frontend && npm install && npm run build`
3. Set publish directory: `frontend/dist`
4. Deploy!

### Other Platforms

The frontend is a standard Vite + React app and can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

## 🛠️ Tech Stack

- **React 18.3.1** - UI framework
- **Vite 6.0.3** - Build tool and dev server
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Fetch API** - HTTP client (no external dependencies)

## 📝 Notes

- Build output is optimized for production with minification and tree-shaking
- CSS is purged of unused Tailwind classes for minimal bundle size
- The app uses React StrictMode for development safety checks
- All components are functional components using React Hooks
