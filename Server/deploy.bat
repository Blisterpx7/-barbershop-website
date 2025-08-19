@echo off
echo 🚀 Starting Barbershop API deployment...

REM Check if .env file exists
if not exist .env (
    echo ❌ .env file not found. Please create one from env.example
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm ci --only=production

REM Create logs directory
echo 📁 Creating logs directory...
if not exist logs mkdir logs

REM Check if PM2 is installed
pm2 --version >nul 2>&1
if errorlevel 1 (
    echo 📥 Installing PM2...
    call npm install -g pm2
)

REM Stop existing process if running
echo 🛑 Stopping existing processes...
pm2 stop barbershop-api 2>nul
pm2 delete barbershop-api 2>nul

REM Start the application
echo ▶️ Starting application with PM2...
call pm2 start ecosystem.config.js --env production

REM Save PM2 configuration
echo 💾 Saving PM2 configuration...
call pm2 save

REM Setup PM2 startup script
echo 🔧 Setting up PM2 startup script...
call pm2 startup

echo ✅ Deployment completed successfully!
echo.
echo 📊 Application status:
call pm2 status
echo.
echo 📝 View logs with: pm2 logs barbershop-api
echo 📊 Monitor with: pm2 monit
echo 🔄 Restart with: pm2 restart barbershop-api
pause
