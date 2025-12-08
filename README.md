# Parasol Tarot Card Generator

A Next.js application that generates personalized tarot cards from Twitter avatars using Google Gemini AI. Users enter their Twitter handle, and the system creates a mystical tarot card featuring their portrait.

## Features

- 🎨 **AI-Powered Image Generation** - Uses Google Gemini to create tarot cards from Twitter avatars
- 🐦 **Twitter Integration** - Fetches avatars via Unavatar.io (no Twitter API needed)
- 💾 **Handle Tracking** - Stores Twitter handles in Supabase database
- 📱 **Responsive Design** - Beautiful UI built with Tailwind CSS
- 🔗 **Social Sharing** - Share tarot cards on Twitter

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** Google Gemini 2.5 Flash Image Preview
- **Database:** Supabase (PostgreSQL)
- **Avatar Service:** Unavatar.io

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))
- Supabase account ([Sign up here](https://supabase.com))

### Installation

1. **Clone or navigate to the project:**
   ```bash
   cd Parasol-Tarot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` with your credentials:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_URL=http://localhost:3000
   NEXT_PUBLIC_BRAND_NAME=Your Event Name
   ```

4. **Set up Supabase database:**
   - Create a new Supabase project
   - Run the SQL from `supabase/schema.sql` in the SQL Editor
   - This creates the `twitter_handles` table with proper indexes and policies

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Customization

### 1. Customize Brand Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  'brand-primary': '#YOUR_COLOR',
  'brand-secondary': '#YOUR_COLOR',
  // ...
}
```

Also update `BRAND_COLORS` in `lib/gemini-api.ts` to match.

### 2. Customize Brand Name

Set `NEXT_PUBLIC_BRAND_NAME` in your `.env.local` file, or update it in the code.

### 3. Customize UI Text

Edit the components in `components/` and `app/page.tsx` to change UI text and messaging.

## Project Structure

```
Parasol-Tarot/
├── app/
│   ├── api/
│   │   ├── generate-outfit/    # Main tarot card generation endpoint
│   │   ├── resolve-identity/   # Twitter avatar fetching
│   │   └── og-image/           # Open Graph images
│   ├── outfit/[handle]/        # Shareable tarot card pages
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main page
│   └── globals.css              # Global styles
├── components/
│   ├── HandleInput.tsx         # Twitter handle input
│   ├── LoadingState.tsx        # Loading animations
│   ├── PlatformSelector.tsx    # Platform UI
│   └── ResultsDisplay.tsx      # Results display
├── lib/
│   ├── gemini-api.ts           # Gemini API client
│   ├── supabase.ts             # Supabase client
│   └── utils.ts                # Utility functions
├── supabase/
│   └── schema.sql              # Database schema
└── package.json
```

## API Routes

### `POST /api/resolve-identity`
Fetches Twitter avatar for a handle.

**Request:**
```json
{
  "handle": "elonmusk",
  "platform": "twitter"
}
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "id": "elonmusk",
    "displayName": "elonmusk",
    "imageUrl": "https://..."
  }
}
```

### `POST /api/generate-outfit`
Generates a tarot card from an avatar image.

**Request:**
```json
{
  "imageUrl": "https://avatar-url.com/image.jpg",
  "username": "elonmusk"
}
```

**Response:**
```json
{
  "success": true,
  "image": "base64_image_data"
}
```

### `GET /api/og-image?handle=username`
Returns tarot card image for Open Graph/social sharing (currently returns 404 as images are not cached).

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- etc.

Make sure to set all environment variables in your deployment platform.

## How It Works

1. **User enters Twitter handle** → Frontend calls `/api/resolve-identity`
2. **Fetch avatar** → Uses Unavatar.io to get profile picture
3. **Generate tarot card** → Sends image to Gemini API for background removal and processing
4. **Add glow effect** → Sharp adds a luminous glow around the portrait
5. **Composite on card** → Portrait is composited onto tarot card background
6. **Save handle** → Stores Twitter handle in Supabase database
7. **Display result** → Shows generated tarot card with download/share options

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `NEXT_PUBLIC_URL` | Your app URL (for OG images) | Yes |
| `NEXT_PUBLIC_BRAND_NAME` | Brand/event name | No |

## Troubleshooting

### "GEMINI_API_KEY is not configured"
- Make sure you've set the environment variable in `.env.local`
- Restart your dev server after adding env vars

### "Failed to fetch avatar"
- The Twitter account might be private or suspended
- Try a different handle
- Use the upload feature as a fallback

### "Failed to generate tarot card"
- Check your Gemini API key is valid
- Check API quota/limits
- Try again (sometimes API has temporary issues)

## License

MIT

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Google Gemini](https://ai.google.dev/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)

