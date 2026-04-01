-- ============================================================================
-- SZ Metal Admin Panel — Bildirim Sistemi
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın.
-- ============================================================================

-- 1) Tablo oluştur
CREATE TABLE IF NOT EXISTS public.notifications (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type        text        NOT NULL,
  title       text        NOT NULL,
  message     text        NOT NULL DEFAULT '',
  data        jsonb       NOT NULL DEFAULT '{}',
  read_at     timestamptz DEFAULT NULL,
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- 2) İndeksler
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications (user_id, created_at DESC)
  WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications (user_id, created_at DESC);

-- 3) RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4) Realtime aktifleştir
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================================================
-- 5) Bildirim oluşturma fonksiyonu (SECURITY DEFINER — RLS'yi atlar)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.create_notification(
  p_type        text,
  p_title       text,
  p_message     text,
  p_data        jsonb DEFAULT '{}',
  p_exclude_uid uuid  DEFAULT NULL,
  p_target      text  DEFAULT 'admin'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid;
BEGIN
  IF p_target = 'admin' THEN
    FOR _uid IN SELECT id FROM users WHERE role = 'Admin' AND (p_exclude_uid IS NULL OR id != p_exclude_uid)
    LOOP
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (_uid, p_type, p_title, p_message, p_data);
    END LOOP;

  ELSIF p_target = 'staff' THEN
    FOR _uid IN SELECT id FROM users WHERE role IN ('Admin', 'Manager') AND (p_exclude_uid IS NULL OR id != p_exclude_uid)
    LOOP
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (_uid, p_type, p_title, p_message, p_data);
    END LOOP;

  ELSIF p_target LIKE 'user:%' THEN
    _uid := (split_part(p_target, ':', 2))::uuid;
    IF p_exclude_uid IS NULL OR _uid != p_exclude_uid THEN
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (_uid, p_type, p_title, p_message, p_data);
    END IF;

  ELSE
    -- 'all' — tüm aktif kullanıcılar
    FOR _uid IN SELECT id FROM users WHERE status = 'Active' AND (p_exclude_uid IS NULL OR id != p_exclude_uid)
    LOOP
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (_uid, p_type, p_title, p_message, p_data);
    END LOOP;
  END IF;
END;
$$;

-- ============================================================================
-- 6) Ürün trigger'ı
-- ============================================================================
CREATE OR REPLACE FUNCTION public.trg_product_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _type   text;
  _title  text;
  _msg    text;
  _data   jsonb;
  _name   text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    _name  := NEW.name;
    _type  := 'product_created';
    _title := 'Yeni Ürün';
    _msg   := format('"%s" ürünü eklendi.', _name);
    _data  := jsonb_build_object('product_id', NEW.id, 'product_name', _name, 'product_code', NEW.code);
    PERFORM create_notification(_type, _title, _msg, _data, NEW.created_by, 'staff');

  ELSIF TG_OP = 'DELETE' THEN
    _name  := OLD.name;
    _type  := 'product_deleted';
    _title := 'Ürün Silindi';
    _msg   := format('"%s" ürünü silindi.', _name);
    _data  := jsonb_build_object('product_id', OLD.id, 'product_name', _name, 'product_code', OLD.code);
    PERFORM create_notification(_type, _title, _msg, _data, NULL, 'admin');
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- INSERT ve DELETE için trigger
CREATE TRIGGER trg_products_notify
  AFTER INSERT OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION trg_product_notify();

-- UPDATE için ayrı trigger (sadece anlamlı değişikliklerde — view_count hariç)
CREATE OR REPLACE FUNCTION public.trg_product_update_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _data jsonb;
BEGIN
  _data := jsonb_build_object('product_id', NEW.id, 'product_name', NEW.name, 'product_code', NEW.code);
  PERFORM create_notification(
    'product_updated',
    'Ürün Güncellendi',
    format('"%s" ürünü güncellendi.', NEW.name),
    _data,
    NULL,
    'staff'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_products_update_notify
  AFTER UPDATE ON public.products
  FOR EACH ROW
  WHEN (
    OLD.name IS DISTINCT FROM NEW.name OR
    OLD.code IS DISTINCT FROM NEW.code OR
    OLD.availability IS DISTINCT FROM NEW.availability OR
    OLD.has_customer_mold IS DISTINCT FROM NEW.has_customer_mold OR
    OLD.category_id IS DISTINCT FROM NEW.category_id OR
    OLD.variant IS DISTINCT FROM NEW.variant OR
    OLD.description IS DISTINCT FROM NEW.description
  )
  EXECUTE FUNCTION trg_product_update_notify();

-- ============================================================================
-- 7) Kullanıcı trigger'ı
-- ============================================================================
CREATE OR REPLACE FUNCTION public.trg_user_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _type   text;
  _title  text;
  _msg    text;
  _data   jsonb;
  _uname  text;
