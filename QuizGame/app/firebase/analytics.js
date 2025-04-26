"use client";

import { analytics } from '../firebase/config';
import { logEvent } from 'firebase/analytics';

// Utility function to safely log analytics events
export const logAnalyticsEvent = (eventName, eventParams = {}) => {
  try {
    if (analytics) {
      logEvent(analytics, eventName, eventParams);
      console.debug(`Analytics event logged: ${eventName}`, eventParams);
    }
  } catch (error) {
    console.error(`Error logging analytics event: ${eventName}`, error);
  }
};

// Common analytics events
export const trackQuizStart = (quizId, quizTitle, quizCategory) => {
  logAnalyticsEvent('quiz_start', {
    quiz_id: quizId,
    quiz_title: quizTitle,
    quiz_category: quizCategory
  });
};

export const trackQuizComplete = (quizId, quizTitle, score, totalQuestions) => {
  logAnalyticsEvent('quiz_complete', {
    quiz_id: quizId,
    quiz_title: quizTitle,
    score: score,
    total_questions: totalQuestions,
    completion_rate: Math.round((score / totalQuestions) * 100)
  });
};

export const trackQuestionAnswer = (quizId, questionId, isCorrect) => {
  logAnalyticsEvent('question_answer', {
    quiz_id: quizId,
    question_id: questionId,
    is_correct: isCorrect
  });
};

export const trackQuizCreate = (userId, quizCategory, questionCount) => {
  logAnalyticsEvent('quiz_create', {
    user_id: userId,
    quiz_category: quizCategory,
    question_count: questionCount
  });
};

export const trackUserRegistration = (method) => {
  logAnalyticsEvent('user_registration', {
    method: method
  });
};

export const trackUserLogin = (method) => {
  logAnalyticsEvent('user_login', {
    method: method
  });
};

export const trackSearch = (searchTerm) => {
  logAnalyticsEvent('search', {
    search_term: searchTerm
  });
};

export default {
  logAnalyticsEvent,
  trackQuizStart,
  trackQuizComplete,
  trackQuestionAnswer,
  trackQuizCreate,
  trackUserRegistration,
  trackUserLogin,
  trackSearch
};