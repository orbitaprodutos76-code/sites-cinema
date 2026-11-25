/* ================================================================
   ATENDE — atendimento e vendedor do Garimpados
   1. Botão de dúvidas + WhatsApp (o WhatsApp é a ÚLTIMA opção)
   2. Assistente vendedor: entende o que a pessoa quer (tipo de peça, ocasião,
      orçamento, tamanho, cor, estilo), recomenda peças do catálogo com preço e
      botões (Ver, Comprar, Provar), monta looks e sugere complementos.
      No Claude responde com IA (capability "sample"); fora dele (Netlify)
      o vendedor local responde sozinho. Conversa e perfil ficam na sessão.
   3. Convite discreto: depois de um tempo parado numa peça ou trocando muito
      de tamanho, um balão pequeno oferece ajuda (no máximo 2 por visita).
   4. Perguntas frequentes com busca (seção "Dúvidas")
   5. "Avise quando baixar" (Netlify Forms no Netlify; WhatsApp no Claude)
   6. Uso sem dados pessoais: conta só o TEMA de cada pergunta e manda
      1 resumo por visita para /api/uso (função do Netlify)

   GSAtende.montar({ zap, pecas(), fmt, faqEl, ico(nome, tam), abrirPeca(id),
                     provar(id), info(p) → { thumb, link, provar }, numeros(p) → [BR],
                     atual() → id da ficha aberta })
     → { avisar(peca), abrir(), atualizar(), sinal(tipo, peca) }
   ================================================================ */
