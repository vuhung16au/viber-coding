'use client';

import { ThemeProvider } from '../components/ThemeProvider';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../firebase/auth';
import StatisticsInitializer from '../components/StatisticsInitializer';

export default function LanguageLayout({ children, params }) {
  // Remove the problematic React.use() call and directly use params
  const lang = params.lang;
  
  return (
    <LanguageProvider initialLocale={lang}>
      <AuthProvider>
        <ThemeProvider>
          {/* Initialize statistics system */}
          <StatisticsInitializer />
          
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