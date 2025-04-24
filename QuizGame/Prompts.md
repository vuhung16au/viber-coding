# First batch
This is a quiz app that allows users to take quizzes on various topics. 

- Turn this project into a web app using Next.js and Tailwind CSS (vite) latest stable 4.1.17 version.
- This app will be deployed to vercel.

## UI/UX requirements 

- The app should be responsive and mobile-friendly.
- The app should have a clean and modern design.
- The app should be easy to navigate and use.
- The app should be fast and efficient.
- The app should be secure and protect user data.
- The app should be accessible to all users, including those with disabilities.
- The app should be compatible with all major browsers.
- The app should be optimized for search engines (SEO).
- The app should be easy to maintain and update.

# Technology stack

- Next.js (latest stable version)
- Tailwind CSS (latest stable version)
- Node.js (latest stable version)

## Login 

- Users should be able to log in using their email and password.
- Users should be able to log in using their Google account.
- Users can save their login information for future use (using cookies).
- Users should be able to reset their password if they forget it.
- Users should be able to log out of the app.
- Users should be able to view their profile information.
- Users should be able to update their profile information.
- Users should be able to delete their account.

Use firebase authentication for login and registration.

### Login addition 1 

Manage login status 

- Do not show "login"/"signup" button once user has logged in 
- Show dashboard once logged in 

# 2nd batch

Users can create quizzes on various topics.
- Users can add a title to their quizzes.
- Users can add a description to their quizzes.
- Users can add a cover image to their quizzes.
- Users can add a category to their quizzes.
- Users can add tags to their quizzes.
- Users can add questions to their quizzes.
- Users can add answers to their questions.


## Implementation of quiz details page

Implement
http://localhost:3001/quiz/1
http://localhost:3001/quiz/{id}

## Storage of quizzes

- quizzes, questions, answers, and results should be stored in a Firebase realtime database.
- quizzes should be stored in a collection called "quizzes".
- questions should be stored in a collection called "questions".
- answers should be stored in a collection called "answers".
- results should be stored in a collection called "results".

Please create a firebase project and use the following structure for the database:

```
quizzes
  quizId
    title: string
    description: string
    coverImage: string
    category: string
    tags: array of strings
    questions: array of questionIds
questions
  questionId
    question: string
    answers: array of answerIds
answers
  answerId
    answer: string
    isCorrect: boolean
results
  resultId
    quizId: string
    userId: string
    score: number
    date: timestamp
```


# Type of questions:
- Multiple choice questions (maximum of 4 answers)
- True/False questions

Use firebase database for storing quizzes and questions.
- Users can view their quizzes.
- Users can edit their quizzes.
- Users can delete their quizzes.
- Users can take quizzes created by other users.
- Users can view their quiz results.

- Users can share their quizzes with other users.
- Users can rate quizzes created by other users.

 # Generate documents 

Generate `LICENSE.md` and claim it to be MIT license.

Generate `README.md` write 
- a short description of the project, 
- how to run it, 
- how to deploy it on localhost or vercel,
- technology stack used,
- add screenshots of the app,
- add a link to the live demo of the app,
- add a link to the github repo of the app,
- Security Considerations note about how to protect Firebase keys

Generate `FEATURE.md` and write
- a list of features of the app,
- short description of each feature,
- how to use each feature,
- any known issues with each feature,