import { Spinner } from '@/components/atoms/spinner';

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Spinner size="lg" />
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Loading...
      </span>
    </div>
  );
}
