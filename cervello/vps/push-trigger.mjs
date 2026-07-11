#!/usr/bin/env node
// push-trigger.mjs — esegue push su GitHub con PAT token dal .env
// Usato per triggerare la GitHub Action deploy-pannello.yml
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..');
const envRaw = readFileSync(join(here, '.env'), 'utf8');
const token = envRaw.match(/^GIT_PUSH_TOKEN=(.+)$/m)?.[1]?.trim() ?? '';

if (!token) {
  console.error('GIT_PUSH_TOKEN mancante nel .env');
  process.exit(1);
}

const remote = 'https://' + token + '@github.com/NicolaeRotaru/ad-mycity.git';
const safe = 'https://github.com/NicolaeRotaru/ad-mycity.git';

try {
  execSync('git remote set-url origin ' + JSON.stringify(remote), { cwd: repo, stdio: 'pipe' });
  const out = execSync('git push origin main', { cwd: repo }).toString();
  console.log('PUSH OK:', out.trim() || '(nessun output — già sincronizzato o push silenzioso)');
} catch (e) {
  const msg = e.stderr ? e.stderr.toString() : e.message;
  console.error('PUSH ERROR:', msg);
  process.exitCode = 1;
} finally {
  try {
    execSync('git remote set-url origin ' + JSON.stringify(safe), { cwd: repo, stdio: 'pipe' });
  } catch (_) {}
}
