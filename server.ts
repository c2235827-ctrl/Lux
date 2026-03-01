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

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- 'stylist', 'service', 'experience'
    target_id INTEGER, -- stylist_id or service_id, NULL for experience
    client_name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS site_content (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Seed initial data
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

const galleryCount = db.prepare('SELECT COUNT(*) as count FROM gallery').get() as { count: number };
if (galleryCount.count === 0) {
  const insertGallery = db.prepare('INSERT INTO gallery (title, image_url, category) VALUES (?, ?, ?)');
  insertGallery.run('Elegant Braids', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800', 'Hair');
  insertGallery.run('Modern Nails', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800', 'Nails');
  insertGallery.run('Skin Glow', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800', 'Skin');
}

const contentCount = db.prepare('SELECT COUNT(*) as count FROM site_content').get() as { count: number };
if (contentCount.count === 0) {
  const insertContent = db.prepare('INSERT INTO site_content (key, value) VALUES (?, ?)');
  insertContent.run('hero_title', 'Reveal Your \n Inner Radiance');
  insertContent.run('hero_subtitle', 'Welcome to Excellence');
  insertContent.run('mission_statement', 'Defining luxury beauty experiences since 2015. Our mission is to provide bespoke services that celebrate your unique radiance.');
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Site Content
  app.get('/api/content', (req, res) => {
    const content = db.prepare('SELECT * FROM site_content').all();
    const contentMap = content.reduce((acc: any, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
    res.json(contentMap);
  });

  app.put('/api/content', (req, res) => {
    const { content } = req.body;
    const update = db.prepare('INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)');
    const transaction = db.transaction((data) => {
      for (const [key, value] of Object.entries(data)) {
        update.run(key, value);
      }
    });
    transaction(content);
    res.json({ success: true });
  });

  // Reviews
  app.get('/api/reviews', (req, res) => {
    const { type, target_id } = req.query;
    let query = 'SELECT * FROM reviews';
    const params = [];
    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
      if (target_id) {
        query += ' AND target_id = ?';
        params.push(target_id);
      }
    }
    query += ' ORDER BY created_at DESC';
    const reviews = db.prepare(query).all(...params);
    res.json(reviews);
  });

  app.post('/api/reviews', (req, res) => {
    const { type, target_id, client_name, rating, comment } = req.body;
    const info = db.prepare('INSERT INTO reviews (type, target_id, client_name, rating, comment) VALUES (?, ?, ?, ?, ?)')
      .run(type, target_id, client_name, rating, comment);
    res.json({ id: info.lastInsertRowid });
  });

  // Services
  app.get('/api/services', (req, res) => {
    const services = db.prepare('SELECT * FROM services').all();
    res.json(services);
  });

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
  app.get('/api/stylists', (req, res) => {
    const stylists = db.prepare('SELECT * FROM stylists').all();
    res.json(stylists);
  });

  app.get('/api/stylists/:id', (req, res) => {
    const stylist = db.prepare('SELECT * FROM stylists WHERE id = ?').get(req.params.id);
    if (stylist) res.json(stylist);
    else res.status(404).json({ message: 'Stylist not found' });
  });

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

  // Bookings
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

  // Gallery
  app.get('/api/gallery', (req, res) => {
    const images = db.prepare('SELECT * FROM gallery').all();
    res.json(images);
  });

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
    if (password === 'admin123') {
      res.json({ success: true, token: 'demo-token-123' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid password' });
    }
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
