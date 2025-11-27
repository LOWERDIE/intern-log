# 🚀 Deployment Guide - Internship Log

Complete guide for deploying your Internship Log application to production.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Firebase Setup](#firebase-setup)
- [Vercel Deployment](#vercel-deployment)
- [Environment Variables](#environment-variables)
- [Security Configuration](#security-configuration)
- [Domain Configuration](#domain-configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:
- ✅ A GitHub account
- ✅ A Firebase account (free tier is sufficient)
- ✅ A Vercel account (free tier is sufficient)
- ✅ Node.js 18+ installed locally (for testing)

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter your project name (e.g., `intern-log-prod`)
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click "Get started"
3. Click on **Sign-in method** tab
4. Enable **Email/Password**
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

### 3. Create Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click "Create database"
3. **Select location:**
   - Choose a location close to your users (e.g., `asia-southeast1` for Thailand)
4. **Start in production mode** (we'll add security rules later)
5. Click "Create"

### 4. Set Up Firestore Security Rules

1. In Firestore Database, go to the **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Logs collection
    match /logs/{logId} {
      // Allow creation only if user is authenticated and the userId matches
      allow create: if request.auth != null && 
                      request.resource.data.userId == request.auth.uid;
      
      // Allow read, update, delete only if user owns the log
      allow read, update, delete: if request.auth != null && 
                                     resource.data.userId == request.auth.uid;
    }
  }
}
```

3. Click **Publish** to save the rules

### 5. Get Firebase Configuration

1. In Firebase Console, click on the gear icon (⚙️) → **Project settings**
2. Scroll down to **Your apps**
3. Click on the **</>** (Web) icon
4. Register your app:
   - App nickname: `Internship Log`
   - ❌ Don't check "Set up Firebase Hosting"
   - Click "Register app"
5. **Copy the configuration values** (you'll need these for environment variables):

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:..."
};
```

### 6. Create First User Account

1. Go to **Authentication** → **Users** tab
2. Click "Add user"
3. Enter email and password for your admin account
4. Click "Add user"

## Vercel Deployment

### 1. Push Code to GitHub

```bash
# Make sure all changes are committed
git status
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository:
   - Click "Import" next to your `intern-log` repository
   - Or click "Import Git Repository" and enter the URL

### 3. Configure Project

**Framework Preset:** Next.js (auto-detected)

**Root Directory:** `./` (default)

**Build and Output Settings:** (use defaults)
- Build Command: `next build`
- Output Directory: `.next`
- Install Command: `npm install`

### 4. Add Environment Variables

Click on "Environment Variables" and add the following:

| Name | Value | Example |
|------|-------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | From Firebase config | `AIzaSyC...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | From Firebase config | `your-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | From Firebase config | `your-project-id` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | From Firebase config | `your-project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | From Firebase config | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | From Firebase config | `1:123456789:web:...` |

💡 **Tip:** Use the same values for all environments (Production, Preview, Development)

### 5. Deploy

1. Click "Deploy"
2. Wait for the build to complete (usually 1-2 minutes)
3. Once deployed, you'll get a URL like: `https://intern-log.vercel.app`

## Environment Variables

### Local Development (.env.local)

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:...
```

⚠️ **Important:** Never commit `.env.local` to Git. It's already in `.gitignore`.

## Security Configuration

### Firebase Authentication Settings

1. **Authorized Domains:**
   - Go to **Authentication** → **Settings** → **Authorized domains**
   - Add your Vercel domain: `your-app.vercel.app`
   - Add any custom domains you're using

2. **Email Enumeration Protection:**
   - In **Authentication** → **Settings**
   - Enable "Email enumeration protection" for better security

### Firestore Indexes (If Needed)

If you see errors about missing indexes in production:

1. Go to **Firestore Database** → **Indexes** tab
2. Click "Create index"
3. Or click the link in the error message to auto-create the index

**Current indexes needed:**
- Collection: `logs`
- Fields: `userId` (Ascending), `date` (Descending)
- Query scope: Collection

## Domain Configuration

### Using a Custom Domain

1. **In Vercel:**
   - Go to your project → **Settings** → **Domains**
   - Click "Add" and enter your domain
   - Follow the instructions to configure DNS

2. **Update Firebase Authorized Domains:**
   - Go to Firebase **Authentication** → **Settings**
   - Add your custom domain to the authorized domains list

## Troubleshooting

### Common Issues

#### ❌ "Firebase: Error (auth/unauthorized-domain)"

**Solution:** Add your deployment domain to Firebase authorized domains
1. Firebase Console → Authentication → Settings → Authorized domains
2. Add `your-app.vercel.app`

#### ❌ "Permission denied" in Firestore

**Solution:** Check your security rules
1. Make sure you're logged in
2. Verify the security rules are correctly set up
3. Check that `userId` field is being set correctly

#### ❌ Build fails on Vercel

**Solution:** Check environment variables
1. Verify all `NEXT_PUBLIC_FIREBASE_*` variables are set
2. Check for typos in variable names
3. Redeploy after adding/updating variables

#### ❌ "Module not found" errors

**Solution:** Clear cache and rebuild
1. In Vercel, go to Deployments
2. Click "..." → "Redeploy"
3. Check "Clear cache and redeploy"

### Checking Logs

**Vercel Logs:**
- Go to your project → Deployments
- Click on a deployment → "View Function Logs"

**Firebase Logs:**
- Firebase Console → Firestore Database → "Rules" tab
- Check for denied operations

## Production Checklist

Before going live, ensure:

- [ ] Firebase project is created and configured
- [ ] Email/Password authentication is enabled
- [ ] Firestore database is created
- [ ] Security rules are properly set up
- [ ] At least one user account is created
- [ ] All environment variables are set in Vercel
- [ ] Application builds successfully
- [ ] Can log in successfully
- [ ] Can create, read, update, delete logs
- [ ] Work links are clickable and open correctly
- [ ] Excel export works
- [ ] Language toggle works (TH/EN)
- [ ] Custom domain is configured (if applicable)
- [ ] Authorized domains are updated in Firebase

## Updating Your Deployment

### Automatic Deployments

Once connected to Vercel, deployments are automatic:

1. Push changes to `main` branch:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. Vercel automatically:
   - Detects the push
   - Builds the application
   - Deploys to production
   - Usually takes 1-2 minutes

### Manual Deployments

If needed, you can manually redeploy:

1. Go to Vercel Dashboard → Your Project
2. Click "Deployments"
3. Click "..." → "Redeploy"

## Monitoring

### Vercel Analytics (Optional)

1. Go to your project in Vercel
2. Click "Analytics" tab
3. Enable Analytics to track:
   - Page views
   - Top pages
   - Top referrers

### Firebase Usage

Monitor your Firebase usage:
- Firebase Console → Usage and billing
- Check Firestore reads/writes
- Check Authentication usage

**Free tier limits:**
- Firestore: 50K reads, 20K writes, 20K deletes per day
- Authentication: Unlimited

---

## Need Help?

- **Vercel Support:** [vercel.com/support](https://vercel.com/support)
- **Firebase Support:** [firebase.google.com/support](https://firebase.google.com/support)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)

**Created with ❤️ by [LOWERDIE](https://github.com/LOWERDIE)**
