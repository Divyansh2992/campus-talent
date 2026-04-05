# 🚀 CampusKart Deployment Guide

## Backend Deployment (Render)

### Step 1: Prepare Your Backend
1. **Environment Variables**: Copy your `.env` file and ensure all required variables are set:
   ```env
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   CLOUDINARY_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

2. **MongoDB Setup**: Make sure your MongoDB database is accessible from external connections.

3. **Cloudinary Setup**: Create a free account at [cloudinary.com](https://cloudinary.com) for image storage. The app uses Cloudinary v1.x for compatibility with multer-storage-cloudinary.

### Step 2: Deploy to Render
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `campuskart-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install --legacy-peer-deps`
   - **Start Command**: `npm start`
5. Add Environment Variables in the "Environment" section
6. Click "Create Web Service"

### Step 3: Get Your Backend URL
After deployment, note down your Render URL (e.g., `https://campuskart-backend.onrender.com`)

---

## Frontend Deployment (Netlify)

### Step 1: Prepare Your Frontend
1. **Update API URL**: Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=https://your-backend-name.onrender.com
   ```

2. **Build Configuration**: The `netlify.toml` file is already configured.

### Step 2: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Configure the build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 20 (automatically set by netlify.toml)
5. Add Environment Variables:
   - `VITE_API_URL`: Your Render backend URL
6. Click "Deploy site"

### Step 3: Fix MIME Type Issues (if encountered)
If you see "Failed to load module script" errors:
1. The `netlify.toml` and `_headers` files are pre-configured to fix MIME type issues
2. Push the latest changes to trigger a new deployment
3. Netlify will automatically apply the correct headers for JavaScript modules

### Step 4: Update Redirects
After deployment, update the `netlify.toml` file with your actual backend URL and push to GitHub.

---

## Post-Deployment Checklist

### Backend
- ✅ API endpoints are accessible
- ✅ Database connection works
- ✅ File uploads work
- ✅ Authentication works

### Frontend
- ✅ Site loads without errors
- ✅ API calls work (login, register, listings)
- ✅ Images load from backend
- ✅ All routes work correctly

### Final Steps
1. Test the complete flow: Register → Login → Create Listing → View Listings
2. Update any hardcoded URLs in your code
3. Set up custom domain (optional)
4. Enable HTTPS (automatically handled by both platforms)

---

## Troubleshooting

### Backend Issues
- Check Render logs for errors
- Verify environment variables are set correctly
- Ensure MongoDB allows external connections

### Frontend Issues
- Check Netlify build logs
- Verify `VITE_API_URL` is set correctly
- Check browser console for CORS errors
- Ensure API endpoints return correct data

### Common Issues
- **Node.js version errors**: Fixed by netlify.toml specifying Node.js 20
- **MIME type errors**: Fixed automatically by the `netlify.toml` and `_headers` files
- **CORS errors**: Add your Netlify domain to allowed origins in backend
- **API calls failing**: Double-check the `VITE_API_URL` environment variable
- **Images not loading**: Ensure upload endpoints work and URLs are correct