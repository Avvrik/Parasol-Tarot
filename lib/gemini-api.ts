import { GoogleGenAI } from '@google/genai';
import { promises as fs } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

// =============================================================================
// PARASOL TAROT CARD
// =============================================================================

const TAROT_BACKGROUNDS = [
  'background-01.png',
  'background-02.png',
  'background-03.png',
  'background-04.png',
  'background-05.png',
];

function ensureApiKey() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }
}

const geminiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

// -----------------------------------------------------------------------------
// Prompts
// -----------------------------------------------------------------------------

function buildTarotCutoutPrompt(): string {
  return `
You are editing a portrait photo for a tarot-style trading card.

TASK
- Remove the background completely.
- Keep ONLY the person as they appear in the input image.
- Do NOT add any new objects, shapes, patterns, glow, or effects.

WHAT TO KEEP
- Keep the person's face, hair, expression, and pose exactly as in the original.
- Preserve the exact scale and crop of the person.
- Do NOT zoom out, crop tighter, shrink, rotate, or reposition the person.

BACKGROUND & TRANSPARENCY (STRICT)
- Every pixel that does not belong to the person must be fully transparent (alpha = 0).
- Do NOT generate any background colors, gradients, frames, canvases, or squares.
- No black, dark, or colored rectangles behind the person.
- No checkerboard pattern, no white fill.

STRICTLY FORBIDDEN
- Do NOT add glow, halos, light rays, or any special effects.
- Do NOT draw extra objects, icons, text, or symbols.
- Do NOT stylize or repaint the person.

OUTPUT
- Return a single PNG with RGBA channels.
- Only the pixels belonging to the person should be non-transparent.
`.trim();
}

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

function selectBackground(username?: string): string {
  if (!username) return TAROT_BACKGROUNDS[0];
  const score = username.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
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

// -----------------------------------------------------------------------------
// Checkerboard remover (flood-fill from borders)
// -----------------------------------------------------------------------------

async function removeCheckerboardBackground(imageBuffer: Buffer): Promise<Buffer> {
  const img = sharp(imageBuffer);
  const { data, info } = await img
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels;
  const pixels = new Uint8Array(data);

  const idxOf = (x: number, y: number) => y * width + x;
  const candidate = new Uint8Array(width * height);
  const inBackground = new Uint8Array(width * height);
  const queue: [number, number][] = [];

  // Step 1: mark near-white, low-chroma pixels as checkerboard candidates
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pIdx = (y * width + x) * channels;
      const r = pixels[pIdx];
      const g = pixels[pIdx + 1];
      const b = pixels[pIdx + 2];
      const a = pixels[pIdx + 3];
      if (a === 0) continue;

      const maxc = Math.max(r, g, b);
      const minc = Math.min(r, g, b);
      const chroma = maxc - minc;
      const lightGrey = maxc >= 220 && chroma <= 8;

      if (lightGrey) {
        candidate[idxOf(x, y)] = 1;
      }
    }
  }

  // Step 2: flood-fill from border candidates to mark background
  const pushIfCandidate = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const id = idxOf(x, y);
    if (candidate[id] && !inBackground[id]) {
      inBackground[id] = 1;
      queue.push([x, y]);
    }
  };

  for (let x = 0; x < width; x++) {
    pushIfCandidate(x, 0);
    pushIfCandidate(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    pushIfCandidate(0, y);
    pushIfCandidate(width - 1, y);
  }

  while (queue.length) {
    const [x, y] = queue.shift() as [number, number];
    pushIfCandidate(x + 1, y);
    pushIfCandidate(x - 1, y);
    pushIfCandidate(x, y + 1);
    pushIfCandidate(x, y - 1);
  }

  // Step 3: any background-marked pixel becomes transparent
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const id = idxOf(x, y);
      if (!inBackground[id]) continue;
      const pIdx = id * channels;
      pixels[pIdx + 3] = 0;
    }
  }

  return sharp(pixels, {
    raw: { width, height, channels },
  })
    .png()
    .toBuffer();
}

// -----------------------------------------------------------------------------
// Bottom feather (soft fade-out instead of hard cut)
// -----------------------------------------------------------------------------

async function applyBottomFeather(imageBuffer: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels;
  const pixels = new Uint8Array(data);

  const featherStart = Math.round(height * 0.78); // bottom 22% fades out
  const featherEnd = height - 1;

  for (let y = featherStart; y < height; y++) {
    const t = (y - featherStart) / Math.max(1, featherEnd - featherStart); // 0..1
    const fade = 1 - t; // 1 -> 0
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const a = pixels[idx + 3];
      if (a === 0) continue;
      pixels[idx + 3] = Math.round(a * fade);
    }
  }

  return sharp(pixels, {
    raw: { width, height, channels },
  })
    .png()
    .toBuffer();
}

// -----------------------------------------------------------------------------
// Gemini: transparent portrait
// -----------------------------------------------------------------------------

