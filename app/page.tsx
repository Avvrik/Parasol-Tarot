'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import PlatformSelector from '@/components/PlatformSelector';
import HandleInput from '@/components/HandleInput';
import LoadingState from '@/components/LoadingState';
import ResultsDisplay from '@/components/ResultsDisplay';

type AppState = 'input' | 'resolving' | 'generating' | 'results' | 'error' | 'upload';

interface ProfileData {
  displayName: string;
  imageUrl: string;
}

interface ResultData {
  originalImageUrl: string;
  generatedImageBase64: string;
  displayName: string;
}

export default function Home() {
  const [state, setState] = useState<AppState>('input');
  const [handle, setHandle] = useState('');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [error, setError] = useState('');
  
  // Fixed to Twitter only
  const platform = 'twitter';
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'your event';

  // Check for handle in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlHandle = params.get('handle');
    if (urlHandle && urlHandle.trim()) {
      setHandle(urlHandle);
    }
  }, []);

  // Auto-trigger search when handle is set from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlHandle = params.get('handle');
    
    if (urlHandle && urlHandle.trim() && handle === urlHandle && state === 'input') {
      // Trigger search automatically
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle, state]);

  const handleSubmit = async (forceRegenerate = false) => {
    try {
      setState('resolving');
      setError('');

      // Step 1: Check cache first (unless forcing regenerate)
      if (!forceRegenerate) {
        console.log(`[Frontend] Checking cache for: ${handle}`);
        
        const generateResponse = await fetch('/api/generate-outfit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            imageUrl: 'cached', // Signal to check cache first
            username: handle
          }),
        });

        // If cached outfit exists, use it immediately
        if (generateResponse.ok) {
          const { image, cached } = await generateResponse.json();
          
          if (cached) {
            console.log(`[Frontend] ✅ Loaded from cache for: ${handle}`);
            setResultData({
              originalImageUrl: '', // Not needed for cached results
              generatedImageBase64: image,
              displayName: handle,
            });
            setState('results');
            return;
          }
        }
      } else {
        console.log(`[Frontend] Force regenerating for: ${handle}`);
      }

      // Step 2: No cache or force regenerate - need to fetch avatar and generate new outfit
      console.log(`[Frontend] ${forceRegenerate ? 'Force regenerating' : 'No cache found'}, fetching avatar for: ${handle}`);
      setState('resolving');

      const resolveResponse = await fetch('/api/resolve-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle, platform }),
      });

      if (!resolveResponse.ok) {
        const errorData = await resolveResponse.json();
        throw new Error(errorData.error || 'Failed to find profile');
      }

      const { profile } = await resolveResponse.json();
      setProfileData(profile);

      // Step 3: Generate new outfit with fetched avatar
      setState('generating');

      const generateNewResponse = await fetch('/api/generate-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageUrl: profile.imageUrl,
          username: handle,
          forceRegenerate: forceRegenerate
        }),
      });

      if (!generateNewResponse.ok) {
        const errorData = await generateNewResponse.json();
        throw new Error(errorData.error || 'Failed to generate outfit');
      }

      const { image } = await generateNewResponse.json();

      // Step 4: Show results
      setResultData({
        originalImageUrl: profile.imageUrl,
        generatedImageBase64: image,
        displayName: profile.displayName || profile.name || handle,
      });
      setState('results');
    } catch (err) {
      console.error('Error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
      setState('error');
    }
  };

  const handleReset = () => {
    setState('input');
    setHandle('');
    setProfileData(null);
    setResultData(null);
    setError('');
  };

  const handleUploadClick = () => {
    setState('upload');
    setError('');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    try {
      setState('generating');
      
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Generate outfit with uploaded image
        const generateResponse = await fetch('/api/generate-outfit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            imageUrl: base64String, // Send base64 directly
            username: handle
          }),
        });

        if (!generateResponse.ok) {
          const errorData = await generateResponse.json();
          throw new Error(errorData.error || 'Failed to generate outfit');
        }

        const { image } = await generateResponse.json();

        setResultData({
          originalImageUrl: base64String,
          generatedImageBase64: image,
          displayName: handle,
        });
        setState('results');
      };
      
      reader.onerror = () => {
        throw new Error('Failed to read image file');
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to process image. Please try again.'
      );
      setState('error');
    }
  };

  return (
    <main className={`p-4 sm:p-8 relative overflow-hidden ${state === 'input' ? 'min-h-screen' : ''}`}>
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: 'url(/backgrounds/background-01.jpg)' }}
        ></div>
        {/* Colorful circles - subtle in corners */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-brand-primary/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-10 right-10 w-40 h-40 bg-brand-secondary/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-brand-accent/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 right-10 w-44 h-44 bg-brand-highlight/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header - Only show on input state */}
        {state === 'input' && (
          <header className="text-center space-y-4 mb-12 animate-fade-in">
            <div className="flex justify-center mb-4">
              <Image
                src="/Parasol2.png"
                alt="Parasol"
                width={200}
                height={80}
                className="object-contain"
              />
            </div>
            <p className="text-lg text-brand-secondary/90 max-w-2xl mx-auto font-rubik">
              Offer your Twitter handle to the cards, and let the Parasol arcana unveil your prophecy. 🔮🌟
            </p>
          </header>
        )}

        {/* Main Content */}
        <div className={`bg-gradient-to-br from-[#3D405B] via-[#81B29A] to-[#3D405B] backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 ${state === 'input' ? 'border-4 border-brand-primary/40' : ''}`}>
          {state === 'input' && (
            <div className="space-y-6 animate-fade-in">
              <HandleInput
                value={handle}
                onChange={setHandle}
                onSubmit={handleSubmit}
                isLoading={false}
                platform={platform}
              />
            </div>
          )}

          {(state === 'resolving' || state === 'generating') && (
            <LoadingState stage={state} />
          )}

          {state === 'results' && resultData && (
            <ResultsDisplay
              originalImageUrl={resultData.originalImageUrl}
              generatedImageBase64={resultData.generatedImageBase64}
              displayName={resultData.displayName}
              onTryAnother={() => handleSubmit(true)}
              brandName={brandName}
            />
          )}

          {state === 'error' && (
            <div className="space-y-6 text-center animate-fade-in">
              <div className="text-6xl">😔</div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-brand-secondary font-moche">
                  Oops! Something went wrong
                </h3>
                <p className="text-brand-highlight font-rubik">{error}</p>
                <p className="text-brand-secondary/80 text-sm mt-2 font-rubik">
                  Can't find your avatar? Upload your own photo instead!
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 rounded-xl font-semibold text-brand-secondary bg-brand-accent/80 hover:bg-brand-accent hover:scale-105 active:scale-95 transition-all duration-200 font-rubik"
                >
                  Try Another Handle
                </button>
                <button
                  onClick={handleUploadClick}
                  className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-brand hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 font-rubik"
                >
                  📤 Upload Your Photo
                </button>
              </div>
            </div>
          )}

          {state === 'upload' && (
            <div className="space-y-6 text-center animate-fade-in">
              <div className="text-6xl">📸</div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-brand-secondary font-moche">
                  Upload Your Photo
                </h3>
                <p className="text-brand-secondary/80 font-rubik">
                  Upload a photo of yourself to generate your tarot card!
                </p>
                <p className="text-sm text-brand-secondary/70 font-rubik">
                  Handle: <span className="font-semibold text-brand-primary">{handle}</span>
                </p>
              </div>
              
              <div className="max-w-md mx-auto">
                <label className="block">
                  <div className="border-2 border-dashed border-brand-primary/50 rounded-xl p-8 cursor-pointer hover:bg-brand-primary/10 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="space-y-2">
                      <div className="text-4xl">🖼️</div>
                      <p className="text-brand-secondary font-medium font-rubik">
                        Click to select a photo
                      </p>
                      <p className="text-sm text-brand-secondary/70 font-rubik">
                        JPG, PNG, or GIF (max 5MB)
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              <button
                onClick={handleReset}
                className="text-sm text-brand-secondary/80 hover:text-brand-secondary underline font-rubik"
              >
                ← Back to search
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-brand-secondary/60 font-rubik">
          <p>Powered by Google Gemini AI</p>
        </footer>
      </div>
    </main>
  );
}

