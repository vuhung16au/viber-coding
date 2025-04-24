'use client';

import ResetPassword from '@/app/components/auth/ResetPassword';
import { useLanguage } from '@/app/context/LanguageContext';

export default function ResetPasswordPage() {
  const { locale } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Reset Password</h1>
      <ResetPassword />
    </div>
  );
}