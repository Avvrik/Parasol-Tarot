import { Metadata } from 'next';
import { redirect } from 'next/navigation';

type Props = {
  params: { handle: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const handle = decodeURIComponent(params.handle);
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'Parasol Tarot';
  
  return {
    title: `${handle}'s Tarot Card - ${brandName}`,
    description: `Check out ${handle}'s Parasol tarot card! Discover your tarot card now.`,
  };
}

export default async function OutfitPage({ params }: Props) {
  const handle = decodeURIComponent(params.handle);
  
  // Redirect to home with handle parameter
  redirect(`/?handle=${encodeURIComponent(handle)}`);
}

