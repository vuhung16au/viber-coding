import { appWithTranslation } from 'next-i18next';
import '../styles/globals.css';
import { ThemeProvider } from 'styled-components';
import { useState, useEffect } from 'react';
import { lightTheme, darkTheme } from '../themes';
import GlobalStyle from '../styles/GlobalStyle';
import { useRouter } from 'next/router';
import Script from 'next/script';
import * as gtag from '../lib/gtag';

function MyApp({ Component, pageProps }) {
  const [theme, setTheme] = useState('light');
  const router = useRouter();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gtag.GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
      <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
        <GlobalStyle />
        <Component {...pageProps} toggleTheme={toggleTheme} />
      </ThemeProvider>
    </>
  );
}

export default appWithTranslation(MyApp);