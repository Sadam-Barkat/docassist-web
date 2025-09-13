# Deployment Configuration Guide

## Environment Variables Setup

### Frontend (Vercel)
Add these environment variables in your Vercel dashboard:

```
NEXT_PUBLIC_API_URL=https://docassist-api.onrender.com
```

### Backend (Render)
Add these environment variables in your Render dashboard:

```
DATABASE_URL=postgresql://username:password@host:port/database
SECRET_KEY=your-jwt-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
GEMINI_API_KEY=your-gemini-api-key-here
SMTP_SERVER=your-smtp-server
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-email-password
Secret_key=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

## Deployment Steps

### 1. Backend Deployment (Render)
1. Connect your GitHub repository
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add all environment variables listed above
5. Deploy

### 2. Frontend Deployment (Vercel)
1. Connect your GitHub repository
2. Set framework preset: Next.js
3. Set root directory: `/` (or your frontend folder path)
4. Add environment variable: `NEXT_PUBLIC_API_URL`
5. Deploy

## Common Issues & Fixes

### 401 Authentication Errors
- Ensure DATABASE_URL is correctly set in Render
- Verify SECRET_KEY matches between deployments
- Check if admin user exists in production database

### CORS Issues
- Backend now supports multiple Vercel deployment URLs
- Ensure your actual Vercel URL is in the origins list

### Chatbot Issues
- Ensure GEMINI_API_KEY is set in Render environment
- Check OpenAI Agent SDK is properly installed

### Database Connection Issues
- Verify DATABASE_URL format: `postgresql://user:pass@host:port/db`
- Ensure database is accessible from Render's IP ranges
- Run database migrations if needed

## Testing Deployment
1. Test API health: `https://your-backend-url.onrender.com/`
2. Test authentication: Login with admin credentials
3. Test chatbot: Send a message and verify navigation works
4. Check browser console for any CORS or API errors
