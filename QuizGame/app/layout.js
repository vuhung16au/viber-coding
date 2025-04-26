import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import { redirect } from 'next/navigation';
import GoogleAnalytics from './components/GoogleAnalytics';

// Configure the Inter font with display settings to avoid preload warning
const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Use 'swap' to show text while font loads
  variable: '--font-inter', // Define a CSS variable for the font
});

export const metadata = {
  title: 'Quiz Get It Right',
  description: 'Test your knowledge with our quizzes',
  icons: {
    icon: '/favicon.ico',
  },
};

// This root layout will be used by the middleware to redirect to language-specific routes
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <GoogleAnalytics />
      </head>
      <body className={inter.className}>{children}</body>
      
      {/* Fix font preloading issues by setting appropriate 'as' attribute */}
      <Script id="fix-font-preload" strategy="afterInteractive">
        {`
          document.addEventListener('DOMContentLoaded', () => {
            // Fix font preloading issues
            const preloadLinks = document.querySelectorAll('link[rel="preload"][href*=".woff2"]');
            preloadLinks.forEach(link => {
              if (!link.hasAttribute('as') || link.getAttribute('as') !== 'font') {
                link.setAttribute('as', 'font');
                link.setAttribute('type', 'font/woff2');
                link.setAttribute('crossorigin', 'anonymous');
              }
            });
            
            // Remove browser extension attributes that cause hydration issues
            const htmlElement = document.documentElement;
            if (htmlElement.hasAttribute('katalonextensionid')) {
              htmlElement.removeAttribute('katalonextensionid');
            }
          });
        `}
      </Script>
    </html>
  );
}
