---
name: novo-site
description: Cria um site cinematográfico novo para um cliente a partir do template do repositório. Use quando o senhor pedir "novo site", "site para o cliente X", "prévia para a empresa Y" ou mandar briefing/logo/fotos de uma empresa.
---

# Novo site

## 1. Briefing (pergunte só o que faltar, no máximo 3 perguntas)
Precisa de: nome, nicho, cidade, WhatsApp, o que vendem, público, 1 a 3 sites de referência (ou use `referencias/`), material disponível (logo, fotos, textos).
Se for **prévia de prospecção**, não pergunte nada: use os dados do lead (Google Maps, site atual, Instagram público) e marque o que for suposição.

## 2. Criar o projeto
```bash
cp -r template clientes/<slug>
rm -rf clientes/<slug>/node_modules clientes/<slug>/dist clientes/<slug>/.astro
cd clientes/<slug> && npm install
```
Crie `clientes/<slug>/BRIEFING.md` com o briefing e as decisões de direção de arte.
Branch: `cliente/<slug>`.

## 3. Direção de arte (antes de codar)
- Carregue as skills `design-taste-frontend` e `gsap` se estiverem disponíveis.
- Defina em 5 linhas no BRIEFING: conceito, paleta (tokens), par de fontes, tipo de hero, 3 momentos de "uau" no scroll.
- Proibido: hero genérico centralizado com gradiente roxo, grade de 3 cards com ícone, "Bem-vindo ao nosso site".

## 4. Construir
- Edite `src/site.config.ts` e os tokens em `src/styles/global.css`.
- Reescreva `src/pages/index.astro` seção por seção, seguindo a narrativa do briefing. Reaproveite `motion.ts` (`data-reveal`, `data-parallax`, `data-horizontal`, `data-hero-line`).
- Three.js (`HeroWebGL`) só se o conceito pedir; senão remova.
- Textos em português do Brasil, curtos, orientados a benefício.

## 5. Conferir (obrigatório)
- `npm run build`.
- Screenshots em 1440px e 390px com Playwright; olhe cada uma e corrija o que estiver feio antes de mostrar.
- Rode o checklist de entrega do `CLAUDE.md`.

## 6. Mostrar
Envie as screenshots ao senhor, faça commit, push e abra o PR em rascunho. Se for prévia, ofereça publicar (skill `entregar-site`).
