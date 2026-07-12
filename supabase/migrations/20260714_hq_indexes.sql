-- HQ 인트라넷 고빈도 쿼리 인덱스 추가

-- 알림: 30초마다 target_user + read 기준 폴링
CREATE INDEX IF NOT EXISTS idx_hq_notifications_target_read
  ON hq_notifications(target_user, read, created_at DESC);

-- 경비: 날짜 + 상태 필터
CREATE INDEX IF NOT EXISTS idx_hq_expenses_date_status
  ON hq_expenses(date, status);

-- 메일: 수신함 조회 (to_name + read)
CREATE INDEX IF NOT EXISTS idx_hq_mail_to_read
  ON hq_mail(to_name, read, created_at DESC);

-- 감사로그: 사용자 + 시간순 정렬
CREATE INDEX IF NOT EXISTS idx_hq_audit_log_actor_created
  ON hq_audit_log(actor, created_at DESC);

-- 공지: 중요 공지 + 최신순
CREATE INDEX IF NOT EXISTS idx_hq_notices_important_created
  ON hq_notices(important, created_at DESC);

-- 보고서: 최신순 정렬
CREATE INDEX IF NOT EXISTS idx_hq_reports_created
  ON hq_reports(created_at DESC);

-- CRM: 스테이지별 집계
CREATE INDEX IF NOT EXISTS idx_hq_crm_deals_stage
  ON hq_crm_deals(stage);

-- 체크인: 날짜 + 사용자 조회
CREATE INDEX IF NOT EXISTS idx_hq_checkins_date
  ON hq_checkins(date, user_name);

-- ── 누락 테이블: hq_shift_preferences ──────────────────
CREATE TABLE IF NOT EXISTS hq_shift_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  preferred_shift TEXT NOT NULL DEFAULT '주간',
  unavailable BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_name, day_of_week)
);

ALTER TABLE hq_shift_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hq_shift_preferences_auth" ON hq_shift_preferences
  FOR ALL USING (auth.uid() IS NOT NULL);
