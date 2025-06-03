'use client';

import { generateQuiz } from '../../actions/quizActions';

// Function to generate a single question with AI
export const generateQuestionWithAI = async (prompt, images = []) => {
  try {
    if (!prompt || prompt.trim() === '') {
      return { success: false, error: 'Please enter a prompt before generating a question with AI' };
    }

    // Escape backslashes in the prompt for JSON safety (AI generation only)
    const safePrompt = prompt.replace(/\\/g, '\\\\');

    // Use the server action to generate a single question
    const result = await generateQuiz(safePrompt, 1, { images });
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    if (result.data && result.data.length > 0) {
      return {
        success: true,
        data: result.data[0]
      };
    } else {
      throw new Error('No questions were generated');
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to generate question with AI'
    };
  }
};

// Function to generate multiple questions with AI
export const generateQuestionsWithAI = async (prompt, count = 10, images = []) => {
  try {
    if (!prompt || prompt.trim() === '') {
      return { success: false, error: 'Please enter a prompt before generating with AI' };
    }

    // Escape backslashes in the prompt for JSON safety (AI generation only)
    const safePrompt = prompt.replace(/\\/g, '\\\\');

    // Use the server action to generate questions
    const result = await generateQuiz(safePrompt, count, { images });
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    // Return the generated questions
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('Error generating quiz with AI:', error);
    
    // Display a more user-friendly error message
    let errorMessage = 'An unexpected error occurred during quiz generation';
    
    if (error.message) {
      if (error.message.includes('Missing API key')) {
        errorMessage = 'Missing API key. Please configure your Gemini API key in the environment variables (GEMINI_API_KEY).';
      } else if (error.message.toLowerCase().includes('api key not valid')) {
        errorMessage = 'The Gemini API key is invalid. Please check your API key in the environment variables (GEMINI_API_KEY).';
      } else if (error.message.includes('quota')) {
        errorMessage = 'AI generation quota reached. You can still create a quiz manually, or try again later when your quota resets.';
      } else if (error.message.includes('429')) {
        errorMessage = 'AI service is currently busy. Please try again in a few minutes or create your quiz manually.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Function to generate title and description with AI
export const generateTitleDescWithAI = async (prompt, images = []) => {
  try {
    if (!prompt || prompt.trim() === '') {
      return { success: false, error: 'Please enter a prompt to generate title and description.' };
    }

    // Escape backslashes in the prompt for JSON safety
    const safePrompt = prompt.replace(/\\/g, '\\\\');
    
    // Request only 1 question, but expect title/desc in result
    const result = await generateQuiz(safePrompt, 1, { onlyTitleDesc: true, images });
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return {
      success: true,
      data: {
        title: result.data.title || '',
        description: result.data.description || ''
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to generate title/description'
    };
  }
};
