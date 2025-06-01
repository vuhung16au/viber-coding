export const GA_MEASUREMENT_ID = 'G-9E5QLTJ5X6';

export const pageview = (url) => {
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};
