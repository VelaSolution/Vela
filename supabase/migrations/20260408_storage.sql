-- HQ 파일 공유용 Storage 버킷
INSERT INTO storage.buckets (id, name, public)
VALUES ('hq-files', 'hq-files', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: 관리자만 업로드/다운로드
CREATE POLICY "admin_upload" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'hq-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "admin_select" ON storage.objects FOR SELECT
USING (bucket_id = 'hq-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "admin_delete" ON storage.objects FOR DELETE
USING (bucket_id = 'hq-files' AND auth.uid() IS NOT NULL);
