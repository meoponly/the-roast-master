-- Create storage bucket for style photos
INSERT INTO storage.buckets (id, name, public) VALUES ('style-photos', 'style-photos', true);

-- Allow anyone to upload to style-photos bucket
CREATE POLICY "Anyone can upload style photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'style-photos');

-- Allow anyone to read style photos
CREATE POLICY "Anyone can read style photos" ON storage.objects FOR SELECT USING (bucket_id = 'style-photos');

-- Create chat_sessions table
CREATE TABLE public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'New Chat',
  first_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS but allow all access (no auth required for this app)
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to chat_sessions" ON public.chat_sessions FOR ALL USING (true) WITH CHECK (true);