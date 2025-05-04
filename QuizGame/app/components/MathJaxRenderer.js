'use client';

import { useEffect, useRef } from 'react';

// This component renders math expressions using MathJax
let mathJaxScriptLoading = false;
let mathJaxScriptLoaded = false;
let mathJaxScriptPromise = null;

export default function MathJaxRenderer({ content }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!content || !containerRef.current) return;

    // Helper to load MathJax script only once
    function ensureMathJaxScript() {
      if (mathJaxScriptLoaded) return Promise.resolve();
      if (mathJaxScriptPromise) return mathJaxScriptPromise;
      mathJaxScriptLoading = true;
      mathJaxScriptPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
        script.async = true;
        script.onload = () => {
          mathJaxScriptLoaded = true;
          resolve();
        };
        // Configure MathJax before script loads
        window.MathJax = {
          tex: {
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']],
            processEscapes: true,
            packages: ['base', 'ams', 'noerrors', 'noundefined']
          },
          options: {
            enableMenu: false,
            processHtmlClass: 'math-tex',
            ignoreHtmlClass: 'tex2jax_ignore'
          },
        };
        document.head.appendChild(script);
      });
      return mathJaxScriptPromise;
    }

    // Set content and typeset with MathJax
    async function typeset() {
      containerRef.current.innerHTML = content;
      await ensureMathJaxScript();
      if (window.MathJax && window.MathJax.typesetPromise) {
        try {
          await window.MathJax.typesetPromise([containerRef.current]);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('MathJax typesetting error:', error);
        }
      }
    }

    typeset();
  }, [content]);

  return (
    <div ref={containerRef} className="math-content" />
  );
}