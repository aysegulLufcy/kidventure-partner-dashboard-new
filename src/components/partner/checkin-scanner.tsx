'use client';

import { useState } from 'react';
import { CheckinResult } from '@/types';
import { Button, Input, Card } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/states';
import { submitCheckin } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ScanLine,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';

export function CheckinScanner() {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await submitCheckin(token.trim());
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setResult(response.data);
      }
    } catch (err) {
      setError('Failed to process check-in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setToken('');
    setResult(null);
    setError(null);
  };

  const getResultIcon = () => {
    if (!result) return null;
    switch (result.status) {
      case 'valid':
        return <CheckCircle2 className="w-16 h-16 text-emerald-500" />;
      case 'invalid':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'duplicate':
        return <AlertTriangle className="w-16 h-16 text-amber-500" />;
    }
  };

  const getResultBg = () => {
    if (!result) return 'bg-white';
    switch (result.status) {
      case 'valid':
        return 'bg-emerald-50 border-emerald-200';
      case 'invalid':
        return 'bg-red-50 border-red-200';
      case 'duplicate':
        return 'bg-amber-50 border-amber-200';
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Scanner Input */}
      <Card className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-explorer-teal/10">
            <ScanLine className="w-5 h-5 text-explorer-teal" />
          </div>
          <div>
            <h2 className="font-semibold text-deep-play-blue">Check-in Scanner</h2>
            <p className="text-sm text-slate-500">
              Scan QR code or paste booking token
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            placeholder="Paste or scan booking token..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="font-mono text-sm"
            disabled={isLoading}
          />
          <div className="flex gap-3 mt-4">
            <Button
              type="submit"
              className="flex-1"
              isLoading={isLoading}
              disabled={!token.trim()}
            >
              Validate & Check In
            </Button>
            {(result || error) && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Reset
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="flex flex-col items-center py-8">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-slate-500">Validating booking...</p>
        </Card>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card className="border-2 border-red-200 bg-red-50">
          <div className="flex flex-col items-center text-center py-4">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Check-in Failed
            </h3>
            <p className="text-red-600">{error}</p>
          </div>
        </Card>
      )}

      {/* Result Display */}
      {result && !isLoading && (
        <Card className={`border-2 ${getResultBg()}`}>
          <div className="flex flex-col items-center text-center py-4">
            {getResultIcon()}
            
            <h3 className="text-lg font-semibold mt-4 mb-2">
              {result.status === 'valid' && (
                <span className="text-emerald-800">Check-in Successful!</span>
              )}
              {result.status === 'invalid' && (
                <span className="text-red-800">Invalid Booking</span>
              )}
              {result.status === 'duplicate' && (
                <span className="text-amber-800">Already Checked In</span>
              )}
            </h3>
            
            <p className="text-slate-600 mb-4">{result.message}</p>

            {result.booking && (
              <div className="w-full bg-white rounded-xl p-4 text-left border border-slate-200">
                <h4 className="text-sm font-medium text-slate-500 mb-3">
                  Booking Details
                </h4>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-slate-500">Class</dt>
                    <dd className="text-sm font-medium text-deep-play-blue">
                      {result.booking.classTitle}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-slate-500">Session Time</dt>
                    <dd className="text-sm font-medium text-deep-play-blue">
                      {formatDateTime(result.booking.startAt)}
                    </dd>
                  </div>
                  {result.booking.kidNameMasked && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-slate-500">Child</dt>
                      <dd className="text-sm font-medium text-deep-play-blue">
                        {result.booking.kidNameMasked}
                      </dd>
                    </div>
                  )}
                  {result.booking.parentNameMasked && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-slate-500">Parent</dt>
                      <dd className="text-sm font-medium text-deep-play-blue">
                        {result.booking.parentNameMasked}
                      </dd>
                    </div>
                  )}
                  {result.checkedInAt && (
                    <div className="flex justify-between pt-2 border-t border-slate-100">
                      <dt className="text-sm text-slate-500">Checked in at</dt>
                      <dd className="text-sm font-medium text-explorer-teal">
                        {formatDateTime(result.checkedInAt)}
                      </dd>
                    </div>
                  )}
                </dl>
                <p className="text-xs text-slate-400 mt-3 font-mono">
                  Booking ID: {result.booking.id}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Help Link */}
      <div className="mt-6 text-center">
        <a
          href="mailto:support@kidventurepass.com?subject=Check-in%20Issue"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-explorer-teal transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          Having trouble? Contact support
        </a>
      </div>
    </div>
  );
}
