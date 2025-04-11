-- Create the projects table
CREATE TABLE projects (
    id uuid primary key default gen_random_uuid(),
    name text,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create the artifacts table
CREATE TABLE artifacts (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references projects(id) on delete cascade,
    type text, -- e.g., 'user_story', 'func_req', 'non_func_req', 'arch_suggestion', 'use_case_diagram'
    content text,
    generated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add comments for clarity
COMMENT ON TABLE projects IS 'Stores project information and requirements';
COMMENT ON TABLE artifacts IS 'Stores AI-generated artifacts for each project';
COMMENT ON COLUMN artifacts.type IS 'Type of the generated artifact (user_story, func_req, non_func_req, arch_suggestion, use_case_diagram)';
COMMENT ON COLUMN artifacts.content IS 'The actual generated text or Mermaid syntax';

-- Create indexes for better query performance
CREATE INDEX idx_artifacts_project_id ON artifacts(project_id);
CREATE INDEX idx_artifacts_type ON artifacts(type);