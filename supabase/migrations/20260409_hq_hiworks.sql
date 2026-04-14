-- HQ 하이윅스 기능 확장 테이블

-- ── 근태관리 ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hq_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  clock_in TIMESTAMPTZ,
  clock_out TIMESTAMPTZ,
  status TEXT DEFAULT '정상',
  overtime NUMERIC DEFAULT 0,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- ── 휴가관리 ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hq_leave (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT '연차',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days NUMERIC NOT NULL DEFAULT 1,
  reason TEXT,
  status TEXT DEFAULT '대기',
  approver TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 주소록 ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hq_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  position TEXT,
  phone TEXT,
  email TEXT,
  extension TEXT,
  profile_img TEXT,
  manager TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 게시판 ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hq_board (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL DEFAULT '자유',
  title TEXT NOT NULL,
  content TEXT,
  author TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hq_board_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES hq_board(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 설문/투표 ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hq_surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  author TEXT NOT NULL,
  deadline DATE,
  status TEXT DEFAULT '진행중',
  questions JSONB DEFAULT '[]',
  responses INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hq_survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES hq_surveys(id) ON DELETE CASCADE,
  respondent TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(survey_id, respondent)
);

-- ── 위키/지식베이스 ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS hq_wiki (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT DEFAULT '일반',
  author TEXT NOT NULL,
  last_editor TEXT,
  tags TEXT[] DEFAULT '{}',
  views INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── RLS 활성화 ──────────────────────────────────────────
ALTER TABLE hq_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq_leave ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq_board ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq_board_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq_survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq_wiki ENABLE ROW LEVEL SECURITY;

-- ── RLS 정책 (로그인 사용자 전체 접근, HQ 페이지에서 권한 체크) ──
CREATE POLICY "auth_all" ON hq_attendance FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_all" ON hq_leave FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_all" ON hq_contacts FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_all" ON hq_board FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_all" ON hq_board_comments FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_all" ON hq_surveys FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_all" ON hq_survey_responses FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_all" ON hq_wiki FOR ALL USING (auth.uid() IS NOT NULL);

-- ── 인덱스 ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_hq_attendance_user_date ON hq_attendance(user_id, date);
CREATE INDEX IF NOT EXISTS idx_hq_leave_requester ON hq_leave(requester);
CREATE INDEX IF NOT EXISTS idx_hq_board_category ON hq_board(category);
CREATE INDEX IF NOT EXISTS idx_hq_board_comments_post ON hq_board_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_hq_survey_responses_survey ON hq_survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_hq_wiki_category ON hq_wiki(category);
