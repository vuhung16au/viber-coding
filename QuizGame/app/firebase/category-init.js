'use client';

import { db } from './config';
import { ref, get, set, push, update, serverTimestamp } from 'firebase/database';
import { getAllCategories, createCategory } from './database';

/**
 * Default categories to initialize the system with
 */
const DEFAULT_CATEGORIES = [
  {
    name: 'General Knowledge',
    slug: 'general-knowledge',
    description: 'Test your knowledge across a variety of topics',
    isActive: true,
    displayOrder: 1
  },
  {
    name: 'Science & Technology',
    slug: 'science-technology',
    description: 'Explore scientific principles and technological innovations',
    isActive: true,
    displayOrder: 2
  },
  {
    name: 'History',
    slug: 'history',
    description: 'Journey through key historical events and civilizations',
    isActive: true,
    displayOrder: 3
  },
  {
    name: 'Geography',
    slug: 'geography',
    description: 'Test your knowledge of world geography and landmarks',
    isActive: true,
    displayOrder: 4
  },
  {
    name: 'Pop Culture',
    slug: 'pop-culture',
    description: 'Dive into movies, music, celebrities, and entertainment',
    isActive: true,
    displayOrder: 5
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Test your knowledge of sports, athletes, and sporting events',
    isActive: true,
    displayOrder: 6
  },
  {
    name: 'Arts & Literature',
    slug: 'arts-literature',
    description: 'Explore classic and contemporary arts and literature',
    isActive: true,
    displayOrder: 7
  },
  {
    name: 'Food & Drink',
    slug: 'food-drink',
    description: 'Test your culinary knowledge and food trivia',
    isActive: true,
    displayOrder: 8
  },
  {
    name: 'Other',
    slug: 'other',
    description: 'Miscellaneous quizzes that don\'t fit into other categories',
    isActive: true,
    displayOrder: 99
  }
];

/**
 * Setup the categories system by initializing default categories and migrating existing quizzes
 * @returns {Promise<Object>} Result of initialization
 */
export const setupCategoriesSystem = async () => {
  try {
    // Check if categories exist
    const existingCategories = await getAllCategories(true);
    let categoriesInitialized = false;
    let quizzesMigrated = false;
    
    // Initialize default categories if none exist
    if (existingCategories.length === 0) {
      for (const category of DEFAULT_CATEGORIES) {
        await createCategory(category);
      }
      categoriesInitialized = true;
      console.log('Default categories initialized');
    }
    
    // Get the newly created categories (or existing ones)
    const categories = await getAllCategories(true);
    const categoryMap = new Map();
    
    // Create a map for easy lookup by name
    categories.forEach(cat => {
      categoryMap.set(cat.name, cat.id);
    });
    
    // Add a fallback mapping for similar category names
    const categoryNameMapping = {
      'General': 'General Knowledge',
      'Science': 'Science & Technology',
      'Tech': 'Science & Technology',
      'Technology': 'Science & Technology',
      'Historical': 'History',
      'World History': 'History',
      'Maps': 'Geography',
      'World Geography': 'Geography',
      'Entertainment': 'Pop Culture',
      'TV': 'Pop Culture',
      'Movies': 'Pop Culture',
      'Music': 'Pop Culture',
      'Sport': 'Sports',
      'Athletics': 'Sports',
      'Art': 'Arts & Literature',
      'Literature': 'Arts & Literature',
      'Books': 'Arts & Literature',
      'Cuisine': 'Food & Drink',
      'Cooking': 'Food & Drink',
      'Drinks': 'Food & Drink',
      'Beverages': 'Food & Drink'
    };
    
    // Get all quizzes that don't have categoryId
    const quizzesRef = ref(db, 'quizzes');
    const quizzesSnapshot = await get(quizzesRef);
    
    if (quizzesSnapshot.exists()) {
      const quizzesData = quizzesSnapshot.val();
      let migratedCount = 0;
      
      for (const [quizId, quiz] of Object.entries(quizzesData)) {
        // Skip quizzes that already have a categoryId
        if (quiz.categoryId) continue;
        
        let categoryId = null;
        
        // Try to match the category name directly
        if (quiz.category && categoryMap.has(quiz.category)) {
          categoryId = categoryMap.get(quiz.category);
        } 
        // Try to match with similar category names
        else if (quiz.category && categoryNameMapping[quiz.category]) {
          const mappedName = categoryNameMapping[quiz.category];
          if (categoryMap.has(mappedName)) {
            categoryId = categoryMap.get(mappedName);
          }
        }
        // Default to "Other" if no match found
        else {
          categoryId = categoryMap.get('Other');
        }
        
        // Update the quiz with the categoryId
        if (categoryId) {
          const quizRef = ref(db, `quizzes/${quizId}`);
          await update(quizRef, {
            categoryId,
            updatedAt: serverTimestamp()
          });
          migratedCount++;
        }
      }
      
      if (migratedCount > 0) {
        quizzesMigrated = true;
        console.log(`Migrated ${migratedCount} quizzes to use categoryId`);
      }
    }
    
    return {
      categoriesInitialized,
      quizzesMigrated
    };
  } catch (error) {
    console.error('Error setting up categories system:', error);
    throw error;
  }
};