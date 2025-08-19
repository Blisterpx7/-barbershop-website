# 🚀 Domain Setup Guide for Barbershop

## 📋 Prerequisites

1. **Domain Provider Account** (Namecheap, GoDaddy, etc.)
2. **GitHub Account** (for code repository)
3. **Railway Account** (for hosting - free tier)
4. **MongoDB Atlas Account** (for database - free tier)

## 🔧 Step-by-Step Setup

### 1. GitHub Repository Setup

```bash
# Create new repository
git init
git add .
git commit -m "Initial commit: Barbershop Backend"
git branch -M main
git remote add origin https://github.com/yourusername/barbershop-backend.git
git push -u origin main
```

### 2. Railway Deployment

1. **Sign up at [railway.app](https://railway.app)**
2. **Connect GitHub repository**
3. **Create new project**
4. **Set environment variables:**

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/barbershop
JWT_SECRET=your-super-secret-jwt-key-here
STRIPE_SECRET_KEY=sk_live_your_stripe_key
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
ADMIN_EMAIL=jamesmayang51@gmail.com
```

5. **Deploy automatically**

### 3. MongoDB Atlas Setup

1. **Create account at [mongodb.com/atlas](https://mongodb.com/atlas)**
2. **Create new cluster (free tier)**
3. **Create database user**
4. **Get connection string**
5. **Update Railway environment variable**

### 4. Domain Configuration

#### A. DNS Records (at your domain provider)

```dns
# API Subdomain
Type: CNAME
Name: api
Value: your-railway-app.railway.app
TTL: 300

# Or Root Domain
Type: CNAME
Name: @
Value: your-railway-app.railway.app
TTL: 300
```

#### B. Railway Custom Domain

1. **Go to Railway project settings**
2. **Add custom domain: `api.yourdomain.com`**
3. **Verify domain ownership**
4. **SSL certificate will be auto-generated**

### 5. Frontend Configuration

Update your React frontend to use the new API:

```javascript
// config.js
export const API_BASE_URL = 'https://api.yourdomain.com';
// or
export const API_BASE_URL = 'https://yourdomain.com/api';
```

## 🌐 Final URLs

- **API Base**: `https://api.yourdomain.com`
- **Health Check**: `https://api.yourdomain.com/api/health`
- **Barbers**: `https://api.yourdomain.com/api/barbers`
- **Barber Images**: `https://api.yourdomain.com/api/barbers/images/`

## 🔒 Security Features

- **HTTPS/SSL**: Automatic with Railway
- **CORS**: Restricted to your domain
- **JWT Authentication**: Secure token system
- **Environment Variables**: Protected secrets

## 📊 Monitoring

- **Railway Dashboard**: Real-time logs and metrics
- **Health Checks**: Automatic endpoint monitoring
- **Auto-restart**: On failure recovery

## 🚨 Troubleshooting

### Common Issues:

1. **Domain not resolving**
   - Check DNS propagation (can take 24-48 hours)
   - Verify CNAME records

2. **CORS errors**
   - Check CORS_ORIGIN environment variable
   - Ensure frontend domain matches

3. **Database connection failed**
   - Verify MongoDB Atlas connection string
   - Check network access settings

## 📞 Support

- **Railway**: [docs.railway.app](https://docs.railway.app)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Domain Provider**: Check their support documentation

---

**🎉 Congratulations! Your barbershop backend is now live and production-ready!**
