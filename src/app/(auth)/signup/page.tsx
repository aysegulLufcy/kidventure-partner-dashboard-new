'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Verify the invite token with Supabase
      supabase.auth.verifyOtp({
        token_hash: token,
        type: 'invite',
      }).then(({ data, error }) => {
        if (error) {
          console.error('Token verification failed:', error);
          setError(error.message);
          setTimeout(() => {
            router.replace('/login?error=invalid_token');
          }, 2000);
        } else {
          // Token verified, session created - redirect to accept-invite to set password
          router.replace('/accept-invite');
        }
      });
    } else {
      router.replace('/login');
    }
  }, [searchParams, router]);

  return (
    <Card className="p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-explorer-teal/10 flex items-center justify-center mx-auto mb-4">
        <Loader2 className="w-8 h-8 text-explorer-teal animate-spin" />
      </div>
      <h2 className="text-2xl font-bold text-deep-play-blue mb-2">
        {error ? 'Verification Failed' : 'Verifying invitation...'}
      </h2>
      <p className="text-slate-500">
        {error || 'Please wait while we verify your invitation.'}
      </p>
    </Card>
  );
}