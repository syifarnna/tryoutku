-- ============================================
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
