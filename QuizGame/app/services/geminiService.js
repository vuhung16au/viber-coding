// Gemini AI service for quiz generation
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

/**
 * Generates quiz questions using Gemini API based on a description
 * @param {string} description - The description of the quiz to generate
 * @param {number} numQuestions - The number of questions to generate (default: 10)
 * @returns {Promise<Array>} - Array of quiz questions with options and correct answers
 */
export const generateQuizWithAI = async (description, numQuestions = 10) => {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Create the prompt for the API
    const prompt = `Create a quiz about "${description}" with ${numQuestions} multiple-choice questions.
      Format each question as a JSON object with the following structure:
      {
        "question": "Question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "The correct option text"
      }
      
      Return the response as a valid JSON array of these question objects. Do not include any explanations or additional text outside the JSON array.`;

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
    
    return questions;
  } catch (error) {
    console.error("Error generating quiz with AI:", error);
    throw error;
  }
};