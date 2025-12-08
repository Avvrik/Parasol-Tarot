'use client';

export default function PlatformSelector() {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-brand-secondary font-rubik">
        Platform
      </label>
      <div className="flex items-center gap-3 px-4 py-3 bg-brand-accent/80 rounded-xl border-2 border-brand-primary/40">
        <svg className="w-6 h-6 text-brand-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        <div>
          <p className="font-semibold text-brand-secondary font-rubik">Twitter / X</p>
          <p className="text-xs text-brand-secondary/80 font-rubik">Tell me your Twitter handle, wanderer…✨</p>
        </div>
      </div>
    </div>
  );
}

