-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Words table
CREATE TABLE IF NOT EXISTS words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text VARCHAR(500) NOT NULL,
  memo TEXT,
  summary TEXT,
  detail TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Disable RLS for now (single user, no auth)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon users (self-use only)
CREATE POLICY "Allow all for anon" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON words FOR ALL USING (true) WITH CHECK (true);

-- Seed initial categories
INSERT INTO categories (name) VALUES
  ('IT'),
  ('政治'),
  ('ビジネス'),
  ('言語'),
  ('科学'),
  ('一般知識')
ON CONFLICT (name) DO NOTHING;
