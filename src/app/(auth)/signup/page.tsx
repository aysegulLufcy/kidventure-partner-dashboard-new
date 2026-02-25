'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Verifying invitation...');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      router.replace('/login');
      return;
    }

    const verifyToken = async () => {
      // Try different token types
      const tokenTypes = ['invite', 'signup', 'magiclink'] as const;
      
      for (const type of tokenTypes) {
        setStatus(`Trying ${type}...`);
        
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type,
        });
        
        if (!error && data.session) {
          console.log('Success with type:', type);
          router.replace('/accept-invite');
          return;
        }
        
        console.log(`${type} failed:`, error?.message);
      }
      
      // All types failed - show error
      setStatus('Invalid or expired invitation link');
      setTimeout(() => {
        router.replace('/login?error=invalid_token');
      }, 3000);
    };

    verifyToken();
  }, [searchParams, router]);

  return (
    <Card className="p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-explorer-teal/10 flex items-center justify-center mx-auto mb-4">
        <Loader2 className="w-8 h-8 text-explorer-teal animate-spin" />
      </div>
      <h2 className="text-2xl font-bold text-deep-play-blue mb-2">
        {status}
      </h2>
    </Card>
  );
}