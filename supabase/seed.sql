-- Seed programs schedule (production data)
INSERT INTO public.programs (name, slug, logo_path, days, start_hour, end_hour, is_coming_soon, sort_order) VALUES
  ('D-Lokos', 'd-lokos', 'd-lokos.png', ARRAY['L','M','X','J','V'], 12, 14, FALSE, 1),
  ('Pick and Roll', 'pick-and-roll', 'pick-and-roll.png', ARRAY['L','V'], 19, 20, FALSE, 2),
  ('Segona Jugada', 'segona-jugada', 'segona-jugada.png', ARRAY['M'], 19, 20, FALSE, 3),
  ('Esto es Futbol Papa', 'esto-es-futbol-papa', 'esto-es-futbol-papa.png', ARRAY['M'], 14, 15, FALSE, 4),
  ('Desde la Cantera', 'desde-la-cantera', 'desde-la-cantera.png', ARRAY['J'], 19, 20, FALSE, 5),
  ('El Rincon del Negro', 'el-rincon-del-negro', 'el-rincon-del-negro.png', ARRAY['J'], 14, 15, FALSE, 6),
  ('El Sprint', 'el-sprint', 'el-sprint.png', ARRAY['V'], 14, 15, FALSE, 7),
  ('Level Up', 'level-up', 'level-up.png', ARRAY[]::TEXT[], 0, 0, TRUE, 8);

-- Seed default categories
INSERT INTO public.categories (name, slug, color) VALUES
  ('Deportes', 'deportes', '#E2001A'),
  ('Futbol', 'futbol', '#E2001A'),
  ('Baloncesto', 'baloncesto', '#E2001A'),
  ('Tenis', 'tenis', '#1B3C6E'),
  ('Motor', 'motor', '#1B3C6E'),
  ('Baleares', 'baleares', '#1B3C6E'),
  ('Entrevistas', 'entrevistas', '#E2001A'),
  ('Ciclismo', 'ciclismo', '#1B3C6E'),
  ('Atletismo', 'atletismo', '#E2001A'),
  ('Fútbol Balear', 'futbol-balear', '#1B3C6E'),
  ('Polideportivo', 'polideportivo', '#E2001A')
ON CONFLICT (slug) DO NOTHING;
