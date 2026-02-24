'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, AlertCircle, Mail, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'resent'>('verifying');
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      // Check if this is a verification callback
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');

      if (type === 'signup' || type === 'email_change') {
        // Email verification successful via hash params
        setStatus('success');
        
        // Redirect after delay
        setTimeout(() => {
          router.push('/partner');
        }, 3000);
        return;
      }

      // Check current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.email_confirmed_at) {
        setStatus('success');
        setTimeout(() => {
          router.push('/partner');
        }, 2000);
      } else if (session?.user?.email) {
        setEmail(session.user.email);
        setStatus('error');
        setError('Your email has not been verified yet. Please check your inbox.');
      } else {
        setStatus('error');
        setError('No verification token found. Please request a new verification email.');
      }
    };

    verifyEmail();
  }, [router]);

  const handleResendVerification = async () => {
    if (!email) return;

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (resendError) {
        setError(resendError.message);
        return;
      }

      setStatus('resent');
    } catch (err) {
      setError('Failed to resend verification email. Please try again.');
    }
  };

  if (status === 'verifying') {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-explorer-teal/10 flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-explorer-teal animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-deep-play-blue mb-2">Verifying your email...</h2>
        <p className="text-slate-500">Please wait while we verify your email address.</p>
      </Card>
    );
  }

  if (status === 'success') {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-deep-play-blue mb-2">Email verified!</h2>
        <p className="text-slate-500 mb-6">
          Your email has been successfully verified. Redirecting you to the dashboard...
        </p>
        <Link href="/partner">
          <Button className="w-full">Go to Dashboard</Button>
        </Link>
      </Card>
    );
  }

  if (status === 'resent') {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-explorer-teal/10 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-explorer-teal" />
        </div>
        <h2 className="text-2xl font-bold text-deep-play-blue mb-2">Verification email sent!</h2>
        <p className="text-slate-500 mb-6">
          We&apos;ve sent a new verification email to{' '}
          <span className="font-medium text-deep-play-blue">{email}</span>.
          Please check your inbox and click the verification link.
        </p>
        <Link href="/login">
          <Button variant="outline" className="w-full">Back to sign in</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-deep-play-blue mb-2">Verification failed</h2>
      <p className="text-slate-500 mb-6">{error}</p>
      
      <div className="space-y-3">
        {email && (
          <Button onClick={handleResendVerification} className="w-full">
            Resend verification email
          </Button>
        )}
        <Link href="/login">
          <Button variant="outline" className="w-full">Back to sign in</Button>
        </Link>
      </div>
    </Card>
  );
}
