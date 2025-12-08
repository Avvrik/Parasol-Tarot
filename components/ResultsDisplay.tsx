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
      `major arcana'd by Parasol — pull your card 🔮`
    );
    const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(shareUrl)}`;
    
    window.open(twitterUrl, '_blank');
  };

  return (
    <div className="flex flex-col items-center pt-6 pb-6 animate-fade-in">
      {/* Success message */}
      <h2 className="text-2xl font-semibold mb-1 font-moche">
        ✨ Your Destiny Has Been Drawn ✨
      </h2>
      <p className="text-sm text-brand-secondary/80 mb-2 font-rubik">
        the spirits have whispered… your true self awaits.
      </p>

      {/* Generated Tarot Card - Center Display */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-md">
          {/* Tarot card aspect ratio: height is 1.73x width (standard tarot card proportions ~2.75" x 4.75") */}
          {/* No overflow: hidden - ensure full card is visible including borders and text */}
          <div className="relative rounded-lg" style={{ aspectRatio: '1 / 1.73' }}>
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

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <button
          onClick={downloadImage}
          className="flex-1 py-3 px-6 rounded-xl font-semibold text-white bg-[#E07A5F] hover:bg-[#E07A5F]/90 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 font-rubik"
        >
          Download Image 📥
        </button>
        <button
          onClick={shareOnTwitter}
          className="flex-1 py-3 px-6 rounded-xl font-semibold text-white bg-brand-accent hover:bg-brand-accent/90 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 font-rubik"
        >
          Share on X
        </button>
      </div>

      {/* Try again button */}
      <div className="text-center mt-4">
        <button
          onClick={onTryAnother}
          className="text-sm text-brand-primary hover:text-brand-secondary underline transition-colors font-rubik"
        >
          Try again →
        </button>
      </div>
    </div>
  );
}

