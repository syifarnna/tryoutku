const fs = require('fs');
const path = require('path');

const rows = JSON.parse(fs.readFileSync(path.join(__dirname, 'passing-grade-2025.json'), 'utf8'));

const SAINTEK_PHRASES = [
  'KEDOKTERAN', 'DOKTER', 'KEPERAWATAN', 'FARMASI', 'FISIOTERAPI', 'FISOTERAPI', 'KEBIDANAN',
  'TEKNIK', 'TEKNOLOGI', 'INFORMATIKA', 'ILMU KOMPUTER', 'SISTEM KOMPUTER', 'SISTEM INFORMASI', 'KOMPUTER',
  'SAINS', 'MATEMATIKA', 'STATISTIK', 'FISIKA', 'KIMIA', 'BIOLOGI', 'BIOTEKNOLOGI', 'ILMU PENGETAHUAN ALAM',
  'GEOGRAFI', 'GEOLOGI', 'GEOFISIKA', 'METALURGI', 'PERMINYAKAN', 'PERTAMBANGAN', 'GEOMATIKA',
  'PERTANIAN', 'AGRO', 'PETERNAKAN', 'TERNAK', 'AKUAKULTUR', 'PERIKANAN', 'IKAN', 'KELAUTAN', 'KEHUTANAN',
  'PERAIRAN', 'AKUATIK', 'TANAMAN', 'TANAH', 'ARSITEKTUR', 'GIZI', 'KESEHATAN', 'LINGKUNGAN',
  'PANGAN', 'METROLOGI', 'INSTRUMENTASI',
  'REKAYASA', 'KESELAMATAN', 'SILVIKULTUR', 'METEOROLOGI', 'OSEANOGRAFI', 'OCEANOGRAFI', 'KARTOGRAFI', 'PENGINDERAAN',
  'AKTUARIA', 'PARAMEDIK', 'VETERINER', 'MINYAK', 'ELEKTRONIKA', 'ALAT BERAT', 'NAUTIKA', 'TRANSPORTASI',
  'MANUFAKTUR', 'MESIN', 'MEKANIK', 'PERKERETAAPIAN', 'KONSTRUKSI', 'JEMBATAN', 'PERUMAHAN', 'PEMUKIMAN',
  'MEKATRONIKA', 'KECERDASAN BUATAN', 'PERANGKAT LUNAK', 'SIBER', 'LISTRIK', 'ENERGI', 'BROADBAND',
  'HORTIKULTURA', 'PERKEBUNAN', 'BUDI DAYA', 'BUDIDAYA', 'KONSERVASI', 'HUTAN', 'KAYU',
  'GIGI', 'OKUPASI', 'BIOMEDIS', 'BIOMEDIK', 'HIGIENE', 'PENGOBAT',
  'PERKAPALAN', 'BANGUNAN', 'GEDUNG', 'LAHAN'
];

const SAINTEK_TOKENS = ['IPA', 'BIOSISTEM'];

const SOSHUM_PHRASES = [
  'HUKUM', 'EKONOMI', 'MANAJEMEN', 'MANJEMEN', 'AKUNTANSI', 'AKUTANSI', 'BISNIS', 'KEUANGAN', 'PERBANKAN', 'PERPAJAKAN',
  'KEWIRAUSAHAAN', 'SASTRA', 'BAHASA', 'LINGUISTIK', 'SEJARAH', 'SOSIOLOGI', 'ANTROPOLOGI',
  'ARKEOLOGI', 'INTERNASIONAL', 'POLITIK', 'PEMERINTAHAN', 'ADMINISTRASI', 'KOMUNIKASI', 'PSIKOLOGI',
  'KRIMINOLOGI', 'PARIWISATA', 'WISATA', 'PERHOTELAN', 'PERPUSTAKAAN', 'KESEKRETARIATAN', 'FILSAFAT',
  'SENI', 'MUSIK', 'TARI', 'OLAHRAGA', 'PENJASKES', 'KEPELATIHAN', 'BIMBINGAN', 'KONSELING',
  'MASYARAKAT', 'PENDIDIKAN', 'KHUSUS', 'DESAIN', 'SYARIAH', 'ISLAM', 'PANCASILA', 'KEWARGANEGARAAN',
  'AGAMA', 'NEGARA', 'PEMBANGUNAN', 'DAERAH', 'SEKOLAH DASAR', 'DASAR',
  'FOTOGRAFI', 'KARAWITAN', 'TEATER', 'KRIYA', 'KERIS', 'HUMANITAS', 'TRADISI', 'FILM', 'TELEVISI',
  'ANIMASI', 'JURNALISTIK', 'HUMAS', 'PENYIARAN', 'PERIKLANAN', 'PENERBITAN', 'ARSIP', 'MEDIA',
  'DEMOGRAFI', 'KESEJAHTERAAN', 'KELUARGA', 'REKREASI', 'KONVENSI', 'INCENTIVE',
  'TATA BOGA', 'TATA BUSANA', 'TATA RIAS', 'KECANTIKAN', 'PEMASARAN', 'LUAR BIASA', 'PENCATATAN SIPIL',
  'SENDRATASIK', 'ENTREPRENEURSHIP', 'ENTERPRENEURSHIP', 'DIGITAL', 'PAUD', 'MANAJEMAN', 'REKAMAN INFORMASI', 'KEWIRUSAHAAN'
];

const SOSHUM_TOKENS = ['PGSD', 'PGPAUD', 'IPS', 'ADM', 'BHS', 'PEND', 'EKO', 'IESP', 'PPKN', 'PKN', 'PLS', 'PLB'];

function classify(prodi) {
  const name = String(prodi || '').toUpperCase();
  const tokens = new Set(name.split(/[^A-Z0-9]+/).filter(Boolean));
  const has = (list) => list.some((k) => name.includes(k));
  const hasTok = (list) => list.some((k) => tokens.has(k));

  if (has(SAINTEK_PHRASES) || hasTok(SAINTEK_TOKENS)) return 'Saintek';
  if (has(SOSHUM_PHRASES) || hasTok(SOSHUM_TOKENS)) return 'Soshum';
  return 'Campuran';
}

const buckets = { Saintek: [], Soshum: [], Campuran: [] };
for (const r of rows) {
  buckets[classify(r.prodi)].push(r);
}

const dbg = rows.find((r) => r.kode === '112033');
console.log('debug 112033:', JSON.stringify(dbg), '=>', classify(dbg.prodi));

for (const b of Object.keys(buckets)) {
  console.log(`${b}: ${buckets[b].length}`);
}

console.log('\n--- CAMPURAN (sisanya, untuk review) ---');
for (const r of buckets.Campuran) {
  console.log(`${r.kode}\t${r.jenjang}\t${r.prodi}  [${r.universitas}]`);
}

const CHUNK = 800;
const QUOTED = 4643;
const out = [];
for (const b of ['Saintek', 'Soshum', 'Campuran']) {
  const codes = buckets[b].map((r) => `'${r.kode}'`).join(', ');
  out.push(`UPDATE majors SET cluster = '${b}' WHERE code IN (${codes});`);
}

fs.writeFileSync(path.join(__dirname, 'import_cluster.sql'), out.join('\n\n'));
console.log(`\nGenerated import_cluster.sql (${out.length} statements).`);