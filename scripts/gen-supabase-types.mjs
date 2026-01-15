// scripts/gen-supabase-types.mjs
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const projectId = process.env.SUPABASE_PROJECT_ID ?? 'zofgtjswwjikwhdirvpa';
const outFile = path.join(process.cwd(), 'src', 'types', 'supabase.ts');

const args = [
  'gen',
  'types',
  'typescript',
  '--project-id',
  projectId,
  '--schema',
  'public,storage,graphql_public',
];

const child = spawn('supabase', args, { shell: true, env: process.env });

let stdout = '';
let stderr = '';

child.stdout.on('data', (d) => {
  stdout += d.toString();
});
child.stderr.on('data', (d) => {
  stderr += d.toString();
});

const exitCode = await new Promise((resolve) => {
  child.on('close', resolve);
});

const looksValid = stdout.trim().length > 500 && stdout.includes('export type Database');

if (exitCode !== 0 || !looksValid) {
  console.error('[types:supabase] Types generation failed. Keeping existing file untouched.');
  if (stderr.trim()) console.error(stderr.trim());

  if (existsSync(outFile)) {
    const prev = await readFile(outFile, 'utf8');
    console.error(`[types:supabase] Existing file preserved: ${outFile} (${prev.length} bytes)`);
  } else {
    console.error(`[types:supabase] No existing file found at: ${outFile}`);
  }

  process.exit(0);
}

await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, stdout, 'utf8');
console.log(`[types:supabase] Wrote ${outFile} (${stdout.length} bytes).`);
