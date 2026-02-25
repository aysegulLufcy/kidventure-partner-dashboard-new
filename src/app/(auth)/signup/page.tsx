'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Card } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { User, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ stable token value
  const token = useMemo(() => searchParams.get('token'), [searchParams]);

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
    let cancelled = false;

    const verifyToken = async () => {
      setStatus('loading');
      setError(null);

      if (!token) {
        setError('No invitation token found.');
        setStatus('error');
        return;
      }

      const { data: application, error: appError } = await supabase
        .from('partner_applications')
        .select('id,contact_email,user_id') // ✅ don’t pull *
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

    // ✅ if for some reason state isn’t ready, don’t let them submit
    if (!inviteEmail || !applicationId) {
      setError('Invitation is still being verified. Please refresh the page and try again.');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) return setError('Please enter your full name');

    const passwordError = validatePassword(password);
    if (passwordError) return setError(passwordError);

    if (password !== confirmPassword) return setError('Passwords do not match');

    setIsLoading(true);

    try {
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

      if (signUpData.user) {
        const { error: updateErr } = await supabase
          .from('partner_applications')
          .update({ user_id: signUpData.user.id, invite_token: null })
          .eq('id', applicationId);

        if (updateErr) {
          // optional: show a better message
          console.error('Failed to update partner_applications:', updateErr);
        }
      }

      setStatus('success');
      setTimeout(() => router.push('/partner'), 2000);
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ...rest of your render stays the same
}