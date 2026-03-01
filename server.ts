import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('luxeglow.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    duration INTEGER NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS stylists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    bio TEXT,
    specialty TEXT,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT,
    service_id INTEGER,
    stylist_id INTEGER,
    booking_date TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY(service_id) REFERENCES services(id),
    FOREIGN KEY(stylist_id) REFERENCES stylists(id)
  );

  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    image_url TEXT NOT NULL,
    category TEXT
  );
`);

// Seed initial data if empty
const serviceCount = db.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number };
if (serviceCount.count === 0) {
  const insertService = db.prepare('INSERT INTO services (name, description, price, duration, category, image_url) VALUES (?, ?, ?, ?, ?, ?)');
  insertService.run('Classic Hair Braiding', 'Traditional braiding styles for all hair types.', 85.00, 120, 'Hair', 'https://picsum.photos/seed/braids/400/300');
  insertService.run('Gel Manicure', 'Long-lasting gel polish with nail shaping.', 45.00, 60, 'Nails', 'https://picsum.photos/seed/nails/400/300');
  insertService.run('HydraFacial', 'Deep cleansing and hydration treatment.', 120.00, 45, 'Skin', 'https://picsum.photos/seed/facial/400/300');
}

const stylistCount = db.prepare('SELECT COUNT(*) as count FROM stylists').get() as { count: number };
if (stylistCount.count === 0) {
  const insertStylist = db.prepare('INSERT INTO stylists (name, bio, specialty, image_url) VALUES (?, ?, ?, ?)');
  insertStylist.run('Elena Vance', 'Expert in intricate braiding and natural hair care.', 'Master Braider', 'https://picsum.photos/seed/stylist1/400/400');
  insertStylist.run('Marcus Chen', 'Award-winning nail artist with 10 years experience.', 'Nail Art', 'https://picsum.photos/seed/stylist2/400/400');
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get('/api/services', (req, res) => {
    const services = db.prepare('SELECT * FROM services').all();
    res.json(services);
  });

  app.get('/api/stylists', (req, res) => {
    const stylists = db.prepare('SELECT * FROM stylists').all();
    res.json(stylists);
  });

  app.get('/api/bookings', (req, res) => {
    const bookings = db.prepare(`
      SELECT b.*, s.name as service_name, st.name as stylist_name 
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN stylists st ON b.stylist_id = st.id
      ORDER BY b.booking_date DESC
    `).all();
    res.json(bookings);
  });

  app.post('/api/bookings', (req, res) => {
    const { client_name, client_email, client_phone, service_id, stylist_id, booking_date } = req.body;
    const info = db.prepare(`
      INSERT INTO bookings (client_name, client_email, client_phone, service_id, stylist_id, booking_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(client_name, client_email, client_phone, service_id, stylist_id, booking_date);
    res.json({ id: info.lastInsertRowid });
  });

  app.patch('/api/bookings/:id', (req, res) => {
    const { status } = req.body;
    db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
  });

  app.get('/api/gallery', (req, res) => {
    const images = db.prepare('SELECT * FROM gallery').all();
    res.json(images);
  });

  // Admin Login
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === 'admin123') {
      res.json({ success: true, token: 'demo-token-123' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid password' });
    }
  });

  // Admin Endpoints
  // Services
  app.post('/api/services', (req, res) => {
    const { name, description, price, duration, category, image_url } = req.body;
    const info = db.prepare('INSERT INTO services (name, description, price, duration, category, image_url) VALUES (?, ?, ?, ?, ?, ?)')
      .run(name, description, price, duration, category, image_url);
    res.json({ id: info.lastInsertRowid });
  });

  app.put('/api/services/:id', (req, res) => {
    const { name, description, price, duration, category, image_url } = req.body;
    db.prepare('UPDATE services SET name = ?, description = ?, price = ?, duration = ?, category = ?, image_url = ? WHERE id = ?')
      .run(name, description, price, duration, category, image_url, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/services/:id', (req, res) => {
    db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Stylists
  app.post('/api/stylists', (req, res) => {
    const { name, bio, specialty, image_url } = req.body;
    const info = db.prepare('INSERT INTO stylists (name, bio, specialty, image_url) VALUES (?, ?, ?, ?)')
      .run(name, bio, specialty, image_url);
    res.json({ id: info.lastInsertRowid });
  });

  app.put('/api/stylists/:id', (req, res) => {
    const { name, bio, specialty, image_url } = req.body;
    db.prepare('UPDATE stylists SET name = ?, bio = ?, specialty = ?, image_url = ? WHERE id = ?')
      .run(name, bio, specialty, image_url, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/stylists/:id', (req, res) => {
    db.prepare('DELETE FROM stylists WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Gallery
  app.post('/api/gallery', (req, res) => {
    const { title, image_url, category } = req.body;
    const info = db.prepare('INSERT INTO gallery (title, image_url, category) VALUES (?, ?, ?)')
      .run(title, image_url, category);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete('/api/gallery/:id', (req, res) => {
    db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Admin Login
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === 'admin123') { // Simple hardcoded password for demo
      res.json({ success: true, token: 'admin-token-123' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid password' });
    }
  });

  // Services CRUD
  app.post('/api/services', (req, res) => {
    const { name, description, price, duration, category, image_url } = req.body;
    const info = db.prepare('INSERT INTO services (name, description, price, duration, category, image_url) VALUES (?, ?, ?, ?, ?, ?)').run(name, description, price, duration, category, image_url);
    res.json({ id: info.lastInsertRowid });
  });

  app.put('/api/services/:id', (req, res) => {
    const { name, description, price, duration, category, image_url } = req.body;
    db.prepare('UPDATE services SET name = ?, description = ?, price = ?, duration = ?, category = ?, image_url = ? WHERE id = ?').run(name, description, price, duration, category, image_url, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/services/:id', (req, res) => {
    db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Stylists CRUD
  app.post('/api/stylists', (req, res) => {
    const { name, bio, specialty, image_url } = req.body;
    const info = db.prepare('INSERT INTO stylists (name, bio, specialty, image_url) VALUES (?, ?, ?, ?)').run(name, bio, specialty, image_url);
    res.json({ id: info.lastInsertRowid });
  });

  app.put('/api/stylists/:id', (req, res) => {
    const { name, bio, specialty, image_url } = req.body;
    db.prepare('UPDATE stylists SET name = ?, bio = ?, specialty = ?, image_url = ? WHERE id = ?').run(name, bio, specialty, image_url, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/stylists/:id', (req, res) => {
    db.prepare('DELETE FROM stylists WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Gallery CRUD
  app.post('/api/gallery', (req, res) => {
    const { title, image_url, category } = req.body;
    const info = db.prepare('INSERT INTO gallery (title, image_url, category) VALUES (?, ?, ?)').run(title, image_url, category);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete('/api/gallery/:id', (req, res) => {
    db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'dist', 'index.html')));
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
