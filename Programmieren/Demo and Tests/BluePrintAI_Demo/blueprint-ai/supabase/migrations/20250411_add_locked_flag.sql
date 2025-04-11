-- Add is_locked column to artifacts table
ALTER TABLE artifacts
ADD COLUMN is_locked boolean DEFAULT false NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN artifacts.is_locked IS 'Indicates whether the artifact is locked for editing';

-- Add index for is_locked column
CREATE INDEX idx_artifacts_is_locked ON artifacts(is_locked);