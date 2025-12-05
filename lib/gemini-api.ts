import { GoogleGenAI } from '@google/genai';
import { promises as fs } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

// =============================================================================
// PARASOL TAROT CARD STYLES
// =============================================================================
const OUTFIT_STYLES = [
  {
    name: 'THE_MAGICIAN',
    description: `**THE_MAGICICAN**: Parasol Tarot Card Theme
- Background aesthetic: Mystical atmosphere with classic tarot symbols (wands, pentagrams, magical tools) in Parasol brand colors (green/teal #81B29A, coral #E07A5F, cream #F4F1DE, dark blue #3D405B, light yellow #F2CC8F)
- Classic tarot elements: Wand symbols, pentagrams, magical circles, mystical tools, arcane symbols
- Background decorative elements: Parasol spiral patterns combined with classic Magician card symbols (infinity symbol, wand, cup, sword, pentacle)
- Tarot card style: Vertical portrait format, ornate borders with mystical symbols
- Border/frame: Ornate tarot card borders with magical symbols and Parasol spiral patterns
- Background theme: Confident, powerful, mystical energy with classic tarot card imagery
- Use only Parasol brand colors for all tarot symbols and decorative elements`,
  },
  {
    name: 'THE_HIGH_PRIESTESS',
    description: `**THE_HIGH_PRIESTESS**: Parasol Tarot Card Theme
- Background aesthetic: Serene and mysterious atmosphere with classic tarot symbols (moons, pillars, veils, pomegranates) in Parasol brand colors
- Classic tarot elements: Moon symbols, crescent moons, pillars, veil patterns, pomegranate symbols, sacred geometry
- Background decorative elements: Parasol spiral patterns combined with classic High Priestess card symbols (moon phases, pillars, sacred symbols)
- Tarot card style: Vertical portrait format, ornate borders with lunar and sacred symbols
- Border/frame: Ornate tarot card borders with moon symbols and Parasol spiral patterns
- Background theme: Wise, contemplative, esoteric knowledge with classic tarot card imagery
- Use only Parasol brand colors for all tarot symbols and decorative elements`,
  },
  {
    name: 'THE_EMPRESS',
    description: `**THE_EMPRESS**: Parasol Tarot Card Theme
- Background aesthetic: Luxurious and nurturing atmosphere with classic tarot symbols (stars, nature elements, crown symbols) in Parasol brand colors
- Classic tarot elements: Star symbols, nature patterns, crown symbols, wheat/grain symbols, floral patterns, pentacle symbols
- Background decorative elements: Parasol spiral patterns combined with classic Empress card symbols (stars, nature, abundance symbols)
- Tarot card style: Vertical portrait format, ornate borders with nature and star symbols
- Border/frame: Ornate tarot card borders with regal symbols and Parasol spiral patterns
- Background theme: Nurturing, abundant, creative power with classic tarot card imagery
- Use only Parasol brand colors for all tarot symbols and decorative elements`,
  },
  {
    name: 'THE_EMPEROR',
    description: `**THE_EMPEROR**: Parasol Tarot Card Theme
- Background aesthetic: Strong and commanding atmosphere with classic tarot symbols (mountains, throne symbols, ram heads, geometric patterns) in Parasol brand colors
- Classic tarot elements: Mountain symbols, throne patterns, ram head symbols, geometric structures, sword symbols, authoritative symbols
- Background decorative elements: Parasol spiral patterns combined with classic Emperor card symbols (mountains, structures, power symbols)
- Tarot card style: Vertical portrait format, ornate borders with structural and power symbols
- Border/frame: Ornate tarot card borders with authoritative symbols and Parasol spiral patterns
- Background theme: Authoritative, structured, worldly power with classic tarot card imagery
- Use only Parasol brand colors for all tarot symbols and decorative elements`,
  },
  {
    name: 'THE_STAR',
    description: `**THE_STAR**: Parasol Tarot Card Theme
- Background aesthetic: Hopeful and inspiring atmosphere with classic tarot symbols (large star, smaller stars, water symbols, tree symbols) in Parasol brand colors
- Classic tarot elements: Large central star, multiple smaller stars, water/wave symbols, tree/nature symbols, celestial patterns
- Background decorative elements: Parasol spiral patterns combined with classic Star card symbols (stars, water, celestial elements)
- Tarot card style: Vertical portrait format, ornate borders with star and celestial symbols
- Border/frame: Ornate tarot card borders with star symbols and Parasol spiral patterns
- Background theme: Serene, hopeful, cosmic inspiration with classic tarot card imagery
- Use only Parasol brand colors for all tarot symbols and decorative elements`,
  },
  {
    name: 'THE_MOON',
    description: `**THE_MOON**: Parasol Tarot Card Theme
- Background aesthetic: Mysterious and intuitive atmosphere with classic tarot symbols (full moon, crescent moon, towers, water, dog/wolf symbols) in Parasol brand colors
- Classic tarot elements: Full moon, crescent moon phases, tower symbols, water/wave patterns, animal symbols, path symbols
- Background decorative elements: Parasol spiral patterns combined with classic Moon card symbols (moon phases, water, mysterious elements)
- Tarot card style: Vertical portrait format, ornate borders with lunar and mystical symbols
- Border/frame: Ornate tarot card borders with moon symbols and Parasol spiral patterns
- Background theme: Intuitive, mysterious, hidden knowledge with classic tarot card imagery
- Use only Parasol brand colors for all tarot symbols and decorative elements`,
  },
  {
    name: 'THE_SUN',
    description: `**THE_SUN**: Parasol Tarot Card Theme
- Background aesthetic: Bright and joyful atmosphere with classic tarot symbols (radiating sun, sunflowers, wall symbols, child symbols) in Parasol brand colors
- Classic tarot elements: Large radiating sun, sun rays, sunflower symbols, wall/boundary symbols, child/youth symbols, bright patterns
- Background decorative elements: Parasol spiral patterns combined with classic Sun card symbols (sun, rays, joyful elements)
- Tarot card style: Vertical portrait format, ornate borders with solar and radiant symbols
- Border/frame: Ornate tarot card borders with sun symbols and Parasol spiral patterns
- Background theme: Joyful, radiant, life energy with classic tarot card imagery
- Use only Parasol brand colors for all tarot symbols and decorative elements`,
  },
  {
    name: 'THE_WORLD',
    description: `**THE_WORLD**: Parasol Tarot Card Theme
- Background aesthetic: Complete and fulfilled atmosphere with classic tarot symbols (wreath, four elements symbols, world symbols) in Parasol brand colors
- Classic tarot elements: Wreath/circle symbols, four element symbols (earth, air, fire, water), world/globe symbols, completion symbols
- Background decorative elements: Parasol spiral patterns combined with classic World card symbols (wreath, elements, unity symbols)
- Tarot card style: Vertical portrait format, ornate borders with universal and completion symbols
- Border/frame: Ornate tarot card borders with world symbols and Parasol spiral patterns
- Background theme: Complete, fulfilled, universal wisdom with classic tarot card imagery
- Use only Parasol brand colors for all tarot symbols and decorative elements`,
  },
];

