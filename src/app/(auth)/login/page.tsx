'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Please verify your email address before logging in.');
        } else {
          setError(signInError.message);
        }
        return;
      }

      if (data.user) {
        // Check if user has partner role
        const role = data.user.app_metadata?.role || data.user.user_metadata?.role;
        
        if (role !== 'partner_staff' && role !== 'partner_manager') {
          await supabase.auth.signOut();
          setError('Access denied. This dashboard is for partner accounts only.');
          return;
        }

        router.push('/partner');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo login for development
  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In demo mode, just redirect
    router.push('/partner');
  };

  const isDemoMode = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

  return (
    <Card className="p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-deep-play-blue">Welcome back</h2>
        <p className="text-slate-500 mt-1">Sign in to your partner account</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourstudio.com"
          required
          leftElement={<Mail className="w-4 h-4" />}
          disabled={isLoading}
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          leftElement={<Lock className="w-4 h-4" />}
          disabled={isLoading}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-explorer-teal focus:ring-explorer-teal"
            />
            <span className="text-sm text-slate-600">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-explorer-teal hover:text-kvp-teal-600 font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign In
        </Button>

        {isDemoMode && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleDemoLogin}
            disabled={isLoading}
          >
            Demo Login (Skip Auth)
          </Button>
        )}
      </form>

      <div className="mt-6 pt-6 border-t border-slate-200 text-center">
        <p className="text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link
            href="mailto:partners@kidventurepass.com"
            className="text-explorer-teal hover:text-kvp-teal-600 font-medium"
          >
            Contact us to become a partner
          </Link>
        </p>
      </div>
    </Card>
  );
}
