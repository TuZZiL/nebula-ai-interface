# Deployment Guide

## 🚀 Deploying to Render.com

### Prerequisites
- GitHub account with your code repository
- Render.com account

### Step 1: Prepare Your Repository
1. Ensure all sensitive data is in environment variables
2. Push your code to GitHub
3. Make sure `.env` file is in `.gitignore`

### Step 2: Create Web Service on Render
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `nebula-ai-interface` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3: Set Environment Variables
In the Render dashboard, go to your service → Environment tab and add:

```
DEFAULT_API_KEY=your_actual_api_key_here
IMAGE_API_URL=https://chutes-hidream.chutes.ai/generate
NODE_ENV=production
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for the build and deployment to complete
3. Your app will be available at `https://your-service-name.onrender.com`

## 🔧 Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DEFAULT_API_KEY` | Default API key for LLM services | No | `YOUR_DEFAULT_API_KEY_HERE` |
| `IMAGE_API_URL` | URL for image generation API | No | `https://chutes-hidream.chutes.ai/generate` |
| `PORT` | Server port | No | `3000` |
| `NODE_ENV` | Environment mode | No | `development` |

## 🔒 Security Best Practices

1. **Never commit API keys** to your repository
2. **Use environment variables** for all sensitive data
3. **Regularly rotate** your API keys
4. **Monitor usage** of your deployed application
5. **Set up alerts** for unusual activity

## 🐛 Troubleshooting

### Common Issues

**Build fails with "Module not found"**
- Check that all dependencies are in `package.json`
- Ensure `npm install` runs successfully locally

**App crashes on startup**
- Check the logs in Render dashboard
- Verify environment variables are set correctly
- Ensure `npm start` works locally

**API calls fail**
- Verify API keys are set in environment variables
- Check CORS settings if needed
- Verify API endpoints are accessible

### Getting Help
- Check Render.com documentation
- Review application logs in Render dashboard
- Test locally with same environment variables