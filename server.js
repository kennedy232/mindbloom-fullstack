const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const { readAll, writeAll } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function badRequest(res, msg) {
  return res.status(400).json({ error: msg });
}

function requireUserId(req, res) {
  const userId = req.query.userId || req.body.userId;
  if (!userId || typeof userId !== 'string' || userId.length > 100) {
    badRequest(res, 'A valid userId is required.');
    return null;
  }
  return userId;
}

// ---------- MOODS (private per device) ----------
app.get('/api/moods', (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const data = readAll();
  const mine = data.moods.filter(m => m.userId === userId);
  res.json(mine);
});

app.post('/api/moods', (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const { mood } = req.body;
  const allowed = ['great', 'okay', 'low', 'anxious', 'tired'];
  if (!allowed.includes(mood)) return badRequest(res, 'Invalid mood value.');

  const data = readAll();
  const entry = { id: crypto.randomUUID(), userId, mood, date: Date.now() };
  data.moods.push(entry);
  writeAll(data);
  res.status(201).json(entry);
});

// ---------- JOURNAL (private per device) ----------
app.get('/api/journal', (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const data = readAll();
  const mine = data.journal.filter(j => j.userId === userId);
  res.json(mine);
});

app.post('/api/journal', (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const { situation = '', thought = '', reframe = '' } = req.body;
  if (!situation.trim() && !thought.trim() && !reframe.trim()) {
    return badRequest(res, 'Entry cannot be empty.');
  }
  const data = readAll();
  const entry = {
    id: crypto.randomUUID(),
    userId,
    situation: String(situation).slice(0, 2000),
    thought: String(thought).slice(0, 2000),
    reframe: String(reframe).slice(0, 2000),
    date: Date.now()
  };
  data.journal.push(entry);
  writeAll(data);
  res.status(201).json(entry);
});

app.delete('/api/journal/:id', (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const data = readAll();
  const before = data.journal.length;
  data.journal = data.journal.filter(j => !(j.id === req.params.id && j.userId === userId));
  if (data.journal.length === before) return res.status(404).json({ error: 'Entry not found.' });
  writeAll(data);
  res.status(204).end();
});

// ---------- COMMUNITY (shared, public) ----------
app.get('/api/community', (req, res) => {
  const data = readAll();
  const recent = data.community.slice(-100).reverse();
  res.json(recent);
});

app.post('/api/community', (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return badRequest(res, 'Post text is required.');
  if (text.length > 140) return badRequest(res, 'Post must be 140 characters or fewer.');

  const data = readAll();
  const entry = { id: crypto.randomUUID(), text: String(text).slice(0, 140), date: Date.now() };
  data.community.push(entry);
  // keep the file from growing without bound
  if (data.community.length > 1000) data.community = data.community.slice(-1000);
  writeAll(data);
  res.status(201).json(entry);
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: Date.now() }));

// Fallback to the SPA for any non-API route (Express 5 wildcard syntax)
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`MindBloom server running on port ${PORT}`);
});
