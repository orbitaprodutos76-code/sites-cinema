# Prospecção

## Funil
1. **Buscar**: `buscar-empresas.mjs` lista até 60 empresas de um nicho numa cidade (Google Maps) e dá uma pontuação de oportunidade.
2. **Filtrar**: os melhores leads são os que **não têm site** ou têm só Instagram, **e** que têm muitas avaliações (movimento = dinheiro).
3. **Auditar**: `auditar-site.mjs <url>` aponta os defeitos do site atual, que viram argumento na abordagem.
4. **Prévia**: para os 3 a 5 melhores, o Claude gera uma prévia do site novo (hero + 1 seção) a partir do template e publica num link.
5. **Abordar**: mensagem curta com a prévia (modelo em `abordagem.md`).
6. **Atualizar** a coluna `status` do CSV: `novo` → `contatado` → `respondeu` → `proposta` → `fechado` / `perdido`.

## Configurar a chave do Google
1. Acesse console.cloud.google.com, crie um projeto e ative **Places API (New)**.
2. Crie uma chave em *APIs e serviços → Credenciais* e restrinja à Places API.
3. Ative faturamento. O Google dá uma cota mensal gratuita; confira os preços atuais no console antes de rodar buscas em massa.
4. Na nuvem do Claude: salve a chave como credencial do ambiente (o Claude pede pelo formulário seguro). Localmente: `export GOOGLE_PLACES_API_KEY=...`.

**Nunca** coloque a chave em arquivo do repositório.

## Nichos que costumam pagar bem por site
Clínicas (estética, odonto, dermato), advocacia, arquitetura e interiores, imobiliárias de alto padrão, restaurantes e bares premium, academias boutique, studios de tatuagem, hotéis e pousadas, construtoras, concessionárias e oficinas premium.
