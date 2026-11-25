#!/usr/bin/env node
// Busca empresas no Google Maps (Places API New) e salva um CSV de leads.
// Uso: GOOGLE_PLACES_API_KEY=... node prospeccao/scripts/buscar-empresas.mjs "nicho" "Cidade UF" [maxResultados]
// Exemplo: node prospeccao/scripts/buscar-empresas.mjs "clínica de estética" "Campinas SP" 60

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [nicho, cidade, maxArg] = process.argv.slice(2);
const chave = process.env.GOOGLE_PLACES_API_KEY;
const max = Math.min(Number(maxArg) || 60, 60); // a API entrega no máximo 60 por busca

if (!nicho || !cidade) {
  console.error('Uso: node buscar-empresas.mjs "nicho" "Cidade UF" [max]');
  process.exit(1);
}
if (!chave) {
  console.error('Falta GOOGLE_PLACES_API_KEY. Gere em console.cloud.google.com (Places API New).');
  process.exit(1);
}

const campos = [
  'places.id', 'places.displayName', 'places.formattedAddress', 'places.nationalPhoneNumber',
  'places.internationalPhoneNumber', 'places.websiteUri', 'places.rating', 'places.userRatingCount',
  'places.googleMapsUri', 'places.businessStatus', 'nextPageToken',
].join(',');

const lugares = [];
let pageToken;
do {
  const resp = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': chave, 'X-Goog-FieldMask': campos },
    body: JSON.stringify({ textQuery: `${nicho} em ${cidade}`, languageCode: 'pt-BR', regionCode: 'BR', pageSize: 20, pageToken }),
  });
  if (!resp.ok) {
    console.error(`Erro ${resp.status}:`, await resp.text());
    process.exit(1);
  }
  const dados = await resp.json();
  lugares.push(...(dados.places ?? []));
  pageToken = dados.nextPageToken;
  if (pageToken) await new Promise((r) => setTimeout(r, 1500));
} while (pageToken && lugares.length < max);

// Pontuação de oportunidade: quanto maior, mais o lead precisa de um site e pode pagar por ele.
function pontuar(p) {
  let s = 0;
  if (!p.websiteUri) s += 50;                                    // sem site
  else if (/instagram|facebook|linktr|wa\.me|whatsapp|negocio\.site|business\.site/i.test(p.websiteUri)) s += 35; // "site" é rede social
  const n = p.userRatingCount ?? 0;
  if (n >= 200) s += 25; else if (n >= 50) s += 15; else if (n >= 10) s += 5; // movimento = tem dinheiro
  if ((p.rating ?? 0) >= 4.5) s += 10;                           // boa reputação, site ruim é desperdício
  if (p.businessStatus && p.businessStatus !== 'OPERATIONAL') s -= 100;
  return s;
}

const linhas = lugares.slice(0, max).map((p) => ({
  pontuacao: pontuar(p),
  nome: p.displayName?.text ?? '',
  telefone: p.nationalPhoneNumber ?? '',
  whatsapp: (p.internationalPhoneNumber ?? '').replace(/\D/g, ''),
  site: p.websiteUri ?? '',
  nota: p.rating ?? '',
  avaliacoes: p.userRatingCount ?? 0,
  endereco: p.formattedAddress ?? '',
  maps: p.googleMapsUri ?? '',
  status: 'novo',
  observacoes: '',
})).sort((a, b) => b.pontuacao - a.pontuacao);

const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
const csv = [Object.keys(linhas[0] ?? { pontuacao: '' }).join(','), ...linhas.map((l) => Object.values(l).map(esc).join(','))].join('\n');

const slug = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const hoje = new Date().toISOString().slice(0, 10);
const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', 'leads');
mkdirSync(raiz, { recursive: true });
const arquivo = join(raiz, `${slug(nicho)}-${slug(cidade)}-${hoje}.csv`);
writeFileSync(arquivo, '﻿' + csv); // BOM para abrir certo no Excel

console.log(`${linhas.length} empresas salvas em ${arquivo}`);
console.log(`Sem site: ${linhas.filter((l) => !l.site).length} · Top 5:`);
linhas.slice(0, 5).forEach((l) => console.log(`  [${l.pontuacao}] ${l.nome} — ${l.site || 'SEM SITE'} — ${l.avaliacoes} avaliações`));
