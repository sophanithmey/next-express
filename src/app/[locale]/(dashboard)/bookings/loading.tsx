import React from 'react';

export default function BookingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="space-y-2">
          <div className="h-7 w-56 bg-slate-200 rounded-lg" />
          <div className="h-4 w-72 bg-slate-100 rounded-md" />
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded-xl" />
      </div>

      {/* 4 Metric Stats Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-7 w-7 bg-slate-100 rounded-lg" />
            </div>
            <div className="h-7 w-24 bg-slate-200 rounded-md" />
            <div className="h-3 w-32 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Filter Tabs & Search Bar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-20 bg-slate-200 rounded-xl" />
          ))}
        </div>
        <div className="h-9 w-full sm:w-64 bg-slate-200 rounded-xl" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="h-10 bg-slate-100 rounded-lg w-full" />
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="h-12 bg-slate-50 rounded-lg w-full" />
        ))}
      </div>
    </div>
  );
}

