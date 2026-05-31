/*
  # Admin Security System and Reservation Tracking

  1. New Tables
    - `admin_credentials` - Stores encrypted admin login credentials
    - `reservation_stats` - Tracks reservation statistics
  
  2. Security
    - Enable RLS on all tables
    - Admin credentials are stored securely
    - Only admins can access credential data
*/

-- Create admin_credentials table for secure admin authentication
CREATE TABLE IF NOT EXISTS admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reservation_stats table for tracking
CREATE TABLE IF NOT EXISTS reservation_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id text,
  source text DEFAULT 'whatsapp',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_stats ENABLE ROW LEVEL SECURITY;

-- Admin credentials policies - only admins can manage
CREATE POLICY "Admins can manage credentials"
  ON admin_credentials
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_credentials ac
      WHERE ac.email = auth.jwt() ->> 'email'
      AND ac.role IN ('admin', 'super_admin')
    )
  );

-- Reservation stats policies
CREATE POLICY "Admins can view all reservation stats"
  ON reservation_stats
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_credentials ac
      WHERE ac.email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "System can insert reservation stats"
  ON reservation_stats
  FOR INSERT
  WITH CHECK (true);

-- Insert default admin credentials
-- Email: admin@naxcivan.travel
-- Password: NaxcivanAdmin2026! (hashed)
INSERT INTO admin_credentials (email, password_hash, role)
VALUES (
  'admin@naxcivan.travel',
  '919b7ea344bc818b2be6f1b90f41ce0fff28d4f481fd429793419d10e5753eca',
  'super_admin'
) ON CONFLICT (email) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_credentials_email ON admin_credentials(email);
CREATE INDEX IF NOT EXISTS idx_reservation_stats_created ON reservation_stats(created_at);
