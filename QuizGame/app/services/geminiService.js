// Gemini AI service for quiz generation
import { GoogleGenerativeAI } from "@google/generative-ai";

// Get the API key from environment variables - only used server-side
const API_KEY = process.env.GEMINI_API_KEY;

// Validate the API key exists
if (!API_KEY) {
  console.error("Missing GEMINI_API_KEY environment variable");
}

// Initialize the Gemini API with the API key from environment variables
const genAI = new GoogleGenerativeAI(API_KEY || "dummy-key");

// Define model options with fallbacks in priority order
const MODEL_OPTIONS = {
  PRIMARY: "gemini-2.5-flash-lite", // 1st priority: cost-efficient current model
  SECONDARY: "gemini-2.5-flash", // 2nd priority: current general-purpose flash model
  FALLBACK: "gemini-2.0-flash-lite" // 3rd priority: older stable fallback
};

const shouldTryNextModel = (error) => {
  const message = error?.message?.toLowerCase() || "";
  return (
    message.includes("quota") ||
    message.includes("429") ||
    message.includes("404") ||
    message.includes("not found") ||
    message.includes("is not found") ||
    message.includes("unsupported")
  );
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
 * Generates quiz questions using Gemini API based on a description and optional images
 * @param {string} description - The description of the quiz to generate
 * @param {number} numQuestions - The number of questions to generate (default: 10)
 * @param {Array} images - Optional array of image data for multimodal generation
 * @returns {Promise<Array>} - Array of quiz questions with options and correct answers
 */
export const generateQuizWithAI = async (description, numQuestions = 10, images = []) => {
  // Limit the number of questions to a reasonable amount
  const safeNumQuestions = Math.min(numQuestions, 15);
  
  // Create the prompt for the API
  const promptText = `Create a quiz about "${description}" with ${safeNumQuestions} multiple-choice questions.
    Format each question as a JSON object with the following structure:
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The correct option text"
    }
    
    Return the response as a valid JSON array of these question objects. Do not include any explanations or additional text outside the JSON array.`;

  // Check if we have images - this will change how we handle models and content generation
  const hasImages = Array.isArray(images) && images.length > 0;
  
  // Set model options based on whether we have images or not
  // If we have images, use only multimodal-capable models (skip text-only models)
  const modelOptions = hasImages 
    ? [MODEL_OPTIONS.PRIMARY, MODEL_OPTIONS.SECONDARY] // Only use models that support images
    : [MODEL_OPTIONS.PRIMARY, MODEL_OPTIONS.SECONDARY, MODEL_OPTIONS.FALLBACK]; // Use all models in order
  
  let lastError = null;
  
  for (const modelName of modelOptions) {
    try {
      console.log(`Attempting to generate quiz using model: ${modelName}`);
      
      // Get the generative model
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // Different handling based on whether we have images
      let result;
      
      if (hasImages) {
        // Create a multimodal prompt with images and text
        const prompt = {
          contents: [
            {
              role: "user",
              parts: [
                { text: promptText },
                ...images.map(img => ({ inlineData: { data: img.data, mimeType: img.mimeType } }))
              ]
            }
          ]
        };
        
        // Generate content from the model with images
        result = await model.generateContent(prompt);
      } else {
        // Generate content from the model with text only
        result = await model.generateContent(promptText);
      }
      
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
      
      if (!shouldTryNextModel(error)) {
        break;
      }
    }
  }
  
  // If we get here, all attempts failed
  throw new Error(formatErrorMessage(lastError));
};

/**
 * Generates a quiz title and description using Gemini AI based on a prompt and optional images
 * @param {string} prompt - The prompt or description for the quiz
 * @param {Array} images - Optional array of image data for multimodal generation
 * @returns {Promise<{title: string, description: string}>}
 */
export const generateQuizTitleAndDescriptionWithAI = async (prompt, images = []) => {
  // Check if we have images - this will change how we handle models and content generation
  const hasImages = Array.isArray(images) && images.length > 0;
  
  // Set model options based on whether we have images or not
  const modelOptions = hasImages
    ? [MODEL_OPTIONS.PRIMARY, MODEL_OPTIONS.SECONDARY] // Only use models that support images
    : [MODEL_OPTIONS.PRIMARY, MODEL_OPTIONS.SECONDARY, MODEL_OPTIONS.FALLBACK]; // Use all models in order
    
  let lastError = null;
  
  // Gemini prompt for title/desc
  const promptText = `Given the following quiz prompt${hasImages ? " and image(s)" : ""}, generate a quiz title (max 20 words) and a quiz description (max 100 words). Respond in strict JSON format as follows:\n{\n  \"title\": \"...\",\n  \"description\": \"...\"\n}\nPrompt: ${prompt}`;
  
  for (const modelName of modelOptions) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      let result;
      
      if (hasImages) {
        // Create a multimodal prompt with images and text
        const multimodalPrompt = {
          contents: [
            {
              role: "user",
              parts: [
                { text: promptText },
                ...images.map(img => ({ inlineData: { data: img.data, mimeType: img.mimeType } }))
              ]
            }
          ]
        };
        
        // Generate content from the model with images
        result = await model.generateContent(multimodalPrompt);
      } else {
        // Generate content from the model with text only
        result = await model.generateContent(promptText);
      }
      
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
      if (!shouldTryNextModel(error)) break;
    }
  }
  throw new Error(formatErrorMessage(lastError));
};

/**
 * Generates an explanation for a quiz question using Gemini AI
 * @param {string} question - The question text
 * @param {string} userAnswer - The user's answer
 * @param {string} correctAnswer - The correct answer
 * @returns {Promise<string>} - The explanation text in markdown format
 */
export const generateQuizExplanationWithAI = async (question, userAnswer, correctAnswer) => {
  const modelOptions = [
    MODEL_OPTIONS.PRIMARY,
    MODEL_OPTIONS.SECONDARY,
    MODEL_OPTIONS.FALLBACK
  ];
  
  const prompt = `You are a helpful math tutor for elementary/primary school students. 
Explain clearly why the correct answer is correct for the following quiz question. 
If the user's answer is incorrect, briefly mention why it is incorrect.

Your explanation should use simple language and clear mathematical reasoning.
Use markdown formatting for better readability, including:
- Use ** for bold text when emphasizing important points
- Use mathematical notation with proper LaTeX syntax wrapped in $ symbols (e.g., $\\frac{1}{2}$ for inline math or $$\\frac{1}{2}$$ for display math)
- For LaTeX commands, use single backslash, not double (use $\\frac{1}{2}$ not $\\\\frac{1}{2}$, use $\\times$ not $\\\\times$)
- Break down the steps of calculations clearly
- Use paragraph breaks (double line breaks) to separate different parts of your explanation

Important:
- Your response should be in Markdown format.
- Your response should be compatible with MathJax.
- Use simple language and clear mathematical reasoning.

Here is the quiz question and answers:
Question: ${question}
User's answer: ${userAnswer}
Correct answer: ${correctAnswer}

Explanation:`;
  
  let lastError = null;
  
  for (const modelName of modelOptions) {
    try {
      console.log(`Attempting to generate explanation using model: ${modelName}`);
      
      // Get the generative model
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // Generate content from the model
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const explanation = response.text();
      
      console.log(`Successfully generated explanation using ${modelName}`);
      return explanation;
      
    } catch (error) {
      console.error(`Error generating explanation with model ${modelName}:`, error);
      lastError = error;
      
      if (!shouldTryNextModel(error)) {
        break;
      }
    }
  }
  
  // If we get here, all attempts failed
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
