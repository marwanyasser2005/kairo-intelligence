import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '..');
const outputDirectory = path.join(projectRoot, 'dist', '.openai');

await mkdir(outputDirectory, { recursive: true });
await copyFile(
  path.join(projectRoot, '.openai', 'hosting.json'),
  path.join(outputDirectory, 'hosting.json'),
);
