import { execSync } from 'child_process';

const token = process.env.GIT_PUSH_TOKEN || process.env.GITHUB_TOKEN || '';
if (!token) {
  console.error('ERRORE: GIT_PUSH_TOKEN non trovato');
  process.exit(1);
}

const body = JSON.stringify({
  title: 'pannello: aggiunge chip skill rapide in ParlaCasella e ChatCasella',
  body: '8 chip cliccabili sopra la textarea (giro, loop 30m, verify, audit-pannello, auto-radiografia, deep-research, security-review, schedule). Visibili solo quando la bozza è vuota.',
  head: 'feature/skill-rapide-chat',
  base: 'main'
});

const cmd = `curl -s -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token ${token}" \
  https://api.github.com/repos/NicolaeRotaru/ad-mycity/pulls \
  -d '${body.replace(/'/g, "'\\''")}'`;

try {
  const result = execSync(cmd, { encoding: 'utf8' });
  const j = JSON.parse(result);
  if (j.html_url) {
    console.log('✅ PR creata:', j.html_url);
    console.log('Numero:', j.number);
  } else {
    console.log('Risposta:', JSON.stringify(j, null, 2));
  }
} catch(e) {
  console.error('Errore:', e.message);
}
