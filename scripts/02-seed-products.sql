-- Insert default products
INSERT INTO products (name, price, stock) VALUES
  ('Roti Tawar', 12000, 50),
  ('Roti Coklat', 15000, 30),
  ('Roti Keju', 18000, 25),
  ('Croissant', 25000, 20),
  ('Donat Gula', 8000, 40),
  ('Donat Coklat', 10000, 35),
  ('Roti Pisang', 13000, 30),
  ('Roti Abon', 16000, 25),
  ('Roti Sobek', 14000, 20),
  ('Roti Gandum', 15000, 15)
ON CONFLICT DO NOTHING;
