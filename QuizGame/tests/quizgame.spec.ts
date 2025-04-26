import { test, expect } from '@playwright/test';

test.describe('QuizGame E2E Tests', () => {
  // Test the public pages without login
  test.describe('Not logged-in user experience', () => {
    test('should navigate main pages without login', async ({ page }) => {
      // Go to the home page
      await page.goto('/');
      await expect(page).toHaveTitle(/QuizGame/);

      // Navigate to Quizzes page
      await page.getByRole('link', { name: /quizzes/i }).click();
      await expect(page.url()).toContain('/quizzes');
      await expect(page.getByRole('heading', { name: /popular quizzes/i })).toBeVisible();

      // Try changing language
      const languageSelector = page.getByRole('button', { name: /language/i });
      await languageSelector.click();
      await page.getByText('日本語').click();
      await expect(page.url()).toContain('/ja');
      
      // Check if the content switched to Japanese
      await expect(page.getByRole('heading')).toContainText(/クイズ/);
      
      // Change back to English
      await languageSelector.click();
      await page.getByText('English').click();
      await expect(page.url()).toContain('/en');
    });

    test('should check footer links', async ({ page }) => {
      await page.goto('/');
      
      // Check About page
      await page.getByRole('link', { name: /about/i }).click();
      await expect(page.url()).toContain('/about');
      
      // Check Privacy Policy page
      await page.getByRole('link', { name: /privacy policy/i }).click();
      await expect(page.url()).toContain('/privacy-policy');
      
      // Check Terms of Service page
      await page.getByRole('link', { name: /terms of service/i }).click();
      await expect(page.url()).toContain('/terms-of-service');
      
      // Check Contact page
      await page.getByRole('link', { name: /contact/i }).click();
      await expect(page.url()).toContain('/contact');
    });
  });

  // Logged-in user experience
  test.describe('Logged-in user experience', () => {
    // Set up test to login before each test
    test.beforeEach(async ({ page }) => {
      // Mock Google SSO for testing
      await page.route('**/oauth2/v2/auth**', async route => {
        // Mocking Google auth redirect
        await route.fulfill({
          status: 302,
          headers: {
            Location: '/auth/google/callback?code=test_auth_code',
          },
        });
      });
      
      // Mock the auth callback
      await page.route('**/auth/google/callback**', async route => {
        // Set cookies or localStorage to simulate logged in state
        await page.evaluate(() => {
          localStorage.setItem('authUser', JSON.stringify({
            uid: 'test-user-id',
            email: 'test@example.com',
            displayName: 'Test User',
            photoURL: 'https://example.com/photo.jpg'
          }));
        });
        
        await route.fulfill({
          status: 302,
          headers: {
            Location: '/',
          },
        });
      });

      // Go to login page and sign in
      await page.goto('/login');
      await page.getByRole('button', { name: /sign in with google/i }).click();
      
      // Wait for login to complete and redirect
      await page.waitForURL('/*');
      
      // Verify user is logged in
      await expect(page.getByText(/test user/i)).toBeVisible();
    });

    test('should browse user-specific pages after login', async ({ page }) => {
      // Mock data for my quizzes
      await page.route('**/api/my-quizzes**', async route => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify([
            {
              id: 'quiz1',
              title: 'My First Quiz',
              description: 'A test quiz',
              createdAt: new Date().toISOString()
            }
          ])
        });
      });
      
      // Browse My Quizzes
      await page.getByRole('link', { name: /my quizzes/i }).click();
      await expect(page.url()).toContain('/my-quizzes');
      await expect(page.getByText(/my first quiz/i)).toBeVisible();
      
      // Mock data for results
      await page.route('**/api/my-results**', async route => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify([
            {
              id: 'result1',
              quizId: 'quiz1',
              quizTitle: 'My First Quiz',
              score: 8,
              totalQuestions: 10,
              percentage: 80,
              completedAt: new Date().toISOString()
            }
          ])
        });
      });
      
      // Browse My Results
      await page.getByRole('link', { name: /my results/i }).click();
      await expect(page.url()).toContain('/my-results');
      await expect(page.getByText(/80%/i)).toBeVisible();
      
      // Mock statistics data
      await page.route('**/api/statistics**', async route => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            totalQuizzesTaken: 5,
            averageScore: 85,
            bestCategory: 'Science'
          })
        });
      });
      
      // Browse Statistics
      await page.getByRole('link', { name: /statistics/i }).click();
      await expect(page.url()).toContain('/statistics');
      await expect(page.getByText(/average score/i)).toBeVisible();
      await expect(page.getByText(/85/)).toBeVisible();
    });

    test('should create a new quiz with manual questions', async ({ page }) => {
      // Go to create quiz page
      await page.getByRole('link', { name: /create quiz/i }).click();
      await expect(page.url()).toContain('/create-quiz');
      
      // Fill in quiz details
      await page.getByLabel(/quiz title/i).fill('E2E Test Quiz');
      await page.getByLabel(/description/i).fill('This quiz was created during E2E testing');
      
      // Add a question
      await page.getByRole('button', { name: /add question/i }).click();
      
      // Fill in question details
      await page.getByLabel(/question text/i).fill('What is 1+1?');
      
      // Fill in options
      const optionInputs = page.getByLabel(/option/i).all();
      await optionInputs[0].fill('1');
      await optionInputs[1].fill('2');
      await optionInputs[2].fill('3');
      await optionInputs[3].fill('4');
      
      // Select correct answer
      await page.getByLabel(/correct answer/i).click();
      await page.getByText('2').click();
      
      // Mock the quiz creation API
      await page.route('**/api/quizzes**', async route => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            id: 'new-quiz-id',
            title: 'E2E Test Quiz',
            success: true
          })
        });
      });
      
      // Save the quiz
      await page.getByRole('button', { name: /save quiz/i }).click();
      
      // Check for success message
      await expect(page.getByText(/quiz created successfully/i)).toBeVisible();
    });

    test('should create a new quiz with AI-generated questions', async ({ page }) => {
      // Go to create quiz page
      await page.getByRole('link', { name: /create quiz/i }).click();
      await expect(page.url()).toContain('/create-quiz');
      
      // Fill in quiz details
      await page.getByLabel(/quiz title/i).fill('AI Generated Quiz');
      await page.getByLabel(/description/i).fill('This quiz was created with AI during E2E testing');
      
      // Select category and difficulty
      await page.getByLabel(/category/i).selectOption('Science');
      await page.getByLabel(/difficulty/i).selectOption('Medium');
      
      // Mock AI generation API
      await page.route('**/api/generate-questions**', async route => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify([
            {
              question: 'What is the chemical symbol for gold?',
              options: ['Au', 'Ag', 'Fe', 'Cu'],
              correctAnswer: 'Au'
            },
            {
              question: 'What is the closest planet to the Sun?',
              options: ['Venus', 'Mercury', 'Earth', 'Mars'],
              correctAnswer: 'Mercury'
            }
          ])
        });
      });
      
      // Generate questions with AI
      await page.getByRole('button', { name: /generate with ai/i }).click();
      
      // Wait for questions to be generated
      await expect(page.getByText(/what is the chemical symbol for gold/i)).toBeVisible();
      
      // Mock the quiz creation API
      await page.route('**/api/quizzes**', async route => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            id: 'ai-quiz-id',
            title: 'AI Generated Quiz',
            success: true
          })
        });
      });
      
      // Save the quiz
      await page.getByRole('button', { name: /save quiz/i }).click();
      
      // Check for success message
      await expect(page.getByText(/quiz created successfully/i)).toBeVisible();
    });

    test('should take a quiz and view results', async ({ page }) => {
      // Mock getting quiz data
      await page.route('**/api/quizzes/test-quiz-id**', async route => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            id: 'test-quiz-id',
            title: 'Test Quiz',
            description: 'A quiz for E2E testing',
            questions: [
              {
                id: 'q1',
                question: 'What is the capital of France?',
                options: ['London', 'Berlin', 'Paris', 'Madrid'],
                correctAnswer: 'Paris'
              }
            ]
          })
        });
      });
      
      // Navigate to the quiz
      await page.goto('/quiz/test-quiz-id');
      
      // Wait for quiz to load
      await expect(page.getByText(/test quiz/i)).toBeVisible();
      await expect(page.getByText(/what is the capital of france/i)).toBeVisible();
      
      // Select an answer
      await page.getByText('Paris').click();
      
      // Mock the submit quiz API
      await page.route('**/api/submit-quiz**', async route => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            score: 1,
            totalQuestions: 1,
            percentage: 100,
            correctAnswers: ['Paris']
          })
        });
      });
      
      // Submit the quiz
      await page.getByRole('button', { name: /submit/i }).click();
      
      // Check for results
      await expect(page.getByText(/your score/i)).toBeVisible();
      await expect(page.getByText(/100%/i)).toBeVisible();
    });

    test('should edit user profile', async ({ page }) => {
      // Go to profile page
      await page.getByRole('link', { name: /my profile/i }).click();
      await expect(page.url()).toContain('/profile');
      
      // Check if user information is displayed
      await expect(page.getByText(/test user/i)).toBeVisible();
      await expect(page.getByText(/test@example.com/i)).toBeVisible();
      
      // Click edit profile button
      await page.getByRole('button', { name: /edit profile/i }).click();
      
      // Update display name
      await page.getByLabel(/name/i).fill('Updated Test User');
      
      // Mock the update profile API
      await page.route('**/api/update-profile**', async route => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            success: true,
            user: {
              uid: 'test-user-id',
              displayName: 'Updated Test User',
              email: 'test@example.com',
              photoURL: 'https://example.com/photo.jpg'
            }
          })
        });
      });
      
      // Save changes
      await page.getByRole('button', { name: /save changes/i }).click();
      
      // Check for success message
      await expect(page.getByText(/profile updated successfully/i)).toBeVisible();
      
      // Check if updated information is displayed
      await expect(page.getByText(/updated test user/i)).toBeVisible();
    });

    test('should logout successfully', async ({ page }) => {
      // Click on the logout button
      await page.getByRole('button', { name: /logout/i }).click();
      
      // Wait for logout to complete
      await page.waitForURL('/*');
      
      // Verify login button is now visible
      await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
      
      // Verify user-specific links are no longer visible
      await expect(page.getByRole('link', { name: /my quizzes/i })).not.toBeVisible();
    });

    test('should change language when logged in', async ({ page }) => {
      // Try changing language
      const languageSelector = page.getByRole('button', { name: /language/i });
      await languageSelector.click();
      await page.getByText('日本語').click();
      await expect(page.url()).toContain('/ja');
      
      // Check if the content switched to Japanese
      await expect(page.getByRole('heading')).toContainText(/クイズ/);
      
      // Try other languages
      await languageSelector.click();
      await page.getByText('Tiếng Việt').click();
      await expect(page.url()).toContain('/vi');
      
      await languageSelector.click();
      await page.getByText('Deutsch').click();
      await expect(page.url()).toContain('/de');
      
      await languageSelector.click();
      await page.getByText('Français').click();
      await expect(page.url()).toContain('/fr');
      
      // Change back to English
      await languageSelector.click();
      await page.getByText('English').click();
      await expect(page.url()).toContain('/en');
    });
  });
});