# Changelog

All notable changes to the Quiz GetItRight project will be documented in this file.

## [1.0.9] - 2025-04-26

### Added
- Improved question timeout functionality with visual countdown timer
- Color-coded timer display (green, yellow, red) based on remaining time
- Enhanced answer handling with clearer visual feedback
- Better support for different answer text formats in quiz questions
- Responsive UI improvements for question display
- Proper cleanup of timer intervals to prevent memory leaks

### Changed
- Optimized question component for better performance and user experience
- Improved accessibility for quiz answers with proper ARIA attributes
- Enhanced visual styling for correct/incorrect answers

## [1.0.8] - 2025-04-26

### Added
- Firebase Analytics integration for comprehensive user behavior tracking
- Event tracking utilities for quiz interactions (start, complete, answer)
- User engagement metrics (registration, login, search)
- Custom analytics utility functions for standardized event tracking
- Client-side analytics initialization with proper Next.js integration

### Changed
- Enhanced Google Analytics implementation with Firebase Analytics integration
- Optimized analytics to properly work with Next.js Server and Client components
- Updated Firebase configuration to include analytics capabilities

## [1.0.7] - 2025-04-26

### Added
- Google Analytics 4 (GA4) integration
- Tracking setup for the production site (https://quiz-gotitright.vercel.app/)
- Measurement ID configuration in environment variables
- Analytics component for tracking page views

### Changed
- Enhanced application with analytics capabilities
- Added performance-optimized analytics script loading

## [1.0.6] - 2025-04-26

### Added
- Public/private visibility toggle for quizzes
- Visual indicators showing whether a quiz is public or private
- Public quizzes are displayed on the public quizzes page
- Private quizzes are only visible to their creators
- New "isPublic" field in the quiz database structure

### Changed
- Quiz creation form updated with public/private visibility option
- Quizzes page now filters based on visibility permissions
- All existing quizzes set to private by default for backward compatibility

## [1.0.5] - 2025-04-26

### Added
- Drag and drop functionality for reordering quiz questions
- Up/down arrow buttons for moving questions one position at a time
- Visual feedback when dragging questions (highlight and shadow effects)
- Automatic question renumbering when order changes

### Changed
- Enhanced quiz creation experience with multiple reordering options
- Improved quiz editing workflow with intuitive question management

## [1.0.4] - 2025-04-26

### Added
- Quiz duplication feature that allows users to create copies of existing quizzes
- "Duplicate" button added to quiz cards in the My Quizzes dashboard
- Success/error feedback when duplicating quizzes
- Duplicated quizzes appear with "(Copy)" suffix in the title

### Changed
- Enhanced quiz management workflow with quick duplication option
- Improved user experience for creating similar quizzes

## [1.0.3] - 2025-04-26

### Added
- Comprehensive search functionality for quiz discovery
- Search across quiz title, description, category names, tags, and question/answer content
- Category filtering on the main Quizzes page
- Combined search and filtering options
- "Clear search" and "Clear filters" buttons for better user experience
- Visual indicators for search results count
- Responsive search UI that works well on mobile devices

### Changed
- Enhanced My Quizzes page with search capabilities
- Improved main Quizzes page with advanced filtering options
- Better organization of quiz browsing interface

## [1.0.2] - 2025-04-26

### Added
- Pagination feature added to quiz listing pages
- Support for customizing number of quizzes per page (10, 20, 50, 100)
- Default of 20 quizzes per page
- Pagination implemented on homepage, quizzes page, and dashboard/my-quizzes

### Changed
- Improved user experience when browsing large quiz collections
- Enhanced performance by displaying quizzes in manageable chunks

## [1.0.1]

### Added
- Keyboard shortcuts for quiz navigation (A/B/C/D to select answers, N for next, P for previous) (TODO)
- Keyboard shortcut to retry quiz (R key in results screen) (TODO)
- Gemini AI integration for automatic quiz generation
- Checkbox option to enable AI-assisted quiz creation
- Auto-generate 10 quality questions based on quiz description

### Changed
- Improved quiz creation form with better AI assistance UI
- Enhanced error handling for AI generation process

### Fixed
- Various minor UI/UX improvements in the quiz creation form

## [1.0.0] - 2025-04-25

### Added
- Initial release
- User authentication (login, register, profile management)
- Quiz creation and management
- Quiz taking functionality
- Multilingual support (EN, FR, DE, VI, ZH, JA)
- Responsive design for all screen sizes
- Dark/light theme support