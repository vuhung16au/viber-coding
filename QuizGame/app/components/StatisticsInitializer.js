'use client';

import { useEffect } from 'react';
import { scheduleStatisticsCleanup } from '@/app/firebase/statistics';

// This component initializes the statistics system when the app loads
export function StatisticsInitializer() {
  useEffect(() => {
    // Initialize statistics system - schedule cleanup to run periodically
    scheduleStatisticsCleanup();
    
    console.log('Statistics system initialized');
    
    // No cleanup needed for this effect as the interval will be cleaned up
    // automatically when the app is closed
  }, []); // Empty dependency array ensures this runs only once on mount

  // This component doesn't render anything
  return null;
}

export default StatisticsInitializer;