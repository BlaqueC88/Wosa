CREATE TABLE wishlist_items (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, menu_item_id)
);

CREATE INDEX wishlist_items_user_created_idx
  ON wishlist_items (user_id, created_at DESC);