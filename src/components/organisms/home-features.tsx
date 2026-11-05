import React from 'react';
import { Zap, MapPin, Banknote, Share2, Repeat, Clock } from 'lucide-react';

export function HomeFeatures() {
  const features = [
    {
      title: '5-Step Rapid Dispatch',
      description:
        'Fill pickup, recipient, destination, item, and COD in under 60 seconds with streamlined keyboard and touch navigation.',
      icon: Zap,
      color: 'bg-amber-100 text-amber-700',
    },
    {
      title: 'Pinpoint GPS Map Drop',
      description:
        'Drag the pin to any exact alley, gate, or building entrance. Accurate drop-offs without getting lost.',
      icon: MapPin,
      color: 'bg-rose-100 text-rose-700',
    },
    {
      title: 'Automated COD Collection',
      description:
        'Clear separation between delivery fees and customer payments. Track every dollar collected on your behalf.',
      icon: Banknote,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      title: '1-Click Customer Updates',
      description:
        'Instantly copy pre-formatted SMS and Telegram messages with tracking links to send straight to your buyers.',
      icon: Share2,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'One-Click "Book Again"',
      description:
        'Repeat previous customer orders with a single tap. All destination coordinates and contact details auto-load.',
      icon: Repeat,
      color: 'bg-purple-100 text-purple-700',
    },
    {
      title: 'Real-Time Dispatch Timeline',
      description:
        'Watch your parcels move from pending pickup to driver assignment and final doorstep delivery.',
      icon: Clock,
      color: 'bg-cyan-100 text-cyan-700',
    },
  ];

  return (
    <section className="border-t border-slate-200 bg-slate-50/50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block">
            Engineered For High-Volume Online Sellers
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Everything You Need To Handle Daily Dispatches
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Say goodbye to messy notebooks and fragmented messaging apps. Consolidate your delivery operations in one unified workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs hover:border-slate-300 hover:shadow-xs transition"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${f.color} mb-4`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
