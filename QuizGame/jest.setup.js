import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import 'whatwg-fetch';

// Mock the next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    route: '/',
    asPath: '/',
    query: {},
    locale: 'en'
  }),
}));

// Mock Firebase - this is a complete mock rather than trying to use real Firebase in tests
jest.mock('./app/firebase/config', () => {
  const mockAuth = {
    signInWithPopup: jest.fn(),
    signOut: jest.fn().mockResolvedValue({}),
    currentUser: { uid: 'test-user-id', email: 'test@example.com', displayName: 'Test User' },
    onAuthStateChanged: jest.fn(callback => {
      callback({ uid: 'test-user-id', email: 'test@example.com', displayName: 'Test User' });
      return jest.fn(); // Return unsubscribe function
    }),
    GoogleAuthProvider: jest.fn(() => ({})),
  };
  
  const mockDatabaseValue = {
    val: jest.fn().mockReturnValue({
      quizzes: {
        'quiz-1': { id: 'quiz-1', title: 'Test Quiz', questions: [] },
      },
      users: {
        'test-user-id': { name: 'Test User', email: 'test@example.com' }
      }
    }),
    exists: jest.fn().mockReturnValue(true),
  };

  const mockDatabase = {
    ref: jest.fn().mockReturnThis(),
    child: jest.fn().mockReturnThis(),
    set: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    push: jest.fn().mockReturnValue({ key: 'mock-key' }),
    remove: jest.fn().mockResolvedValue({}),
    once: jest.fn().mockResolvedValue(mockDatabaseValue),
    on: jest.fn((event, callback) => {
      callback(mockDatabaseValue);
      return jest.fn(); // Return unsubscribe function
    }),
  };

  const mockStorage = {
    ref: jest.fn().mockReturnThis(),
    child: jest.fn().mockReturnThis(),
    put: jest.fn().mockResolvedValue({
      ref: {
        getDownloadURL: jest.fn().mockResolvedValue('https://example.com/test-image.jpg')
      }
    }),
    getDownloadURL: jest.fn().mockResolvedValue('https://example.com/test-image.jpg'),
    delete: jest.fn().mockResolvedValue({}),
  };

  // Mock Firebase functions and exports
  return {
    auth: mockAuth,
    database: mockDatabase,
    storage: mockStorage,
    app: {},
    getAuth: jest.fn().mockReturnValue(mockAuth),
    getDatabase: jest.fn().mockReturnValue(mockDatabase),
    getStorage: jest.fn().mockReturnValue(mockStorage),
    initializeApp: jest.fn(),
    getApps: jest.fn().mockReturnValue([{}]),
    GoogleAuthProvider: jest.fn().mockImplementation(() => ({ 
      addScope: jest.fn()
    })),
    ref: jest.fn().mockReturnValue(mockDatabase),
    child: jest.fn().mockReturnValue(mockDatabase),
    get: jest.fn().mockResolvedValue(mockDatabaseValue),
    set: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
    push: jest.fn().mockReturnValue({ key: 'mock-key' }),
    onValue: jest.fn((ref, callback) => {
      callback({ val: () => ({ data: 'mock data' }) });
      return jest.fn(); // Return unsubscribe function
    }),
  };
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock components that are giving issues
jest.mock('./app/components/layout/Footer', () => ({
  __esModule: true,
  default: function Footer() {
    return <div data-testid="mock-footer">Mock Footer</div>;
  }
}));

// Set up global values
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Suppress console errors in tests
console.error = jest.fn();