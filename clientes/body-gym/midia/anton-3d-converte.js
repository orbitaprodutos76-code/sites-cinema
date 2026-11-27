// Converte Anton (OFL) para o formato typeface.json do Three.js, só com as letras usadas na abertura.
const opentype = require('opentype.js'), fs = require('fs');
const font = opentype.loadSync(__dirname + '/Anton-Regular.ttf');
const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÉÁÃÇ ';
const scale = (1000 * 100) / ((font.unitsPerEm || 2048) * 72);
const r = v => Math.round(v * scale);
const glyphs = {};
for (const ch of LETRAS) {
  const g = font.charToGlyph(ch); if (!g) continue;
  const t = { ha: r(g.advanceWidth), x_min: r(g.xMin || 0), x_max: r(g.xMax || 0), o: '' };
  (g.path.commands || []).forEach(c => {
    let tipo = c.type.toLowerCase(); if (tipo === 'c') tipo = 'b';
    t.o += tipo + ' ';
    if (c.x !== undefined && c.y !== undefined) t.o += r(c.x) + ' ' + r(c.y) + ' ';
    if (c.x1 !== undefined && c.y1 !== undefined) t.o += r(c.x1) + ' ' + r(c.y1) + ' ';
    if (c.x2 !== undefined && c.y2 !== undefined) t.o += r(c.x2) + ' ' + r(c.y2) + ' ';
  });
  glyphs[ch] = t;
}
const out = { glyphs, familyName: 'Anton', ascender: r(font.ascender), descender: r(font.descender),
  underlinePosition: r(font.tables.post.underlinePosition), underlineThickness: r(font.tables.post.underlineThickness),
  boundingBox: { yMin: r(font.tables.head.yMin), xMin: r(font.tables.head.xMin), yMax: r(font.tables.head.yMax), xMax: r(font.tables.head.xMax) },
  resolution: 1000, original_font_information: { format: 0, fontFamily: 'Anton', copyright: 'SIL Open Font License 1.1' } };
fs.writeFileSync(process.argv[2], JSON.stringify(out));
console.log('glifos', Object.keys(glyphs).length, 'bytes', fs.statSync(process.argv[2]).size);
