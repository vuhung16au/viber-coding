'use client';

import Login from '../components/auth/Login';
import { AuthProvider } from '../firebase/auth';

export default function LoginPage() {
  return (
    <AuthProvider>
      <Login />
    </AuthProvider>
  );
}