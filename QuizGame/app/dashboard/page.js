'use client';

import dynamic from 'next/dynamic';
import Dashboard from '../components/Dashboard';

// Use dynamic import with SSR disabled to prevent the component from being pre-rendered
const DashboardWithNoSSR = dynamic(() => Promise.resolve(Dashboard), {
  ssr: false
});

export default function DashboardPage() {
  return <DashboardWithNoSSR />;
}