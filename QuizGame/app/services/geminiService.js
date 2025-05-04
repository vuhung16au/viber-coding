// Gemini AI service for quiz generation
import { GoogleGenerativeAI } from "@google/generative-ai";

// Get the API key from environment variables
const API_KEY = process.env.GEMINI_API_KEY;

// Validate the API key exists
if (!API_KEY) {
  console.error("Missing GEMINI_API_KEY environment variable");
}

// Initialize the Gemini API with the API key from environment variables
const genAI = new GoogleGenerativeAI(API_KEY || "dummy-key");

// Define model options with fallbacks in priority order
const MODEL_OPTIONS = {
  PRIMARY: "gemini-2.0-flash-lite", // 1st priority: Gemini 2.0 Flash-Lite
  SECONDARY: "gemini-1.5-flash-8b", // 2nd priority: Gemini 1.5 Flash-8B
  FALLBACK: "gemini-1.0-pro"        // 3rd priority: Original fallback option
};

/**
 * Formats an error message from Gemini API for better user feedback
 */
const formatErrorMessage = (error) => {
  // Check if the API key is missing or invalid
  if (!API_KEY) {
    return "API key is not configured. Please add your Gemini API key to the environment variables.";
  }
  
  // Check for API key validation errors
  if (error.message && error.message.toLowerCase().includes("api key not valid")) {
    return "The Gemini API key is invalid. Please check your API key configuration.";
  }
  
  // Check for quota limits
  if (error.message && error.message.includes("quota")) {
    return "You've reached the AI generation quota limit. Please try again later or use manual quiz creation.";
  }
  
  // Generic error handling
  return error.message || "An unexpected error occurred during quiz generation";
};

/**
 * Generates quiz questions using Gemini API based on a description
 * @param {string} description - The description of the quiz to generate
 * @param {number} numQuestions - The number of questions to generate (default: 10)
 * @returns {Promise<Array>} - Array of quiz questions with options and correct answers
 */
export const generateQuizWithAI = async (description, numQuestions = 10) => {
  // Limit the number of questions to a reasonable amount
  const safeNumQuestions = Math.min(numQuestions, 15);
  
  // Create the prompt for the API
  const prompt = `Create a quiz about "${description}" with ${safeNumQuestions} multiple-choice questions.
    Format each question as a JSON object with the following structure:
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The correct option text"
    }
    
    Return the response as a valid JSON array of these question objects. Do not include any explanations or additional text outside the JSON array.`;

  // Try models in priority order
  const modelOptions = [
    MODEL_OPTIONS.PRIMARY,     // Try Gemini 2.0 Flash-Lite first
    MODEL_OPTIONS.SECONDARY,   // Then try Gemini 1.5 Flash-8B
    MODEL_OPTIONS.FALLBACK     // Finally fall back to Gemini 1.0 Pro
  ];
  
  let lastError = null;
  
  for (const modelName of modelOptions) {
    try {
      console.log(`Attempting to generate quiz using model: ${modelName}`);
      
      // Get the generative model
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // Generate content from the model
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract the JSON array from the response
      const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
      if (!jsonMatch) {
        throw new Error("Could not extract valid JSON from the response");
      }
      
      const jsonString = jsonMatch[0];
      const questions = JSON.parse(jsonString);
      
      console.log(`Successfully generated ${questions.length} questions using ${modelName}`);
      return questions;
      
    } catch (error) {
      console.error(`Error generating quiz with model ${modelName}:`, error);
      lastError = error;
      
      // If this is not a quota error, or if we're on the last model option, don't try again
      if (!error.message?.includes("quota") && !error.message?.includes("429")) {
        break;
      }
    }
  }
  
  // If we get here, all attempts failed
  throw new Error(formatErrorMessage(lastError));
};

/**
 * Generates a quiz title and description using Gemini AI based on a prompt
 * @param {string} prompt - The prompt or description for the quiz
 * @returns {Promise<{title: string, description: string}>}
 */
export const generateQuizTitleAndDescriptionWithAI = async (prompt) => {
  const modelOptions = [
    MODEL_OPTIONS.PRIMARY,
    MODEL_OPTIONS.SECONDARY,
    MODEL_OPTIONS.FALLBACK
  ];
  let lastError = null;
  // Gemini prompt for title/desc
  const aiPrompt = `Given the following quiz prompt, generate a quiz title (max 20 words) and a quiz description (max 100 words). Respond in strict JSON format as follows:\n{\n  \"title\": \"...\",\n  \"description\": \"...\"\n}\nPrompt: ${prompt}`;
  for (const modelName of modelOptions) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(aiPrompt);
      const response = await result.response;
      const text = response.text();
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not extract valid JSON for title/description");
      const obj = JSON.parse(jsonMatch[0]);
      if (!obj.title || !obj.description) throw new Error("Missing title or description in AI response");
      return { title: obj.title.trim(), description: obj.description.trim() };
    } catch (error) {
      console.error(`Error generating title/desc with model ${modelName}:`, error);
      lastError = error;
      if (!error.message?.includes("quota") && !error.message?.includes("429")) break;
    }
  }
  throw new Error(formatErrorMessage(lastError));
};

/**
 * Simple function to check if the API is responsive
 * Can be used to test API connectivity before attempting generation
 */
export const testGeminiAPIConnection = async () => {
  try {
    // Use the primary model for the test connection
    const model = genAI.getGenerativeModel({ model: MODEL_OPTIONS.PRIMARY });
    const result = await model.generateContent("Hello, are you online?");
    return { success: true, message: "API is responsive" };
  } catch (error) {
    console.error("API test connection failed:", error);
    return { success: false, message: formatErrorMessage(error) };
  }
};