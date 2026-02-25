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
  const [applicationId, setApplicationId] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setError('No invitation token found.');
        setStatus('error');
        return;
      }

      // Verify token against partner_applications table
      const { data: application, error: appError } = await supabase
        .from('partner_applications')
        .select('*')
        .eq('invite_token', token)
        .single();

      if (appError || !application) {
        console.error('Token verification failed:', appError);
        setError('Invalid or expired invitation link.');
        setStatus('error');
        return;
      }

      // Check if already signed up
      if (application.user_id) {
        setError('This invitation has already been used.');
        setStatus('error');
        return;
      }

      setInviteEmail(application.email);
      setApplicationId(application.id);
      setStatus('form');
    };

    verifyToken();
  }, [searchParams]);

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

    if (!inviteEmail || !applicationId) {
      setError('Invalid invitation state');
      return;
    }

    setIsLoading(true);

    try {
      // Create the user account with Supabase
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

      // Update the application with user_id
      if (signUpData.user) {
        await supabase
          .from('partner_applications')
          .update({ 
            user_id: signUpData.user.id,
            invite_token: null // Clear token after use
          })
          .eq('id', applicationId);
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
        <p className="text-slate-500">Please wait.</p>
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
        <p className="text-slate-500 mb-6">Redirecting to dashboard...</p>
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
        <Link href="/login">
          <Button variant="outline" className="w-full">Go to sign in</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-deep-play-blue">Create your account</h2>
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
    </Card>
  );
}