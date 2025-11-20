import sharp from 'sharp';

export async function processImage(buffer: Buffer): Promise<Buffer> {
  try {
    // 1. Create the watermark SVG
    // We use SVG because it's easy to generate text on the fly without loading another image
    const width = 800; // Standardize width
    const height = 600; // Approximate, sharp will resize proportionally
    
    const watermarkSvg = `
      <svg width="${width}" height="${height}">
        <style>
          .title { fill: rgba(255, 255, 255, 0.3); font-size: 60px; font-weight: bold; font-family: sans-serif; transform: rotate(-45deg); transform-origin: center; }
        </style>
        <text x="50%" y="50%" text-anchor="middle" class="title">PROTIRODH</text>
      </svg>
    `;

    // 2. Process with Sharp
    const processedBuffer = await sharp(buffer)
      .resize({ width: 1080, fit: 'inside', withoutEnlargement: true }) // Resize to max 1080px width
      .composite([
        {
          input: Buffer.from(watermarkSvg),
          gravity: 'center',
          blend: 'over',
        },
      ])
      .jpeg({ quality: 80, mozjpeg: true }) // Compress to JPEG 80% quality
      .toBuffer();

    return processedBuffer;
  } catch (error) {
    console.error("Image processing failed:", error);
    throw new Error("Failed to process image");
  }
}