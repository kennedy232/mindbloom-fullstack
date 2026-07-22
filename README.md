# MindBloom — Full-Stack App

A real Express backend + REST API + frontend for MindBloom (mindfulness breathing
exercise, mood tracker, CBT-style journal, and a shared community wall).

This is a complete, working project you can push to GitHub and deploy today.
Follow the steps below to get it live on its own domain.

---

## 1. Run it locally first

```bash
npm install
npm start
```

Then open `http://localhost:3000` — the full app, including the API, runs from
this one server.

Quick API sanity checks:

```bash
curl http://localhost:3000/api/health
curl -X POST http://localhost:3000/api/community -H "Content-Type: application/json" -d '{"text":"Hello world"}'
curl http://localhost:3000/api/community
```

---

## 2. How it's built

- **Backend:** Node.js + Express (`server.js`), REST API under `/api/*`
- **Data storage:** a JSON file on disk (`db.js`) — zero setup required to get
  running. This is fine for a demo or small personal deployment, but it is
  **not safe for multiple server instances** and some hosts reset local disks
  on redeploy (see the Postgres note below).
- **Frontend:** plain HTML/CSS/JS in `public/index.html`, served as static
  files by the same Express server and talking to the API via `fetch()`.
- **Users:** there are no accounts. Each browser gets a random anonymous ID
  stored in `localStorage`, used only to keep *your* moods/journal private to
  *your* device. The Community wall has no user scoping — anything posted
  there is public to everyone who visits the site.

---

## 3. Push it to GitHub

```bash
git init
git add .
git commit -m "MindBloom full-stack app"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

(Create the empty repo on GitHub first if you haven't already.)

---

## 4. Deploy the server (pick one — all have free tiers)

### Option A: Render.com (easiest)
1. Go to render.com → **New → Web Service** → connect your GitHub repo.
2. Build command: `npm install`
3. Start command: `npm start`
4. Deploy. You'll get a live URL like `https://mindbloom-xxxx.onrender.com`.

### Option B: Railway.app
1. railway.app → **New Project → Deploy from GitHub repo**.
2. Railway auto-detects Node and runs `npm start`.
3. You'll get a live URL under `*.up.railway.app`.

### Option C: Fly.io
1. Install the `flyctl` CLI, run `fly launch` in this folder, accept the
   defaults (it detects Node automatically).
2. `fly deploy`.

Any of these gets you a real, publicly reachable backend within a few
minutes — no server management required.

**Important — persistent data:** on Render/Railway free tiers, local disk
storage can be wiped on redeploy or restart. For anything beyond a demo,
add a persistent volume/disk in your host's settings (Render has a "Disks"
add-on), or swap the storage layer in `db.js` for a real database — e.g.
[Neon](https://neon.tech) or [Supabase](https://supabase.com) both offer a
free hosted Postgres instance with a connection string you'd use with the
`pg` npm package. The rest of the app (server.js) only calls `readAll()` /
`writeAll()` from `db.js`, so that's the only file you'd need to change.

---

## 5. Point your own domain at it

1. **Buy a domain** if you don't have one (Namecheap, Google Domains/Squarespace,
   Cloudflare Registrar, etc.) — usually $10–15/year.
2. In your hosting provider's dashboard (Render/Railway/Fly all support this):
   - Find **Settings → Custom Domain**.
   - Add your domain, e.g. `mindbloom.app` or `app.yourdomain.com`.
   - The host will show you a DNS record to add (usually a `CNAME` pointing
     at something like `mindbloom-xxxx.onrender.com`, or an `A` record with
     an IP address for apex domains).
3. Go to your domain registrar's DNS settings and add that record.
4. DNS propagation usually takes a few minutes to a few hours. Most hosts
   also auto-provision a free HTTPS certificate once the domain resolves.

Once that's done, your app is live at your own domain with a real backend
behind it — no more Claude-hosted artifact link required.

---

## 6. Project structure

```
mindbloom-fullstack/
  server.js        # Express app + REST API
  db.js            # JSON-file data layer (swap for Postgres when ready)
  package.json
  public/
    index.html      # frontend (breathe / mood / journal / community)
  data/             # created automatically at runtime, gitignored
```
