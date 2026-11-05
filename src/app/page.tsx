import { redirect } from 'next/navigation';
import { sessionService } from '@/server/auth/session-service';

export default async function HomePage() {
  const user = await sessionService.getCurrentUser();

  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
