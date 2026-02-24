'use client';

import { useEffect, useState } from 'react';
import { PartnerOrganization, StaffMember } from '@/types';
import { getPartnerOrganization, updatePartnerOrganization, inviteStaff, removeStaffAccess } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { PageHeader } from '@/components/layout';
import { Card, Button, Input, Select, Badge, Modal, ModalFooter } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/ui/states';
import {
  Building2,
  MapPin,
  Users,
  CreditCard,
  Edit2,
  Plus,
  Trash2,
  Mail,
  CheckCircle2,
  Clock,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

export default function SettingsPage() {
  const { isManager } = useAuth();
  const [org, setOrg] = useState<PartnerOrganization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'staff' | 'manager'>('staff');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const fetchOrg = async () => {
    setIsLoading(true);
    setError(null);

    const result = await getPartnerOrganization();

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setOrg(result.data);
      setDisplayName(result.data.displayName);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrg();
  }, []);

  const handleSaveName = async () => {
    if (!displayName.trim()) return;
    setIsSavingName(true);

    const result = await updatePartnerOrganization({ displayName: displayName.trim() });

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setOrg(result.data);
      setIsEditingName(false);
    }

    setIsSavingName(false);
  };

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      setInviteError('Please enter an email address');
      return;
    }

    setIsInviting(true);
    setInviteError(null);

    const result = await inviteStaff({
      email: inviteEmail.trim(),
      role: inviteRole,
    });

    if (result.error) {
      setInviteError(result.error);
    } else {
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteRole('staff');
      fetchOrg();
    }

    setIsInviting(false);
  };

  const handleRemoveStaff = async (staff: StaffMember) => {
    if (!confirm(`Are you sure you want to remove ${staff.email}?`)) return;

    const result = await removeStaffAccess(staff.id);

    if (result.error) {
      setError(result.error);
    } else {
      fetchOrg();
    }
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Settings" />
        <LoadingState message="Loading settings..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Settings" />
        <ErrorState message={error} onRetry={fetchOrg} />
      </div>
    );
  }

  if (!org) return null;

  const getStripeStatusInfo = () => {
    switch (org.stripeConnectStatus) {
      case 'connected':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          title: 'Stripe Connected',
          description: 'Your account is set up to receive payouts.',
          showAction: false,
        };
      case 'pending_verification':
        return {
          icon: <Clock className="w-5 h-5 text-amber-600" />,
          title: 'Verification Pending',
          description: 'Stripe is reviewing your account information.',
          showAction: true,
        };
      case 'action_needed':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
          title: 'Action Required',
          description: 'Please complete your Stripe account setup to receive payouts.',
          showAction: true,
        };
      default:
        return {
          icon: <CreditCard className="w-5 h-5 text-slate-400" />,
          title: 'Not Connected',
          description: 'Connect Stripe to start receiving payouts.',
          showAction: true,
        };
    }
  };

  const stripeInfo = getStripeStatusInfo();

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Settings"
        description="Manage your organization profile and team."
      />

      <div className="space-y-6">
        {/* Organization Profile */}
        <Card>
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-xl bg-explorer-teal/10 text-explorer-teal">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-deep-play-blue">
                Organization Profile
              </h2>
              <p className="text-sm text-slate-500">
                Manage your studio&apos;s display information.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-500">Display Name</p>
                {isEditingName ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-64"
                    />
                    <Button size="sm" onClick={handleSaveName} isLoading={isSavingName}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsEditingName(false);
                        setDisplayName(org.displayName);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <p className="text-deep-play-blue">{org.displayName}</p>
                )}
              </div>
              {!isEditingName && isManager && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingName(true)}
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Edit
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-500">Legal Name</p>
                <p className="text-deep-play-blue">{org.legalName}</p>
              </div>
              <Badge size="sm">Read-only</Badge>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-slate-500">Organization ID</p>
                <p className="text-deep-play-blue font-mono text-sm">{org.id}</p>
              </div>
              <Badge size="sm">Read-only</Badge>
            </div>
          </div>
        </Card>

        {/* Locations */}
        <Card>
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-xl bg-adventure-orange/10 text-adventure-orange">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-deep-play-blue">Locations</h2>
              <p className="text-sm text-slate-500">
                Your studio locations where classes are held.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {org.locations.map((location) => (
              <div
                key={location.id}
                className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl"
              >
                <div>
                  <p className="font-medium text-deep-play-blue">{location.name}</p>
                  <p className="text-sm text-slate-500">{location.address}</p>
                </div>
                <Badge variant="status" status={location.isActive ? 'active' : 'inactive'} />
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400 mt-4">
            Contact KidVenture Pass support to add or modify locations.
          </p>
        </Card>

        {/* Staff Management */}
        <Card>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-deep-play-blue/10 text-deep-play-blue">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-deep-play-blue">Staff Accounts</h2>
                <p className="text-sm text-slate-500">
                  Manage who can access your partner dashboard.
                </p>
              </div>
            </div>
            {isManager && (
              <Button onClick={() => setIsInviteOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
                Invite Staff
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {org.staff.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-explorer-teal/20 flex items-center justify-center">
                    <span className="text-explorer-teal font-semibold">
                      {member.firstName?.[0] || member.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-deep-play-blue">
                      {member.firstName && member.lastName
                        ? `${member.firstName} ${member.lastName}`
                        : member.email}
                    </p>
                    <p className="text-sm text-slate-500">
                      {member.email} • {member.role === 'manager' ? 'Manager' : 'Staff'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="status" status={member.status} size="sm" />
                  {isManager && member.status !== 'removed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveStaff(member)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Stripe Connect Status */}
        <Card>
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-xl bg-slate-100 text-slate-600">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-deep-play-blue">Payout Setup</h2>
              <p className="text-sm text-slate-500">
                Connect your Stripe account to receive payouts.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between py-4 px-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              {stripeInfo.icon}
              <div>
                <p className="font-medium text-deep-play-blue">{stripeInfo.title}</p>
                <p className="text-sm text-slate-500">{stripeInfo.description}</p>
              </div>
            </div>
            {stripeInfo.showAction && (
              <Button variant="secondary" rightIcon={<ExternalLink className="w-4 h-4" />}>
                Complete Setup
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Invite Staff Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => {
          setIsInviteOpen(false);
          setInviteEmail('');
          setInviteRole('staff');
          setInviteError(null);
        }}
        title="Invite Staff Member"
        description="Send an invitation to join your partner dashboard."
      >
        <form onSubmit={handleInviteStaff}>
          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@yourstudio.com"
              error={inviteError || undefined}
              leftElement={<Mail className="w-4 h-4" />}
            />
            <Select
              label="Role"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'staff' | 'manager')}
              options={[
                { value: 'staff', label: 'Staff - Can scan check-ins and view sessions' },
                { value: 'manager', label: 'Manager - Full access including settings' },
              ]}
            />
          </div>
          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isInviting}>
              Send Invitation
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
