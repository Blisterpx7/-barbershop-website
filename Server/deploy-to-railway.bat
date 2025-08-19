@echo off
echo 🚀 James Barbershop Backend Deployment to Railway
echo ================================================

echo.
echo 📋 Prerequisites Check:
echo 1. GitHub repository created
echo 2. Railway account setup
echo 3. MongoDB Atlas account
echo 4. Domain provider access
echo.

echo 🔧 Step 1: Push to GitHub
echo git add .
echo git commit -m "Production ready for james.com"
echo git push origin main
echo.

echo 🌐 Step 2: Railway Deployment
echo 1. Go to railway.app
echo 2. Create new project
echo 3. Connect GitHub repo
echo 4. Set environment variables
echo.

echo 📊 Step 3: Environment Variables
echo NODE_ENV=production
echo PORT=3000
echo MONGODB_URI=your_mongodb_atlas_connection_string
echo JWT_SECRET=your_super_secret_key
echo STRIPE_SECRET_KEY=your_stripe_live_key
echo CORS_ORIGIN=https://james.com,https://www.james.com
echo ADMIN_EMAIL=jamesmayang51@gmail.com
echo.

echo 🌍 Step 4: Domain Setup
echo 1. Add custom domain in Railway
echo 2. Update DNS records at domain provider
echo 3. Wait for SSL certificate
echo.

echo ✅ Step 5: Test Endpoints
echo Health: https://your-app.railway.app/api/health
echo Barbers: https://your-app.railway.app/api/barbers
echo James Image: https://your-app.railway.app/api/barbers/images/james.jpg
echo.

echo 🎉 Deployment Complete!
echo Your backend will be live at: https://your-app.railway.app
echo.

pause
