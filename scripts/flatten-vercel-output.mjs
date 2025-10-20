import { readdirSync, lstatSync, readlinkSync, rmSync, cpSync } from 'fs';
import { join, resolve } from 'path';

const root = resolve('.vercel/output/functions');
function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    const isLink = e.isSymbolicLink?.() || lstatSync(p).isSymbolicLink();
    if (isLink) {
      const target = resolve(dir, readlinkSync(p));
      rmSync(p, { force: true });
      cpSync(target, p, { recursive: true });
      console.log('flattened:', p);
    } else if (e.isDirectory()) walk(p);
  }
}
walk(root);
console.log('✅ Symlink flattening complete.');
