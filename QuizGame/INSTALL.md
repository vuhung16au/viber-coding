# Quiz Game Installation Guide

This document provides step-by-step instructions for setting up and deploying the Quiz Game application both locally and on Vercel, along with configuration guidance for Firebase.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Firebase Configuration](#firebase-configuration)
- [Vercel Deployment](#vercel-deployment)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or later)
- npm (v9 or later)
- Git
- Firebase account
- Vercel account (for deployment)

## Local Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd QuizGame
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory with your Firebase configuration:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your-database-url
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000).

## Firebase Configuration

### Setting Up Firebase

1. **Create a Firebase project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard

2. **Enable Authentication**
   - In the Firebase console, navigate to "Authentication"
   - Go to the "Sign-in method" tab
   - Enable Email/Password authentication
   - Optionally enable Google, Facebook, or other providers

3. **Set up Realtime Database**
   - In the Firebase console, navigate to "Realtime Database"
   - Click "Create Database"
   - Start in test mode, then apply the security rules below

### Firebase Realtime Database Security Rules

Replace the default security rules with the following configuration to ensure secure access to your data:

```json
{
  "rules": {
    ".read": "auth != null", // Require authentication for reading anything
    ".write": "auth != null", // Require authentication for writing anything

    "quizzes": {
      ".read": true, // Allow anyone (even unauthenticated) to read quiz definitions
      "$quizId": {
        // Specific rules for individual quizzes if needed
      }
    },

    "users": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId", // Only the logged-in user can read their own data
        ".write": "auth != null && auth.uid == $userId", // Only the logged-in user can write to their own data
        "results": {
          ".indexOn": ["quizId"]
        }
      }
    },

    "results": {
      ".read": "auth != null && query.orderByChild == 'userId' && query.equalTo == auth.uid",
      ".write": "auth != null && newData.child('userId').val() == auth.uid",
      ".indexOn": ["userId", "quizId"]
    }
  }
}
```

### Initialize Firebase Data (Optional)

To populate your database with initial data:

1. **Run the category initialization script**
   ```bash
   node firebase/category-init.js
   ```

2. **Populate sample quizzes (for development)**
   ```bash
   cd priv-vuhung-utils
   npm install
   node populate-sample-quiz.js
   ```

## Vercel Deployment

1. **Push your code to a Git repository**
   - GitHub, GitLab, or Bitbucket

2. **Create a Vercel account and connect it to your Git provider**
   - Go to [Vercel](https://vercel.com/) and sign up or log in
   - Connect your Git provider account

3. **Import your repository**
   - Click "Import Project" in the Vercel dashboard
   - Select your Quiz Game repository

4. **Configure project**
   - Vercel will automatically detect Next.js
   - Add all the environment variables from your `.env.local` file

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application

6. **Set up custom domain (optional)**
   - In the Vercel dashboard, go to "Domains"
   - Add and verify your custom domain

## Environment Variables

For both local development and Vercel deployment, you need the following environment variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | Firebase Realtime Database URL |

## Troubleshooting

### Common Issues

1. **Firebase Authentication Issues**
   - Ensure you've enabled the correct authentication providers in Firebase Console
   - Check that your environment variables are correctly set

2. **Database Access Denied**
   - Verify your Firebase security rules are correctly configured
   - Check that users are properly authenticated before accessing protected data

3. **Deployment Issues**
   - Ensure all environment variables are set in Vercel
   - Check build logs for any errors

### Getting Help

If you encounter any issues not covered in this guide, please:
- Open an issue in the GitHub repository
- Check existing issues for similar problems and solutions
- Consult the Firebase and Next.js documentation for additional troubleshooting steps