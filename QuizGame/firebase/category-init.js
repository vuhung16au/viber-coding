// This script populates initial categories in the database
import { database } from './config.js';
import { ref, set, push, get, serverTimestamp } from 'firebase/database';
import { createCategory, getAllCategories } from './database';

// Initial categories to populate the database with
const initialCategories = [
  {
    name: 'General Knowledge',
    slug: 'general-knowledge',
    description: 'Test your knowledge on a wide range of general topics',
    isActive: true,
    displayOrder: 1
  },
  {
    name: 'Science & Technology',
    slug: 'science-technology',
    description: 'Explore the worlds of science and technology',
    isActive: true,
    displayOrder: 2
  },
  {
    name: 'History',
    slug: 'history',
    description: 'Travel back in time with historical facts and events',
    isActive: true,
    displayOrder: 3
  },
  {
    name: 'Geography',
    slug: 'geography', 
    description: 'Discover the world with geography quizzes',
    isActive: true,
    displayOrder: 4
  },
  {
    name: 'Pop Culture',
    slug: 'pop-culture',
    description: 'Test your knowledge of movies, music, TV shows and more',
    isActive: true,
    displayOrder: 5
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Challenge yourself with sports trivia from around the world',
    isActive: true,
    displayOrder: 6
  },
  {
    name: 'Other',
    slug: 'other',
    description: 'Miscellaneous quizzes that don\'t fit other categories',
    isActive: true,
    displayOrder: 7
  }
];

// Function to check if categories already exist and create them if they don't
export const initializeCategories = async () => {
  try {
    console.log('Checking for existing categories...');
    const existingCategories = await getAllCategories(true);
    
    if (existingCategories.length === 0) {
      console.log('No categories found. Creating initial categories...');
      const categoryPromises = initialCategories.map(category => createCategory(category));
      await Promise.all(categoryPromises);
      console.log('Initial categories created successfully!');
      return true;
    } else {
      console.log(`Found ${existingCategories.length} existing categories. No need to initialize.`);
      return false;
    }
  } catch (error) {
    console.error('Error initializing categories:', error);
    return false;
  }
};

// Function to migrate existing quizzes to use categoryId instead of category name
export const migrateQuizzesToCategoryIds = async () => {
  try {
    console.log('Starting quiz category migration...');
    
    // Get all categories
    const categories = await getAllCategories(true);
    if (categories.length === 0) {
      console.log('No categories found. Run initializeCategories first.');
      return false;
    }
    
    // Create a mapping of category names to category IDs
    const categoryMap = {};
    const categoryNameToId = {};
    
    categories.forEach(category => {
      categoryMap[category.name.toLowerCase()] = category.id;
      categoryNameToId[category.name] = category.id;
    });
    
    // Also map some variations for backward compatibility
    categoryMap['general'] = categoryMap['general knowledge'];
    categoryMap['science'] = categoryMap['science & technology'];
    categoryMap['technology'] = categoryMap['science & technology'];
    categoryMap['entertainment'] = categoryMap['pop culture'];
    
    // Get all quizzes
    const quizzesRef = ref(database, 'quizzes');
    const quizzesSnapshot = await get(quizzesRef);
    
    if (!quizzesSnapshot.exists()) {
      console.log('No quizzes found to migrate.');
      return false;
    }
    
    const quizzesData = quizzesSnapshot.val();
    let migratedCount = 0;
    
    // Update each quiz with the appropriate categoryId
    for (const [quizId, quiz] of Object.entries(quizzesData)) {
      if (!quiz.categoryId && quiz.category) {
        const categoryLower = quiz.category.toLowerCase();
        const categoryId = categoryMap[categoryLower] || categoryMap['other'];
        
        if (categoryId) {
          const quizRef = ref(database, `quizzes/${quizId}`);
          await set(quizRef, {
            ...quiz,
            categoryId: categoryId,
            // Keep the original category name for backward compatibility
            categoryName: quiz.category,
          });
          migratedCount++;
        }
      }
    }
    
    console.log(`Migration complete! ${migratedCount} quizzes updated with categoryId.`);
    return true;
  } catch (error) {
    console.error('Error migrating quizzes:', error);
    return false;
  }
};

// Export a function to run both operations
export const setupCategoriesSystem = async () => {
  const categoriesInitialized = await initializeCategories();
  if (categoriesInitialized) {
    console.log('Categories initialized successfully.');
  }
  
  const quizzesMigrated = await migrateQuizzesToCategoryIds();
  if (quizzesMigrated) {
    console.log('Quizzes migrated successfully.');
  }
  
  return { categoriesInitialized, quizzesMigrated };
};