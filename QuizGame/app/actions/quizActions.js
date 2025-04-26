'use server';

import { generateQuizWithAI } from '@/app/services/geminiService';

export async function generateQuiz(description, numQuestions = 10) {
  try {
    // This runs on the server side where process.env.GEMINI_API_KEY is available
    const questions = await generateQuizWithAI(description, numQuestions);
    return { success: true, data: questions };
  } catch (error) {
    console.error('Error generating quiz:', error);
    return { 
      success: false, 
      error: error.message || 'An error occurred while generating the quiz'
    };
  }
}