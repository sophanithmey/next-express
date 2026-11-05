import Link from 'next/link';
import { Button } from '@/components/atoms/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-4">
        <FileQuestion className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">Page Not Found</h2>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">
        The requested delivery page, tracking link, or resource does not exist.
      </p>
      <div className="mt-6">
        <Link href="/dashboard">
          <Button variant="primary" size="md">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
