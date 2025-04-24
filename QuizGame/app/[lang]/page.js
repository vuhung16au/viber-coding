'use client';

import { useLanguage } from '../context/LanguageContext';
import Dashboard from '../components/Dashboard';

export default function HomePage({ params }) {
  const { t } = useLanguage();
  
  return (
    <main>
      <Dashboard />
    </main>
  );
}