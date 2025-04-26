'use client';

import { useEffect, useRef } from 'react';

// This component renders math expressions using MathJax
export default function MathJaxRenderer({ content }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Skip if no content or no container
    if (!content || !containerRef.current) return;

    // Function to load and initialize MathJax
    const loadMathJax = async () => {
      // Check if MathJax is already loaded
      if (window.MathJax) {
        // If already loaded, just process the content
        if (window.MathJax.typesetPromise) {
          try {
            containerRef.current.innerHTML = content;
            await window.MathJax.typesetPromise([containerRef.current]);
          } catch (error) {
            console.error('MathJax typesetting error:', error);
          }
        }
        return;
      }

      // Otherwise, load MathJax
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;
      
      // Configure MathJax
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
          processEscapes: true,
          packages: ['base', 'ams', 'noerrors', 'noundefined']
        },
        options: {
          enableMenu: false, // Disable the MathJax menu
          processHtmlClass: 'math-tex', // Process elements with this class
          ignoreHtmlClass: 'tex2jax_ignore' // Ignore elements with this class
        },
        startup: {
          ready: () => {
            window.MathJax.startup.defaultReady();
            if (containerRef.current) {
              containerRef.current.innerHTML = content;
              window.MathJax.typesetPromise([containerRef.current]).catch(err => {
                console.error('MathJax typeset error:', err);
              });
            }
          }
        }
      };

      // Add the script to the document
      document.head.appendChild(script);
    };

    loadMathJax();

    // Cleanup function
    return () => {
      // No cleanup needed as MathJax should stay loaded
    };
  }, [content]);

  return (
    <div ref={containerRef} className="math-content" dangerouslySetInnerHTML={{ __html: content }} />
  );
}