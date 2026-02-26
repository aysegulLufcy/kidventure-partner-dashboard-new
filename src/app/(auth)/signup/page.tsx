'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Card } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

type Status = 'loading' | 'form' | 'success' | 'error';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ depend on the token string (not the searchParams object)
  const token = useMemo(() => searchParams.get('token'), [searchParams]);

  const [status, setStatus] = useState<Status>('loading');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // invite state
  const [inviteEmail, setInviteEmail] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  // ✅ verify token once (and when token changes)
  useEffect(() => {
    let cancelled = false;

    const verifyToken = async () => {
      setStatus('loading');
      setError(null);
      setInviteEmail(null);
      setApplicationId(null);

      if (!token) {
        setError('No invitation token found.');
        setStatus('error');
        return;
      }

      const { data: application, error: appError } = await supabase
        .from('partner_applications')
        .select('id, contact_email, user_id')
        .eq('invite_token', token)
        .single();

      if (cancelled) return;

      if (appError || !application) {
        console.error('Token verification failed:', appError);
        setError('Invalid or expired invitation link.');
        setStatus('error');
        return;
      }

      if (application.user_id) {
        setError('This invitation has already been used.');
        setStatus('error');
        return;
      }

      if (!application.contact_email) {
        setError('This invitation is missing an email address. Please contact support.');
        setStatus('error');
        return;
      }

      setInviteEmail(application.contact_email);
      setApplicationId(String(application.id));
      setStatus('form');
    };

    verifyToken();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ✅ prevent submit until invite verified
    if (!inviteEmail || !applicationId || !token) {
      setError('Invitation is still being verified. Please refresh and try again.');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      // 1) Create auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: inviteEmail,
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            role: 'partner_manager',
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      const newUserId = signUpData.user?.id;
      if (!newUserId) {
        // This can happen if email confirmation is enabled and user object is not returned
        // Still mark invite as used only after we can associate a user_id (safer).
        setError(
          'Account created, but email confirmation may be required before activating this invite. Please check your email.'
        );
        setStatus('error');
        return;
      }

      // 2) ✅ Atomically mark invite as used (prevents reuse / race condition)
      const { data: updated, error: updateErr } = await supabase
        .from('partner_applications')
        .update({ user_id: newUserId, invite_token: null })
        .eq('id', applicationId)
        .eq('invite_token', token) // only update if token still matches
        .is('user_id', null) // only update if not already used
        .select('id')
        .single();

      if (updateErr || !updated) {
        console.error('Failed to lock invite / update partner_applications:', updateErr);

        // Optional: surface a user-friendly message
        setError(
          'Your account was created, but this invite may have already been used. Please contact support.'
        );
        setStatus('error');
        return;
      }

      setStatus('success');
      setTimeout(() => router.push('/partner'), 1500);
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------
  // UI
  // -----------------------

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8 text-center w-full max-w-md">
          <div className="w-16 h-16 rounded-full bg-explorer-teal/10 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-explorer-teal animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-deep-play-blue mb-2">
            Verifying invitation...
          </h2>
          <p className="text-slate-500">Please wait.</p>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8 text-center w-full max-w-md">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-deep-play-blue mb-2">Account created!</h2>
          <p className="text-slate-500 mb-6">Redirecting to dashboard...</p>
          <Link href="/partner">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8 text-center w-full max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-deep-play-blue mb-2">Invitation error</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Go to sign in
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // status === 'form'
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-deep-play-blue">Create your account</h2>
          {inviteEmail && <p className="text-sm text-slate-400 mt-1">{inviteEmail}</p>}
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
                onClick={() => setShowPassword((s) => !s)}
                className="text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
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
      </Card>
    </div>
  );
}