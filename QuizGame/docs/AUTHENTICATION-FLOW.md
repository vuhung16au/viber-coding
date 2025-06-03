# Authentication Flow Documentation

This document outlines the authentication flow in the QuizGame application, including user registration, login, session management, and security considerations.

## Authentication Overview

QuizGame uses Firebase Authentication as its primary authentication provider, offering:

- Email/password authentication
- OAuth providers (Google, Facebook, Twitter)
- Anonymous authentication
- JWT token-based session management
- Secure password hashing
- Email verification

## User Registration Flow

1. **User enters registration details:**
   - Email address
   - Password
   - Display name

2. **Client-side validation:**
   - Email format validation
   - Password strength requirements (8+ characters, mixture of letters/numbers/symbols)
   - Required field validation

3. **Server-side processing:**
   ```javascript
   // Example registration flow
   firebase.auth().createUserWithEmailAndPassword(email, password)
     .then((userCredential) => {
       // Create user document in Firestore
       return db.collection('users').doc(userCredential.user.uid).set({
         uid: userCredential.user.uid,
         email: email,
         displayName: displayName,
         photoURL: null,
         role: 'user',
         createdAt: firebase.firestore.FieldValue.serverTimestamp(),
         lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
         isActive: true
       });
     })
     .then(() => {
       // Send email verification
       return firebase.auth().currentUser.sendEmailVerification();
     });
   ```

4. **Email verification:**
   - Verification link sent to user's email
   - User clicks link to verify email ownership
   - Account marked as verified in Firebase Auth

## Login Flow

1. **User enters credentials:**
   - Email/Username
   - Password
   - OAuth provider selection (if applicable)

2. **Authentication process:**
   ```javascript
   // Email/password login
   firebase.auth().signInWithEmailAndPassword(email, password)
     .then((userCredential) => {
       // Update last login timestamp
       return db.collection('users').doc(userCredential.user.uid).update({
         lastLogin: firebase.firestore.FieldValue.serverTimestamp()
       });
     });
   
   // OAuth login (example with Google)
   const provider = new firebase.auth.GoogleAuthProvider();
   firebase.auth().signInWithPopup(provider)
     .then((result) => {
       // Check if user exists in database
       return db.collection('users').doc(result.user.uid).get()
         .then((doc) => {
           if (!doc.exists) {
             // Create new user document for first-time OAuth users
             return db.collection('users').doc(result.user.uid).set({
               uid: result.user.uid,
               email: result.user.email,
               displayName: result.user.displayName,
               photoURL: result.user.photoURL,
               role: 'user',
               createdAt: firebase.firestore.FieldValue.serverTimestamp(),
               lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
               isActive: true
             });
           } else {
             // Update last login for existing users
             return doc.ref.update({
               lastLogin: firebase.firestore.FieldValue.serverTimestamp()
             });
           }
         });
     });
   ```

3. **Session management:**
   - Firebase issues JWT token
   - Token stored in local storage/cookies
   - Token includes user claims (role, permissions)

## Session Management

1. **Token lifecycle:**
   - Default token expiration: 1 hour
   - Silent refresh mechanism for active users
   - Force logout on security-sensitive actions

2. **Authentication state observer:**
   ```javascript
   // Monitor auth state changes
   firebase.auth().onAuthStateChanged((user) => {
     if (user) {
       // User is signed in
       getUserData(user.uid).then((userData) => {
         // Update application state with user data
         store.dispatch(setUser(userData));
       });
     } else {
       // User is signed out
       store.dispatch(clearUser());
     }
   });
   ```

3. **Token validation:**
   - Server validates token signature on each API request
   - Checks token expiration
   - Verifies user claims

## Password Management

1. **Password reset flow:**
   - User requests password reset
   - Reset email sent with secure link
   - Link contains one-time token
   - User sets new password
   - All sessions invalidated on password change

2. **Implementation:**
   ```javascript
   // Request password reset email
   firebase.auth().sendPasswordResetEmail(email);

   // Complete password reset (on reset page)
   firebase.auth().confirmPasswordReset(actionCode, newPassword);
   ```

## Role-Based Access Control (RBAC)