BEGIN
  _uname := COALESCE(NEW.username, NEW.email, 'Bilinmeyen');

  IF TG_OP = 'INSERT' THEN
    _type  := 'user_registered';
    _title := 'Yeni Kullanıcı';
    _msg   := format('%s sisteme kaydoldu.', _uname);
    _data  := jsonb_build_object('target_user_id', NEW.id, 'username', _uname);
    PERFORM create_notification(_type, _title, _msg, _data, NEW.id, 'admin');

  ELSIF TG_OP = 'UPDATE' THEN
    -- Rol değişikliği
    IF OLD.role IS DISTINCT FROM NEW.role THEN
      _type  := 'user_role_changed';
      _title := 'Rol Değişikliği';
      _msg   := format('%s kullanıcısının rolü %s olarak değiştirildi.', _uname, NEW.role);
      _data  := jsonb_build_object('target_user_id', NEW.id, 'username', _uname, 'old_role', OLD.role, 'new_role', NEW.role);
      PERFORM create_notification(_type, _title, _msg, _data, NULL, 'admin');
      -- Etkilenen kullanıcıya da bildir (admin değilse)
      IF NEW.role != 'Admin' THEN
        PERFORM create_notification(_type, _title, _msg, _data, NULL, 'user:' || NEW.id);
      END IF;
    END IF;

    -- Durum değişikliği
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      _type  := 'user_status_changed';
      _title := 'Durum Değişikliği';
      _msg   := format('%s kullanıcısının durumu %s olarak değiştirildi.', _uname, NEW.status);
      _data  := jsonb_build_object('target_user_id', NEW.id, 'username', _uname, 'old_status', OLD.status, 'new_status', NEW.status);
      PERFORM create_notification(_type, _title, _msg, _data, NULL, 'admin');
      IF NEW.role != 'Admin' THEN
        PERFORM create_notification(_type, _title, _msg, _data, NULL, 'user:' || NEW.id);
      END IF;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_users_notify
  AFTER INSERT OR UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION trg_user_notify();

-- ============================================================================
-- 8) Yorum trigger'ı
-- ============================================================================
CREATE OR REPLACE FUNCTION public.trg_comment_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _product_name text;
  _product_code text;
  _owner_id     uuid;
BEGIN
  SELECT name, code, created_by
  INTO _product_name, _product_code, _owner_id
  FROM products WHERE id = NEW.product_uuid;

  -- Staff'a bildir
  PERFORM create_notification(
    'comment_added',
    'Yeni Yorum',
    format('%s, "%s" ürününe yorum yaptı.', NEW.author_name, COALESCE(_product_name, 'Ürün')),
    jsonb_build_object(
      'product_id', NEW.product_uuid,
      'comment_id', NEW.id,
      'product_name', _product_name,
      'product_code', _product_code,
      'author_name', NEW.author_name
    ),
    NEW.author_id,
    'staff'
  );

  -- Ürün sahibine bildir (staff değilse ve kendisi değilse)
  IF _owner_id IS NOT NULL AND _owner_id != NEW.author_id THEN
    PERFORM create_notification(
      'comment_added',
      'Yeni Yorum',
      format('%s, ürününüze yorum yaptı.', NEW.author_name),
      jsonb_build_object(
        'product_id', NEW.product_uuid,
        'comment_id', NEW.id,
        'product_name', _product_name,
        'product_code', _product_code,
        'author_name', NEW.author_name
      ),
      NULL,
      'user:' || _owner_id
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_comments_notify
  AFTER INSERT ON public.product_comments
  FOR EACH ROW EXECUTE FUNCTION trg_comment_notify();

-- ============================================================================
-- Bitti! Artık bildirim sistemi veritabanı katmanı hazır.
-- ============================================================================
