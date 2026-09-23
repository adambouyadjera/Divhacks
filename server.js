import express from 'express';
import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const dataDirectory = join(root, 'data');
mkdirSync(dataDirectory, { recursive: true });

const db = new Database(join(dataDirectory, 'events.db'));
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    players_needed INTEGER,
    joined_count INTEGER NOT NULL DEFAULT 0,
    closes_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

const app = express();
const port = Number(process.env.PORT) || 3000;
const campus = { south: 40.8036, west: -73.9669, north: 40.8168, east: -73.9505 };

function isOnCampus(latitude, longitude) {
  return latitude >= campus.south && latitude <= campus.north && longitude >= campus.west && longitude <= campus.east;
}

app.use(express.json());
app.use(express.static(join(root, 'www')));

app.get('/api/events', (_request, response) => {
  response.json(db.prepare('SELECT * FROM events WHERE closes_at > ? ORDER BY created_at DESC').all(new Date().toISOString()));
});

app.post('/api/events', (request, response) => {
  const { title, category, latitude, longitude, playersNeeded, closesAt } = request.body;
  const cleanTitle = typeof title === 'string' ? title.trim() : '';
  const cleanCategory = typeof category === 'string' ? category.trim() : '';
  const closes = new Date(closesAt);
  if (!cleanTitle || !cleanCategory || !Number.isFinite(latitude) || !Number.isFinite(longitude) || !isOnCampus(latitude, longitude) || Number.isNaN(closes.valueOf()) || closes <= new Date()) {
    return response.status(400).json({ error: 'Enter a valid future event inside the Columbia campus boundary.' });
  }
  const playerCount = category === 'Sports' ? Number(playersNeeded) : null;
  if (category === 'Sports' && (!Number.isInteger(playerCount) || playerCount < 1 || playerCount > 99)) {
    return response.status(400).json({ error: 'Sports events need a player count from 1 to 99.' });
  }
  const result = db.prepare('INSERT INTO events (title, category, latitude, longitude, players_needed, closes_at) VALUES (?, ?, ?, ?, ?, ?)').run(cleanTitle, cleanCategory, latitude, longitude, playerCount, closes.toISOString());
  response.status(201).json(db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid));
});

app.post('/api/events/:id/join', (request, response) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(request.params.id);
  if (!event || new Date(event.closes_at) <= new Date()) return response.status(404).json({ error: 'This event is no longer active.' });
  if (event.players_needed && event.joined_count >= event.players_needed) return response.status(409).json({ error: 'This event is already full.' });
  db.prepare('UPDATE events SET joined_count = joined_count + 1 WHERE id = ?').run(event.id);
  response.json(db.prepare('SELECT * FROM events WHERE id = ?').get(event.id));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Campus Connect is running at http://localhost:${port}`);
});
