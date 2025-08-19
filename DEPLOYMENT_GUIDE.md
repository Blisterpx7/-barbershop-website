# 🚀 FREE Deployment Guide for Barbershop Website

## 📋 **What You'll Deploy:**
- **Frontend**: React app (Vercel - FREE)
- **Backend**: Node.js API (Render - FREE)
- **Database**: MongoDB Atlas (Already FREE)

## 🆓 **Total Cost: ₱0 (FREE Forever!)**

---

## **STEP 1: Deploy Backend to Render** ⭐

### 1.1 **Push Code to GitHub**
```bash
# In your project folder
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 1.2 **Deploy to Render**
1. Go to [render.com](https://render.com)
2. **Sign up** with GitHub account
3. Click **"New +"** → **"Web Service"**
4. **Connect** your GitHub repository
5. **Configure:**
   - **Name**: `barbershop-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### 1.3 **Set Environment Variables**
In Render dashboard, add these:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://markdave3312004:markdave31@cluster0.swdvfha.mongodb.net/Mydb?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=barbershop-2024-prod-jwt-key
CORS_ORIGIN=*
ADMIN_EMAIL=jamesmayang51@gmail.com
```

### 1.4 **Deploy**
- Click **"Create Web Service"**
- Wait for **"Live"** status
- Copy your **URL** (e.g., `https://barbershop-api.onrender.com`)

---

## **STEP 2: Deploy Frontend to Vercel** ⭐

### 2.1 **Update API URL**
1. Open `client/src/contexts/AuthContext.jsx`
2. Change `localhost:3000` to your Render backend URL
3. Push to GitHub

### 2.2 **Deploy to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. **Sign up** with GitHub account
3. Click **"New Project"**
4. **Import** your GitHub repository
5. **Configure:**
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2.3 **Deploy**
- Click **"Deploy"**
- Wait for completion
- Your website is **LIVE!** 🎉

---

## **STEP 3: Test Everything** ✅

### **Test Your Live Website:**
1. **Frontend**: Visit your Vercel URL
2. **Registration**: Create a test account
3. **Login**: Sign in with test account
4. **Booking**: Try to book an appointment
5. **Services**: Check if all services load

---

## **🔧 Troubleshooting:**

### **If Backend Sleeps:**
- Render free tier sleeps after 15 minutes
- First request will wake it up (may take 30 seconds)
- This is normal for free tier

### **If API Errors:**
- Check if backend URL is correct in frontend
- Verify environment variables in Render
- Check Render logs for errors

### **If Frontend Build Fails:**
- Check Vercel build logs
- Ensure all dependencies are in package.json
- Verify build script works locally

---

## **🎯 Your Live URLs:**
- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://barbershop-api.onrender.com`
- **Database**: MongoDB Atlas (already working)

---

## **🚀 Ready to Deploy?**

**Follow these steps in order:**
1. **Backend first** (Render)
2. **Frontend second** (Vercel)
3. **Test everything**
4. **Share your live website!**

**Need help?** Just follow the steps above - both platforms are designed to be super easy! 🎉
