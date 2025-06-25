// components/admin/SubscriptionStatusDisplay.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SubscriptionStatusDisplayProps {
  planLevel?: string | null;
  subscriptionStatus?: string | null;
  subscriptionEndsAt?: string | null; // ISO date string or formatted date
}

const SubscriptionStatusDisplay: React.FC<SubscriptionStatusDisplayProps> = ({
  planLevel,
  subscriptionStatus,
  subscriptionEndsAt,
}) => {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      console.error("Failed to parse date:", dateString, e);
      return 'Invalid Date';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p><strong>Plan:</strong> {planLevel || 'N/A'}</p>
        <p><strong>Status:</strong> <span className={`capitalize ${subscriptionStatus === 'active' ? 'text-green-600' : 'text-red-600'}`}>{subscriptionStatus || 'N/A'}</span></p>
        {subscriptionEndsAt && (subscriptionStatus === 'active' || subscriptionStatus === 'trialing') && (
          <p><strong>Current period ends on:</strong> {formatDate(subscriptionEndsAt)}</p>
        )}
        {subscriptionStatus === 'canceled' && subscriptionEndsAt && (
          <p><strong>Access ends on:</strong> {formatDate(subscriptionEndsAt)}</p>
        )}
         {subscriptionStatus === 'past_due' && (
          <p className="text-orange-500"><strong>Your subscription is past due. Please update your payment method.</strong></p>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatusDisplay;
