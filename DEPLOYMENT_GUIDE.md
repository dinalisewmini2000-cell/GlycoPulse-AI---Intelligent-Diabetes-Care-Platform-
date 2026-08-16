# 🚀 GlycoPulse AI Deployment Guide

This guide provides step-by-step instructions to deploy the **GlycoPulse AI** application live to the web.

---

## 🛠️ Step 0: Pre-Deployment Check (Already Verified)

Your project build system has been pre-configured and tested. The production build generates cleanly into `frontend/dist`.

Configuration files added:
- `vercel.json` (Root level configuration for single-page application routing)
- `frontend/public/_redirects` (Netlify SPA routing rule)

---

## ⚡ Option 1: Deploying via Vercel (Recommended)

Vercel is the fastest and most reliable platform for React/Vite applications with free hosting, custom domains, and automatic SSL.

### Method A: Deploy via GitHub (Automated CI/CD)

1. Push your latest code to your GitHub repository:
   ```bash
   git add .
   git commit -m "Configure deployment settings"
   git push origin main
   ```
2. Go to [Vercel.com](https://vercel.com) and log in / sign up with GitHub.
3. Click **"Add New"** → **"Project"**.
4. Import your **`GlycoPulse-AI`** repository.
5. In the configuration settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/dist`
6. Expand **Environment Variables** and add:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_GEMINI_API_KEY` (if using AI vision scanning)
7. Click **Deploy**.

---

### Method B: Deploy Directly from Command Line (Vercel CLI)

If you do not want to use GitHub, you can deploy directly from your local terminal:

1. Open PowerShell terminal in `f:\my intern\GlycoPulse-AI`.
2. Run the Vercel deployment command:
   ```powershell
   npx vercel
   ```
3. Follow the quick prompts:
   - *Set up and deploy?* **y**
   - *Which scope?* (Select your account)
   - *Link to existing project?* **N**
   - *What's your project's name?* **glycopulse-ai**
   - *In which directory is your code located?* **./**
4. To deploy to **Production**:
   ```powershell
   npx vercel --prod
   ```

---

## 🌐 Option 2: Deploying via Netlify

### Method A: Drag-and-Drop (No Git Required)

1. Run the local build command in terminal:
   ```powershell
   npm run build
   ```
2. Log into [Netlify.com](https://netlify.com).
3. Navigate to **Sites** → **"Add new site"** → **"Deploy manually"**.
4. Drag and drop the `frontend/dist` directory into the upload box.

### Method B: Git Integration

1. Connect your GitHub account on Netlify.
2. Select repository `GlycoPulse-AI`.
3. Set **Base directory**: `frontend`
4. Set **Build command**: `npm run build`
5. Set **Publish directory**: `dist`
6. Add environment variables under **Site Settings > Environment Variables**.

---

## 🔑 Environment Variables Reference

Ensure all environment variables from `frontend/.env` are added in your hosting platform's Dashboard:

| Variable Name | Description |
| :--- | :--- |
| `VITE_FIREBASE_API_KEY` | Firebase API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Authentication Domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |
| `VITE_GEMINI_API_KEY` | Gemini AI API Key for vision scanners |

---

## 🔒 Firebase Authorized Domains Setup

After deployment, update your Firebase Auth settings to allow logins from your new live URL:

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Select project `cardiora-new`.
3. Navigate to **Authentication** → **Settings** → **Authorized domains**.
4. Click **Add domain** and add your live Vercel / Netlify domain (e.g. `glycopulse-ai.vercel.app`).
