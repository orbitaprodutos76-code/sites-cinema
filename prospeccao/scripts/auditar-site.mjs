#!/usr/bin/env node
// Auditoria rápida de um site existente, para usar como argumento na abordagem.
// Uso: node prospeccao/scripts/auditar-site.mjs https://site-da-empresa.com.br
// Para análise visual completa, peça ao Claude: ele tira screenshots com Playwright.

const url = process.argv[2];
if (!url) { console.error('Uso: node auditar-site.mjs <url>'); process.exit(1); }

const problemas = [];
const inicio = Date.now();
let html = '';
let final = url;
try {
  const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
  final = r.url;
  html = await r.text();
  if (!r.ok) problemas.push(`Responde com erro HTTP ${r.status}`);
} catch (e) {
  console.log(JSON.stringify({ url, fora_do_ar: true, erro: e.message }, null, 2));
  process.exit(0);
}
const ms = Date.now() - inicio;

if (!final.startsWith('https://')) problemas.push('Sem HTTPS (navegador marca como "não seguro")');
if (ms > 3000) problemas.push(`Lento: ${(ms / 1000).toFixed(1)}s só para o HTML`);
if (!/<meta[^>]+name=["']viewport/i.test(html)) problemas.push('Não é adaptado para celular (sem meta viewport)');
if (!/<title>[^<]{5,}<\/title>/i.test(html)) problemas.push('Sem título para o Google');
if (!/<meta[^>]+name=["']description/i.test(html)) problemas.push('Sem descrição para o Google');
if (!/og:image/i.test(html)) problemas.push('Sem imagem de compartilhamento (link no WhatsApp fica feio)');
if (!/wa\.me|api\.whatsapp|whatsapp\.com/i.test(html)) problemas.push('Sem botão de WhatsApp');
if (/wix\.com|wixstatic/i.test(html)) problemas.push('Feito em Wix (template genérico)');
if (/negocio\.site|business\.site/i.test(final)) problemas.push('Site gratuito do Google Meu Negócio');
const anos = [...html.matchAll(/©\s*(?:\d{4}\s*[-–]\s*)?(20\d{2})/g)].map((m) => Number(m[1]));
if (anos.length && Math.max(...anos) < new Date().getFullYear() - 2) problemas.push(`Rodapé parado em ${Math.max(...anos)} (site abandonado)`);

console.log(JSON.stringify({ url: final, tempo_ms: ms, nota: Math.max(0, 10 - problemas.length * 1.5).toFixed(1), problemas }, null, 2));