(function (root) {
  'use strict';

  /* ---------- respostas oficiais (site de AFILIADO: quem vende, cobra, entrega e troca é a loja) ---------- */
  var TAB_ROUPA = [['BR', 'Internacional'], ['PP', 'XS'], ['P', 'S'], ['M', 'M'], ['G', 'L'], ['GG', 'XL'], ['EG / XGG', 'XXL']];
  var TAB_TENIS = [['BR', 'EUR', 'UK', 'US masc.', 'Pé (cm)'], ['34', '35', '2,5–3', '3,5', '22,5'], ['35', '36', '3,5', '4,5', '23'], ['36', '37', '4–4,5', '5', '23,5'], ['37', '38', '5–5,5', '6', '24,5'], ['38', '39', '6', '6,5–7', '25'], ['39', '40', '6,5', '7,5', '25,5'], ['40', '41', '7–7,5', '8', '26,5'], ['41', '42', '8–8,5', '9', '27'], ['42', '43', '9', '9,5–10', '27,5'], ['43', '44', '9,5–10', '10,5', '28,5'], ['44', '45', '10,5–11', '11', '29']];
  var FAQ = [
    ['parcelar', 'Dá para parcelar?', 'Sim. Na Shein, o cartão de crédito de banco brasileiro pode dividir a compra em até 6x. Também tem o PagaLeve, com parcelas via Pix, que precisa de cadastro e aprovação. O número de vezes, as tarifas e o valor final aparecem na tela de pagamento da loja, antes de você confirmar.', 'parcelar parcela parcelado parcelamento vezes 6x 10x 12x sem juros credito cartao dividir pagaleve'],
    ['original', 'As peças são originais?', 'Toda peça passa por uma curadoria seletiva do Garimpados antes de entrar na vitrine: olhamos a avaliação de quem já comprou, o acabamento e se o preço vale a pena. Só fica o que é achado de verdade. A marca e a procedência são as informadas pela loja no anúncio, e você compra direto na loja.', 'original marca falsificado falsificada replica fake verdadeiro procedencia qualidade boa vale presta curadoria confiavel autentico'],
    ['comprar', 'Como eu compro?', 'Toca em "Compre agora". Abre o anúncio oficial da loja: lá você escolhe tamanho e cor, coloca no carrinho e paga no site ou app da loja. O Garimpados não recebe pagamento nem vê dados do seu cartão.', 'comprar compra como funciona finalizar pedido checkout'],
    ['pagamento', 'Quais as formas de pagamento?', 'O pagamento é feito na loja. As formas disponíveis (como Pix, cartão e parcelamento, quando a loja oferece) aparecem no pagamento dela, antes de você confirmar. O Garimpados não recebe pagamento nem dados do cartão.', 'pagamento pagar pix cartao credito debito boleto parcela parcelar parcelado vezes juros'],
    ['afiliado', 'Pago mais caro comprando pelo link?', 'O preço é o mesmo do anúncio: comprar pelo link não deixa nada mais caro. O link só avisa a loja que você veio do Garimpados e, quando você compra, a loja paga uma pequena comissão pra gente. É assim que o site se mantém, sem custo extra pra você.', 'caro taxa link afiliado mesmo preco comissao ganha garimpados quem sao voces'],
    ['preco', 'Por que o preço na loja está diferente?', 'A loja muda preço o tempo todo (promoção relâmpago, cupom, tamanho ou cor). O preço do site é o que vimos na data indicada em cada peça. O que vale é o preço do anúncio na hora da compra.', 'preco diferente mudou subiu desceu valor atualizado errado'],
    ['cupom', 'Tem cupom de desconto?', 'Cupons e promoções são da loja. Se você tiver um cupom, ele entra no carrinho da loja na hora de pagar, e comprar pelo link do Garimpados não atrapalha. As ofertas que a gente garimpou ficam na seção Ofertas.', 'cupom codigo desconto promocional voucher'],
    ['frete', 'Quanto custa o frete e quanto demora?', 'Frete e prazo de entrega são da loja e aparecem no carrinho dela, calculados pelo seu CEP, antes de você pagar.', 'prazo entrega demora frete chega dias cep envio correio gratis rapido quando'],
    ['imposto', 'Tem taxa ou imposto?', 'Se houver alguma taxa ou imposto, a própria loja mostra no carrinho antes do pagamento. Confira o valor final lá antes de confirmar.', 'taxa imposto taxado alfandega importacao tributo remessa'],
    ['tamanho-roupa', 'Como escolho o tamanho da roupa?', 'Pegue uma peça sua que veste bem, meça largura (axila a axila) e comprimento, e compare com a tabela em cm do anúncio. Cada loja tem seu molde. Na dúvida entre dois, em streetwear normalmente vale o maior: o caimento largo é o estilo. Nas avaliações do anúncio, veja quem comenta "veste grande" ou "veste pequeno".', 'tamanho medida veste serve roupa p m g gg pp eg tabela forma molde', TAB_ROUPA],
    ['tamanho-tenis', 'Como escolho a numeração do tênis?', 'Meça o pé: fique em pé sobre uma folha, marque o calcanhar e o dedão e meça em cm. Compare com a tabela em cm do anúncio (é a medida mais segura). Alguns anúncios usam numeração UK ou EUR; a tabela abaixo é uma referência aproximada e muda um pouco de marca para marca.', 'numero numeracao calco calcado tenis pe uk eur europeu americano us cm forma', TAB_TENIS],
    ['troca', 'Como troco ou devolvo?', 'Troca e devolução são feitas direto com a loja onde você comprou. No app ou site da loja, entre em Meus pedidos, escolha o pedido e toque em Devolver ou Trocar. Siga a política e o prazo da loja e guarde a peça com etiqueta e embalagem até concluir.', 'troca trocar devolver devolucao reembolso arrependimento estorno'],
    ['atraso', 'Meu pedido atrasou ou veio errado. E agora?', 'O rastreio e o suporte ficam na loja onde você comprou. Em Meus pedidos, abra o pedido para ver o rastreio; se passou do prazo ou veio errado, use a opção de ajuda do próprio pedido. Tire foto da peça e da etiqueta: agiliza a troca ou o reembolso.', 'atraso atrasou pedido rastreio rastrear nao chegou errado problema suporte defeito rasgado'],
    ['seguro', 'É seguro comprar?', 'Você paga direto no site ou app oficial da loja, com as proteções dela. Antes de pagar, confira se o endereço da página é mesmo o da loja. O Garimpados nunca pede seus dados de pagamento.', 'seguro golpe confiavel confianca seguranca medo'],
    ['esgotou', 'O tamanho que eu quero esgotou. E agora?', 'Estoque é da loja e muda rápido. Na ficha da peça, toque em "Avise quando baixar" para saber se o preço cair, ou me peça uma peça parecida no seu tamanho que eu procuro na vitrine.', 'esgotou esgotado acabou sem estoque indisponivel'],
    ['provador', 'Como funciona o provador?', 'No "Monta o fit" você combina parte de cima, parte de baixo e tênis para ver o look junto. Arrasta para trocar as peças, e cada uma tem o botão para comprar na loja.', 'provador provar montar fit outfit vestir testar ver junto'],
    ['carrinho', 'O carrinho do site já compra?', 'O carrinho do Garimpados é uma lista para você não perder as peças. A compra é feita peça por peça na loja: no carrinho, toque em "Comprar na loja" em cada item.', 'carrinho lista salvar depois favoritos'],
    ['dados', 'Vocês guardam meus dados?', 'O assistente não pede nome, CPF nem cartão. A conversa fica só neste aparelho durante a visita. Seu contato só é usado se você pedir o "Avise quando baixar" e aceitar receber o aviso.', 'dados privacidade lgpd guardam informacao pessoal']
  ];
  var FAQ_ID = {}; FAQ.forEach(function (f) { FAQ_ID[f[0]] = f; });

  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function lerS(k, fb) { try { var v = JSON.parse(sessionStorage.getItem(k) || 'null'); return v == null ? fb : v; } catch (e) { return fb; } }
  function gravarS(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem storage */ } }
  /* "2026-10-26" (só a data) é o dia que está escrito; new Date() leria como meia-noite UTC e mostraria 25/10 no Brasil */
  function dia(iso) { var s = String(iso || ''), m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/); if (m) return m[3] + '/' + m[2]; var d = new Date(s); return isNaN(d) ? '' : String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0'); }
  var noNetlify = /(\.netlify\.app|garimpadosshop\.com\.br)$/i.test(location.hostname);
  var URL_USO = (noNetlify ? '' : 'https://garimpados-shop.netlify.app') + '/api/uso';

  /* ---------- como o cliente fala ---------- */
  /* ordem importa: "calça moletom" é calça, "bermuda moletom" é bermuda */
  /* "calça" vira "calca" e "calço" vira "calco": calça só com a palavra inteira, calço/calçado é tênis */
  var CATS = [['conjunto', /conjunto|duas pecas|2 pecas/], ['oculos', /oculos/], ['corrente', /corrente|colar|cordao/], ['cinto', /\bcinto/], ['bolsa', /bolsa|pochete/], ['calca', /\bcalcas?\b|jogger|cargo|pantalona/], ['bermuda', /bermud|\bshort/], ['tenis', /tenis|sneaker|\bcalco\b|calcad|pisante|kicks|sapato/], ['jaqueta', /jaquet|puffer|corta.?vento|anorak|parka|bobojaco|casaco(?! de molet)/], ['moletom', /molet|hood|blusa de frio|canguru|agasalho|casaco de molet|blusao/], ['camiseta', /camis|\btee\b|t-?shirt|blusa|regata/], ['bone', /bone|gorro|touca/], ['meia', /\bmeia|soquete/]];
  var KIND_CAT = { conjunto: 'conjunto', glasses: 'oculos', chain: 'corrente', belt: 'cinto', bag: 'bolsa', hoodie: 'moletom', jacket: 'jaqueta', tee: 'camiseta', pants: 'calca', shorts: 'bermuda', sneakers: 'tenis', cap: 'bone', beanie: 'bone', socks: 'meia' };
  var NOME_CAT ={ conjunto: 'conjunto', oculos: 'óculos', corrente: 'corrente', cinto: 'cinto', bolsa: 'bolsa', moletom: 'moletom', jaqueta: 'jaqueta', camiseta: 'camiseta', calca: 'calça', bermuda: 'bermuda', tenis: 'tênis', bone: 'boné', meia: 'meia' };
  var CIMA = { moletom: 1, jaqueta: 1, camiseta: 1 }, BAIXO = { calca: 1, bermuda: 1 };
  var CORES = [['preto', /\bpret|black|dark/], ['branco', /\bbranc|white|off.?white/], ['cinza', /cinza|chumbo|grafite|mescla|estonad/], ['bege', /bege|areia|creme|nude|off/], ['marrom', /marrom|cafe|chocolate/], ['azul', /azul|marinho|jeans/], ['rosa', /\brosa|pink/], ['vinho', /vinho|bordo/], ['vermelho', /vermelh|\bred\b/], ['verde', /verde/], ['amarelo', /amarel|mostarda/]];
  /* ocasião/estilo → tipos de peça e palavras do nome que combinam */
  var ESTILOS = [
    ['frio', /frio|inverno|gelad|esfriar|serra/, { moletom: 1, jaqueta: 1, calca: 1 }, null, 'pra frio'],
    ['calor', /calor|verao|praia|quente|sol\b/, { camiseta: 1, bermuda: 1 }, null, 'pra calor'],
    ['corrida', /corrida|correr|academia|treino|caminhada|esporte/, { tenis: 1 }, /corrida|carbono|running/, 'pra treino'],
    ['basquete', /basquete|quadra|basket/, { tenis: 1 }, /basquete/, 'de basquete'],
    ['dark', /gotic|dark|sombri|cruz|caveira|anjo/, null, /gotic|cruz|dark|anjo|teia|olho/, 'dark'],
    ['largo', /oversized|largo|larga|baggy|solto|perna larga/, null, /oversized|larga|perna larga/, 'largo'],
    ['chunky', /chunky|plataforma|robust|tratorad/, { tenis: 1 }, /chunky|plataforma/, 'chunky'],
    ['role', /role|balada|festa|show|date|encontro|sair|resenha/, null, null, 'pro rolê'],
    ['casual', /casual|dia a dia|faculdade|escola|trabalho|basico|simples/, null, /casual|basic|liso|assinatura/, 'casual']
  ];
  var TAM_ROUPA = { pp: 'PP', xs: 'PP', p: 'P', s: 'P', m: 'M', g: 'G', l: 'G', gg: 'GG', xl: 'GG', eg: 'EG', xxl: 'EG', xgg: 'EG', g1: 'EG' };

  function entender(q) {
    var t = ' ' + norm(q) + ' ', r = { t: t };
    for (var i = 0; i < CATS.length; i++) if (CATS[i][1].test(t)) { r.cat = CATS[i][0]; break; }
    if (/parte de cima|em cima|blusa ou camiseta/.test(t)) r.parte = 'cima';
    if (/parte de baixo|embaixo|em baixo/.test(t)) r.parte = 'baixo';
    var m = t.match(/entre\s*r?\$?\s*(\d{2,4})\s*(?:e|a|ate)\s*r?\$?\s*(\d{2,4})/) || t.match(/\bde\s*r?\$\s*(\d{2,4})\s*(?:a|ate)\s*r?\$?\s*(\d{2,4})/);
    if (m) { r.min = +m[1]; r.teto = +m[2]; }
    else {
      m = t.match(/(?:ate|menos de|abaixo de|max(?:imo)?|no maximo|teto|ate uns|por ate|uns|tenho|gastar)\s*r?\$?\s*(\d{2,4})/) || t.match(/r\$\s*(\d{2,4})/) || t.match(/\b(\d{2,4})\s*(?:reais|conto|pila|mangos)/);
      if (m) r.teto = +m[1];
      m = t.match(/(?:acima de|mais de|a partir de)\s*r?\$?\s*(\d{2,4})/); if (m) { r.min = +m[1]; if (r.teto === r.min) r.teto = null; }
    }
    m = t.match(/(?:calco|numero|num\.?|n[o°º]|piso|uso|tenis|tamanho|tam)\s*(\d{2}(?:[.,]5)?)\b/);
    if (m && +m[1].replace(',', '.') >= 28 && +m[1].replace(',', '.') <= 48) r.num = Math.floor(+m[1].replace(',', '.'));
    m = t.match(/(?:tamanho|tam\.?|visto|uso|veste|sou|serve)\s*(pp|xs|p|s|m|g|l|gg|xl|eg|xxl|xgg)\b/) || t.match(/\b(pp|gg|eg|xgg|xxl|xl)\b/);
    if (m) r.tam = TAM_ROUPA[m[1]];
    CORES.forEach(function (c) { if (!r.cor && c[1].test(t)) r.cor = c[0]; });
    ESTILOS.forEach(function (e) { if (!r.estilo && e[1].test(t)) r.estilo = e[0]; });
    r.promo = /promo|desconto|oferta|\boff\b|liquida|queima|baixou|black/.test(t) && !/cupom|codigo/.test(t);
    r.outro = /\boutr[oa]\b|diferente|troca o look|outra opc/.test(t);
    r.barato = /barat|em conta|economic|menor preco|mais em conta|pouco dinheiro|sem grana/.test(t);
    r.top = /melhor avaliad|mais vendid|\btop\b|bombando|mais pedid|mais procurad|famos|queridinh|recomenda|indica|sugere|sugest/.test(t);
    r.look = /\bfit\b|look|outfit|combin|conjunto|\bmonta|kit\b|completo|produc/.test(t);
    r.mais = /^\s*(mais|outr[ao]s?|tem mais|mostra mais|mais opc|outras opc|e mais)\b/.test(t) || /mais opc|outras opc|tem outr|mostra outr/.test(t);
    r.presente = /presente|aniversari|namorad|dar pra|dar para/.test(t);
    r.compra = r.cat || r.teto || r.min || r.cor || r.estilo || r.promo || r.barato || r.top || r.look || r.presente || r.num || r.parte || /\b(quero|procuro|preciso|tem |teria|mostra|ver |busco|achar|indica)/.test(t);
    r.tamDuvida = /que tamanho|qual tamanho|qual numero|que numero|tamanho pego|numero pego|serve em mim|veste (grande|pequeno)|forma (grande|pequena)|tabela|medida|meu tamanho|calco quanto/.test(t);
    r.esta = /\b(esse|essa|este|esta|dessa|desse|nessa|nesse|ele|ela)\b/.test(t);
    r.humano = /pessoa|humano|atendente|whats|zap|falar com (voce|vc|alguem)|ligar|telefone/.test(t);
    r.oi = /^\s*(oi+|ola|eai|e ai|bom dia|boa tarde|boa noite|salve|opa|fala|hey|alo)\b/.test(t) && t.trim().split(/\s+/).length <= 4;
    r.obrigado = /obrigad|valeu|vlw|tmj|show de bola|perfeito|top demais/.test(t) && t.trim().split(/\s+/).length <= 5;
    r.vago = /me ajuda|nao sei|indecis|o que (eu )?compro|me indica algo|algo legal|quero algo|qualquer coisa|sugestao/.test(t);
    return r;
  }

  function montar(o) {
    var ico = o.ico || function () { return ''; }, fmt = o.fmt || function (v) { return 'R$ ' + v; };
    var info = o.info || function () { return {}; }, numeros = o.numeros || function () { return []; };
    var zap = String(o.zap || '').replace(/\D/g, ''), sample = null, ocupado = false;
    var mem = lerS('gs-at', { hist: [], perfil: {}, convites: 0, viu: [] });
    if (!mem.perfil) mem.perfil = {}; if (!mem.hist) mem.hist = []; if (!mem.viu) mem.viu = [];
    function salvar() { mem.hist = mem.hist.slice(-30); gravarS('gs-at', mem); }
    function zapUrl(txt) { return zap ? 'https://wa.me/' + zap + '?text=' + encodeURIComponent(txt) : ''; }

    /* ---------- medição de uso: só temas, nada pessoal ---------- */
    var uso = lerS('gs-at-uso', { temas: {}, sem: [] });
    function medir(tema, pergunta) {
      uso.temas[tema] = (uso.temas[tema] || 0) + 1;
      /* pergunta sem resposta ajuda a melhorar o FAQ: vai sem números, e-mails ou @ (tira contato e documento) */
      if (tema === 'sem-resposta' && pergunta && uso.sem.length < 5) uso.sem.push(String(pergunta).replace(/\S+@\S+/g, '[e-mail]').replace(/@\w+/g, '[@]').replace(/\d[\d\s().-]{3,}\d/g, '[n]').slice(0, 120));
      gravarS('gs-at-uso', uso);
    }
    function enviarUso() {
      var n = Object.keys(uso.temas).length; if (!n) return;
      var corpo = JSON.stringify({ temas: uso.temas, sem: uso.sem, site: noNetlify ? 'netlify' : 'claude' });
      try { if (navigator.sendBeacon && navigator.sendBeacon(URL_USO, new Blob([corpo], { type: 'text/plain' }))) { uso = { temas: {}, sem: [] }; gravarS('gs-at-uso', uso); } } catch (e) { /* bloqueado: tenta na próxima visita */ }
    }
    root.addEventListener('pagehide', enviarUso);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') enviarUso(); });

    /* ---------- 1. botões flutuantes ---------- */
    var flu = el('div', 'at-flu');
    var bZap = el('a', 'at-zap', '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>');
    bZap.target = '_blank'; bZap.rel = 'noopener'; bZap.setAttribute('aria-label', 'Falar no WhatsApp');
    var bAss = el('button', 'at-ass', ico('chat', 18) + '<span>Dúvidas?</span>'); bAss.type = 'button'; bAss.setAttribute('aria-haspopup', 'dialog'); bAss.setAttribute('aria-expanded', 'false');
    flu.appendChild(bAss); flu.appendChild(bZap);
    document.body.appendChild(flu);
    function syncZap() {
      bZap.hidden = !zap;
      if (zap) bZap.href = zapUrl('Oi! Vim do site do Garimpados e queria tirar uma dúvida.');
    }

    /* ---------- 2. assistente ---------- */
    var pn = el('div', 'at-pn'); pn.setAttribute('role', 'dialog'); pn.setAttribute('aria-modal', 'false'); pn.setAttribute('aria-labelledby', 'at-h'); pn.hidden = true;
    pn.innerHTML =
      '<div class="at-pn__top"><div><p class="at-pn__k mono">Atendimento · vendedor</p><h3 id="at-h">Fala com o <span>Garimpados</span></h3></div><button type="button" class="at-x" aria-label="Fechar">' + ico('close', 18) + '</button></div>' +
      '<div class="at-msgs" id="at-msgs" aria-live="polite"></div>' +
      '<div class="at-chips" id="at-chips"></div>' +
      '<form class="at-form" id="at-form"><input id="at-in" type="text" maxlength="400" autocomplete="off" enterkeyhint="send" placeholder="Ex.: moletom preto até R$ 180, tamanho G" aria-label="Sua pergunta"><button type="submit" class="at-send" aria-label="Enviar">' + ico('arrow', 18) + '</button></form>' +
      '<a class="at-humano" id="at-humano" target="_blank" rel="noopener" hidden>Ainda com dúvida? Falar com uma pessoa</a>';
    document.body.appendChild(pn);
    var msgs = pn.querySelector('#at-msgs'), form = pn.querySelector('#at-form'), inp = pn.querySelector('#at-in'), chipsEl = pn.querySelector('#at-chips');
    var CHIPS_INICIO = ['Monta um look até R$ 300', 'O que tá em promoção?', 'Tênis até R$ 200', 'Que tamanho eu pego?', 'As peças são originais?', 'Como troco ou devolvo?'];
    function setChips(lista) { chipsEl.innerHTML = (lista || CHIPS_INICIO).map(function (c) { return '<button type="button" class="at-chip">' + esc(c) + '</button>'; }).join(''); }
    setChips();

    function rolar() { msgs.scrollTop = msgs.scrollHeight; }
    function fala(quem, txt) { var b = el('div', 'at-m at-m--' + quem); b.textContent = txt; msgs.appendChild(b); rolar(); return b; }
    function tabelaHTML(tab) {
      return '<div class="at-tab" role="region" aria-label="Tabela de medidas" tabindex="0"><table><thead><tr>' + tab[0].map(function (c) { return '<th scope="col">' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        tab.slice(1).map(function (l) { return '<tr>' + l.map(function (c, i) { return i ? '<td>' + esc(c) + '</td>' : '<th scope="row">' + esc(c) + '</th>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
    }
    /* cartão de peça dentro da conversa: foto, preço, desconto, data do preço e ações */
    function cartaoHTML(p) {
      var f = info(p) || {}, o = p.oldPrice && p.price != null && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
      return '<div class="at-card" data-id="' + esc(p.id) + '">' +
        '<button type="button" class="at-card__im" data-at-ver="' + esc(p.id) + '" aria-label="Ver ' + esc(p.name) + '">' + (f.thumb ? '<img src="' + esc(f.thumb) + '" alt="" loading="lazy" decoding="async">' : '') + '</button>' +
        '<div class="at-card__tx"><b class="at-card__nm">' + esc(p.name) + '</b>' +
          '<span class="at-card__pr">' + (p.price != null ? (p.priceFrom ? '<small>a partir de </small>' : '') + '<b class="mono">' + esc(fmt(p.price)) + '</b>' + (o ? ' <s class="mono">' + esc(fmt(p.oldPrice)) + '</s> <em>-' + o + '%</em>' : '') : 'Ver preço na loja') + '</span>' +
          (p.priceAt ? '<span class="at-card__dt mono">Preço visto em ' + dia(p.priceAt) + (p.store ? ' na ' + esc(p.store) : '') + '</span>' : '') +
          '<span class="at-card__bt"><button type="button" class="at-mini" data-at-ver="' + esc(p.id) + '">Ver</button>' +
            (f.link ? '<a class="at-mini at-mini--gold" href="' + esc(f.link) + '" target="_blank" rel="noopener sponsored" data-at-compra="' + esc(p.id) + '">Comprar' + ico('external', 12) + '</a>' : '') +
            (f.provar ? '<button type="button" class="at-mini" data-at-provar="' + esc(p.id) + '">Provar</button>' : '') + '</span>' +
        '</div></div>';
    }
    /* resposta rica: { txt, tabela, pecas:[produto], total, depois, chips, tema } */
    function falaRica(r) {
      var b = el('div', 'at-m at-m--bot');
      b.innerHTML = esc(r.txt || '').replace(/\n/g, '<br>') + (r.tabela ? tabelaHTML(r.tabela) : '');
      msgs.appendChild(b);
      if (r.pecas && r.pecas.length) {
        var box = el('div', 'at-cards', r.pecas.map(cartaoHTML).join('') + (r.total ? '<p class="at-total">Total do look: <b class="mono">' + esc(fmt(r.total)) + '</b>' + (r.provarTudo ? ' <button type="button" class="at-mini" data-at-provar-tudo="' + esc(r.pecas.map(function (p) { return p.id; }).join(',')) + '">Provar o look</button>' : '') + '</p>' : ''));
        msgs.appendChild(box);
      }
      if (r.depois) { var d = el('div', 'at-m at-m--bot at-m--depois'); d.textContent = r.depois; msgs.appendChild(d); }
      setChips(r.chips);
      rolar(); return b;
    }
    msgs.addEventListener('click', function (e) {
      var v = e.target.closest('[data-at-ver]'), pr = e.target.closest('[data-at-provar]'), pt = e.target.closest('[data-at-provar-tudo]'), c = e.target.closest('[data-at-compra]');
      /* no celular o chat cobre a tela: fecha antes de abrir a ficha (a conversa fica guardada) */
      if (v && o.abrirPeca) { medir('clique-ver'); if (root.innerWidth < 900) fechar(); o.abrirPeca(v.getAttribute('data-at-ver')); return; }
      if (pr && o.provar) { medir('clique-provar'); fechar(); o.provar(pr.getAttribute('data-at-provar')); return; }
      if (pt && o.provar) { medir('clique-provar'); fechar(); pt.getAttribute('data-at-provar-tudo').split(',').forEach(function (id) { o.provar(id, true); }); return; }
      if (c) { medir('clique-comprar'); sinal('compra'); }
    });

    function resumo() {
      var perg = mem.hist.filter(function (m) { return m.q; }).slice(-3).map(function (m) { return '• ' + m.q; }).join('\n');
      return 'Oi! Vim do assistente do site Garimpados.' + (perg ? '\nMinhas dúvidas:\n' + perg : '');
    }
    /* o WhatsApp é a última opção: o link só aparece depois de 2 perguntas, se o vendedor não achou resposta, ou quando o cliente pede uma pessoa */
    var semResposta = 0;
    function syncHumano() {
      var a = pn.querySelector('#at-humano'), us = mem.hist.filter(function (m) { return m.q; });
      var pediu = us.some(function (m) { return entender(m.q).humano; });
      a.hidden = !zap || !(us.length >= 2 || pediu || semResposta >= 1);
      if (zap) a.href = zapUrl(resumo());
    }

    function boasVindas() {
      var p = o.atual && o.atual() && porId(o.atual());
      if (p) return { txt: 'Salve! Vi que você está olhando ' + p.name + '. Posso te ajudar com o tamanho, ver o que combina ou achar algo parecido mais barato.', chips: ['Que tamanho eu pego?', 'O que combina com essa?', 'Tem parecido mais barato?', 'Frete e prazo'] };
      return { txt: 'Salve! Sou o vendedor do Garimpados. Me diz o que você procura (tipo de peça, ocasião, quanto quer gastar, seu tamanho) que eu garimpo pra você. Também tiro dúvida de tamanho, entrega e troca.', chips: CHIPS_INICIO };
    }
    function abrir(ctx) {
      esconderConvite();
      pn.hidden = false; requestAnimationFrame(function () { pn.classList.add('is-on'); });
      bAss.setAttribute('aria-expanded', 'true');
      if (!msgs.children.length) {
        /* memória da visita: refaz a conversa salva na sessão */
        mem.hist.forEach(function (m) { if (m.q) fala('eu', m.q); if (m.r) falaRica(revive(m.r)); });
        if (!mem.hist.length) falaRica(boasVindas());
      }
      if (ctx) falaRica(ctx);
      syncHumano(); setTimeout(function () { inp.focus({ preventScroll: true }); }, 60);
    }
    function fechar() { pn.classList.remove('is-on'); bAss.setAttribute('aria-expanded', 'false'); setTimeout(function () { if (!pn.classList.contains('is-on')) pn.hidden = true; }, 260); }
    bAss.addEventListener('click', function () { pn.hidden ? abrir() : (fechar(), bAss.focus()); });
    pn.querySelector('.at-x').addEventListener('click', function () { fechar(); bAss.focus(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pn.hidden) { fechar(); bAss.focus(); } });
    chipsEl.addEventListener('click', function (e) { var c = e.target.closest('.at-chip'); if (c) perguntar(c.textContent); });
    form.addEventListener('submit', function (e) { e.preventDefault(); var t = inp.value.trim(); if (t) { inp.value = ''; perguntar(t); } });

    /* ---------- catálogo ---------- */
    function tams(p) { return (Array.isArray(p.sizes) ? p.sizes : String(p.sizes || '').split(/[,;/]+/)).map(function (s) { return String(s).trim(); }).filter(Boolean); }
    function catDe(t) { for (var i = 0; i < CATS.length; i++) if (CATS[i][1].test(' ' + t + ' ')) return CATS[i][0]; return ''; }
    function tipoDe(p) { return KIND_CAT[p.kind] || catDe(norm(p.category || '')) || catDe(norm(p.name)); }
    function offDe(p) { return p.oldPrice && p.price != null && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0; }
    function nota(p) { return (p.stats && +p.stats.rating) || 0; }
    function avals(p) { var r = String((p.stats && p.stats.reviews) || ''), n = parseFloat(r.replace(/[^\d]/g, '')) || 0; return /k|mil/i.test(r) ? n * 1000 : n; }
    function vendaveis() { return (o.pecas() || []).filter(function (p) { return !p.hidden && !p.sample && p.link && p.price != null; }); }
    function porId(id) { var l = o.pecas() || []; for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
    function temTam(p, tam) { if (!tam) return true; return tams(p).some(function (s) { var k = norm(s).replace(/\s/g, ''); return (TAM_ROUPA[k] || s.toUpperCase()) === tam; }); }
    function temNum(p, n) { return !n || numeros(p).indexOf(n) >= 0; }
    function corDe(p, cor) { var c = CORES.filter(function (x) { return x[0] === cor; })[0]; return c && c[1].test(' ' + norm(p.name) + ' '); }
    /* revive cartões salvos na sessão (guardamos só os ids) */
    function revive(r) { var c = Object.assign({}, r); if (r.ids) c.pecas = r.ids.map(porId).filter(Boolean); return c; }
    function guardavel(r) { var c = Object.assign({}, r); if (r.pecas) c.ids = r.pecas.map(function (p) { return p.id; }); delete c.pecas; return c; }

    /* pontua uma peça pelo pedido + perfil da conversa. Filtros duros: tipo, orçamento e tamanho. */
    function ranquear(pd, lista, sem) {
      sem = sem || {};
      var est = ESTILOS.filter(function (e) { return e[0] === pd.estilo; })[0];
      var out = filtrar(pd, lista, sem, est);
      /* cor e estilo pedidos são filtro: se existe peça que bate, só elas aparecem (senão mostra as outras, na ordem) */
      if (pd.cor && !sem.cor) { var daCor = out.filter(function (p) { return corDe(p, pd.cor); }); if (daCor.length) out = daCor; }
      if (est && est[3]) { var doEst = out.filter(function (p) { return est[3].test(norm(p.name)); }); if (doEst.length) out = doEst; }
      return pontuar(pd, out, est);
    }
    function filtrar(pd, lista, sem, est) {
      return lista.filter(function (p) {
        var tp = tipoDe(p);
        if (pd.cat && tp !== pd.cat) return false;
        if (!pd.cat && pd.parte === 'cima' && !CIMA[tp]) return false;
        if (!pd.cat && pd.parte === 'baixo' && !BAIXO[tp]) return false;
        if (!pd.cat && !pd.parte && est && est[2] && !est[2][tp]) return false;
        if (!sem.preco && pd.teto && p.price > pd.teto) return false;
        if (!sem.preco && pd.min && p.price < pd.min) return false;
        if (!sem.tam && tp !== 'tenis' && pd.tam && !temTam(p, pd.tam)) return false;
        if (!sem.tam && tp === 'tenis' && pd.num && !temNum(p, pd.num)) return false;
        if (pd.promo && !offDe(p)) return false;
        if (sem.ids && sem.ids.indexOf(p.id) >= 0) return false;
        return true;
      });
    }
    function pontuar(pd, lista, est) {
      return lista.map(function (p) {
        var s = 0, n = norm(p.name);
        if (pd.cor) s += corDe(p, pd.cor) ? 30 : -8;
        if (est && est[3]) s += est[3].test(n) ? 22 : 0;
        if (pd.promo || pd.barato === false) s += offDe(p) * .8;
        s += offDe(p) * .25 + nota(p) * 3 + Math.min(10, Math.log10(1 + avals(p)) * 3);
        if (pd.top) s += nota(p) * 6 + Math.log10(1 + avals(p)) * 5;
        if (pd.barato) s -= p.price / 8;
        if (mem.viu.indexOf(p.id) >= 0) s += 3;
        return [p, s];
      }).sort(function (a, b) { return b[1] - a[1]; }).map(function (x) { return x[0]; });
    }

    /* look: cima + baixo (+ tênis se couber) dentro do orçamento, respeitando cor, estilo e tamanho */
    function montarLook(pd, fora) {
      fora = fora || [];
      var all = vendaveis().filter(function (p) { return fora.indexOf(p.id) < 0; }), teto = pd.teto || null;
      var base = Object.assign({}, pd, { cat: null, teto: null, min: null, parte: null });
      var est = ESTILOS.filter(function (e) { return e[0] === pd.estilo; })[0], quer = est && est[2];
      var cima = ranquear(Object.assign({}, base, { parte: 'cima' }), all).filter(function (p) { return !quer || quer[tipoDe(p)] || !Object.keys(quer).some(function (k) { return CIMA[k]; }); }).slice(0, 10);
      var baixo = ranquear(Object.assign({}, base, { parte: 'baixo' }), all).filter(function (p) { return !quer || quer[tipoDe(p)] || !Object.keys(quer).some(function (k) { return BAIXO[k]; }); }).slice(0, 10);
      var tenis = ranquear(Object.assign({}, base, { cat: 'tenis', estilo: pd.estilo === 'corrida' || pd.estilo === 'basquete' || pd.estilo === 'chunky' ? pd.estilo : null }), all).slice(0, 8);
      var melhor = null;
      cima.forEach(function (a, ia) { baixo.forEach(function (b, ib) {
        var sub = a.price + b.price; if (teto && sub > teto) return;
        var t3 = null; tenis.forEach(function (c) { if (!t3 && (!teto || sub + c.price <= teto)) t3 = c; });
        var nota3 = -ia * 2 - ib * 2 + (t3 ? 12 : 0) + (pd.cor && corDe(a, pd.cor) ? 6 : 0) + (pd.cor && corDe(b, pd.cor) ? 6 : 0) - (teto ? (teto - sub - (t3 ? t3.price : 0)) / 40 : 0);
        if (!melhor || nota3 > melhor.n) melhor = { n: nota3, pecas: t3 ? [a, b, t3] : [a, b] };
      }); });
      return melhor;
    }

    /* ---------- o vendedor (sem IA) ---------- */
    function resposta(q) {
      var pd = entender(q), P = mem.perfil, atualId = o.atual && o.atual(), atual = atualId && porId(atualId);
      /* lembra o que a pessoa disse (tamanho, número, orçamento, cor, estilo) e usa nas próximas respostas */
      ['tam', 'num', 'teto', 'cor', 'estilo'].forEach(function (k) { if (pd[k]) P[k] = pd[k]; });
      if (pd.oi) return { tema: 'saudacao', txt: 'Salve! Me conta: é pra qual ocasião, qual seu tamanho e até quanto quer gastar? Com isso eu garimpo certinho.', chips: ['Look pro rolê até R$ 300', 'Moletom pra frio', 'Tênis até R$ 200', 'O que tá em promoção?'] };
      if (pd.obrigado) return { tema: 'obrigado', txt: 'Tamo junto! Se bater dúvida de tamanho ou quiser montar outro look, é só chamar.', chips: ['Monta outro look', 'O que tá em promoção?'] };
      if (pd.humano) return { tema: 'humano', txt: zap ? 'Claro. O link para falar com uma pessoa no WhatsApp está logo abaixo, já com o resumo da sua dúvida. Se quiser, antes eu tento resolver aqui mesmo.' : 'No momento o atendimento é por aqui mesmo. Me conta a dúvida que eu resolvo.' };

      /* tamanho de uma peça específica (a da ficha aberta, a citada pelo nome ou a última recomendada) */
      /* peça em foco: a citada pelo nome, a ficha aberta ou a última que o vendedor destacou */
      var citada = pecaCitada(pd.t), sobrePeca = pd.tamDuvida || pd.esta || /combin|parecid|similar|alternativ/.test(pd.t);
      var alvo = citada || (sobrePeca ? atual || ultimaRecomendada() : null);
      /* "tabela de tênis" logo depois de ver uma bermuda é pergunta geral, não sobre a bermuda */
      if (!citada && alvo && pd.cat && tipoDe(alvo) !== pd.cat) alvo = null;
      if (!citada && alvo && /tabela/.test(pd.t) && !pd.esta) alvo = null;
      if (alvo) mem.foco = alvo.id;
      if (pd.tamDuvida && alvo) return tamanhoDaPeca(alvo, P);
      /* peça citada pelo nome ("tem o Niteball no 38?"): disponibilidade de tamanho ou a própria peça */
      if (citada && !pd.look && !/combin|parecid|similar|mais barat/.test(pd.t)) {
        if (pd.num || pd.tam) return tamanhoDaPeca(citada, Object.assign({}, P, { num: pd.num, tam: pd.tam }));
        mem.ultimas = [citada.id];
        return { tema: 'peca-citada', txt: 'Achei:', pecas: [citada], depois: urgencia([citada]) + ' ' + complementoFrase(tipoDe(citada)), chips: ['Que tamanho eu pego?', 'O que combina com essa?', 'Tem parecido mais barato?'] };
      }
      if (pd.tamDuvida) {
        var tn = pd.cat === 'tenis' || /tenis|numero|calco|\bpe\b/.test(pd.t);
        var f0 = FAQ_ID[tn ? 'tamanho-tenis' : 'tamanho-roupa'];
        return { tema: f0[0], txt: f0[2], tabela: f0[4], chips: tn ? ['Tênis no meu número', 'Tênis até R$ 200'] : ['Moletom tamanho G', 'Camiseta oversized'] };
      }
      /* só informou o tamanho ("uso G", "calço 41"): anota e, se tem peça em foco, confere nela */
      if ((pd.tam || pd.num) && !pd.cat && !pd.look && !pd.teto && !pd.cor && !pd.estilo && !pd.promo && !citada) {
        var foco = atual || ultimaRecomendada();
        if (foco && ((pd.num && tipoDe(foco) === 'tenis') || (pd.tam && tipoDe(foco) !== 'tenis'))) return tamanhoDaPeca(foco, P);
        return { tema: 'perfil-tamanho', txt: 'Anotado: ' + (pd.tam ? 'roupa ' + pd.tam : '') + (pd.tam && pd.num ? ' e ' : '') + (pd.num ? 'tênis ' + pd.num : '') + '. Daqui pra frente eu só te mostro o que tem no seu tamanho. O que você procura?', chips: pd.num ? ['Tênis até R$ 200', 'Monta um look com tênis'] : ['Moletom', 'Camiseta oversized', 'Monta um look até R$ 300'] };
      }
      /* "o que combina com essa?" → complementos da peça */
      if (alvo && /combin|junto|com o que|com que|completa|fecha|look com|fit com/.test(pd.t)) return complementos(alvo, P);
      /* "mais barato" logo depois de um look: refaz o look com orçamento menor */
      if (/mais barat|mais em conta/.test(pd.t) && mem.ultimoTema === 'look' && mem.ultimoTotal) { pd.look = true; pd.teto = Math.floor(mem.ultimoTotal * .85); }
      /* "parecido mais barato" */
      if (alvo && /parecid|similar|igual|mais barat|alternativ/.test(pd.t)) return parecidos(alvo);

      /* dúvida frequente (só quando não é pedido de compra) */
      var fq = melhorFaq(pd.t);
      if (fq && fq.s >= 3 && !(pd.cat || pd.look || pd.teto || pd.promo)) return { tema: fq.f[0], txt: fq.f[2], tabela: fq.f[4], chips: proximosChips(fq.f[0]) };

      if (pd.vago && !pd.cat && !pd.look && !pd.estilo && !pd.teto && !pd.cor && !pd.promo) return { tema: 'qualifica', txt: 'Bora achar o certo. Me diz 3 coisas: pra qual ocasião (rolê, dia a dia, frio, treino), seu tamanho ou número e até quanto quer gastar.', chips: ['Rolê, G, até R$ 300', 'Dia a dia, M, até R$ 200', 'Tênis 40 até R$ 250', 'Pra frio, até R$ 200'] };

      if (pd.look || (pd.presente && !pd.cat)) {
        var pl = Object.assign({}, pd, { teto: pd.teto || (pd.look ? P.teto : null), cor: pd.cor || P.cor, estilo: pd.estilo || P.estilo, tam: pd.tam || P.tam, num: pd.num || P.num });
        /* "outro look": tira as peças de cima e de baixo do look anterior */
        var lk = montarLook(pl, pd.outro && mem.ultimoTema === 'look' ? (mem.ultimas || []).slice(0, 2) : []);
        if (!lk && (pl.cor || pl.estilo) && pl.teto) {
          /* não fecha com a cor/estilo pedidos: tenta sem eles, dentro do mesmo orçamento, e avisa */
          var lk1 = montarLook(Object.assign({}, pl, { cor: null, estilo: null }));
          if (lk1) { mem.ultimas = lk1.pecas.map(function (p) { return p.id; }); mem.foco = null; return { tema: 'look', txt: 'Até R$ ' + pl.teto + (pl.cor ? ' puxado pro ' + pl.cor : '') + ' não fecha. Sem esse filtro, fica assim:', pecas: lk1.pecas, total: lk1.pecas.reduce(function (a, p) { return a + p.price; }, 0), provarTudo: true, depois: urgencia(lk1.pecas), chips: ['Outro look', 'Que tamanho eu pego?'] }; }
        }
        if (!lk) {
          var lk2 = montarLook(Object.assign({}, pl, { teto: null }));
          return { tema: 'look', txt: 'Com ' + (pl.teto ? 'R$ ' + pl.teto : 'esse orçamento') + ' não fecha um look completo agora.' + (lk2 ? ' O mais em conta que eu monto sai por ' + fmt(lk2.pecas.slice(0, 2).reduce(function (a, p) { return a + p.price; }, 0)) + ' (cima + baixo):' : ''), pecas: lk2 ? lk2.pecas.slice(0, 2) : [], chips: ['Só a parte de cima', 'Só tênis', 'Look até R$ 400'] };
        }
        var tot = lk.pecas.reduce(function (a, p) { return a + p.price; }, 0);
        mem.ultimas = lk.pecas.map(function (p) { return p.id; }); mem.foco = null;
        return { tema: 'look', txt: 'Fit garimpado' + (pl.estilo ? ' ' + ESTILOS.filter(function (e) { return e[0] === pl.estilo; })[0][4] : '') + (pl.cor ? ', puxado pro ' + pl.cor : '') + (pl.teto ? ', até R$ ' + pl.teto : '') + ':', pecas: lk.pecas, total: tot, provarTudo: true,
          depois: urgencia(lk.pecas) + (pl.tam || pl.num ? '' : ' Me fala seu tamanho' + (lk.pecas.length > 2 ? ' e número' : '') + ' que eu confiro se tem em todas.'), chips: ['Outro look', 'Mais barato', 'Que tamanho eu pego?'] };
      }

      if (pd.compra || pd.mais) {
        var base = pd.mais && mem.ultimoPedido ? Object.assign({}, mem.ultimoPedido, { barato: pd.barato || mem.ultimoPedido.barato }) : pd;
        /* o perfil completa o pedido só onde faz sentido: tamanho de roupa em roupa, número em tênis */
        var ehTenis = base.cat === 'tenis', ehRoupa = base.cat && !ehTenis || base.parte;
        var pq = Object.assign({}, base, { tam: base.tam || (ehRoupa ? P.tam : null), num: base.num || (ehTenis ? P.num : null), cor: base.cor });
        var excl = pd.mais ? (mem.ultimas || []) : [];
        var lista = ranquear(pq, vendaveis(), { ids: excl });
        var aviso = '';
        if (!lista.length && (pq.tam || pq.num)) { lista = ranquear(pq, vendaveis(), { tam: 1, ids: excl }); if (lista.length) aviso = 'No seu tamanho não achei, mas o estoque muda: veja na loja. '; }
        if (!lista.length && (pq.teto || pq.min)) {
          lista = ranquear(pq, vendaveis(), { preco: 1, ids: excl }).sort(function (a, b) { return a.price - b.price; });
          if (lista.length) aviso = (pq.teto ? 'Até R$ ' + pq.teto : 'Nessa faixa') + ' não tenho ' + (pq.cat ? NOME_CAT[pq.cat] : 'peça') + ' agora. O mais perto: ';
        }
        mem.ultimoPedido = pd.mais ? mem.ultimoPedido : pd;
        if (!lista.length) return { tema: 'sem-estoque', txt: pd.mais ? 'Já te mostrei tudo o que tenho nessa linha. Quer tentar outra cor ou outro tipo de peça?' : 'Não achei ' + (pq.cat ? NOME_CAT[pq.cat] : 'peça') + ' com isso agora na vitrine. Quer que eu tente sem filtro de cor ou com outro orçamento?', chips: ['O que tá em promoção?', 'Monta um look', 'Tênis até R$ 200'] };
        var top = lista.slice(0, 3);
        mem.ultimas = excl.concat(top.map(function (p) { return p.id; })); mem.foco = top[0].id;
        var tit = aviso || ((pd.promo ? 'Os maiores descontos' : pd.top ? 'As mais bem avaliadas' : pd.barato ? 'As mais em conta' : 'Separei') + (pq.cat ? ' em ' + NOME_CAT[pq.cat] : '') + (pq.cor ? ' ' + corTxt(pq.cor, pq.cat) : '') + (pq.estilo ? ' ' + ESTILOS.filter(function (e) { return e[0] === pq.estilo; })[0][4] : '') + (pq.teto ? ' até R$ ' + pq.teto : '') + (pq.tam && pq.cat !== 'tenis' ? ', tamanho ' + pq.tam : '') + (pq.num && (pq.cat === 'tenis' || !pq.cat) ? ', número ' + pq.num : '') + ':');
        var tipo1 = tipoDe(top[0]);
        return { tema: 'busca-' + (pq.cat || (pd.promo ? 'promo' : 'geral')), txt: tit, pecas: top, depois: urgencia(top) + ' ' + complementoFrase(tipo1),
          chips: [lista.length > 3 ? 'Mais opções' : null, tipo1 === 'tenis' ? 'Monta um look com tênis' : 'Monta um look com essa', 'Que tamanho eu pego?'].filter(Boolean) };
      }
      if (fq && fq.s >= 1) return { tema: fq.f[0], txt: fq.f[2], tabela: fq.f[4], chips: proximosChips(fq.f[0]) };
      semResposta++;
      return { tema: 'sem-resposta', txt: 'Não peguei essa. Tenta de outro jeito, tipo "moletom preto até R$ 180", "tênis 41", "o que tá em promoção" ou "como troco". Se preferir, também dá pra falar com uma pessoa pelo link abaixo.', chips: CHIPS_INICIO.slice(0, 4) };
    }
    function melhorFaq(t) {
      var w = t.split(/[^a-z0-9]+/).filter(function (x) { return x.length > 2; }), best = null, bs = 0;
      FAQ.forEach(function (f) { var ft = ' ' + norm(f[1] + ' ' + f[3]) + ' ', s = 0; w.forEach(function (x) { if (ft.indexOf(' ' + x) >= 0) s += x.length > 4 ? 2 : 1; }); if (s > bs) { bs = s; best = f; } });
      return best ? { f: best, s: bs } : null;
    }
    function proximosChips(id) {
      var m = { comprar: ['Formas de pagamento', 'Frete e prazo', 'É seguro?'], pagamento: ['Frete e prazo', 'Tem taxa?', 'Tem cupom?'], frete: ['Tem taxa?', 'Como troco?', 'O que tá em promoção?'], troca: ['Meu pedido atrasou', 'Que tamanho eu pego?'], original: ['É seguro comprar?', 'Mais bem avaliadas'], 'tamanho-roupa': ['Moletom tamanho G', 'Tabela de tênis'], 'tamanho-tenis': ['Tênis no número 40', 'Tênis até R$ 200'] };
      return m[id] || ['O que tá em promoção?', 'Monta um look até R$ 300', 'Que tamanho eu pego?'];
    }
    /* urgência honesta: só o que é verdade (data em que vimos o preço e desconto do anúncio) */
    function urgencia(lista) {
      var com = lista.filter(function (p) { return offDe(p) >= 10; }), dt = lista.map(function (p) { return p.priceAt; }).filter(Boolean).sort()[0];
      return (com.length ? (com.length === 1 ? 'Essa está com ' + offDe(com[0]) + '% off no anúncio. ' : 'Tem desconto de anúncio em ' + com.length + ' delas. ') : '') + (dt ? 'Preço visto em ' + dia(dt) + ': promoção de loja muda sem aviso, então vale garantir no "Comprar".' : 'Confira o preço final no anúncio.');
    }
    /* concordância: "calça preta", "moletom preto" */
    function corTxt(cor, cat) { return /^(calca|jaqueta|camiseta|bermuda|meia)$/.test(cat || '') ? cor.replace(/o$/, 'a') : cor; }
    function complementoFrase(tp) {
      if (tp === 'tenis') return 'Quer que eu monte a roupa que fecha com esse tênis?';
      if (CIMA[tp]) return 'Quer ver a parte de baixo e o tênis que combinam?';
      if (BAIXO[tp]) return 'Quer a parte de cima e o tênis pra fechar o fit?';
      return '';
    }
    /* peça em foco: a que o vendedor destacou por último (complemento mantém o foco na peça base), senão a 1ª da última lista */
    function ultimaRecomendada() { var u = mem.ultimas || []; return (mem.foco && porId(mem.foco)) || (u.length ? porId(u[0]) : null); }
    /* peça citada pelo nome: 2 palavras marcantes do nome, ou o apelido do tênis (ex.: "Niteball") */
    function pecaCitada(t) {
      var melhor = null, ms = 0;
      vendaveis().forEach(function (p) {
        var ws = norm(p.name).split(/\s+/).filter(function (x) { return x.length > 3 && !/tenis|moletom|calca|camiseta|bermuda|jaqueta|preto|preta|branco|branca|cinza|com|ziper|capuz/.test(x); });
        var s = ws.filter(function (x) { return t.indexOf(x) >= 0; }).length;
        if (p.short && norm(p.short).length >= 4 && new RegExp('\\b' + norm(p.short) + '\\b').test(t)) s += 2;
        if (s > ms) { ms = s; melhor = p; }
      });
      return ms >= 2 ? melhor : null;
    }
    function tamanhoDaPeca(p, P) {
      var tp = tipoDe(p), sz = tams(p), tn = tp === 'tenis';
      var txt = p.name + ': ' + (sz.length ? (tn ? 'numeração ' : 'tamanhos ') + sz.join(', ') + ' no anúncio.' : 'os tamanhos estão no anúncio.');
      if (tn) {
        var uk = sz.some(function (s) { return /^uk/i.test(s); });
        if (P.num) txt += temNum(p, P.num) ? ' Seu ' + P.num + ' aparece disponível' + (uk ? ' (em UK, conversão aproximada: confira a tabela em cm do anúncio)' : '') + '.' : ' Não vi o ' + P.num + ' nessa numeração' + (uk ? ' (ela vem em UK; confira a tabela em cm do anúncio)' : '') + '.';
        else txt += uk ? ' Esse vem em numeração UK: use a tabela abaixo como referência e confira a medida em cm no anúncio.' : ' Me diz seu número que eu confiro.';
        txt += ' A medida mais segura é o comprimento do pé em cm.';
      } else {
        if (P.tam) txt += temTam(p, P.tam) ? ' O seu ' + P.tam + ' está na grade.' : ' Não vi o ' + P.tam + ' nessa peça.';
        txt += ' Pra acertar: meça uma peça sua (' + (BAIXO[tp] ? 'cintura e comprimento' : 'axila a axila e comprimento') + ') e compare com a tabela em cm do anúncio. Na dúvida entre dois, o maior dá o caimento largo do streetwear. Veja nas avaliações quem comenta se veste grande ou pequeno.';
      }
      mem.foco = p.id;
      return { tema: 'tamanho-peca', txt: txt, tabela: tn ? TAB_TENIS : TAB_ROUPA, pecas: [p], chips: tn ? ['O que combina com esse?', 'Tem parecido mais barato?'] : ['O que combina com essa?', 'Tem parecido mais barato?'] };
    }
    function complementos(p, P) {
      var tp = tipoDe(p), all = vendaveis().filter(function (x) { return x.id !== p.id; }), out = [];
      var pega = function (pd) { var l = ranquear(Object.assign({ cor: P.cor, tam: P.tam, num: P.num }, pd), all); if (l[0]) out.push(l[0]); };
      if (CIMA[tp]) { pega({ parte: 'baixo' }); pega({ cat: 'tenis' }); }
      else if (BAIXO[tp]) { pega({ parte: 'cima' }); pega({ cat: 'tenis' }); }
      else { pega({ parte: 'cima' }); pega({ parte: 'baixo' }); }
      if (!out.length) return { tema: 'combina', txt: 'Ainda não tenho peças pra combinar com essa na vitrine.' };
      var tot = [p].concat(out).reduce(function (a, x) { return a + x.price; }, 0);
      mem.ultimas = out.map(function (x) { return x.id; });
      return { tema: 'combina', txt: 'Com ' + p.name + ' eu fecharia assim:', pecas: out, total: tot, provarTudo: true, depois: 'O total já conta a peça que você estava vendo. ' + urgencia(out), chips: ['Outro look', 'Que tamanho eu pego?'] };
    }
    function parecidos(p) {
      var tp = tipoDe(p), l = vendaveis().filter(function (x) { return x.id !== p.id && tipoDe(x) === tp && x.price < p.price; }).sort(function (a, b) { return a.price - b.price; }).slice(0, 3);
      if (!l.length) return { tema: 'parecido', txt: 'Essa já é a ' + (NOME_CAT[tp] || 'peça') + ' mais em conta da vitrine nesse tipo. Se preferir, toque em "Avise quando baixar" na ficha que a gente avisa se o preço cair.' };
      mem.ultimas = l.map(function (x) { return x.id; });
      return { tema: 'parecido', txt: 'Na mesma linha e mais em conta que ' + fmt(p.price) + ':', pecas: l, depois: urgencia(l) };
    }

    /* ---------- IA (Claude): mesmas regras do vendedor ---------- */
    function catalogo() {
      return vendaveis().map(function (p) {
        var st = p.stats || {};
        return { id: p.id, nome: p.name, tipo: tipoDe(p), loja: p.store || '', preco: p.price, precoAntigo: offDe(p) ? p.oldPrice : null, desconto: offDe(p) ? offDe(p) + '%' : '', apartirDe: !!p.priceFrom, precoVistoEm: dia(p.priceAt), nota: st.rating || '', avaliacoes: st.reviews || '', tamanhos: tams(p).join(', '), podeProvar: !!(info(p) || {}).provar, caimento: p.caimento || null, parcela: p.parcela || null, porQue: p.nota || '' };
      });
    }
    /* site público: a IA fica no servidor (/api/vendedor), que guarda a chave. Sem chave devolve 503 e o vendedor local responde. */
    var remotoOk = !!o.publico;
    async function iaRemota(q) {
      if (!remotoOk) return null;
      var bolha = fala('bot', '…');
      try {
        var conversa = [];
        mem.hist.slice(-3).forEach(function (m) { conversa.push({ role: 'user', content: m.q }); if (m.r && m.r.txt) conversa.push({ role: 'assistant', content: m.r.txt }); });
        conversa.push({ role: 'user', content: q });
        var r = await fetch('/api/vendedor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversa: conversa, pecaId: (o.atual && o.atual()) || '' }) });
        bolha.remove();
        if (!r.ok) { remotoOk = false; return null; }
        var d = await r.json(), t = d && d.texto ? String(d.texto) : '';
        if (!t) return null;
        var n = norm(t), citadas = vendaveis().filter(function (p) { return n.indexOf(norm(p.name)) >= 0; }).slice(0, 3);
        if (citadas.length) mem.ultimas = citadas.map(function (p) { return p.id; });
        return { tema: 'ia', txt: t, pecas: citadas };
      } catch (e) { bolha.remove(); return null; }
    }
    async function ia(q) {
      if (!sample) return iaRemota(q);
      var atualId = o.atual && o.atual(), sys = 'Você é o vendedor e stylist do Garimpados Shop, uma vitrine de achados de streetwear com links de AFILIADO. Objetivo: resolver a dúvida aqui mesmo e ajudar a pessoa a escolher e comprar bem, como um bom vendedor de loja (atencioso, nunca insistente).\n\n' +
        'COMO VENDER\n' +
        '- Entenda o que a pessoa quer: tipo de peça, ocasião, estilo, cor, orçamento e tamanho. Se faltar algo importante, faça UMA pergunta curta.\n' +
        '- Recomende 1 a 3 peças ESPECÍFICAS do catálogo, citando o NOME EXATO (o site transforma o nome em cartão com foto e botões), com preço e desconto.\n' +
        '- Monte looks (parte de cima + parte de baixo + tênis) dentro do orçamento e sugira complementos: quem vê tênis, mostre a roupa que combina; quem vê roupa, mostre o tênis.\n' +
        '- Urgência só se for verdade: diga a data em que o preço foi visto e que promoção de loja muda sem aviso. Nunca invente estoque baixo, prazo ou contador.\n' +
        '- Termine levando para a ação: "Compre agora" (abre o anúncio oficial), "Provar" no provador, ou uma pergunta que avance.\n' +
        '- Português do Brasil, tom de streetwear, direto. Até 5 frases ou lista curta. No máximo 1 emoji.\n\n' +
        'TAMANHO\n- Use os tamanhos da peça. Roupa: medir axila a axila e comprimento e comparar com a tabela em cm do anúncio; na dúvida entre dois, o maior (caimento largo). Tênis: medir o pé em cm; numeração UK/EUR é conversão aproximada e varia por marca.\n' +
        '- Referência aproximada de tênis (BR/EUR/UK/cm): ' + TAB_TENIS.slice(1).map(function (l) { return l[0] + '/' + l[1] + '/' + l[2] + '/' + l[4]; }).join('; ') + '.\n\n' +
        'REGRAS\n' +
        '- Quem vende, cobra, entrega, troca e devolve é a loja do anúncio. Pedido, rastreio e troca: passo a passo em Meus pedidos da loja.\n' +
        '- Sobre ser original: toda peça passa por curadoria seletiva do Garimpados (avaliação de quem comprou, acabamento e se vale o preço); a marca e a procedência são as informadas pela loja no anúncio. Nunca afirme "original" por conta própria.\n' +
        '- Nunca invente preço, prazo, frete, taxa, forma de pagamento, cupom ou política. Se não estiver nos dados, diga onde conferir (anúncio ou carrinho da loja).\n' +
        '- WhatsApp é a ÚLTIMA opção: só mencione se a pessoa pedir uma pessoa ou se você realmente não conseguir resolver.\n' +
        '- Não peça nome, CPF, telefone ou dados de pagamento.\n\n' +
        'PERGUNTAS FREQUENTES:\n' + FAQ.map(function (f) { return '- ' + f[1] + ' ' + f[2]; }).join('\n') +
        '\n\nO QUE JÁ SEI DA PESSOA: ' + JSON.stringify(mem.perfil) +
        (atualId ? '\nPEÇA QUE ELA ESTÁ VENDO AGORA (id): ' + atualId : '') +
        '\n\nCATÁLOGO (JSON):\n' + JSON.stringify(catalogo());
      var hist = mem.hist.slice(-6).map(function (m) { return 'Cliente: ' + m.q + '\nVendedor: ' + (m.r ? m.r.txt : ''); }).join('\n');
      var input = [{ role: 'user', content: sys + '\n\nCONVERSA ATÉ AGORA:\n' + hist + '\nCliente: ' + q }];
      var bolha = fala('bot', '…');
      try {
        var r = await sample(input, { modelTier: 'default', cache: false, onText: function (ev) { if (ev && ev.text) { bolha.textContent = ev.text; rolar(); } } });
        var t = (r && r.text || '').trim(); bolha.remove();
        if (!t) return null;
        var n = norm(t), citadas = vendaveis().filter(function (p) { return n.indexOf(norm(p.name)) >= 0; }).slice(0, 3);
        if (citadas.length) mem.ultimas = citadas.map(function (p) { return p.id; });
        return { tema: 'ia', txt: t, pecas: citadas };
      } catch (e) {
        bolha.remove();
        if (e && e.code === 'not_granted') sample = null;
        return null;
      }
    }

    async function perguntar(q) {
      if (ocupado) return; ocupado = true;
      fala('eu', q);
      /* o vendedor local sempre entende a pergunta (perfil, tema medido); com IA, a resposta mostrada é a dela */
      var local = resposta(q), r = await ia(q);
      if (!r) r = local; else { r.tema = local.tema; if (local.tema === 'sem-resposta') semResposta--; }
      medir(r.tema || 'outro', q);
      falaRica(r);
      mem.ultimoTema = r.tema; mem.ultimoTotal = r.total || 0;
      mem.hist.push({ q: q, r: guardavel(r) }); salvar();
      syncHumano(); ocupado = false;
    }
    if (root.claude && root.claude.use) Promise.resolve(root.claude.use('sample')).then(function (s) { sample = s || null; }, function () { sample = null; });

    /* ---------- 3. convite discreto na hora certa ---------- */
    var conv = el('div', 'at-conv'); conv.hidden = true; conv.setAttribute('role', 'status');
    flu.insertBefore(conv, flu.firstChild);
    var tFicha = 0, trocasTam = 0, fichaP = null, comprou = false;
    function esconderConvite() { conv.classList.remove('is-on'); conv.hidden = true; }
    function convidar(p, motivo) {
      if (comprou || !pn.hidden || mem.convites >= 2 || mem.recusou) return;
      mem.convites++; salvar(); medir('convite-' + motivo);
      var txt = motivo === 'tamanho' ? 'Na dúvida entre tamanhos? Te ajudo a escolher o certo.' : 'Quer ajuda com essa peça? Tamanho, o que combina ou opção mais barata.';
      conv.innerHTML = '<button type="button" class="at-conv__go">' + esc(txt) + '</button><button type="button" class="at-conv__x" aria-label="Dispensar">' + ico('close', 14) + '</button>';
      conv.hidden = false; requestAnimationFrame(function () { conv.classList.add('is-on'); });
      conv.querySelector('.at-conv__go').onclick = function () { medir('convite-aceito'); abrir(p ? { txt: motivo === 'tamanho' ? 'Bora acertar o tamanho de ' + p.name + '. Me diz o que você usa (ex.: "uso M" ou "calço 40") ou toque abaixo.' : 'Sobre ' + p.name + ', posso te ajudar com:', chips: ['Que tamanho eu pego?', 'O que combina com essa?', 'Tem parecido mais barato?', 'Frete e prazo'] } : null); };
      conv.querySelector('.at-conv__x').onclick = function () { mem.recusou = true; salvar(); esconderConvite(); };
      setTimeout(esconderConvite, 12000);
    }
    /* sinais vindos do site: abriu ficha, fechou, trocou tamanho, clicou em comprar */
    function sinal(tipo, p) {
      if (tipo === 'ficha' && p) {
        fichaP = p; trocasTam = 0; clearTimeout(tFicha); mem.foco = p.id;
        if (mem.viu.indexOf(p.id) < 0) { mem.viu.push(p.id); mem.viu = mem.viu.slice(-20); salvar(); }
        tFicha = setTimeout(function () { if (fichaP === p) convidar(p, 'ficha'); }, 14000);
      } else if (tipo === 'fecha') { clearTimeout(tFicha); fichaP = null; esconderConvite(); }
      else if (tipo === 'tamanho') { trocasTam++; if (trocasTam === 3) { clearTimeout(tFicha); convidar(fichaP, 'tamanho'); } }
      else if (tipo === 'compra') { comprou = true; clearTimeout(tFicha); esconderConvite(); medir('clique-comprar-ficha'); }
    }

    /* ---------- 4. perguntas frequentes ---------- */
    function renderFaq() {
      var sec = o.faqEl; if (!sec) return;
      sec.innerHTML = '<div class="wrap"><div class="sec-head"><p class="eyebrow eyebrow--gold">Dúvidas</p><h2 class="h2">Pergunta <span class="g">rápida.</span></h2><p class="lead">Compra, pagamento, tamanho, entrega e troca.</p></div>' +
        '<div class="faq__busca"><input type="search" id="faq-q" placeholder="Busque: tamanho, troca, frete, pix…" aria-label="Buscar nas dúvidas"></div>' +
        '<div class="faq__lista" id="faq-lista">' + FAQ.map(function (f, i) { return '<details class="faq__it" data-t="' + esc(norm(f[1] + ' ' + f[2] + ' ' + f[3])) + '"' + (i === 0 ? ' open' : '') + '><summary>' + esc(f[1]) + '</summary><p>' + esc(f[2]) + '</p>' + (f[4] ? tabelaHTML(f[4]) : '') + '</details>'; }).join('') + '</div>' +
        '<p class="faq__nada muted" id="faq-nada" hidden>Nada encontrado. <button type="button" class="link-btn" id="faq-ass">Pergunte pro assistente</button></p></div>';
      var q = sec.querySelector('#faq-q'), tq = 0;
      q.addEventListener('input', function () {
        var w = norm(q.value).split(/\s+/).filter(Boolean), vis = 0;
        Array.prototype.forEach.call(sec.querySelectorAll('.faq__it'), function (d) { var ok = w.every(function (x) { return d.getAttribute('data-t').indexOf(x) >= 0; }); d.hidden = !ok; if (ok) vis++; if (ok && w.length) d.open = true; });
        sec.querySelector('#faq-nada').hidden = vis > 0;
        clearTimeout(tq); if (w.length && !vis) tq = setTimeout(function () { medir('faq-sem-resultado'); }, 1500);
      });
      sec.querySelector('#faq-ass').addEventListener('click', function () { abrir(); if (q.value.trim()) perguntar(q.value.trim()); });
      sec.addEventListener('toggle', function (e) { if (e.target.open && e.target.matches('.faq__it')) medir('faq-abriu'); }, true);
    }

    /* ---------- 5. avise quando baixar ---------- */
    var av = el('div', 'at-av'); av.setAttribute('role', 'dialog'); av.setAttribute('aria-modal', 'true'); av.setAttribute('aria-labelledby', 'av-h'); av.hidden = true;
    document.body.appendChild(av);
    function avisar(p) {
      if (!p) return;
      av.innerHTML = '<form class="at-av__box" id="av-f" novalidate>' +
        '<button type="button" class="at-x" aria-label="Fechar">' + ico('close', 18) + '</button>' +
        '<p class="at-pn__k mono">Avise quando baixar</p><h3 id="av-h">' + esc(p.name) + '</h3>' +
        '<p class="muted">Te avisamos se o preço cair ou a peça voltar. ' + (p.price != null ? 'Hoje: <b>' + esc(fmt(p.price)) + '</b>.' : '') + '</p>' +
        '<label class="fld"><span>WhatsApp ou e-mail</span><input id="av-c" type="text" maxlength="80" autocomplete="tel" placeholder="(64) 99999-9999 ou voce@email.com" required></label>' +
        '<label class="chk at-av__ok"><input id="av-ok" type="checkbox" required><span><b>Aceito receber o aviso</b><small>Usamos seu contato só para avisos do Garimpados (preço e drops). Você pode pedir para sair a qualquer momento.</small></span></label>' +
        '<input type="text" name="bot" class="at-hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<p class="status" id="av-st" role="status"></p>' +
        '<button type="submit" class="btn btn--gold btn--wide">Quero ser avisado</button></form>';
      av.hidden = false; requestAnimationFrame(function () { av.classList.add('is-on'); });
      var f = av.querySelector('#av-f'), st = av.querySelector('#av-st');
      var fecha = function () { av.classList.remove('is-on'); setTimeout(function () { av.hidden = true; }, 220); };
      av.querySelector('.at-x').addEventListener('click', fecha);
      av.onclick = function (e) { if (e.target === av) fecha(); };
      setTimeout(function () { av.querySelector('#av-c').focus(); }, 60);
      f.addEventListener('submit', async function (e) {
        e.preventDefault();
        var c = av.querySelector('#av-c').value.trim(), ok = av.querySelector('#av-ok').checked;
        var tel = c.replace(/\D/g, ''), mail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c);
        if (!mail && (tel.length < 10 || tel.length > 13)) { st.textContent = 'Digite um WhatsApp com DDD ou um e-mail válido.'; st.className = 'status is-bad'; return; }
        if (!ok) { st.textContent = 'Marque que aceita receber o aviso.'; st.className = 'status is-bad'; return; }
        if (f.querySelector('.at-hp').value) { fecha(); return; }
        medir('avise');
        if (noNetlify) {
          try {
            var body = new URLSearchParams({ 'form-name': 'avise', peca: p.name, id: p.id, preco: p.price != null ? fmt(p.price) : '', contato: c, consentimento: 'sim', data: new Date().toISOString() });
            var r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
            if (!r.ok) throw new Error('http');
            st.textContent = 'Pronto! Te avisamos quando baixar.'; st.className = 'status is-ok';
            setTimeout(fecha, 1400); return;
          } catch (er) { /* cai para o WhatsApp */ }
        }
        if (zap) { window.open(zapUrl('Oi! Quero ser avisado quando baixar: ' + p.name + (p.price != null ? ' (hoje ' + fmt(p.price) + ')' : '') + '. Meu contato: ' + c), '_blank', 'noopener'); st.textContent = 'Abrimos o WhatsApp com o seu pedido. É só enviar.'; st.className = 'status is-ok'; }
        else { st.textContent = 'Não deu para registrar agora. Tente mais tarde.'; st.className = 'status is-bad'; }
      });
    }

    syncZap(); renderFaq();
    return {
      avisar: avisar, abrir: abrir, sinal: sinal,
      atualizar: function (novoZap) { if (novoZap != null) zap = String(novoZap).replace(/\D/g, ''); syncZap(); syncHumano(); },
      /* para testes e para o painel: o que o vendedor local responderia (sem IA) */
      _resposta: function (q) { return resposta(q); }
    };
  }

  root.GSAtende = { montar: montar };
})(window);
