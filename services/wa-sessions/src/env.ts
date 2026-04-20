import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

let loaded = false;

export function loadEnv() {
  if (loaded) return;

  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../.env'),
    path.resolve(process.cwd(), '../../.env'),
    path.resolve(process.cwd(), '../../apps/api/.env'),
  ];

  for (const envPath of candidates) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: false });
    }
  }

  loaded = true;
}
