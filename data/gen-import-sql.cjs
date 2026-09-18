const fs = require('fs');

const rows = JSON.parse(fs.readFileSync('C:/Users/Asus/Downloads/tryoutku/data/passing-grade-2025.json', 'utf8'));

// Institutions: sorted unique names, deterministic ids starting at 1
const univs = [...new Set(rows.map(r => r.universitas))].sort();
const univId = new Map(univs.map((u, i) => [u, i + 1]));

// ---- 1. Schema migration (DDL) ----
const schema = `-- ============================================
-- MIGRASI: DATA UTBK-SNBT 2025 (FORMAT BARU)
-- 4643 prodi, 137 universitas
-- ============================================

-- 1) Backup data lama
DROP TABLE IF EXISTS backup_institutions_2025;
CREATE TABLE backup_institutions_2025 AS SELECT * FROM institutions;
DROP TABLE IF EXISTS backup_majors_2025;
CREATE TABLE backup_majors_2025 AS SELECT * FROM majors;
DROP TABLE IF EXISTS backup_target_institutions_2025;
CREATE TABLE backup_target_institutions_2025 AS SELECT * FROM target_institutions;
DROP TABLE IF EXISTS backup_recommendations_2025;
CREATE TABLE backup_recommendations_2025 AS SELECT * FROM recommendations;

-- 2) Kolom baru format UTBK-SNBT 2025
ALTER TABLE majors ADD COLUMN IF NOT EXISTS code text;
ALTER TABLE majors ADD COLUMN IF NOT EXISTS jenjang text;
ALTER TABLE majors ADD COLUMN IF NOT EXISTS daya_tampung integer;
ALTER TABLE majors ADD COLUMN IF NOT EXISTS peminat integer;
ALTER TABLE majors ADD COLUMN IF NOT EXISTS passing_grade_percentage double precision;
ALTER TABLE majors ADD COLUMN IF NOT EXISTS year integer;

-- 3) Reset data
TRUNCATE TABLE targets_note;
TRUNCATE TABLE target_institutions, majors, institutions CASCADE;

-- 4) Reset sequencer agar id dimulai rapi
ALTER SEQUENCE institutions_id_seq RESTART WITH 1;
ALTER SEQUENCE majors_id_seq RESTART WITH 1;
`;

// ---- 2. Institutions ----
const instRows = univs.map((u, i) => `(${i + 1}, '${u.replace(/'/g, "''")}', 'PTN', NULL)`).join(',\n');
const institutions = `-- INSERT 137 UNIVERSITAS
INSERT INTO institutions (id, name, type, location) VALUES
${instRows};
`;

// ---- 3. Majors (chunked) ----
const pgNum = (v) => (v == null ? 'NULL' : v);
const pemNum = (v) => (v == null ? 'NULL' : v);

const majorValues = rows.map(r => {
  const instId = univId.get(r.universitas);
  const name = r.prodi.replace(/'/g, "''");
  const note = r.value_error ? `, 'P.GRADE #VALUE diarsir (421)'` : '';
  return `(${instId}, '${r.kode}', '${name}', '${r.jenjang}', ${r.daya_tampung}, ${pemNum(r.peminat)}, ${pgNum(r.passing_grade_total)}, ${pgNum(r.pct)}, 2025)`;
});

const chunk = 500;
const pieces = [];
for (let i = 0; i < majorValues.length; i += chunk) {
  const slice = majorValues.slice(i, i + chunk).join(',\n');
  pieces.push(`INSERT INTO majors (institution_id, code, name, jenjang, daya_tampung, peminat, passing_grade_total, passing_grade_percentage, year) VALUES\n${slice};`);
}
const majors = `-- INSERT ${rows.length} PRODI (chunked)
${pieces.join('\n\n')}

-- 5) Indeks pencarian & optimisasi
CREATE INDEX IF NOT EXISTS idx_majors_code ON majors(code);
CREATE INDEX IF NOT EXISTS idx_majors_institution ON majors(institution_id);
CREATE INDEX IF NOT EXISTS idx_majors_jenjang ON majors(jenjang);
CREATE INDEX IF NOT EXISTS idx_majors_name_trgm ON majors USING gin (name gin_trgm_ops);

-- 6) Sinkronisasi sequencer setelah insert eksplisit
SELECT setval('institutions_id_seq', (SELECT MAX(id) FROM institutions));
SELECT setval('majors_id_seq', (SELECT MAX(id) FROM majors));

NOTIFY pgrst, 'reload schema';
`;

// Write chunk files for safe execution
const chunkDir = 'C:/Users/Asus/Downloads/tryoutku/data/chunks';
if (!fs.existsSync(chunkDir)) fs.mkdirSync(chunkDir, { recursive: true });
pieces.forEach((p, i) => {
  fs.writeFileSync(`${chunkDir}/majors_chunk_${String(i + 1).padStart(2, '0')}.sql`, p);
});

fs.writeFileSync('C:/Users/Asus/Downloads/tryoutku/data/import_schema.sql', schema);
fs.writeFileSync('C:/Users/Asus/Downloads/tryoutku/data/import_institutions.sql', institutions);
fs.writeFileSync('C:/Users/Asus/Downloads/tryoutku/data/import_majors.sql', majors);

// ---- Stats ----
const byJenjang = {};
for (const r of rows) byJenjang[r.jenjang] = (byJenjang[r.jenjang] || 0) + 1;
const byUnivCount = {};
for (const r of rows) {
  const u = r.universitas;
  byUnivCount[u] = (byUnivCount[u] || 0) + 1;
}
console.log('Rows:', rows.length, ' Inns:', univs.length);
console.log('Jenjang:', byJenjang);
console.log('Top univ:', Object.entries(byUnivCount).sort((a, b) => b[1] - a[1]).slice(0, 5));
console.log('Institutions SQL bytes:', institutions.length);
console.log('Majors SQL bytes:', majors.length);
console.log('Done writing SQL files.');