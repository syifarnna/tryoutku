const fs = require('fs');

const src = 'C:/Users/Asus/Downloads/823331559-PASSING-GRADE-PTN-2024-2025-1.txt';
const lines = fs.readFileSync(src, 'utf8').split(/\r?\n/);

const toNum = (s) => {
  const t = String(s || '').trim().replace(/%$/, '');
  if (!t) return null;
  const n = parseFloat(t.replace(',', '.'));
  return isNaN(n) ? null : n;
};

const parseRow = (line) => {
  const m = line.match(/^(\d{6})\s+(.*?)\s{2,}(S1|D-III|D-IV)\s+(\d+)\s+((?:\(?Prodi Baru\)?)|\d+)\s+([\d.,]+)\s*(#VALUE!)?\s*([\d.,]+%?)?\s*$/);
  if (!m) return null;
  const [, kode, names, jenjang, daya, peminat, pg, valueErr, pct] = m;
  const isProdiBaru = /^\(?Prodi Baru\)?$/.test(peminat);
  const nz = names.trim().split(/\s{2,}/);
  const universitas = nz[0].trim();
  const prodi = nz.slice(1).join(' ').trim();
  const pgNum = toNum(pg);
  return {
    kode,
    universitas,
    prodi,
    jenjang,
    daya_tampung: parseInt(daya, 10),
    peminat: isProdiBaru ? null : parseInt(peminat, 10),
    prodi_baru: isProdiBaru,
    passing_grade_total: isProdiBaru ? 420.0 : pgNum,
    pct: isProdiBaru ? 42.0 : toNum(pct),
    value_error: !!valueErr,
  };
};

const rows = [];
const failed = [];
for (const line of lines) {
  if (!/^\d{6}\s/.test(line)) continue;
  const r = parseRow(line);
  if (r) rows.push(r);
  else failed.push(line);
}

rows.sort((a, b) => (a.universitas.localeCompare(b.universitas)) || a.kode.localeCompare(b.kode));

const univs = [...new Set(rows.map(r => r.universitas))].sort();
const pgNull = rows.filter(r => r.passing_grade_total == null);
const prodiBaru = rows.filter(r => r.prodi_baru);

console.log('TOTAL ROWS:', rows.length);
console.log('FAILED:', failed.length);
failed.slice(0, 5).forEach(f => console.log('  FAILED LINE:', JSON.stringify(f)));
console.log('UNIQUE UNIVERSITIES:', univs.length);
univs.slice(0, 15).forEach(u => console.log('  -', u));
console.log('PG NULL:', pgNull.length);
pgNull.slice(0, 5).forEach(r => console.log('  ', r.kode, r.universitas, r.prodi));
console.log('Prodi Baru:', prodiBaru.length);

fs.writeFileSync('C:/Users/Asus/Downloads/tryoutku/data/passing-grade-2025.json', JSON.stringify(rows, null, 0));
console.log('Written data/passing-grade-2025.json');