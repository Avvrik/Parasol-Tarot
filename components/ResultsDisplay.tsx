'use client';

import Image from 'next/image';

interface ResultsDisplayProps {
  originalImageUrl: string;
  generatedImageBase64: string;
  displayName: string;
  onTryAnother: () => void;
  brandName?: string;
}

export default function ResultsDisplay({
  originalImageUrl,
  generatedImageBase64,
  displayName,
  onTryAnother,
  brandName = 'your event',
}: ResultsDisplayProps) {
  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${generatedImageBase64}`;
    link.download = `${displayName}-tarot-card.png`;
    link.click();
  };

  const shareOnTwitter = () => {
    // Create shareable URL using the /outfit/[handle] route for proper OG metadata
    const shareUrl = `${window.location.origin}/outfit/${encodeURIComponent(displayName)}`;
    
    // Open Twitter with pre-filled text and URL
    const tweetText = encodeURIComponent(
      `Check out my Parasol tarot card! 🎴✨\n\nDiscover your tarot card too!`
    );
    const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(shareUrl)}`;
    
    window.open(twitterUrl, '_blank');
  };

  return (
    <div className="flex flex-col items-center pt-10 pb-10 animate-fade-in">
      {/* Parasol Brand Identity */}
      <div className="flex flex-col items-center gap-2 mb-3">
        <Image
          src="/Parasol.png"
          alt="Parasol"
          width={40}
          height={40}
          className="object-contain"
        />
        <p className="text-xs uppercase tracking-wide text-brand-accent font-medium">Parasol Tarot</p>
      </div>

      {/* Success message */}
      <h2 className="text-2xl font-semibold mb-1">
        Your Tarot Card is Ready! 🃏✨
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        {displayName}, your Parasol tarot card has been revealed!
      </p>

      {/* Generated Tarot Card - Center Display */}
      <div className="w-full flex justify-center mt-4">
        <div className="w-full max-w-md">
          {/* Tarot card aspect ratio: height is 1.73x width (standard tarot card proportions ~2.75" x 4.75") */}
          {/* No overflow: hidden - ensure full card is visible including borders and text */}
          <div className="relative rounded-lg shadow-2xl" style={{ aspectRatio: '1 / 1.73' }}>
            <Image
              src={`data:image/png;base64,${generatedImageBase64}`}
              alt="Your Parasol tarot card"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      </div>

      {/* Parasol Brand Mark Below Card */}
      <div className="mt-4 flex justify-center">
        <Image
          src="/Parasol.png"
          alt="Parasol mark"
          width={32}
          height={32}
          className="object-contain opacity-60"
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <button
          onClick={downloadImage}
          className="flex-1 py-3 px-6 rounded-xl font-semibold text-white bg-gradient-brand hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
        >
          Download Image 📥
        </button>
        <button
          onClick={shareOnTwitter}
          className="flex-1 py-3 px-6 rounded-xl font-semibold text-white bg-blue-500 hover:bg-blue-600 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
        >
          Share on X
        </button>
      </div>

      {/* Try again button */}
      <div className="text-center mt-4">
        <button
          onClick={onTryAnother}
          className="text-sm text-brand-primary hover:text-brand-secondary underline transition-colors"
        >
          Try again →
        </button>
      </div>
    </div>
  );
}

