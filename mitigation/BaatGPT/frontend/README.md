# AI Risk Mitigation System - Frontend

A production-grade React frontend for AI safety and risk analysis.

## 🎯 Overview

This is a modern, responsive web application that connects to the AI Risk Mitigation System backend API to analyze AI-generated content for various risk factors including:

- **Hallucination Risk** - Detects potentially false or unverified information
- **Bias Risk** - Identifies biased language or perspectives  
- **Toxicity Risk** - Flags harmful or offensive content
- **Fraud Risk** - Identifies suspicious or fraudulent patterns
- **PII Leak Detection** - Detects personally identifiable information

## 🚀 Tech Stack

- **React 19** - Modern React with hooks
- **Vite 7** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Fetch API** - Native HTTP requests (no external libraries)

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Backend API

The frontend connects to the deployed backend at:
```
https://ai-risk-mitigation-system-2.onrender.com
```

### API Endpoint

**POST** `/analyze`

Request:
```json
{
  "text": "AI-generated content here"
}
```

Response:
```json
{
  "hallucination_risk": "LOW | MEDIUM | HIGH",
  "bias_risk": "LOW | MEDIUM | HIGH",
  "toxicity_risk": "LOW | MEDIUM | HIGH",
  "pii_leak": true | false,
  "fraud_risk": "LOW | MEDIUM | HIGH",
  "confidence_score": 0.0 - 1.0,
  "summary": "human readable explanation",
  "engine_used": "heuristics | medbert+heuristics",
  "processing_time_ms": number
}
```

## 🎨 Features

### Landing Page
- Clean, modern dark theme interface
- Large textarea for AI-generated content input
- Real-time character counter
- Keyboard shortcuts (Ctrl+Enter to analyze)
- Disabled state while analyzing

### Results Dashboard
- **Risk Cards** - Color-coded badges (Green/Yellow/Red) for each risk type
- **PII Alert** - Special red alert chip if PII is detected
- **Confidence Score** - Animated progress bar showing analysis confidence
- **Summary Section** - Comprehensive analysis with appropriate icons (⚠️/✅)
- **Metadata Display** - Shows engine used and processing time
- **Analyzed Text Preview** - Displays the analyzed content for reference

### UX Polish
- ✨ Smooth fade-in and slide-up animations
- 🎯 Hover effects on interactive elements
- 🔄 Loading spinner during analysis
- ⚠️ Professional error handling with clear messages
- 📱 Fully responsive design (mobile, tablet, desktop)
- 🎨 Custom scrollbar styling
- ♿ Accessible form controls

## 🎨 Design System

### Colors
- **Background**: `#0a0e1a` (dark-bg)
- **Cards**: `#151925` (dark-card)
- **Borders**: `#1e2537` (dark-border)
- **Accent Blue**: `#3b82f6`
- **Accent Purple**: `#8b5cf6`

### Risk Colors
- 🟢 **LOW** - Green (`#10b981`)
- 🟡 **MEDIUM** - Yellow (`#f59e0b`)
- 🔴 **HIGH** - Red (`#ef4444`)

## 📁 Project Structure

```
src/
├── components/
│   ├── RiskAnalyzer.jsx      # Main analysis component
│   ├── ResultCard.jsx         # Individual risk result card
│   ├── LoadingSpinner.jsx     # Loading animation
│   └── ErrorMessage.jsx       # Error display component
├── App.jsx                    # Root application component
├── main.jsx                   # Application entry point
└── index.css                  # Tailwind directives & global styles
```

## 🚢 Deployment

This frontend can be deployed to any static hosting service:

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Render
```bash
# Build command: npm run build
# Publish directory: dist
```

## 🔧 Configuration

No environment variables needed! The backend URL is hardcoded to the production API:
```javascript
const API_URL = 'https://ai-risk-mitigation-system-2.onrender.com/analyze';
```

To change the API endpoint, modify `src/components/RiskAnalyzer.jsx`.

## 🧪 Testing

The application can be tested by:

1. **Entering sample text** - Use AI-generated content with various risk factors
2. **Checking error handling** - Test with empty input or when API is unreachable
3. **Testing responsive design** - Resize browser window to test mobile/tablet views

### Sample Test Content

High-risk content example:
```
This medication is absolutely guaranteed to cure all diseases without any 
side effects. You will definitely see results in 24 hours. All patients 
have been cured. Act now before this limited time offer expires! 
Contact me at john.doe@email.com or call 555-1234-5678.
```

## 🎯 Key Features

✅ **Zero Backend Changes Required** - Connects to existing deployed API  
✅ **Production Ready** - Professional UI with proper error handling  
✅ **Mobile Responsive** - Works seamlessly on all devices  
✅ **Fast Performance** - Optimized with Vite for quick load times  
✅ **Modern Design** - Dark theme with smooth animations  
✅ **Accessible** - Semantic HTML and keyboard navigation support  

## 📝 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## 🤝 Contributing

This is a production-ready implementation. For enhancements:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📄 License

MIT License - see repository root for details
