-- Enable anonymous auth in Supabase dashboard > Authentication > Providers

-- Profiles (auto-created on user signup via trigger)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  skin text NOT NULL DEFAULT 'steve',
  skin_color text, shirt_color text, pants_color text, hair_color text, shoe_color text,
  wins integer NOT NULL DEFAULT 0,
  platform text NOT NULL DEFAULT 'web',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles (id, username, platform)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Player_' || LEFT(NEW.id::text, 6)),
    COALESCE(NEW.raw_user_meta_data->>'platform', 'web')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Increment wins RPC
CREATE OR REPLACE FUNCTION increment_wins(p_user_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE profiles SET wins = wins + 1 WHERE id = p_user_id;
$$;

-- Rooms
CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  host_id uuid NOT NULL REFERENCES profiles(id),
  is_public boolean NOT NULL DEFAULT true,
  seed integer NOT NULL DEFAULT floor(random() * 2147483647)::integer,
  game_mode text NOT NULL DEFAULT 'battle',
  max_players integer NOT NULL DEFAULT 8,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Room members (join table)
CREATE TABLE room_members (
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  eliminated boolean NOT NULL DEFAULT false,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);

-- World events (game events, persisted for late-join sync)
CREATE TABLE world_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Mission completions
CREATE TABLE mission_completions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id),
  mission_id integer NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now()
);

-- PvP kills
CREATE TABLE pvp_kills (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  killer_id uuid NOT NULL REFERENCES profiles(id),
  victim_id uuid NOT NULL REFERENCES profiles(id),
  weapon text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pvp_kills ENABLE ROW LEVEL SECURITY;

-- Permissive policies (anonymous auth = authenticated)
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "rooms_all" ON rooms FOR ALL USING (true);
CREATE POLICY "room_members_all" ON room_members FOR ALL USING (true);
CREATE POLICY "world_events_all" ON world_events FOR ALL USING (true);
CREATE POLICY "mission_completions_all" ON mission_completions FOR ALL USING (true);
CREATE POLICY "pvp_kills_all" ON pvp_kills FOR ALL USING (true);

-- Enable Supabase Realtime on rooms (needed for Trystero signaling)
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
