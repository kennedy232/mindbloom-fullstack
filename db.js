// Minimal JSON-file data layer.
// Works out of the box with zero external database setup, so you can deploy
// immediately. When you're ready for production-grade persistence, swap the
// read/write functions below for calls to Postgres (e.g. via `pg`) — the
// rest of server.js only talks to the functions exported here, so nothing
// else needs to change.

const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

const DEFAULT_DATA = { moods: [], journal: [], community: [] };

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
  }
}

function readAll() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    console.error('DB read error, resetting to defaults:', e);
    return { ...DEFAULT_DATA };
  }
}

// Atomic-ish write: write to a temp file then rename, to avoid corrupting
// the data file if the process is killed mid-write.
function writeAll(data) {
  ensureFile();
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}

module.exports = { readAll, writeAll };