async function generateTransparentPortrait(avatarBuffer: Buffer): Promise<Buffer> {
  ensureApiKey();

  const base64 = avatarBuffer.toString('base64');
  const prompt = buildTarotCutoutPrompt();

  const models = [
    process.env.GEMINI_MODEL,
    'gemini-2.5-flash-image-preview',
    'gemini-1.5-flash',
  ].filter(Boolean) as string[];

  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const result = await geminiClient.models.generateContent({
        model,
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
      } as any);

      const candidate = (result as any).candidates?.[0];
      const inline = candidate?.content?.parts?.find((p: any) => p.inlineData)?.inlineData;
      if (!inline?.data) {
        throw new Error(`Model ${model} did not return image data`);
      }

      let img: Buffer = Buffer.from(inline.data, 'base64');

      img = await sharp(img).ensureAlpha().png().toBuffer() as Buffer;
      img = await removeCheckerboardBackground(img);
      img = await sharp(img).ensureAlpha().trim({ threshold: 0 }).png().toBuffer() as Buffer;
      img = await applyBottomFeather(img);
      
      // Convert to black and white
      img = await sharp(img).greyscale().ensureAlpha().png().toBuffer() as Buffer;

      return img;
    } catch (err: any) {
      console.warn(`[Gemini] model ${model} failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini models failed');
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// Glow – stronger + larger
// -----------------------------------------------------------------------------

async function addGlowAroundFigure(avatarBuffer: Buffer): Promise<Buffer> {
  const avatar = sharp(avatarBuffer).ensureAlpha();
  const meta = await avatar.metadata();
  const width = meta.width || 0;
  const height = meta.height || 0;
  if (!width || !height) return avatarBuffer;

  try {
    const alpha = await avatar.clone().extractChannel('alpha').toBuffer();
    const radius = Math.round(Math.min(width, height) * 0.12); // thicker glow

    const blurred = await sharp(alpha, {
      raw: { width, height, channels: 1 },
    })
      .blur(radius)
      .toBuffer();

    const { data: maskData } = await sharp(blurred, {
      raw: { width, height, channels: 1 },
    })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const rgba = Buffer.alloc(width * height * 4);
    for (let i = 0; i < maskData.length; i++) {
      let a = maskData[i];
      a = Math.min(255, Math.round(a * 2.0)); // much stronger glow

      const idx = i * 4;
      rgba[idx] = 255;
      rgba[idx + 1] = 255;
      rgba[idx + 2] = 255;
      rgba[idx + 3] = a;
    }

    const glow = await sharp(rgba, {
      raw: { width, height, channels: 4 },
    })
      .png()
      .toBuffer();

    return await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        { input: glow, blend: 'screen' },
        { input: avatarBuffer, blend: 'over' },
      ])
      .png()
      .toBuffer();
  } catch (e) {
    console.warn('[Glow] failed', e);
    return avatarBuffer;
  }
}

// -----------------------------------------------------------------------------
// Compositing onto tarot background
// -----------------------------------------------------------------------------

async function compositeOnTarotBackground(
  avatarTransparent: Buffer,
  backgroundPath: string
): Promise<Buffer> {
  const bgPath = join(process.cwd(), 'public', 'backgrounds', backgroundPath);
  const bgBuffer = await fs.readFile(bgPath);
  const baseCard = sharp(bgBuffer);
  const bgMeta = await baseCard.metadata();

  const cardWidth = bgMeta.width || 1200;
  const cardHeight = bgMeta.height || 1800;

  // 1. Prepare avatar: ensure alpha & resize
  let avatar = await sharp(avatarTransparent)
    .ensureAlpha()
    .png()
    .toBuffer();

  const illustrationBottom = Math.round(cardHeight * 0.62);
  const minTop = Math.round(cardHeight * 0.15);
  const maxAvatarWidth = Math.round(cardWidth * 0.6);
  const maxAvatarHeight = illustrationBottom - minTop;

  avatar = await sharp(avatar)
    .resize({
      width: maxAvatarWidth,
      height: maxAvatarHeight,
      fit: 'inside',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .png()
    .toBuffer();

  const avatarMeta = await sharp(avatar).metadata();
  const avatarWidth = avatarMeta.width || maxAvatarWidth;
  const avatarHeight = avatarMeta.height || maxAvatarHeight;

  // 2. Strong glow
  const avatarWithGlow = await addGlowAroundFigure(avatar);

  // 3. Position on card
  const avatarLeft = Math.max(0, Math.round((cardWidth - avatarWidth) / 2));
  const freeVerticalSpace = illustrationBottom - minTop - avatarHeight;
  const avatarTop = Math.max(
    minTop,
    Math.round(minTop + freeVerticalSpace / 2),
  );

  const finalCard = await baseCard
    .composite([
      {
        input: avatarWithGlow,
        left: avatarLeft,
        top: avatarTop,
        blend: 'over',
      },
    ])
    .png({ compressionLevel: 9, quality: 100 })
    .toBuffer();

  return finalCard;
}

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

export async function generateParasolTarotCard(
  imageUrl: string,
  username?: string,
): Promise<{ imageBase64: string; style: string }> {
  const avatarBuffer = await fetchImageBuffer(imageUrl);
  const transparentPortrait = await generateTransparentPortrait(avatarBuffer);
  const bgName = selectBackground(username);
  const card = await compositeOnTarotBackground(transparentPortrait, bgName);

  return {
    imageBase64: card.toString('base64'),
    style: 'TAROT_CARD',
  };
}

export function getAssignedStyleName(_username: string): string {
  return 'TAROT_CARD';
}
