'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Card } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { User, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'form' | 'success' | 'error'>('loading');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);

  useEffect(() => {
    const verifyAndSetup = async () => {
      // Check for token in URL query params
      const token = searchParams.get('token');
      
      if (token) {
        // Verify the invite token
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'invite',
        });

        if (verifyError) {
          console.error('Token verification failed:', verifyError);
          setError(verifyError.message);
          setStatus('error');
          return;
        }

        if (data.session?.user) {
          setInviteEmail(data.session.user.email || null);
          setOrgName(data.session.user.user_metadata?.org_name || 'your organization');
          setStatus('form');
          return;
        }
      }

      // Check for existing session (maybe already verified)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setInviteEmail(session.user.email || null);
        setOrgName(session.user.user_metadata?.org_name || 'your organization');
        setStatus('form');
        return;
      }

      // Check for hash params (alternative Supabase flow)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');

      if (accessToken) {
        const { data: { session: hashSession } } = await supabase.auth.getSession();
        
        if (hashSession?.user) {
          setInviteEmail(hashSession.user.email || null);
          setOrgName(hashSession.user.user_metadata?.org_name || 'your organization');
          setStatus('form');
          return;
        }
      }

      // No valid token found
      setError('No invitation token found. Please use the link from your invitation email.');
      setStatus('error');
    };

    verifyAndSetup();
  }, [searchParams]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your full name');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setStatus('success');
      
      setTimeout(() => {
        router.push('/partner');
      }, 2000);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-explorer-teal/10 flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-explorer-teal animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-deep-play-blue mb-2">Verifying invitation...</h2>
        <p className="text-slate-500">Please wait while we verify your invitation.</p>
      </Card>
    );
  }

  if (status === 'success') {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-deep-play-blue mb-2">Account created!</h2>
        <p className="text-slate-500 mb-6">
          Welcome to the team! Redirecting you to the dashboard...
        </p>
        <Link href="/partner">
          <Button className="w-full">Go to Dashboard</Button>
        </Link>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-deep-play-blue mb-2">Invalid invitation</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <div className="space-y-3">
          <Link href="/login">
            <Button variant="outline" className="w-full">Go to sign in</Button>
          </Link>
          <p className="text-sm text-slate-400">
            Need help?{' '}
            <a href="mailto:support@kidventurepass.com" className="text-explorer-teal hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-deep-play-blue">Create your account</h2>
        <p className="text-slate-500 mt-1">
          You&apos;ve been invited to join <span className="font-medium">{orgName}</span>
        </p>
        {inviteEmail && (
          <p className="text-sm text-slate-400 mt-1">{inviteEmail}</p>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            required
            leftElement={<User className="w-4 h-4" />}
            disabled={isLoading}
          />
          <Input
            label="Last Name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            required
            disabled={isLoading}
          />
        </div>

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          leftElement={<Lock className="w-4 h-4" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          hint="Min 8 characters with uppercase, lowercase, and number"
          disabled={isLoading}
        />

        <Input
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
          leftElement={<Lock className="w-4 h-4" />}
          disabled={isLoading}
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Create account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-slate-400">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-explorer-teal hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-explorer-teal hover:underline">Privacy Policy</a>
        </p>
      </div>
    </Card>
  );
}