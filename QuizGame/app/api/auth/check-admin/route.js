import { NextResponse } from 'next/server';
import { checkIfUserIsAdminServer } from '../../../../firebase/admin.js';

/**
 * Server-side API route to check if the current user is an admin
 * This uses Firebase Admin SDK to check admin status
 */
export async function POST(request) {
  try {
    const { userId } = await request.json();
    
    console.log('[API] Checking admin status for user ID:', userId);
    
    if (!userId) {
      console.log('[API] No user ID provided');
      return NextResponse.json({ isAdmin: false });
    }
    
    // Check if the user is an admin using Firebase Admin SDK
    console.log('[API] Calling checkIfUserIsAdminServer function');
    const isAdmin = await checkIfUserIsAdminServer(userId);
    console.log('[API] Admin check result:', isAdmin);
    
    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('[API] Error checking admin status:', error);
    return NextResponse.json({ isAdmin: false, error: 'Failed to verify admin status' }, { status: 500 });
  }
}