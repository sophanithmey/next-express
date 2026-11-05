import React from 'react';
import { expressApiClient } from '@/server/api/express-api-client';
import { sessionService } from '@/server/auth/session-service';
import { RecipientsManager } from '@/features/recipients/components/recipients-manager';

export default async function RecipientsPage() {
  const session = await sessionService.getSession();
  const recipients = await expressApiClient.searchRecipients('', session?.accessToken);

  return <RecipientsManager initialRecipients={recipients} />;
}

