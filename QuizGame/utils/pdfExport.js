'use client';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exports a quiz to PDF format
 * @param {Object} quiz - The quiz object containing title, description, and questions
 * @returns {Promise<void>} - A promise that resolves when the PDF is generated and downloaded
 */
export async function exportQuizToPDF(quiz) {
  // Create a temporary div to render the quiz content
  const container = document.createElement('div');
  container.className = 'pdf-export-container';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.padding = '20px';
  container.style.width = '595px'; // A4 width in pixels at 72 dpi
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.color = '#000000'; // Set text color to black
  container.style.backgroundColor = '#ffffff'; // Ensure background is white
  
  // Build the quiz content
  let htmlContent = `
    <div style="text-align: center; margin-bottom: 20px; color: #000000;">
      <h1 style="font-size: 24px; margin-bottom: 10px; color: #000000;">${quiz.title || 'Untitled Quiz'}</h1>
      ${quiz.description ? `<p style="font-size: 14px; color: #000000;">${quiz.description}</p>` : ''}
    </div>
  `;
  
  // Add questions
  htmlContent += '<div style="margin-top: 20px; color: #000000;">';
  quiz.questions.forEach((question, qIndex) => {
    const questionText = question.question || question.text || '';
    
    // Question header
    htmlContent += `
      <div style="margin-bottom: 20px; page-break-inside: avoid;">
        <div style="margin-bottom: 10px;">
          <div style="font-weight: bold; margin-right: 8px; font-size: 16px; display: inline; color: #000000;">Question ${qIndex + 1}:</div>
          <span style="font-size: 16px; color: #000000;">${questionText}</span>
          ${question.points !== undefined ? `<span style="margin-left: 10px; font-size: 12px; padding: 2px 6px; background-color: #e6f0fd; border-radius: 10px; color: #000000;">${question.points} point${question.points !== 1 ? 's' : ''}</span>` : ''}
        </div>
    `;
    
    // Question answers
    htmlContent += '<div style="margin-left: 20px; color: #000000;">';
    
    // Handle the options array in the QuizCreationForm structure
    if (question.options && question.options.length > 0) {
      question.options.forEach((option, aIndex) => {
        const isCorrect = question.correctAnswer === option;
        htmlContent += `
          <div style="margin-bottom: 8px; display: flex;">
            <span style="margin-right: 8px; font-weight: bold; color: #000000;">${String.fromCharCode(65 + aIndex)}.</span>
            <span style="${isCorrect ? 'font-weight: bold; color: #1e7e34;' : 'color: #000000;'}">${option}</span>
            ${isCorrect ? '<span style="margin-left: 5px; color: #1e7e34;">✓</span>' : ''}
          </div>
        `;
      });
    }
    htmlContent += '</div></div>';
  });
  htmlContent += '</div>';
  
  // Set the container's HTML content
  container.innerHTML = htmlContent;
  document.body.appendChild(container);
  
  // Initialize MathJax rendering
  if (window.MathJax) {
    try {
      // Configure MathJax if needed
      if (!window.MathJax.typesetPromise) {
        // Wait for MathJax to be fully loaded
        await new Promise(resolve => {
          const checkMathJax = () => {
            if (window.MathJax.typesetPromise) {
              resolve();
            } else {
              setTimeout(checkMathJax, 100);
            }
          };
          checkMathJax();
        });
      }
      // Force MathJax to process the content
      await window.MathJax.typesetPromise([container]);
    } catch (error) {
      console.error('Error rendering math expressions:', error);
    }
  } else {
    // If MathJax is not loaded, load it dynamically
    await new Promise((resolve) => {
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
          enableMenu: false,
          processHtmlClass: 'math-tex',
          ignoreHtmlClass: 'tex2jax_ignore'
        },
        startup: {
          pageReady: () => {
            resolve();
          }
        }
      };
      
      document.head.appendChild(script);
    });
    
    // Now typeset the content
    await window.MathJax.typesetPromise([container]);
  }
  
  try {
    // Generate PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });
    
    // Set default text color to black
    pdf.setTextColor(0, 0, 0);
    
    let currentPage = 1;
    const totalPages = Math.ceil(container.scrollHeight / 800); // Estimate page count
    
    // Generate page by page to handle long content
    for (let offsetY = 0; offsetY < container.scrollHeight; offsetY += 800) {
      if (currentPage > 1) {
        pdf.addPage();
      }
      
      const canvas = await html2canvas(container, {
        scale: 1.5, // Higher scale for better quality
        y: offsetY,
        height: Math.min(800, container.scrollHeight - offsetY),
        windowWidth: 595, // A4 width
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 595, 0, undefined, 'FAST');
      
      currentPage++;
    }
    
    // Add footer with page numbers
    const totalPagesNum = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPagesNum; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Page ${i} of ${totalPagesNum}`, pdf.internal.pageSize.getWidth() - 100, pdf.internal.pageSize.getHeight() - 30);
    }
    
    // Generate file name
    const fileName = `${quiz.title ? quiz.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'quiz'}_export.pdf`;
    
    // Add a timestamp to the PDF
    const now = new Date();
    const timestamp = `Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(timestamp, 20, pdf.internal.pageSize.getHeight() - 10);
    
    // Save the PDF
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  } finally {
    // Clean up the temporary container
    document.body.removeChild(container);
  }
}
