
Use the Firebase config below,
create the firebase data structure mentioned below, 
populate it with some sample data,
and provide the code to connect to the Firebase database.
try to delete the quiz and see if it works.

Firebase Realtime database data structure
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

