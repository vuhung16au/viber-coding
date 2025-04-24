import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Quiz Get It Right',
  description: 'Test your knowledge with our quizzes',
};

// This root layout will be used by the middleware to redirect to language-specific routes
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
      <Script id="suppress-extensions">
        {`
          document.addEventListener('DOMContentLoaded', () => {
            const htmlElement = document.documentElement;
            // Remove browser extension attributes that cause hydration issues
            if (htmlElement.hasAttribute('katalonextensionid')) {
              htmlElement.removeAttribute('katalonextensionid');
            }
          });
        `}
      </Script>
    </html>
  );
}
