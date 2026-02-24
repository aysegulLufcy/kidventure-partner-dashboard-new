'use client';

import { useState, useEffect } from 'react';
import { Session, CreateSessionRequest, UpdateSessionRequest, ClassTemplate } from '@/types';
import { Button, Input, Select, Modal, ModalFooter } from '@/components/ui';
import { getClassTemplates } from '@/lib/api';
import { mockPartnerOrganization } from '@/lib/mock-data';
import { addWeeks, format } from 'date-fns';
import { Repeat, CalendarDays, Info } from 'lucide-react';

type RecurrenceType = 'none' | 'daily' | 'weekly' | 'custom';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

interface SessionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSessionRequest | UpdateSessionRequest) => Promise<void>;
  session?: Session | null;
  isLoading?: boolean;
}

export function SessionForm({
  isOpen,
  onClose,
  onSubmit,
  session,
  isLoading = false,
}: SessionFormProps) {
  const isEdit = !!session;
  const [templates, setTemplates] = useState<ClassTemplate[]>([]);
  const [formData, setFormData] = useState({
    classTemplateId: '',
    locationId: '',
    date: '',
    startTime: '',
    endTime: '',
    capacityTotal: 10,
    capacityKvp: 3,
    status: 'open' as 'open' | 'closed',
  });
  const [recurrence, setRecurrence] = useState<{
    type: RecurrenceType;
    endDate: string;
    daysOfWeek: number[];
    interval: number;
  }>({
    type: 'none',
    endDate: '',
    daysOfWeek: [],
    interval: 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load class templates
  useEffect(() => {
    async function loadTemplates() {
      const result = await getClassTemplates();
      if (result.data) {
        setTemplates(result.data);
      }
    }
    loadTemplates();
  }, []);

  // Populate form for edit
  useEffect(() => {
    if (session) {
      const startDate = new Date(session.startAt);
      const endDate = new Date(session.endAt);
      setFormData({
        classTemplateId: session.classTemplateId,
        locationId: session.locationId,
        date: startDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5),
        capacityTotal: session.capacityTotal,
        capacityKvp: session.capacityKvp,
        status: session.status as 'open' | 'closed',
      });
      // Reset recurrence for edit mode (can't edit recurrence)
      setRecurrence({
        type: 'none',
        endDate: '',
        daysOfWeek: [],
        interval: 1,
      });
    } else {
      // Reset form for create
      const today = new Date();
      const defaultEndDate = format(addWeeks(today, 4), 'yyyy-MM-dd');
      setFormData({
        classTemplateId: '',
        locationId: '',
        date: today.toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        capacityTotal: 10,
        capacityKvp: 3,
        status: 'open',
      });
      setRecurrence({
        type: 'none',
        endDate: defaultEndDate,
        daysOfWeek: [],
        interval: 1,
      });
    }
    setErrors({});
  }, [session, isOpen]);

  // Auto-select day of week when date changes and recurrence is weekly/custom
  useEffect(() => {
    if (formData.date && recurrence.type === 'weekly') {
      const dayOfWeek = new Date(formData.date + 'T00:00:00').getDay();
      setRecurrence(prev => ({
        ...prev,
        daysOfWeek: [dayOfWeek],
      }));
    }
  }, [formData.date, recurrence.type]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isEdit) {
      if (!formData.classTemplateId) {
        newErrors.classTemplateId = 'Please select a class template';
      }
      if (!formData.locationId) {
        newErrors.locationId = 'Please select a location';
      }
      if (!formData.date) {
        newErrors.date = 'Please select a date';
      }
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Please enter a start time';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'Please enter an end time';
    }
    if (formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    if (formData.capacityTotal < 1) {
      newErrors.capacityTotal = 'Total capacity must be at least 1';
    }
    if (formData.capacityKvp < 0) {
      newErrors.capacityKvp = 'KVP capacity cannot be negative';
    }
    if (formData.capacityKvp > formData.capacityTotal) {
      newErrors.capacityKvp = 'KVP capacity cannot exceed total capacity';
    }

    // Validate recurrence
    if (recurrence.type !== 'none') {
      if (!recurrence.endDate) {
        newErrors.endDate = 'Please select an end date for the recurring sessions';
      } else if (recurrence.endDate <= formData.date) {
        newErrors.endDate = 'End date must be after the start date';
      }
      if (recurrence.type === 'custom' && recurrence.daysOfWeek.length === 0) {
        newErrors.daysOfWeek = 'Please select at least one day of the week';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit) {
      const updateData: UpdateSessionRequest = {
        startTime: formData.startTime,
        endTime: formData.endTime,
        capacityTotal: formData.capacityTotal,
        capacityKvp: formData.capacityKvp,
        status: formData.status,
      };
      await onSubmit(updateData);
    } else {
      const createData: CreateSessionRequest = {
        classTemplateId: formData.classTemplateId,
        locationId: formData.locationId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        capacityTotal: formData.capacityTotal,
        capacityKvp: formData.capacityKvp,
        recurrence: recurrence.type !== 'none' ? {
          type: recurrence.type,
          endDate: recurrence.endDate,
          daysOfWeek: recurrence.type === 'custom' ? recurrence.daysOfWeek : undefined,
          interval: recurrence.interval,
        } : undefined,
      };
      await onSubmit(createData);
    }
  };

  const toggleDayOfWeek = (day: number) => {
    setRecurrence(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day].sort((a, b) => a - b),
    }));
  };

  const getRecurrenceSummary = () => {
    if (recurrence.type === 'none') return null;
    
    const template = templates.find(t => t.id === formData.classTemplateId);
    const className = template?.title || 'This class';
    
    switch (recurrence.type) {
      case 'daily':
        return `${className} will repeat every ${recurrence.interval > 1 ? recurrence.interval + ' days' : 'day'} until ${format(new Date(recurrence.endDate + 'T00:00:00'), 'MMM d, yyyy')}`;
      case 'weekly':
        const dayName = DAYS_OF_WEEK.find(d => d.value === recurrence.daysOfWeek[0])?.label || '';
        return `${className} will repeat every ${recurrence.interval > 1 ? recurrence.interval + ' weeks on ' + dayName : dayName} until ${format(new Date(recurrence.endDate + 'T00:00:00'), 'MMM d, yyyy')}`;
      case 'custom':
        const selectedDays = recurrence.daysOfWeek
          .map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label)
          .join(', ');
        return `${className} will repeat on ${selectedDays} every ${recurrence.interval > 1 ? recurrence.interval + ' weeks' : 'week'} until ${format(new Date(recurrence.endDate + 'T00:00:00'), 'MMM d, yyyy')}`;
      default:
        return null;
    }
  };

  const locationOptions = mockPartnerOrganization.locations
    .filter(l => l.isActive)
    .map(l => ({ value: l.id, label: l.name }));

  const templateOptions = templates.map(t => ({
    value: t.id,
    label: t.title,
  }));

  const recurrenceOptions = [
    { value: 'none', label: 'Does not repeat' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'custom', label: 'Custom (select days)' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Session' : 'Create Session'}
      description={
        isEdit
          ? 'Update session details. Note: You cannot edit attendance or booking status here.'
          : 'Schedule a new class session for KidVenture Pass families.'
      }
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {!isEdit && (
            <>
              <Select
                label="Class Template"
                name="classTemplateId"
                value={formData.classTemplateId}
                onChange={(e) =>
                  setFormData({ ...formData, classTemplateId: e.target.value })
                }
                options={templateOptions}
                placeholder="Select a class..."
                error={errors.classTemplateId}
              />

              <Select
                label="Location"
                name="locationId"
                value={formData.locationId}
                onChange={(e) =>
                  setFormData({ ...formData, locationId: e.target.value })
                }
                options={locationOptions}
                placeholder="Select a location..."
                error={errors.locationId}
              />

              <Input
                label="Start Date"
                type="date"
                name="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                error={errors.date}
              />
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              error={errors.startTime}
            />
            <Input
              label="End Time"
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              error={errors.endTime}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Total Capacity"
              type="number"
              name="capacityTotal"
              min={1}
              value={formData.capacityTotal}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  capacityTotal: parseInt(e.target.value) || 0,
                })
              }
              hint="Maximum students in the class"
              error={errors.capacityTotal}
            />
            <Input
              label="KVP Capacity"
              type="number"
              name="capacityKvp"
              min={0}
              max={formData.capacityTotal}
              value={formData.capacityKvp}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  capacityKvp: parseInt(e.target.value) || 0,
                })
              }
              hint="Spots reserved for KVP members"
              error={errors.capacityKvp}
            />
          </div>

          {/* Recurrence Section - Only for new sessions */}
          {!isEdit && (
            <div className="border-t border-slate-200 pt-4 mt-4">
              <div className="flex items-center gap-2 mb-4">
                <Repeat className="w-5 h-5 text-explorer-teal" />
                <h3 className="font-medium text-deep-play-blue">Repeat Schedule</h3>
              </div>

              <Select
                label="Recurrence"
                name="recurrence"
                value={recurrence.type}
                onChange={(e) =>
                  setRecurrence({
                    ...recurrence,
                    type: e.target.value as RecurrenceType,
                    daysOfWeek: e.target.value === 'weekly' && formData.date
                      ? [new Date(formData.date + 'T00:00:00').getDay()]
                      : [],
                  })
                }
                options={recurrenceOptions}
              />

              {recurrence.type !== 'none' && (
                <div className="mt-4 space-y-4">
                  {/* Custom days selection */}
                  {recurrence.type === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-deep-play-blue mb-2">
                        Repeat on
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {DAYS_OF_WEEK.map((day) => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleDayOfWeek(day.value)}
                            className={`
                              w-12 h-10 rounded-lg text-sm font-medium transition-all
                              ${recurrence.daysOfWeek.includes(day.value)
                                ? 'bg-explorer-teal text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                            `}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                      {errors.daysOfWeek && (
                        <p className="mt-1.5 text-sm text-red-600">{errors.daysOfWeek}</p>
                      )}
                    </div>
                  )}

                  {/* Interval for daily/weekly */}
                  {(recurrence.type === 'daily' || recurrence.type === 'weekly' || recurrence.type === 'custom') && (
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label={`Repeat every`}
                        type="number"
                        min={1}
                        max={12}
                        value={recurrence.interval}
                        onChange={(e) =>
                          setRecurrence({
                            ...recurrence,
                            interval: parseInt(e.target.value) || 1,
                          })
                        }
                        hint={recurrence.type === 'daily' ? 'day(s)' : 'week(s)'}
                      />
                      <Input
                        label="Until"
                        type="date"
                        value={recurrence.endDate}
                        onChange={(e) =>
                          setRecurrence({
                            ...recurrence,
                            endDate: e.target.value,
                          })
                        }
                        error={errors.endDate}
                        min={formData.date}
                      />
                    </div>
                  )}

                  {/* Recurrence Summary */}
                  {getRecurrenceSummary() && (
                    <div className="flex items-start gap-2 p-3 bg-explorer-teal/5 rounded-xl border border-explorer-teal/20">
                      <CalendarDays className="w-5 h-5 text-explorer-teal flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-deep-play-blue">
                        {getRecurrenceSummary()}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {isEdit && (
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'open' | 'closed',
                })
              }
              options={[
                { value: 'open', label: 'Open for bookings' },
                { value: 'closed', label: 'Closed to new bookings' },
              ]}
            />
          )}

          {/* Info note for recurring sessions */}
          {!isEdit && recurrence.type !== 'none' && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                All recurring sessions will be created with the same time and capacity settings. 
                You can edit individual sessions later if needed.
              </p>
            </div>
          )}
        </div>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEdit ? 'Save Changes' : recurrence.type !== 'none' ? 'Create Sessions' : 'Create Session'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
