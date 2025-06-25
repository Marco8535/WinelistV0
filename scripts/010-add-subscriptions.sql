-- Stores the Stripe customer ID for this restaurant, linking to Stripe's customer object.
ALTER TABLE restaurants ADD COLUMN stripe_customer_id TEXT UNIQUE;

-- Stores the current subscription plan level for the restaurant (e.g., 'free', 'basic', 'premium').
ALTER TABLE restaurants ADD COLUMN plan_level TEXT DEFAULT 'free';

-- Stores the current status of the subscription (e.g., 'active', 'inactive', 'canceled', 'past_due').
ALTER TABLE restaurants ADD COLUMN subscription_status TEXT DEFAULT 'inactive';

-- Stores the timestamp when the current subscription period ends or ended.
ALTER TABLE restaurants ADD COLUMN subscription_ends_at TIMESTAMPTZ;
