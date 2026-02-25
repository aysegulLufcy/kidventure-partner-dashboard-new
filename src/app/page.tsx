'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check for auth tokens in URL hash (from Supabase email links)
    const hash = window.location.hash;
    
    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const type = hashParams.get('type');
      const accessToken = hashParams.get('access_token');
      
      if (accessToken) {
        if (type === 'invite' || type === 'signup' || type === 'magiclink') {
          // Redirect to accept-invite page with the hash
          router.replace(`/accept-invite${hash}`);
          return;
        } else if (type === 'recovery') {
          // Redirect to reset-password page with the hash
          router.replace(`/reset-password${hash}`);
          return;
        } else if (type === 'email_change') {
          // Redirect to verify-email page with the hash
          router.replace(`/verify-email${hash}`);
          return;
        }
      }
    }
    
    // Default: redirect to partner dashboard (auth check happens there)
    router.replace('/partner');
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-adventure-orange flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-xl">KV</span>
        </div>
        <div className="animate-pulse text-slate-500">Loading...</div>
      </div>
    </div>
  );
}