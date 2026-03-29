# GoRunners Web App Prototype

A playful, human-centric web app for onsite running activities inspired by Wuming Run Crew. Built for CPT208 Active Lifestyles (C1 Go Runners).

## Features
- Discover and register for onsite runs with playful tags and pacing
- EN/ZH language toggle for key UI content
- Pace-based group matching with supportive recommendations
- Interactive route checkpoints and badge rewards
- Suzhou live map with location-based check-ins
- Community spot threads with camera-enabled posts
- Organizer dashboard for lightweight event management
- Admin tools for user management and recommended checkpoints
- Responsive UI for mobile and desktop

## Tech
- HTML5 + CSS3
- Vanilla JavaScript
- Leaflet + OpenStreetMap tiles for the live map
- LocalStorage "DB" for registrations, points, badges, and organizer updates

## Run locally
Option A (quick):
- Open `index.html` directly in a browser.

Option B (recommended for local dev):
```bash
python3 -m http.server 5173
```
Then open `http://localhost:5173/gorunners/`.

## Backend (FastAPI)
```bash
cd gorunners/server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Default admin:
- Email: `admin@gorunners.com`
- Password: `gorunners123`

The frontend expects the API at `http://localhost:8000`. You can override by setting
`localStorage.gorunners_api` in the browser console.

## Deploy
### Frontend (GitHub Pages)
1. Push this folder to a GitHub repo as the `main` branch root.
2. In GitHub: `Settings -> Pages -> Build and deployment`, select **GitHub Actions**.
3. The workflow at `.github/workflows/deploy-pages.yml` publishes:
   - `index.html`
   - `app.js`
   - `data.js`
   - `styles.css`
   - `config.js`

### Backend (Render)
1. Create a Render **Web Service** from this repo.
2. It will auto-detect `render.yaml` (root).
3. After deploy, set the API URL in `config.js`:
   ```js
   window.GORUNNERS_API = "https://your-service-name.onrender.com";
   ```
4. Commit and push again to update GitHub Pages.

## Data handling
- Seed events are stored in `data.js`.
- User interactions are stored in `localStorage` (`gorunners_state_v2` and `gorunners_events_v2`).
- Server state is stored in `gorunners/server/gorunners.db` (SQLite).

## Notes
- Geolocation and camera capture require HTTPS or localhost in modern browsers.
- OpenStreetMap tiles require attribution (already included in the map).

## AI logs
- See `ai-logs/prompt-log.md` for the primary prompts used to scaffold the prototype.
