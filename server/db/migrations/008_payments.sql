CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  provider TEXT NOT NULL CHECK (provider IN ('payfast')),
  provider_payment_id TEXT,
  status TEXT NOT NULL
    CHECK (status IN ('pending', 'complete', 'cancelled', 'failed')),
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  raw_payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_payment_id)
);

CREATE INDEX payments_order_idx ON payments (order_id);