const TAROT_BACKGROUNDS = [
  'background-01.png',
  'background-02.png',
  'background-03.png',
  'background-04.png',
  'background-05.png',
];

const BRAND_COLORS = {
  primary: '#81B29A',
  secondary: '#F4F1DE',
  accent: '#3D405B',
  highlight: '#E07A5F',
  light: '#F2CC8F',
};

const geminiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

function ensureApiKey() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }
}

function buildTarotPrompt(styleDescription: string) {
  return `You are editing the provided Twitter avatar into a Parasol-branded tarot portrait.

STYLE FOCUS:
${styleDescription}

GOALS:
- Keep the person recognizable with the same facial identity, expression, and pose.
- Remove the original background completely and return transparency behind the subject.
- Gently align the crop so the head and shoulders are centered in a vertical tarot composition. Slight zoom or reframing is allowed if it improves the card layout.
- Add a soft circular halo around the head using Parasol colors (${BRAND_COLORS.primary}, ${BRAND_COLORS.highlight}, ${BRAND_COLORS.light}). The halo should feel ethereal and refined, not overpowering.
- Subtly harmonize clothing colors to the Parasol palette while keeping the same garments and silhouettes.
- Preserve photographic quality (no cartoon or illustration redraws).

OUTPUT REQUIREMENTS:
- Return a single PNG with transparency.
- Include only the person and the soft halo. Do NOT add text, logos, borders, tarot frames, or any other decorative scene elements.
- The background must remain transparent so the server can composite the subject onto a tarot background later.`;
}

