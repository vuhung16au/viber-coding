# Lesson learnt

I've learned some important lessons from this project:

- The first thing you need to do is to design the database. It doesn't need to be complete but you need a structure. I should have created database structure before starting the project. I had to change the database structure multiple times during the project, which caused a lot of confusion and wasted time.
- Start with a code base that is already working. I started from scratch, which led to unnecessary delays and complications.
- multiple lanuages support is not easy. I had to change the code multiple times to support multiple languages, which was time-consuming and frustrating. 
- We need to tell the coding agent that we are using Firebase Realtime Database, not Firestore. I had to change the code multiple times to make it work with Firebase, which was frustrating. Claude usually misunderstood the Firebase Realtime Database and Firestore. I had to change the code multiple times to make it work with Firebase, which was frustrating. Need to tell Claude to delete Firestore related logics and use Firebase Realtime Database instead.
- To debug the code, a good understanding of next.js and firebase is required. I had to spend a lot of time debugging the code, which was frustrating.
- How to report a bug to Claude. Provide a detailed description of the bug, including the steps to reproduce it, the expected behavior, and the actual behavior. Include any error messages. Provide (multiple) screenshots if possible. Thanks the multi-modal feature of Claude supporting multiple screenshots.
- After gathering tech requirements, function list, db struture, UI design, URL list, NFR, required framework, we need to create a plan for AI agent to follow. Any LLM can help with this. 
- I had to instruct Claude to implement quiz generation from server side (using `GEMINI_API_KEY`), instead of `NEXT_PUBLIC_GEMINI_API_KEY`, which is run on client side - and hence, exposes Gemini API key to the client.