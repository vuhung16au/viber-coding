# Quiz Game

A modern, interactive quiz application that allows users to create, share, and take quizzes on various topics. The platform features user authentication, multilingual support, statistics tracking, and a responsive design for an optimal experience across devices.

![Quiz Game Screenshot](public/images/default-quiz.jpg)

## Live Demo

Visit the live demo: [Quiz Game Demo](https://quiz-game-demo.vercel.app)

## GitHub Repository

[https://github.com/username/quiz-game](https://github.com/username/quiz-game)

## Technology Stack

- **Frontend**: Next.js 13+ (App Router), React, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Cloud Functions)
- **State Management**: React Context API
- **Internationalization**: Custom i18n implementation
- **Styling**: Tailwind CSS with custom theming
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Firebase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/username/quiz-game.git
   cd quiz-game
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

### Local Deployment

Follow the Getting Started instructions above to run the application locally.

### Vercel Deployment

1. Push your code to a GitHub repository.
2. Connect your GitHub account to Vercel.
3. Create a new project on Vercel and select your repository.
4. Configure environment variables in the Vercel dashboard.
5. Deploy the project.

## Features

- User authentication (sign up, login, profile management)
- Quiz creation with various question types
- Multi-language support
- Real-time statistics and leaderboards
- Responsive design for all devices
- Dark/light theme toggle

## Security Considerations

To protect your Firebase keys and sensitive information:

1. **Environment Variables**: Always use environment variables for Firebase configuration. Never commit these values directly to your codebase.

2. **Firebase Security Rules**: Implement proper security rules in your Firebase console to restrict database access based on user authentication and roles.

3. **API Key Restrictions**: In the Firebase console, restrict your API keys to specific domains to prevent unauthorized use.

4. **Server-Side Authentication**: For sensitive operations, implement server-side authentication checks using Firebase Admin SDK.

5. **Regular Audits**: Regularly review your security rules and authentication mechanisms for potential vulnerabilities.

6. **Client-Side Validation**: While implementing client-side validation for better UX, always enforce validation on the server side as well.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
