# Chris's Workout & Health Tracker — Setup Guide

## Step 1: Create GitHub Repository

1. Go to **github.com** and sign in
2. Click the **+** icon (top right) → **New repository**
3. Name it: `workout-tracker`
4. Set to **Public** (required for free GitHub Pages)
5. Click **Create repository**

---

## Step 2: Upload the App Files

On your new repository page, click **uploading an existing file**

Upload ALL files maintaining this structure:
```
workout-tracker/
├── index.html
├── package.json
├── vite.config.js
├── .github/
│   └── workflows/
│       └── deploy.yml
└── src/
    ├── main.jsx
    └── App.jsx
```

Click **Commit changes**

---

## Step 3: Enable GitHub Pages

1. Go to your repository → **Settings**
2. Click **Pages** in the left sidebar
3. Under **Source** select **GitHub Actions**
4. The app will auto-deploy — check the **Actions** tab to watch progress
5. Your app URL will be: `https://[yourusername].github.io/workout-tracker`

---

## Step 4: Google Fit API Setup (15 minutes)

### 4a. Create Google Cloud Project
1. Go to **console.cloud.google.com**
2. Click **Select a project** → **New Project**
3. Name it: `Chris Workout Tracker`
4. Click **Create**

### 4b. Enable the Fitness API
1. In the search bar type **Fitness API**
2. Click **Google Fitness API**
3. Click **Enable**

### 4c. Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. If prompted, configure the **consent screen** first:
   - User Type: **External**
   - App name: `Chris Workout Tracker`
   - Your email for support and developer contact
   - Click **Save and Continue** through all steps
   - Add scopes: search for "fitness" and add all fitness scopes
   - Add your Gmail as a **test user**
4. Back at Create Credentials → OAuth client ID:
   - Application type: **Web application**
   - Name: `Workout Tracker`
   - Authorized JavaScript origins: add `https://[yourusername].github.io`
   - Authorized redirect URIs: add `https://[yourusername].github.io/workout-tracker/`
5. Click **Create** — copy your **Client ID**

### 4d. Add Client ID to App
1. Open `src/App.jsx`
2. Find line 4: `const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE";`
3. Replace with your actual Client ID: `const GOOGLE_CLIENT_ID = "123456789-abc.apps.googleusercontent.com";`
4. Commit the change — GitHub Actions will auto-redeploy

---

## Step 5: Add to iPhone Home Screen

1. Open Safari on your iPhone
2. Go to: `https://[yourusername].github.io/workout-tracker`
3. Tap the **Share** button (box with arrow pointing up)
4. Tap **Add to Home Screen**
5. Name it: **Chris's Tracker**
6. Tap **Add**

The app icon will appear on your home screen. Tap it to open full-screen.

---

## Step 6: Connect Google Fit

1. Open the app
2. Tap the **HEALTH** tab
3. Tap **Connect Google Fit**
4. Sign in with your Google account
5. Grant all requested permissions

Your sleep, heart rate, steps, and activity data will start pulling automatically.

---

## Updating the App Later

Whenever we make changes in Claude:
1. Download the new `App.jsx` file
2. Go to your GitHub repository
3. Navigate to `src/App.jsx`
4. Click the pencil icon (edit)
5. Replace the content with the new version
6. Click **Commit changes**
7. GitHub Actions automatically rebuilds and deploys (takes ~2 minutes)

---

## Troubleshooting

**App not loading:** Check the Actions tab in GitHub — look for any red X errors

**Google Fit not connecting:** Make sure your Gmail is added as a test user in the OAuth consent screen

**Data not saving:** localStorage is tied to the browser — use the same browser on the same device

**Token expired:** Google OAuth tokens expire after 1 hour — just reconnect in the Health tab
