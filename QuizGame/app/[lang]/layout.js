'use client';

import React from 'react';
import { ThemeProvider } from '../components/ThemeProvider';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../firebase/auth';
import StatisticsInitializer from '../components/StatisticsInitializer';

export default function LanguageLayout({ children, params }) {
  const unwrappedParams = React.use(params);
  
  return (
    <LanguageProvider initialLocale={unwrappedParams.lang}>
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