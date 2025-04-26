"use client";

import Script from 'next/script';
import { useEffect } from 'react';
import { initializeAnalytics } from '../firebase/config';
import { logEvent } from 'firebase/analytics';

export default function GoogleAnalytics() {
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
          page_path: url,
        });
      }
      
      // Initialize Firebase Analytics on route change
      const setupAnalytics = async () => {
        const { analytics } = await import('../firebase/config');
        if (analytics) {
          // Log page_view event with Firebase Analytics
          logEvent(analytics, 'page_view', {
            page_location: window.location.href,
            page_path: url,
            page_title: document.title,
          });
        }
      };
      
      setupAnalytics().catch(console.error);
    };

    // Track initial page load
    if (typeof window !== 'undefined') {
      handleRouteChange(window.location.pathname);
      
      // Initialize Firebase Analytics on component mount
      initializeAnalytics().catch(console.error);
    }

    // Set up listening for route changes
    document.addEventListener('routeChangeComplete', handleRouteChange);
    
    return () => {
      document.removeEventListener('routeChangeComplete', handleRouteChange);
    };
  }, []);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
      >
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}