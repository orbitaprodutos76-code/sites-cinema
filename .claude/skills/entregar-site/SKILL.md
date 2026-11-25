---
name: entregar-site
description: Publica um site de cliente (prévia ou versão final) e faz a checagem final de qualidade. Use quando o senhor pedir "publicar", "colocar no ar", "gerar link", "entregar" ou "deploy".
---

# Entregar site

## 1. Checagem final
- `npm run build` em `clientes/<slug>`.
- Checklist de entrega do `CLAUDE.md`, item por item. Relate o que passou e o que não passou.
- Ajuste `site` em `astro.config.mjs` para a URL final.

## 2. Publicar
Opções, da preferida para a menos:
1. **Vercel/Netlify ligados ao GitHub**: faça push da branch; o PR ganha um link de prévia automático. Para produção, o senhor aprova o merge do PR.
   Na Vercel, o projeto do cliente usa *Root Directory* = `clientes/<slug>`.
2. **Prévia rápida de prospecção**: publique o `dist/` como Artifact (link privado do claude.ai) e o senhor decide se compartilha.

## 3. Pós-entrega
- Anote a URL final no `BRIEFING.md` do cliente.
- Atualize o status do lead no CSV de `prospeccao/leads/` para `fechado`, se veio de prospecção.
