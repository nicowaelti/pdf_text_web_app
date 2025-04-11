-- Create enum for task status
CREATE TYPE task_status AS ENUM ('open', 'in_progress', 'done');

-- Create tasks table
CREATE TABLE tasks (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references projects(id) on delete cascade,
    artifact_id uuid references artifacts(id) on delete cascade,
    title text NOT NULL,
    description text,
    status task_status DEFAULT 'open' NOT NULL,
    order_index integer NOT NULL,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add comments for clarity
COMMENT ON TABLE tasks IS 'Stores project implementation tasks';
COMMENT ON COLUMN tasks.title IS 'Short description of the task';
COMMENT ON COLUMN tasks.description IS 'Detailed description of what needs to be done';
COMMENT ON COLUMN tasks.status IS 'Current status of the task (open, in_progress, done)';
COMMENT ON COLUMN tasks.order_index IS 'Index for ordering tasks in the stack';

-- Create indexes
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_artifact_id ON tasks(artifact_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_order ON tasks(order_index);
