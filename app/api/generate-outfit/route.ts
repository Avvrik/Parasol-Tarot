import { NextRequest, NextResponse } from 'next/server';
import { generateParasolTarotCard } from '@/lib/gemini-api';
import { getCachedOutfit, saveOutfit } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, username, forceRegenerate } = body;

    console.log(`[API] Generate outfit request - username: ${username}, imageUrl: ${imageUrl}`);

    // Check cache first (unless force regenerate)
    if (username && !forceRegenerate) {
      const cached = await getCachedOutfit(username);
      if (cached) {
        console.log(`[API] ✅ Returning cached outfit for ${username}`);
        return NextResponse.json({
          success: true,
          image: cached.generated_image_base64,
          style: cached.style,
          cached: true,
        });
      }
      console.log(`[API] No cached outfit found for ${username}`);
    }

    // If imageUrl is 'cached', it means frontend is just checking cache
    // Return 404 to signal no cache exists
    if (imageUrl === 'cached') {
      console.log(`[API] Cache-only request for ${username} - no cache found`);
      return NextResponse.json(
        { error: 'No cached outfit found', cached: false },
        { status: 404 }
      );
    }

    // Validate input for new generation
    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format (or allow base64 data URLs)
    if (!imageUrl.startsWith('data:') && !imageUrl.startsWith('http')) {
      return NextResponse.json(
        { error: 'Invalid image URL format' },
        { status: 400 }
      );
    }

    console.log(`[API] Processing image for user: ${username || 'unknown'}`);

    const { imageBase64, style } = await generateParasolTarotCard(imageUrl, username);

    // Save to database for caching
    if (username) {
      const saved = await saveOutfit({
        handle: username,
        platform: 'twitter',
        style,
        originalImageUrl: imageUrl.startsWith('http') ? imageUrl : null,
        generatedImageBase64: imageBase64,
      });
      
      if (saved) {
        console.log(`[API] Successfully saved outfit for ${username}`);
      } else {
        console.error(`[API] Failed to save outfit for ${username}`);
      }
    }

    // Return the generated image as base64
    return NextResponse.json({
      success: true,
      image: imageBase64,
      cached: false,
    });
  } catch (error) {
    console.error('Error in generate-outfit:', error);
    
    // Provide more specific error messages
    let errorMessage = 'We couldn\'t generate your outfit, please try again';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Increase the timeout for this API route (Vercel default is 10s)
export const maxDuration = 60; // 60 seconds

