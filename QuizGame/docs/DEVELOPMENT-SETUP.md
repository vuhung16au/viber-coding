# Development Environment Setup

This document provides step-by-step instructions for setting up a local development environment for the QuizGame application.

## Prerequisites

Before starting, ensure you have the following tools installed on your system:

- **Node.js** (v18 or later)
- **npm** (v8 or later) or **yarn** (v1.22 or later)
- **Git** (v2.20 or later)
- A code editor (VS Code recommended)
- A modern web browser (Chrome or Firefox recommended)

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-organization/QuizGame.git

# Navigate to the project directory
cd QuizGame
```

## Step 2: Install Dependencies

```bash
# Using npm
npm install

# Using yarn
yarn install
```

## Step 3: Firebase Setup

### Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup wizard to create a new project
4. Enable the following services:
   - Firebase Authentication
   - Firestore Database
   - Firebase Storage
   - Firebase Functions (if needed)

### Configure Firebase for Local Development

1. In your Firebase project, navigate to Project Settings
2. Under "General" tab, scroll down to "Your apps" section
3. Click the web icon (</>) to register a new web app
4. Follow the instructions to register your app
5. Copy the Firebase configuration object

### Set Up Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Other Environment Variables
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Step 4: Running the Development Server

```bash
# Using npm
npm run dev

# Using yarn
yarn dev
```

The application will be available at `http://localhost:3000`.

## Step 5: Setting Up Database Seed Data (Optional)

To populate your database with sample data:

```bash
# Navigate to the utility directory
cd priv-vuhung-utils

# Install dependencies
npm install

# Run the database population script
node populate-sample-quiz.js
```

## Step 6: Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/quizgame.spec.ts

# Run tests with coverage
npm run test:coverage
```

## Environment-Specific Configurations

### Development Environment

- Uses local Firebase emulators (optional)
- Debug mode enabled
- No minification for easier debugging

### Staging Environment

To run the application in staging mode:

```bash
# Using npm
npm run build:staging
npm start

# Using yarn
yarn build:staging
yarn start
```

Environment variables for staging should be set in `.env.staging`.

### Production Environment

To build the application for production:

```bash
# Using npm
npm run build
npm start

# Using yarn
yarn build
yarn start
```

Environment variables for production should be set in `.env.production`.

## Firebase Emulator Setup (Advanced)

For completely local development without connecting to the remote Firebase services:

1. Install Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Login to Firebase:

```bash
firebase login
```

3. Initialize Firebase in your project (if not already done):

```bash
firebase init
```

4. Start the Firebase emulators:

```bash
firebase emulators:start
```

5. Update your `.env.local` file to use the emulators:

```
# Add these variables to use Firebase emulators
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST=localhost:8080
```

## Troubleshooting

### Common Issues

1. **Module not found errors**
   - Ensure all dependencies are installed: `npm install`
   - Check for typos in import paths

2. **Firebase connection issues**
   - Verify your Firebase credentials in `.env.local`
   - Check that your IP is allowed in Firebase console security rules

3. **CORS errors**
   - Update Firebase security rules to allow local development

### Getting Help

If you encounter any issues that are not addressed in this guide:

1. Check the project's GitHub Issues
2. Refer to the official documentation for [Next.js](https://nextjs.org/docs) and [Firebase](https://firebase.google.com/docs)
3. Reach out to the development team via the internal communication channels

## VS Code Setup Recommendations

We recommend the following VS Code extensions for an optimal development experience:

- ESLint
- Prettier
- Firebase
- JavaScript and TypeScript Nightly
- GitLens
- Better Comments
- Path Intellisense

VS Code workspace settings (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript", "javascriptreact"],
  "prettier.singleQuote": true,
  "prettier.semi": true,
  "javascript.updateImportsOnFileMove.enabled": "always"
}
```

## Committing Code

Before committing code, ensure:

1. All tests pass: `npm test`
2. Code follows the style guide: `npm run lint`
3. There are no build errors: `npm run build`

Follow the conventional commit format for commit messages:

```
feat: add new quiz creation feature
fix: resolve loading issue on dashboard
docs: update README with new instructions
```

## Docker Setup (Optional)

WIP 

If you prefer using Docker for development:

1. Ensure Docker and Docker Compose are installed
2. Run the application using Docker Compose:

```bash
docker-compose up
```

The Docker configuration is in `docker-compose.yml` and `Dockerfile` in the project root.
