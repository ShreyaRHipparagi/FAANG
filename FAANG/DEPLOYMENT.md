# FAANG Deployment Guide

## Quick Deploy to Render

### Prerequisites
- GitHub account
- Render account (free tier available at [render.com](https://render.com))

### Deployment Steps

1. **Push code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **Deploy to Render**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository: `ShreyaRHipparagi/FAANG`
   - Render will detect `render.yaml` and set up:
     - Web service (your app)
     - PostgreSQL database
   - Click "Apply" to start deployment

3. **Wait for deployment** (5-10 minutes):
   - Render will build and deploy your app
   - Database will be provisioned automatically
   - You'll get a public URL like: `https://faang-app.onrender.com`

4. **Set up database schema**:
   - Once deployed, go to your web service's "Shell" tab
   - Run: `npm run db:push`
   - This will create all database tables

### Your Public URL
After deployment completes, your app will be available at:
`https://faang-app-XXXXX.onrender.com`

(The exact URL will be shown in your Render dashboard)

---

## Alternative: Local Testing

To test the production build locally before deploying:

```bash
# Install dependencies
npm install

# Build the app
npm run build

# Start production server (requires DATABASE_URL)
export DATABASE_URL="your-postgres-connection-string"
npm start
```

---

## Environment Variables

The app uses these environment variables:
- `NODE_ENV`: Set to `production` in deployment
- `DATABASE_URL`: PostgreSQL connection string (auto-configured by Render)
- `PORT`: Server port (auto-configured by Render, defaults to 5000)

---

## Troubleshooting

### Build fails
- Check Node.js version compatibility
- Ensure all dependencies are in `package.json`

### App not loading
- Check Render logs in the dashboard
- Verify database connection
- Run `npm run db:push` to create tables

### Database errors
- Ensure `DATABASE_URL` is properly set
- Check database is provisioned and running
- Verify schema is pushed with `npm run db:push`
