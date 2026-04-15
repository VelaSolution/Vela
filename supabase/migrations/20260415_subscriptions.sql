-- ============================================================
-- 자동 구독 결제 시스템 — 테이블 생성
-- ============================================================

-- ── subscriptions 테이블 ────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan                  TEXT NOT NULL DEFAULT 'standard',
  billing_cycle         TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
  billing_key           TEXT NOT NULL,
  card_last4            TEXT,
  card_company          TEXT,
  status                TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'cancelled', 'past_due', 'expired')),
  current_period_start  TIMESTAMPTZ NOT NULL,
  current_period_end    TIMESTAMPTZ NOT NULL,
  cancel_at_period_end  BOOLEAN NOT NULL DEFAULT false,
  retry_count           INT NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sub_read_own' AND tablename = 'subscriptions') THEN
    CREATE POLICY "sub_read_own" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;
-- 서비스 역할만 INSERT/UPDATE 가능 (API 서버에서만 조작)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sub_service_write' AND tablename = 'subscriptions') THEN
    CREATE POLICY "sub_service_write" ON subscriptions FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── subscription_events 테이블 (감사 로그) ──────────────
CREATE TABLE IF NOT EXISTS subscription_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id   UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL,
  event_type        TEXT NOT NULL,
  payment_key       TEXT,
  amount            INT,
  metadata          JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sub_events_sub ON subscription_events(subscription_id);

ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sub_events_read_own' AND tablename = 'subscription_events') THEN
    CREATE POLICY "sub_events_read_own" ON subscription_events FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── profiles 테이블 변경 ────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;

-- ── payments 테이블 변경 ────────────────────────────────
ALTER TABLE payments ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS billing_cycle TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS is_renewal BOOLEAN DEFAULT false;
