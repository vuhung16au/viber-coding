# Firebase Data Structure

```mermaid
graph TD
    A[quiz-gotitright-default-rtdb] --> B(results)
    B --> C{userId}
    B --> D{quizId}
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#ccf,stroke:#333,stroke-width:2px
    style C fill:#ccf,stroke:#333,stroke-width:2px
    style D fill:#ccf,stroke:#333,stroke-width:2px
```

# Explanation

- quiz-gotitright-default-rtdb is the root of your database, the top-level node.
- results is a node directly under the root. This is where you're storing your quiz result data.
- userId and quizId are properties that you have configured the database to index on for faster querying.