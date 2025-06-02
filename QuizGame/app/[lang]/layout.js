'use client';

import { ThemeProvider } from '../components/ThemeProvider';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../firebase/auth';
import StatisticsInitializer from '../components/StatisticsInitializer';
import dynamic from 'next/dynamic';

// Dynamically import the GoogleAnalytics component with no SSR
const GoogleAnalytics = dynamic(() => import('../components/GoogleAnalytics'), {
  ssr: false,
});

export default function LanguageLayout({ children, params }) {
  // Remove the problematic React.use() call and directly use params
  const lang = params.lang;
  
  return (
    <LanguageProvider initialLocale={lang}>
      <AuthProvider>
        <ThemeProvider>
          {/* Initialize statistics system */}
          <StatisticsInitializer />
          
          {/* Google Analytics tracking */}
          <GoogleAnalytics />
          
          <Navbar />
          <div className="min-h-screen pt-16">
            {children}
          </div>
          <Footer />
        </ThemeProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}