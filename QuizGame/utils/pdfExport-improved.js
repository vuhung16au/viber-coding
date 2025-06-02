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

/**
 * Exports quiz results to PDF format
 * @param {Object} quiz - The quiz object containing title and description
 * @param {Array} questions - Array of questions with their details
 * @param {number} score - User's score
 * @param {number} totalQuestions - Total number of questions
 * @param {Array} userAnswers - Array of user's answers
 * @param {Object} explanations - Object containing explanations for questions
 * @returns {Promise<void>} - A promise that resolves when the PDF is generated and downloaded
 */
export async function exportQuizResultsToPDF({ quiz, questions, score, totalQuestions, userAnswers, explanations = {} }) {
  // Create a temporary div to render the quiz results content
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
  
  // Calculate percentage
  const percentage = Math.round((score / totalQuestions) * 100);
  
  // Determine message based on percentage
  let message = '';
  let messageColor = '';
  
  if (percentage >= 90) {
    message = 'Excellent! You\'re a genius!';
    messageColor = '#22c55e'; // green-600
  } else if (percentage >= 70) {
    message = 'Great job! Well done!';
    messageColor = '#22c55e'; // green-600
  } else if (percentage >= 50) {
    message = 'Good effort! Keep learning!';
    messageColor = '#ca8a04'; // yellow-600
  } else {
    message = 'Keep practicing! You\'ll get better!';
    messageColor = '#dc2626'; // red-600
  }
  
  // Build the quiz results content
  let htmlContent = `
    <div style="text-align: center; margin-bottom: 20px; color: #000000;">
      <h1 style="font-size: 24px; margin-bottom: 10px; color: #000000;">${quiz.title || 'Untitled Quiz'}</h1>
      ${quiz.description ? `<p style="font-size: 14px; color: #000000;">${quiz.description}</p>` : ''}
    </div>
    
    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="font-size: 22px; margin-bottom: 15px; color: #000000;">Quiz Results</h2>
      <div style="font-size: 32px; font-weight: bold; margin-bottom: 10px; color: #000000;">${score} / ${totalQuestions}</div>
      <div style="font-size: 24px; margin-bottom: 10px; color: #000000;">${percentage}%</div>
      <div style="font-size: 18px; font-weight: 500; color: ${messageColor};">${message}</div>
    </div>
  `;
  
  // Add question review section
  htmlContent += `<div style="margin-top: 30px; color: #000000;">
    <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #000000;">Question Review</h3>
  `;
  
  // Add each question with user answer and correct answer
  questions.forEach((question, index) => {
    const questionText = question.question || question.text || '';
    const userAnswerId = userAnswers[index];
    
    // For finding user's selected answer and correct answer
    const answers = question.answers || [];
    const userAnswer = answers.find(a => a.id === userAnswerId);
    const correctAnswer = answers.find(a => a.id === question.correctAnswer);
    
    const userAnswerText = userAnswer ? (userAnswer.text || userAnswer.answer) : 'Not answered';
    const correctAnswerText = correctAnswer ? (correctAnswer.text || correctAnswer.answer) : 'N/A';
    
    const isCorrect = userAnswerId === question.correctAnswer;
    
    // Background color based on correctness
    const bgColor = isCorrect ? '#f0fdf4' : '#fef2f2'; // green-50 or red-50
    const borderColor = isCorrect ? '#86efac' : '#fecaca'; // green-300 or red-300
    
    htmlContent += `
      <div style="padding: 15px; margin-bottom: 20px; border: 1px solid ${borderColor}; border-radius: 8px; background-color: ${bgColor};">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <div style="display: flex;">
            <span style="font-weight: 500; margin-right: 8px; color: #000000;">${index + 1}.</span>
            <span style="color: #000000;">${questionText}</span>
          </div>
          <div>
            ${isCorrect 
              ? '<span style="color: #16a34a; font-size: 18px;">✓</span>' 
              : '<span style="color: #dc2626; font-size: 18px;">✗</span>'}
          </div>
        </div>
        
        <div style="margin-left: 20px;">
          <div style="margin-bottom: 5px; color: ${isCorrect ? '#15803d' : '#000000'};">
            <span style="font-weight: 500; color: #000000;">Your answer: </span>${userAnswerText}
          </div>
          
          ${!isCorrect ? `
            <div style="color: #15803d;">
              <span style="font-weight: 500; color: #000000;">Correct answer: </span>${correctAnswerText}
            </div>
          ` : ''}
        </div>
        
        ${explanations[index] ? `
          <div style="margin-top: 10px; padding: 10px; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;">
            <div style="font-weight: 500; color: #1e40af; margin-bottom: 5px;">Explanation:</div>
            <div style="color: #000000;">${explanations[index]}</div>
          </div>
        ` : ''}
      </div>
    `;
  });
  
  htmlContent += '</div>';
  
  // Set the container's HTML content
  container.innerHTML = htmlContent;
  document.body.appendChild(container);
  
  // Initialize MathJax rendering
  if (window.MathJax) {
    try {
      // Ensure MathJax is fully loaded and configured
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
      
      // Configure MathJax for better SVG rendering
      window.MathJax.config = window.MathJax.config || {};
      window.MathJax.config.svg = window.MathJax.config.svg || {};
      window.MathJax.config.svg.fontCache = 'global';
      window.MathJax.config.tex = window.MathJax.config.tex || {};
      window.MathJax.config.tex.inlineMath = [['$', '$'], ['\\(', '\\)']];
      window.MathJax.config.tex.displayMath = [['$$', '$$'], ['\\[', '\\]']];
      
      // Add specific CSS to improve math formula rendering
      const style = document.createElement('style');
      style.textContent = `
        .MathJax { font-size: 115% !important; }
        mjx-container { display: inline-block !important; }
      `;
      container.appendChild(style);
      
      // Force MathJax to process the content
      await window.MathJax.typesetPromise([container]);
      
      // Give MathJax some time to fully render the elements
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error('Error rendering math expressions:', error);
    }
  } else {
    // If MathJax is not loaded, load it dynamically with SVG output
    await new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
      script.async = true;
      
      // Configure MathJax
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
          processEscapes: true,
          packages: ['base', 'ams', 'noerrors', 'noundefined']
        },
        svg: {
          fontCache: 'global',
          scale: 1.2 // Scale up the size of formulas
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
    
    // Give MathJax some time to fully render the elements
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  
  try {
    // Generate PDF with better quality settings
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
      compress: true,
      precision: 16, // Higher precision for better rendering
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
        scale: 2, // Higher scale for better quality and sharper text
        y: offsetY,
        height: Math.min(800, container.scrollHeight - offsetY),
        windowWidth: 595, // A4 width
        logging: false,
        useCORS: true,
        allowTaint: false,
        imageTimeout: 15000,
        letterRendering: true,
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
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
    const fileName = `${quiz.title ? quiz.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'quiz'}_results.pdf`;
    
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
