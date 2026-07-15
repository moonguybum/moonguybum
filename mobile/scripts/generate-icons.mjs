import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(root, '..');
const source = process.argv[2] || join(projectRoot, 'assets', 'icon-source.png');
const assets = join(projectRoot, 'assets');

const sizes = {
  'icon.png': 1024,
  'splash-icon.png': 512,
  'favicon.png': 48,
  'android-icon-foreground.png': 432,
  'android-icon-monochrome.png': 432,
};

mkdirSync(assets, { recursive: true });

await sharp({
  create: { width: 512, height: 512, channels: 4, background: '#0b1220' },
})
  .png()
  .toFile(join(assets, 'android-icon-background.png'));

for (const [name, size] of Object.entries(sizes)) {
  let pipeline = sharp(source).resize(size, size, {
    fit: 'contain',
    background: '#0b1220',
  });

  if (name === 'android-icon-monochrome.png') {
    pipeline = pipeline.grayscale().negate().threshold(200);
  }

  await pipeline.png().toFile(join(assets, name));
  console.log(`generated ${name} (${size}px)`);
}

console.log('All app icons generated.');
