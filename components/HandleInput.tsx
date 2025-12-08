'use client';

import { useState } from 'react';
import { validateHandle } from '@/lib/utils';

interface HandleInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  platform: string;
}

export default function HandleInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  platform,
}: HandleInputProps) {
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue && !validateHandle(newValue)) {
      setError('Please enter a valid handle (letters, numbers, _, -)');
    } else {
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[HandleInput] Form submitted, value:', value);
    
    if (!value.trim()) {
      setError('Please enter a handle');
      return;
    }
    
    if (!validateHandle(value)) {
      setError('Please enter a valid handle');
      return;
    }
    
    setError('');
    console.log('[HandleInput] Calling onSubmit');
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Input Section */}
      <div className="space-y-3">
        <label className="block text-lg font-semibold text-brand-secondary text-center font-moche">
          Tell me your Twitter handle, wanderer…✨
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-brand-secondary/70 text-lg">@</span>
          </div>
          <input
            type="text"
            value={value}
            onChange={handleChange}
            placeholder="elonmusk"
            disabled={isLoading}
            className={`
              w-full pl-10 pr-4 py-4 text-lg rounded-2xl border-2 bg-brand-accent/50 text-brand-secondary font-rubik
              focus:outline-none focus:ring-4 focus:ring-brand-primary/30 focus:border-brand-primary
              disabled:bg-brand-accent/30 disabled:cursor-not-allowed
              transition-all duration-200 placeholder:text-brand-secondary/50
              ${error ? 'border-brand-highlight' : 'border-brand-primary/40 hover:border-brand-primary/60'}
            `}
          />
          {error && (
            <p className="mt-2 text-sm text-brand-highlight text-center font-rubik">{error}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !value.trim() || !!error}
        className={`
          w-full py-4 px-6 rounded-2xl font-bold text-lg text-white font-rubik
          transition-all duration-200 shadow-lg
          ${
            isLoading || !value.trim() || error
              ? 'bg-brand-accent/50 cursor-not-allowed'
              : 'bg-brand-accent hover:bg-brand-accent/90 hover:shadow-2xl hover:scale-105 active:scale-95'
          }
        `}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            The crypto stars are aligning…
          </span>
        ) : (
          '🔮 Unveil My Fate 🔮'
        )}
      </button>
    </form>
  );
}

