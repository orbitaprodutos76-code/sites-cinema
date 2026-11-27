# Garimpados — vitrine de streetwear com links de afiliado

Negócio próprio do senhor (não é cliente). Produtos da Shein, Shopee, Mercado Livre etc. com foto recortada, preço e link de compra.

| Pasta | O que é |
|---|---|
| `shop/` | Versão mais recente e completa (22/11/2026): vitrine, outfit, ofertas com fogo, anatomia do tênis, câmera de cinema (GSAP), atendimento. |
| `arara/` | Vitrine em formato de arara de roupas (07/11). |
| `provador-3d/` | Provador 3D: corpo e roupas em WebGL (20/10). |
| `garimpos-do-chefe/` | Primeira versão da vitrine (19/10). |

Versões antigas do Shop que **não** foram importadas (ficam só como link):
- https://claude.ai/artifact/RPmUpuC1uejwg11mo6XfgX (09/11)
- https://claude.ai/artifact/N9chrcPJfszzM63zSXa376 (27/10)

## ⚠️ Importação incompleta do `shop/`
O serviço de artifacts parou de responder no meio do download. Faltam **~270 fotos de produto** em `shop/img/p/`
(de `camiseta-lady-liberty-lavada.webp` em diante, na ordem alfabética: camisetas new-york → streetez, conjuntos, gorro,
jaquetas, meias, moletons, polos e tênis). O código, o CSS, as fontes e o modelo 3D do tênis estão completos.

Também ficaram de fora, **de propósito**, os arquivos `ml/*.wasm` (~58 MB): são a biblioteca pública de recorte de fundo
(ONNX Runtime + modelo ISNet), não código nosso. Sem eles, só a função de recortar foto de produto nova no navegador não roda.

Para completar: peça ao Claude "completa a importação do Garimpados Shop".
