'use client';

import { useState } from 'react';
import { DisputeReason } from '@/types';
import { Button, Input, Select, Modal, ModalFooter } from '@/components/ui';
import { createDispute } from '@/lib/api';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  onSuccess?: () => void;
}

const reasonOptions = [
  { value: 'wrong_checkin_time', label: 'Wrong check-in time recorded' },
  { value: 'technical_issue', label: 'Technical issue with scanner' },
  { value: 'duplicate_entry', label: 'Duplicate entry created' },
  { value: 'incorrect_credits', label: 'Incorrect credits charged' },
  { value: 'other', label: 'Other (explain in notes)' },
];

export function DisputeModal({
  isOpen,
  onClose,
  bookingId,
  onSuccess,
}: DisputeModalProps) {
  const [reason, setReason] = useState<DisputeReason | ''>('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select a reason');
      return;
    }
    if (reason === 'other' && !notes.trim()) {
      setError('Please provide details in the notes field');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await createDispute({
        bookingId,
        reason: reason as DisputeReason,
        notes: notes.trim(),
      });

      if (result.error) {
        setError(result.error);
      } else {
        onSuccess?.();
        onClose();
        // Reset form
        setReason('');
        setNotes('');
      }
    } catch (err) {
      setError('Failed to submit dispute. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setNotes('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Request Dispute"
      description="Submit a dispute for review by KidVenture Pass. Our team will investigate and respond within 2 business days."
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Select
            label="Reason for Dispute"
            name="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value as DisputeReason)}
            options={reasonOptions}
            placeholder="Select a reason..."
            error={error && !reason ? 'Please select a reason' : undefined}
          />

          <div>
            <label className="block text-sm font-medium text-deep-play-blue mb-1.5">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide any additional details that may help us investigate..."
              rows={4}
              className="
                w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5
                text-deep-play-blue placeholder:text-slate-400
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-explorer-teal focus:border-explorer-teal
                hover:border-slate-300
              "
            />
            {error && reason === 'other' && !notes.trim() && (
              <p className="mt-1.5 text-sm text-red-600">
                Please provide details in the notes field
              </p>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs text-slate-500 mb-2">
              <strong>Booking ID:</strong>{' '}
              <span className="font-mono">{bookingId}</span>
            </p>
            <p className="text-xs text-slate-500">
              File upload for supporting documents coming soon.
            </p>
          </div>

          {error && reason && (reason !== 'other' || notes.trim()) && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Submit Dispute
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
