
-- ============================================
-- GOLF CHARITY SUBSCRIPTION PLATFORM SCHEMA
-- ============================================

-- 1. Enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.draw_mode AS ENUM ('random', 'algorithm');
CREATE TYPE public.draw_status AS ENUM ('pending', 'completed', 'cancelled');
CREATE TYPE public.verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'expired', 'past_due');

-- 2. Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 3. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 5. Charities table
CREATE TABLE public.charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_received NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active charities" ON public.charities FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage charities" ON public.charities FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_charities_updated_at BEFORE UPDATE ON public.charities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. User charity selections
CREATE TABLE public.user_charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES public.charities(id) ON DELETE CASCADE,
  contribution_percentage INTEGER NOT NULL DEFAULT 10 CHECK (contribution_percentage BETWEEN 1 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);
ALTER TABLE public.user_charities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own charity selection" ON public.user_charities FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own charity selection" ON public.user_charities FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_user_charities_updated_at BEFORE UPDATE ON public.user_charities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Scores table (Stableford, 1-45, max 5 per user)
CREATE TABLE public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 45),
  played_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own scores" ON public.scores FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores" ON public.scores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own scores" ON public.scores FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all scores" ON public.scores FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Function to enforce max 5 scores (auto-replace oldest)
CREATE OR REPLACE FUNCTION public.enforce_max_scores()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.scores
  WHERE id IN (
    SELECT id FROM public.scores
    WHERE user_id = NEW.user_id
    ORDER BY created_at DESC
    OFFSET 4
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER enforce_max_scores_trigger
  AFTER INSERT ON public.scores
  FOR EACH ROW EXECUTE FUNCTION public.enforce_max_scores();

-- 8. Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan TEXT NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  status subscription_status NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Draws table
CREATE TABLE public.draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_date DATE NOT NULL,
  mode draw_mode NOT NULL DEFAULT 'random',
  status draw_status NOT NULL DEFAULT 'pending',
  winning_numbers INTEGER[] NOT NULL DEFAULT '{}',
  prize_pool NUMERIC(12,2) NOT NULL DEFAULT 0,
  jackpot_rollover NUMERIC(12,2) NOT NULL DEFAULT 0,
  executed_by UUID REFERENCES auth.users(id),
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view completed draws" ON public.draws FOR SELECT USING (status = 'completed');
CREATE POLICY "Admins can manage draws" ON public.draws FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_draws_updated_at BEFORE UPDATE ON public.draws FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Draw results table
CREATE TABLE public.draw_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matched_count INTEGER NOT NULL CHECK (matched_count BETWEEN 0 AND 5),
  prize_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  user_scores INTEGER[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.draw_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own results" ON public.draw_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage results" ON public.draw_results FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 11. Winner verifications
CREATE TABLE public.winner_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_result_id UUID NOT NULL REFERENCES public.draw_results(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proof_url TEXT,
  status verification_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.winner_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own verifications" ON public.winner_verifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own verifications" ON public.winner_verifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage verifications" ON public.winner_verifications FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_winner_verifications_updated_at BEFORE UPDATE ON public.winner_verifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 12. App settings (admin-configurable)
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.app_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.app_settings (key, value) VALUES
  ('pricing', '{"monthly": 1000, "yearly": 10000, "currency": "usd"}'::jsonb),
  ('draw_config', '{"mode": "random", "five_match_pct": 40, "four_match_pct": 35, "three_match_pct": 25}'::jsonb),
  ('jackpot', '{"current_rollover": 0}'::jsonb);

-- 13. Storage bucket for verification proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('verifications', 'verifications', false);
CREATE POLICY "Users can upload verification proofs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'verifications' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own verification proofs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'verifications' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins can view all verification proofs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'verifications' AND public.has_role(auth.uid(), 'admin'));
