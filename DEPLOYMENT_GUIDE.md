# Vercel Deployment Guide for PlanLingo

## Prerequisites
- GitHub repository with your code
- Vercel account (free tier available)
- OpenAI API key (for AI features)
- Database (PostgreSQL) - can use Vercel Postgres or external service

## Step 1: Deploy Backend to Vercel

### 1.1 Create Backend Project in Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty

### 1.2 Set Backend Environment Variables
In Vercel dashboard, go to Settings > Environment Variables and add:

```
DATABASE_URL=your_postgresql_connection_string
SECRET_KEY=your_jwt_secret_key_here
OPENAI_API_KEY=your_openai_api_key
CORS_ORIGINS=https://your-frontend-domain.vercel.app
ALLOWED_HOSTS=your-backend-domain.vercel.app
```

### 1.3 Deploy Backend
- Click "Deploy" and wait for deployment to complete
- Note the deployment URL (e.g., `https://your-backend.vercel.app`)

## Step 2: Deploy Frontend to Vercel

### 2.1 Create Frontend Project in Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import the same GitHub repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2.2 Set Frontend Environment Variables
In Vercel dashboard, go to Settings > Environment Variables and add:

```
VITE_API_URL=https://your-backend-domain.vercel.app/api/v1
```

### 2.3 Deploy Frontend
- Click "Deploy" and wait for deployment to complete
- Note the deployment URL (e.g., `https://your-frontend.vercel.app`)

## Step 3: Update CORS Settings

After both deployments are complete:

1. Go to your backend project in Vercel
2. Update the `CORS_ORIGINS` environment variable to include your frontend URL
3. Redeploy the backend

## Step 4: Test Your Deployment

1. Visit your frontend URL
2. Test the main features:
   - User registration/login
   - Intent parsing
   - Plan generation
   - Goal tracking

## Database Setup Options

### Option 1: Vercel Postgres (Recommended)
1. In Vercel dashboard, go to Storage tab
2. Create a new Postgres database
3. Use the connection string as your `DATABASE_URL`

### Option 2: External Database
- Use services like Supabase, PlanetScale, or Railway
- Add the connection string to your environment variables

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure `CORS_ORIGINS` includes your frontend URL
2. **Database Connection**: Verify your `DATABASE_URL` is correct
3. **Environment Variables**: Ensure all required variables are set
4. **Build Failures**: Check the build logs in Vercel dashboard

### Debugging Steps:

1. Check Vercel function logs for backend errors
2. Check browser console for frontend errors
3. Verify API endpoints are accessible
4. Test database connectivity

## Production Considerations

1. **Security**: Use strong, unique secrets for production
2. **Monitoring**: Set up error tracking (Sentry, etc.)
3. **Performance**: Enable Vercel Analytics
4. **Backup**: Regular database backups
5. **SSL**: Vercel handles this automatically

## Environment Variables Reference

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your_jwt_secret_key
OPENAI_API_KEY=sk-your_openai_key
CORS_ORIGINS=https://your-frontend.vercel.app
ALLOWED_HOSTS=your-backend.vercel.app
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend.vercel.app/api/v1
VITE_GROQ_API_KEY=your_groq_api_key_here
```

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test API endpoints directly
4. Check browser console for errors