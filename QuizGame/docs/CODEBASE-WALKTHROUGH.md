# Codebase Walkthrough

This document provides a comprehensive walkthrough of the QuizGame codebase, explaining the directory structure, key files, and code organization to help developers navigate and understand the project.

## Directory Structure Overview

The QuizGame application follows a Next.js project structure with some custom organization:

```
QuizGame/
├── app/               # Next.js App Router structure
├── docs/              # Project documentation
├── firebase/          # Firebase configuration and utilities
├── priv-vuhung-utils/ # Private utility scripts
├── public/            # Static assets
├── tests/             # Test files
├── translations/      # Internationalization files
└── utils/             # Utility functions
```

## Key Files and Directories

### Root Directory Files

| File | Description |
|------|-------------|
| `next.config.js` | Next.js configuration file |
| `package.json` | Project dependencies and scripts |
| `middleware.js` | Next.js middleware for auth and routing |
| `tailwind.config.js` | Tailwind CSS configuration |
| `jest.config.js` | Jest testing configuration |
| `playwright.config.ts` | Playwright E2E testing configuration |

### App Directory (Next.js 13+ App Router)

```
app/
├── layout.js              # Root layout with common UI elements
├── page.js                # Home page component
├── [lang]/                # Dynamic language route
│   ├── layout.js          # Layout for localized routes
│   └── page.js            # Localized home page
├── components/            # Reusable UI components
├── context/               # React context providers
├── firebase/              # Firebase client utilities
├── hooks/                 # Custom React hooks
├── lib/                   # Library code and utilities
└── api/                   # API route handlers
```

## Core Application Flow

### Request Lifecycle

1. User requests a page
2. `middleware.js` checks authentication status if needed
3. Next.js server components render the page
4. Client-side hydration completes the rendering

### Authentication Flow

Authentication is handled through Firebase and integrated with Next.js:

1. `app/context/AuthContext.js` provides auth state to the application
2. `firebase/auth.js` contains Firebase authentication methods
3. `middleware.js` protects routes based on authentication status

## Important Code Modules

### Quiz Management

Quiz creation, editing, and taking are core features:

```javascript
// app/create-quiz/page.js - Quiz creation page
export default function CreateQuizPage() {
  // Quiz creation UI and logic
}

// app/quiz/[id]/page.js - Quiz taking page
export default function QuizPage({ params }) {
  // Quiz display and submission logic
  const { id } = params;
  // ...
}
```

### User Management

User profiles, settings, and authentication:

```javascript
// app/profile/[id]/page.js - User profile page
export default function ProfilePage({ params }) {
  // Profile display and management
  const { id } = params;
  // ...
}
```

### Firebase Integration

The application uses Firebase for authentication, database, and storage:

```javascript
// firebase/config.js - Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Configuration values
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

## Key Components

### UI Components

Located in `app/components/`, these provide the user interface:

| Component | Purpose |
|-----------|---------|
| `QuizCard.js` | Displays quiz information in a card format |
| `QuizForm.js` | Form for creating and editing quizzes |
| `QuestionEditor.js` | Editor for quiz questions |
| `UserProfile.js` | User profile display component |
| `Navigation.js` | Site navigation menu |

### Hooks

Custom React hooks in `app/hooks/` handle common functionality:

| Hook | Purpose |
|------|---------|
| `useAuth.js` | Authentication state and methods |
| `useQuiz.js` | Quiz data fetching and manipulation |
| `useCategory.js` | Category data management |
| `useTranslation.js` | Internationalization functions |

## Internationalization (i18n)

The app supports multiple languages through a custom i18n system:

```
translations/
├── index.js      # Translation loader
├── en.json       # English translations
├── es.json       # Spanish translations
└── fr.json       # French translations
```

Language switching is handled through the dynamic `[lang]` route parameter.

## State Management

The application uses a combination of:
- React Context for global state
- React Query for server state management
- Local state for component-specific data

## API Structure

API endpoints follow a RESTful pattern using Next.js API routes:

```
app/api/
├── auth/             # Authentication endpoints
├── quiz/             # Quiz management endpoints
├── user/             # User management endpoints
└── category/         # Category management endpoints
```

## Testing Strategy

Tests are organized by type:

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
└── e2e/            # End-to-end tests
```

The project uses:
- Jest for unit and integration testing
- Playwright for end-to-end testing

## Firebase Utilities

Custom Firebase utilities simplify database operations:

```javascript
// firebase/functions.js
export async function getQuizById(quizId) {
  const quizRef = doc(db, 'quizzes', quizId);
  const quizSnap = await getDoc(quizRef);
  
  if (quizSnap.exists()) {
    return { id: quizSnap.id, ...quizSnap.data() };
  } else {
    return null;
  }
}
```

## Performance Optimizations

### Code Splitting

Automatic code splitting with Next.js, enhanced by:
- Dynamic imports for large components
- Module-level code splitting

### Data Fetching

The app uses different data fetching strategies:
- Server components for initial data loading
- React Query for client-side data fetching
- SWR for real-time data updates

## Common Patterns

### Error Handling

Consistent error handling approach:

```javascript
try {
  // Attempt operation
  await createQuiz(quizData);
} catch (error) {
  // Log error
  console.error('Failed to create quiz:', error);
  
  // Format user-facing error message
  const message = formatErrorMessage(error);
  
  // Display error to user
  toast.error(message);
}
```

### Form Management

Forms use React Hook Form for validation and submission:

```javascript
import { useForm } from 'react-hook-form';

export default function QuizForm() {
  const { register, handleSubmit, errors } = useForm();
  
  const onSubmit = (data) => {
    // Process form data
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

## Deployment Pipeline

Continuous integration and deployment:
1. GitHub Actions run tests on pull requests
2. Successful merges to main trigger deployment
3. Vercel deploys the application automatically

## Development Workflow

1. Local development with `npm run dev`
2. Firebase emulators with `npm run emulators`
3. Testing with `npm test` or `npm run test:e2e`

## Security Considerations

1. Firebase security rules protect database data
2. Auth middleware secures protected routes
3. Form validation prevents malicious input
4. API rate limiting prevents abuse

## Common Tasks

### Adding a New Page

1. Create a new file in the appropriate app directory
2. Implement the page component
3. Add any required API endpoints
4. Update navigation if needed

### Creating a New Component

1. Add a new file in `app/components/`
2. Implement the component with proper TypeScript types
3. Add any necessary styles
4. Create unit tests in the `tests` directory

### Adding a New API Endpoint

1. Create a file in the appropriate `app/api/` directory
2. Implement the route handler with proper validation
3. Add appropriate error handling
4. Document the endpoint in the API documentation

## Troubleshooting Common Issues

### Firebase Authentication Issues

Check:
- Firebase configuration in `firebase/config.js`
- Auth initialization in `app/context/AuthContext.js`
- Firebase console settings for authentication methods

### Data Fetching Problems

Check:
- Firestore security rules
- Query construction in Firebase utilities
- React Query configuration

### Styling Issues

Check:
- Tailwind configuration
- Component-specific styles
- Responsive design breakpoints

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
