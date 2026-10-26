CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number INTEGER GENERATED ALWAYS AS IDENTITY (START WITH 1001) UNIQUE,

  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  status TEXT NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN (
      'pending_payment',
      'paid',
      'preparing',
      'out_for_delivery',
      'ready_for_collection',
      'completed',
      'cancelled'
    )),

  fulfilment_type TEXT NOT NULL
    CHECK (fulfilment_type IN ('delivery', 'collection')),

  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,

  delivery_address TEXT,
  delivery_suburb TEXT,
  delivery_city TEXT,
  delivery_notes TEXT,

  subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
  delivery_fee_cents INTEGER NOT NULL DEFAULT 0 CHECK (delivery_fee_cents >= 0),
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT orders_total_matches
    CHECK (total_cents = subtotal_cents + delivery_fee_cents),

  CONSTRAINT orders_delivery_needs_address
    CHECK (
      fulfilment_type <> 'delivery'
      OR (
        delivery_address IS NOT NULL
        AND delivery_suburb IS NOT NULL
        AND delivery_city IS NOT NULL
      )
    )
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,

  item_name TEXT NOT NULL,
  item_image_url TEXT,
  base_price_cents INTEGER NOT NULL CHECK (base_price_cents >= 0),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  quantity SMALLINT NOT NULL CHECK (quantity BETWEEN 1 AND 20),
  line_total_cents INTEGER NOT NULL CHECK (line_total_cents >= 0),

  selected_options JSONB NOT NULL DEFAULT '[]'::jsonb,
  special_instructions TEXT,

  CONSTRAINT order_items_line_total_matches
    CHECK (line_total_cents = unit_price_cents * quantity)
);

CREATE INDEX orders_user_created_idx ON orders (user_id, created_at DESC);
CREATE INDEX order_items_order_idx ON order_items (order_id);