# Frontend Deployment Guide

## Quick Start

The AI Risk Mitigation System frontend is a standalone React application that can be deployed to any static hosting service.

## Prerequisites

- Node.js 20+ (for building)
- npm or yarn

## Build for Production

```bash
cd mitigation/BaatGPT/frontend
npm install
npm run build
```

This creates an optimized production build in the `dist/` directory.

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd mitigation/BaatGPT/frontend
   vercel
   ```

3. **Follow the prompts**:
   - Link to existing project or create new one
   - Accept default settings
   - Deploy!

**Configuration:**
Vercel auto-detects Vite projects. No additional configuration needed.

### Option 2: Netlify

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

   Or **drag & drop** the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop).

**Configuration (netlify.toml):**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: Render

1. **Connect your GitHub repository** to Render

2. **Create a new Static Site** with these settings:
   - **Build Command**: `cd mitigation/BaatGPT/frontend && npm install && npm run build`
   - **Publish Directory**: `mitigation/BaatGPT/frontend/dist`

3. **Deploy**!

### Option 4: GitHub Pages

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json**:
   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     },
     "homepage": "https://yourusername.github.io/AI-RISK-MITIGATION-SYSTEM"
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

### Option 5: AWS S3 + CloudFront

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Upload to S3**:
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Configure S3 bucket** for static website hosting

4. **(Optional) Set up CloudFront** for CDN

## Environment Configuration

The frontend is configured to connect to the production backend:
```
https://ai-risk-mitigation-system-2.onrender.com
```

If you need to change the API endpoint, modify `src/components/RiskAnalyzer.jsx`:
```javascript
const API_URL = 'your-backend-url/analyze';
```

## Testing the Deployment

After deployment, test the application:

1. **Visit the deployed URL**
2. **Enter sample text** in the textarea
3. **Click "Analyze Risk"**
4. **Verify results** are displayed correctly

### Sample Test Content

```
This medication is absolutely guaranteed to cure all diseases without any 
side effects. You will definitely see results in 24 hours. All patients 
have been cured. Act now before this limited time offer expires! 
Contact me at john.doe@email.com or call 555-1234-5678.
```

Expected result: HIGH risk flags for hallucination, fraud, and PII detection.

## Troubleshooting

### CORS Issues

If you encounter CORS errors, ensure the backend API allows requests from your frontend domain. The production backend should already be configured for this.

### Build Errors

If you get build errors:
1. Delete `node_modules/` and `package-lock.json`
2. Run `npm install` again
3. Try building again

### API Connection Issues

If the frontend cannot connect to the backend:
1. Check that the backend URL is correct
2. Verify the backend is running and accessible
3. Check browser console for error messages

## Performance Optimization

The production build is already optimized with:
- ✅ Code splitting
- ✅ Tree shaking
- ✅ Minification
- ✅ Gzip compression
- ✅ CSS purging (Tailwind)

Typical bundle size: ~200KB (gzipped: ~62KB)

## Monitoring

After deployment, monitor:
- **Load times** - Should be under 2 seconds
- **API response times** - Typically 50-200ms
- **Error rates** - Should be minimal
- **User engagement** - Track analyses performed

## Support

For issues or questions:
1. Check the [README](./README.md)
2. Review the [main repository documentation](../../README.md)
3. Open a GitHub issue

## License

MIT License - See repository root for details
