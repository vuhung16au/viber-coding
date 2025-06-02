"use client";

import Script from 'next/script';
import { useEffect } from 'react';
import { logEvent } from 'firebase/analytics';
import { usePathname, useSearchParams } from 'next/navigation';

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Handle route changes with Next.js App Router
  useEffect(() => {
    const handleRouteChange = async (url) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
          page_path: url,
        });
      }
      
      // Initialize Firebase Analytics on route change
      const setupAnalytics = async () => {
        try {
          const { initializeAnalytics } = await import('../firebase/config');
          const analytics = await initializeAnalytics();
          
          if (analytics) {
            // Log page_view event with Firebase Analytics
            logEvent(analytics, 'page_view', {
              page_location: window.location.href,
              page_path: url,
              page_title: document.title,
            });
          }
        } catch (error) {
          console.error('Analytics error:', error);
        }
      };
      
      setupAnalytics();
    };

    // Get the current URL
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    // Track page view on initial load and route changes
    if (typeof window !== 'undefined') {
      handleRouteChange(url);
    }
    
    // No need for eventListener in App Router - useEffect with pathname/searchParams handles route changes
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