1. **User roles:**
   - `user`: Standard permissions
   - `teacher`: Content creation privileges
   - `admin`: Full system access

2. **Custom claims:**
   - Roles stored as Firebase Auth custom claims
   - Claims added to JWT tokens
   - Server validates claims for protected operations

3. **Admin SDK implementation:**
   ```javascript
   // Set custom claims (admin-only operation)
   admin.auth().setCustomUserClaims(uid, { role: 'teacher' })
     .then(() => {
       // Update Firestore user document
       return db.collection('users').doc(uid).update({
         role: 'teacher'
       });
     });
   ```

## Multi-Factor Authentication (MFA)

1. **MFA options:**
   - SMS verification
   - Authenticator app
   - Email link verification

2. **MFA enrollment flow:**
   - User initiates MFA setup from profile settings
   - Secondary factor configured and verified
   - MFA status stored in user profile

## OAuth Integration

1. **Supported providers:**
   - Google
   - Facebook
   - Twitter
   - GitHub

2. **OAuth configuration:**
   ```javascript
   // OAuth provider setup
   const googleProvider = new firebase.auth.GoogleAuthProvider();
   googleProvider.addScope('profile');
   googleProvider.addScope('email');
   
   // Sign in with OAuth
   firebase.auth().signInWithPopup(googleProvider);
   ```

3. **Account linking:**
   - Mechanism to link multiple auth providers to one account
   - Email address used as linking key

## Anonymous Authentication

1. **Use cases:**
   - Quiz preview without registration
   - Guest access to public content
   - Gradual onboarding

2. **Implementation:**
   ```javascript
   // Start anonymous session
   firebase.auth().signInAnonymously();
   
   // Convert anonymous account to permanent
   const credential = firebase.auth.EmailAuthProvider.credential(email, password);
   firebase.auth().currentUser.linkWithCredential(credential);
   ```

## Authentication Security Measures

1. **Rate limiting:**
   - Login attempts limited to prevent brute force attacks
   - Progressive delays on repeated failed attempts
   - IP-based blocking for suspicious activity

2. **Account protection:**
   - Automatic account locking after multiple failed attempts
   - Email notifications for security events
   - Suspicious location alerts

3. **Session security:**
   - HTTP-only cookies for token storage
   - Secure and SameSite cookie attributes
   - CSRF protection mechanisms

## Testing Authentication

1. **Unit testing:**
   - Mock Firebase Auth for component testing
   - Test component behavior in authenticated/unauthenticated states

2. **Integration testing:**
   - Test auth flows using Firebase Auth Emulator
   - Verify protected API endpoints

3. **E2E testing:**
   ```javascript
   // Example Playwright test for authentication
   test('user can login and access protected page', async ({ page }) => {
     await page.goto('/login');
     await page.fill('input[name="email"]', 'test@example.com');
     await page.fill('input[name="password"]', 'testPassword123');
     await page.click('button[type="submit"]');
     
     // Wait for redirect after successful login
     await page.waitForURL('/dashboard');
     
     // Verify authenticated content is visible
     await expect(page.locator('.user-profile')).toBeVisible();
   });
   ```

## Authentication Error Handling

1. **Common error scenarios:**
   - Invalid credentials
   - Email already in use
   - Weak password
   - Account disabled
   - Email not verified

2. **Error handling strategy:**
   ```javascript
   firebase.auth().signInWithEmailAndPassword(email, password)
     .catch((error) => {
       switch (error.code) {
         case 'auth/user-not-found':
         case 'auth/wrong-password':
           // Show generic error for both cases to prevent user enumeration
           showError('Invalid email or password');
           break;
         case 'auth/too-many-requests':
           showError('Too many failed attempts. Please try again later');
           break;
         case 'auth/user-disabled':
           showError('This account has been disabled');
           break;
         default:
           showError('An error occurred during login. Please try again');
       }
     });
   ```

## Authentication Audit & Compliance

1. **Activity logging:**
   - All authentication events logged
   - Login attempts (successful and failed)
   - Password changes
   - Role modifications

2. **Audit review:**
   - Admin dashboard for auth event review
   - Suspicious activity flagging
   - Compliance reporting

## Future Enhancements



