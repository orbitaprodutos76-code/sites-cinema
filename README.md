# sites-cinema

Estúdio de sites cinematográficos + prospecção de clientes.

```
template/      projeto base (Astro + GSAP + Lenis + Three.js)
clientes/      um site por cliente
referencias/   sites de referência aprovados
prospeccao/    busca de empresas e abordagem
CLAUDE.md      regras que o Claude segue em toda sessão
```

## Começar um site novo
```bash
cp -r template clientes/nome-do-cliente
cd clientes/nome-do-cliente
npm install
npm run dev
```

Ou peça ao Claude: *"novo site para a Padaria X, nicho padaria, cidade Campinas"* — a skill `novo-site` faz o resto.

## Prospectar
```bash
GOOGLE_PLACES_API_KEY=... node prospeccao/scripts/buscar-empresas.mjs "clínica odontológica" "Campinas SP"
```
