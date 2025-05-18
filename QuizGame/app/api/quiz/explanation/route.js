// API endpoint for generating quiz explanations
import { NextResponse } from 'next/server';
import { generateQuizExplanationWithAI } from '@/app/services/geminiService';

// POST /api/quiz/explanation
export async function POST(request) {
  try {
    // Get the request body
    const body = await request.json();
    const { question, userAnswer, correctAnswer } = body;
    
    // Validate required fields
    if (!question || userAnswer === undefined || !correctAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields: question, userAnswer, or correctAnswer' },
        { status: 400 }
      );
    }

    // Generate the explanation using Gemini AI
    const explanation = await generateQuizExplanationWithAI(
      question, 
      userAnswer || 'Not answered', 
      correctAnswer
    );
    
    // Return the explanation
    return NextResponse.json({ explanation }, { status: 200 });
    
  } catch (error) {
    console.error('Error generating explanation:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to generate explanation' },
      { status: 500 }
    );
  }
}
