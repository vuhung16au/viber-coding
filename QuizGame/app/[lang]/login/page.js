'use client';

import Login from '@/app/components/auth/Login';
import { useLanguage } from '@/app/context/LanguageContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { locale } = useLanguage();
  const router = useRouter();

  // We're removing the problematic useEffect that was directly manipulating DOM
  // This was causing Cross-Origin-Opener-Policy violations

  return (
    <div className="container mx-auto px-4 py-8">
      <Login />
    </div>
  );
}