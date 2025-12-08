import { NextRequest, NextResponse } from 'next/server';
import { generateParasolTarotCard } from '@/lib/gemini-api';
import { saveHandle } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, username } = body;

    console.log(`[API] Generate tarot card request - username: ${username}, imageUrl: ${imageUrl}`);

    // Validate input
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

    // Save handle to database
    if (username) {
      const saved = await saveHandle(username);
      
      if (saved) {
        console.log(`[API] Successfully saved handle: ${username}`);
      } else {
        console.error(`[API] Failed to save handle: ${username}`);
      }
    }

    // Return the generated image as base64
    return NextResponse.json({
      success: true,
      image: imageBase64,
    });
  } catch (error) {
    console.error('Error in generate-outfit:', error);
    
    // Provide more specific error messages
    let errorMessage = 'We couldn\'t generate your tarot card, please try again';
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

