-- ==========================================
-- 1. BẢNG USERS (Lưu thông tin hồ sơ người dùng)
-- ==========================================
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    url_avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bật RLS cho bảng users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Người dùng có thể tự xem và cập nhật hồ sơ của chính mình
CREATE POLICY "Users can view their own profile" 
ON public.users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.users FOR UPDATE USING (auth.uid() = id);

-- Trigger để tự động tạo profile trong bảng public.users khi có người đăng ký mới trong hệ thống auth.users của Supabase
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, url_avatar)
  VALUES (new.id, new.email, 'https://cdn-icons-png.flaticon.com/512/149/149071.png'); -- Avatar mặc định
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gắn Trigger vào bảng auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ==========================================
-- 2. BẢNG LIKED_SONGS (Bài hát yêu thích)
-- ==========================================
CREATE TABLE public.liked_songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    song_id TEXT NOT NULL,
    song_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure a user can only like a specific song once
    UNIQUE(user_id, song_id)
);

-- Bật tính năng Row Level Security (RLS)
ALTER TABLE public.liked_songs ENABLE ROW LEVEL SECURITY;

-- Tạo Policy cho quyền SELECT (Xem)
-- Người dùng chỉ được phép xem các bài hát do chính họ đã like
CREATE POLICY "Users can view their own liked songs" 
ON public.liked_songs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Tạo Policy cho quyền INSERT (Thêm mới)
-- Người dùng chỉ được phép thêm bài hát với user_id của chính họ
CREATE POLICY "Users can insert their own liked songs" 
ON public.liked_songs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Tạo Policy cho quyền DELETE (Xóa/Bỏ Like)
-- Người dùng chỉ được phép xóa các bài hát do chính họ đã like
CREATE POLICY "Users can delete their own liked songs" 
ON public.liked_songs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Tạo Index để tối ưu hóa tốc độ truy vấn khi tải danh sách nhạc yêu thích
CREATE INDEX idx_liked_songs_user_id ON public.liked_songs(user_id);
CREATE INDEX idx_liked_songs_song_id ON public.liked_songs(song_id);

-- ==========================================
-- 3. BẢNG USER_PLAYLISTS (Danh sách phát của người dùng)
-- ==========================================
CREATE TABLE public.user_playlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    cover_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own playlists" 
ON public.user_playlists FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own playlists" 
ON public.user_playlists FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" 
ON public.user_playlists FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" 
ON public.user_playlists FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_user_playlists_user_id ON public.user_playlists(user_id);

-- ==========================================
-- 4. BẢNG USER_PLAYLIST_SONGS (Bài hát trong danh sách phát)
-- ==========================================
CREATE TABLE public.user_playlist_songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    playlist_id UUID REFERENCES public.user_playlists(id) ON DELETE CASCADE NOT NULL,
    song_id TEXT NOT NULL,
    song_data JSONB NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Một bài hát chỉ xuất hiện 1 lần trong 1 playlist
    UNIQUE(playlist_id, song_id)
);

ALTER TABLE public.user_playlist_songs ENABLE ROW LEVEL SECURITY;

-- Policy requires checking the owner of the playlist
CREATE POLICY "Users can view songs in their playlists" 
ON public.user_playlist_songs FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.user_playlists 
        WHERE id = public.user_playlist_songs.playlist_id 
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert songs to their playlists" 
ON public.user_playlist_songs FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_playlists 
        WHERE id = playlist_id 
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete songs from their playlists" 
ON public.user_playlist_songs FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.user_playlists 
        WHERE id = public.user_playlist_songs.playlist_id 
        AND user_id = auth.uid()
    )
);

CREATE INDEX idx_user_playlist_songs_playlist_id ON public.user_playlist_songs(playlist_id);
