CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  slug TEXT NOT NULL UNIQUE,

  name TEXT NOT NULL,
  description TEXT NOT NULL,

  category TEXT NOT NULL CHECK (
    category IN (
      'steaks',
      'chicken',
      'fish',
      'surfnturf',
      'salads',
      'desserts'
    )
  ),

  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),

  image_url TEXT NOT NULL,

  available BOOLEAN NOT NULL DEFAULT TRUE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,

  prep_time_minutes SMALLINT CHECK (prep_time_minutes > 0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS menu_items_category_available_idx
  ON menu_items (category, available);

CREATE INDEX IF NOT EXISTS menu_items_featured_available_idx
  ON menu_items (featured, available);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,

  role TEXT NOT NULL DEFAULT 'customer'
    CHECK (role IN ('customer', 'admin')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_email_idx
  ON users (email);

CREATE INDEX IF NOT EXISTS users_role_idx
  ON users (role);