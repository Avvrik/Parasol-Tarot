'use client';

interface LoadingStateProps {
  stage: 'resolving' | 'generating';
}

export default function LoadingState({ stage }: LoadingStateProps) {
  const messages = {
    resolving: {
      title: 'Reading your essence…',
      description: 'Fetching your Twitter avatar',
      icon: '🔍',
    },
    generating: {
      title: 'The crypto stars are aligning…',
      description: 'The arcana work in silence to reveal your nature.',
      icon: '🎴',
    },
  };

  const current = messages[stage];

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-gradient-brand animate-spin"></div>
        <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
          <span className="text-4xl animate-pulse">{current.icon}</span>
        </div>
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-brand-secondary font-moche">
          {current.title}
        </h3>
        <p className="text-sm text-brand-secondary/80 font-rubik">{current.description}</p>
      </div>
      <div className="flex gap-2">
        <div className="w-2 h-2 rounded-full bg-brand-primary animate-bounce"></div>
        <div className="w-2 h-2 rounded-full bg-brand-secondary animate-bounce" style={{ animationDelay: '75ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-brand-highlight animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}

