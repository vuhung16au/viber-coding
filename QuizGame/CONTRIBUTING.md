# Contributing to QuizGame

Thank you for your interest in contributing to QuizGame! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Code Style and Conventions](#code-style-and-conventions)
5. [Pull Request Process](#pull-request-process)
6. [Issue Reporting](#issue-reporting)
7. [Documentation](#documentation)

## Code of Conduct

We expect all contributors to adhere to our Code of Conduct. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

1. **Fork the repository**
2. **Clone your fork locally**
   ```bash
   git clone https://github.com/your-username/QuizGame.git
   cd QuizGame
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Set up your environment**
   - Follow the instructions in [INSTALL.md](INSTALL.md)
   - Set up Firebase configuration as described in [firebase-info.md](firebase-info.md)

5. **Create a branch for your work**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. **Create or pick an issue** from the GitHub issue tracker
2. **Write your code** following the [code style guidelines](#code-style-and-conventions)
3. **Write tests** for your changes
4. **Run tests** to ensure everything passes
   ```bash
   npm test
   ```
5. **Update documentation** as needed
6. **Submit a pull request** following the [pull request guidelines](#pull-request-process)

## Code Style and Conventions

### JavaScript/React

- We use ESLint for code linting. Run `npm run lint` to check your code
- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use functional components with hooks for React components
- Use async/await for asynchronous operations
- Add JSDoc comments for functions and components

```javascript
/**
 * Processes quiz results and updates user statistics
 * @param {Object} session - The quiz session object
 * @param {string} session.userId - User ID
 * @param {Object} results - Quiz results object
 * @returns {Promise<Object>} Updated user statistics
 */
const processQuizResults = async (session, results) => {
  // Function implementation
};
```

### Naming Conventions

- **Files and Directories**:
  - React components: PascalCase (e.g., `QuestionCard.js`)
  - Utility functions: camelCase (e.g., `authHelpers.js`)
  - Test files: ComponentName.test.js (e.g., `QuestionCard.test.js`)

- **Variables and Functions**:
  - Use descriptive names: `getUserQuizzes` instead of `getQuizzes`
  - Boolean variables should have "is", "has", or "should" prefix: `isLoading`, `hasPermission`

### CSS/Styling

- Use Tailwind CSS utility classes when possible
- Create custom CSS modules only when necessary
- Follow BEM naming convention for custom CSS classes

### Firebase

- Always use batch operations when updating multiple documents
- Protect security rules in Firestore
- Include error handling for all Firebase operations

## Pull Request Process

1. **Before submitting a PR**:
   - Ensure all tests pass
   - Update documentation if needed
   - Make sure your code follows our style guidelines
   - Rebase your branch on the latest main branch

2. **PR Template**:
   When creating a PR, please include:

   ```markdown
   ## Description
   Brief description of the changes

   ## Related Issue
   Fixes #(issue number)

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Performance improvement
   - [ ] Code refactoring

   ## How Has This Been Tested?
   Describe the tests you ran

   ## Screenshots (if applicable)

   ## Checklist
   - [ ] My code follows the style guidelines
   - [ ] I have performed a self-review of my code
   - [ ] I have commented my code where needed
   - [ ] I have updated the documentation
   - [ ] My changes generate no new warnings
   - [ ] I have added tests that prove my fix or feature works
   - [ ] New and existing tests pass with my changes
   ```

3. **Code Review**:
   - All PRs require at least one review from a maintainer
   - Address reviewer comments and suggestions
   - Once approved, a maintainer will merge your PR

4. **After Merging**:
   - Delete the feature branch
   - Update any related issues

## Issue Reporting

### Issue Template

When creating an issue, please use one of the following templates:

#### Bug Report
```markdown
## Bug Description
A clear and concise description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Screenshots
If applicable, add screenshots

## Environment
- Browser: [e.g. Chrome 91, Safari 14]
- OS: [e.g. Windows 10, macOS 11]
- Device: [e.g. iPhone 12, Desktop]

## Additional Context
Any other information about the problem
```

#### Feature Request
```markdown
## Feature Description
A clear and concise description of the feature you'd like to see

## Problem This Feature Solves
Explain why this feature would be useful

## Proposed Solution
Describe how you envision this feature working

## Alternatives Considered
Any alternative solutions or features you've considered

## Additional Context
Any other context or screenshots about the feature request
```

## Documentation

- Update the relevant documentation when making changes
- Follow the existing documentation structure and style
- For significant changes, update the [CHANGELOG.md](CHANGELOG.md)

---

Thank you for contributing to QuizGame! Your efforts help make this project better for everyone.
