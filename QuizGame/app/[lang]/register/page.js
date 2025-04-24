'use client';

import Register from '@/app/components/auth/Register';
import { useLanguage } from '@/app/context/LanguageContext';

export default function RegisterPage() {
  const { locale } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8">
      <Register />
    </div>
  );
}