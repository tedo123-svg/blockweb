-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('woreda', 'subcity')),
  woreda_name VARCHAR(255),
  sub_city VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  woreda_name VARCHAR(255) NOT NULL,
  sub_city VARCHAR(255),
  discussion_date DATE NOT NULL,
  location VARCHAR(255) NOT NULL,
  facilitator_name VARCHAR(255) NOT NULL,
  total_participants INTEGER NOT NULL,
  male_participants INTEGER NOT NULL,
  female_participants INTEGER NOT NULL,
  main_topic TEXT NOT NULL,
  description TEXT NOT NULL,
  positive_ideas TEXT,
  negative_issues TEXT,
  recommendations TEXT,
  submitted_by VARCHAR(255) NOT NULL,
  submitted_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Attachments Table (each file uploaded in a report)
CREATE TABLE IF NOT EXISTS report_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  filename VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_submitted_by ON reports(submitted_by);
CREATE INDEX IF NOT EXISTS idx_reports_discussion_date ON reports(discussion_date);
CREATE INDEX IF NOT EXISTS idx_reports_woreda_name ON reports(woreda_name);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Insert default users (skip if username already exists)
INSERT INTO users (username, password, role, woreda_name, sub_city, status) VALUES
  ('woreda1', '$2a$10$8K1p/a0dL3LKzao0gMdCSOCHTugjdTWAzNqB.VizLO5xVfQXqkmm6', 'woreda', 'Woreda 1', 'Sub-City A', 'active'),
  ('subcity', '$2a$10$8K1p/a0dL3LKzao0gMdCSOCHTugjdTWAzNqB.VizLO5xVfQXqkmm6', 'subcity', NULL, NULL, 'active')
ON CONFLICT (username) DO NOTHING;

-- Note: Default password for both users is 'password123' and 'admin123' respectively
-- You should change these after first login

-- Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policies (optional - for direct Supabase client access)
-- For now, we'll use service role key from backend, so RLS is optional