function getUserStyle(username: string): typeof OUTFIT_STYLES[0] {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    const char = username.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  const styleIndex = Math.abs(hash) % OUTFIT_STYLES.length;
  return OUTFIT_STYLES[styleIndex];
}

function selectBackground(username?: string) {
  if (!username) return TAROT_BACKGROUNDS[0];
  const score = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return TAROT_BACKGROUNDS[score % TAROT_BACKGROUNDS.length];
}

async function fetchImageBuffer(imageUrl: string): Promise<Buffer> {
  if (imageUrl.startsWith('data:')) {
    const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 data URL format');
    }
    return Buffer.from(matches[2], 'base64');
  }

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch avatar image');
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function generateTransparentPortrait(avatarBuffer: Buffer, style: typeof OUTFIT_STYLES[0]): Promise<Buffer> {
  ensureApiKey();

  const base64 = avatarBuffer.toString('base64');
  const prompt = buildTarotPrompt(style.description);

  const result = await geminiClient.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              data: base64,
              mimeType: 'image/png',
            },
          },
          { text: prompt },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'image/png',
    },
  });

  const candidates: any[] = (result as any).candidates ?? [];
  const parts = candidates[0]?.content?.parts ?? [];
  const imagePart = parts.find((p: any) => p.inlineData)?.inlineData ?? null;

  if (!imagePart?.data) {
    console.error('Gemini response missing image data', JSON.stringify(result, null, 2));
    throw new Error('Gemini did not return an edited image');
  }

  return Buffer.from(imagePart.data, 'base64');
}

async function compositeOnTarotBackground(avatarBuffer: Buffer, backgroundPath: string): Promise<Buffer> {
  const backgroundAbsolutePath = join(process.cwd(), 'public', 'backgrounds', backgroundPath);
  const backgroundBuffer = await fs.readFile(backgroundAbsolutePath);

  const background = sharp(backgroundBuffer);
  const backgroundMeta = await background.metadata();
  const cardWidth = backgroundMeta.width || 1200;
  const cardHeight = backgroundMeta.height || 1800;

  const targetWidth = Math.round(cardWidth * 0.7);
  const targetHeight = Math.round(cardHeight * 0.75);

  const resizedAvatar = await sharp(avatarBuffer)
    .resize({
      width: targetWidth,
      height: targetHeight,
      fit: 'inside',
    })
    .png()
    .toBuffer();

  const resizedMeta = await sharp(resizedAvatar).metadata();
  const finalAvatarWidth = resizedMeta.width || targetWidth;
  const finalAvatarHeight = resizedMeta.height || targetHeight;

  const left = Math.max(0, Math.round((cardWidth - finalAvatarWidth) / 2));
  const centerY = cardHeight * 0.42;
  const top = Math.max(0, Math.round(centerY - (finalAvatarHeight / 2)));

  const composited = await background
    .composite([
      {
        input: resizedAvatar,
        left,
        top,
      },
    ])
    .png()
    .toBuffer();

  return composited;
}

export async function generateParasolTarotCard(imageUrl: string, username?: string): Promise<{ imageBase64: string; style: string; }> {
  const avatarBuffer = await fetchImageBuffer(imageUrl);
  const style = getUserStyle(username || 'parasol');
  const transparentPortrait = await generateTransparentPortrait(avatarBuffer, style);
  const backgroundName = selectBackground(username);
  const composited = await compositeOnTarotBackground(transparentPortrait, backgroundName);

  return {
    imageBase64: composited.toString('base64'),
    style: style.name,
  };
}

export function getAssignedStyleName(username: string): string {
  const style = getUserStyle(username);
  return style.name;
}
