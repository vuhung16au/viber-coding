'use server';

import { generateQuizWithAI, generateQuizTitleAndDescriptionWithAI } from '@/app/services/geminiService';

export async function generateQuiz(description, numQuestions = 10, options = {}) {
  try {
    // Get image data from options if available
    const images = options.images || [];
    
    if (options.onlyTitleDesc) {
      // Only generate title and description
      const aiResult = await generateQuizTitleAndDescriptionWithAI(description, images);
      return { success: true, data: { title: aiResult.title, description: aiResult.description } };
    }
    // This runs on the server side where process.env.GEMINI_API_KEY is available
    const questions = await generateQuizWithAI(description, numQuestions, images);
    return { success: true, data: questions };
  } catch (error) {
    console.error('Error generating quiz:', error);
    return { 
      success: false, 
      error: error.message || 'An error occurred while generating the quiz'
    };
  }
}