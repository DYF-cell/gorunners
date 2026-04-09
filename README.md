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

## Local startup and run configuration
This project has two parts:
- Frontend static page (`index.html`, `app.js`, `styles.css`, ...)
- Backend API (`server/main.py`, FastAPI + SQLite)

You can run frontend-only, or run frontend + backend together.

### 1) Frontend only (quick preview)
Open `index.html` directly in a browser.

Note: Some browser features (camera/geolocation/cross-origin requests) are more stable with a local HTTP server, so this mode is only for quick UI preview.

### 2) Frontend local dev server (recommended)
Run from repository root (`gorunners`):

Windows PowerShell:
```powershell
cd D:\PythonCode1\Gorunner\gorunners
python -m http.server 5173
```

macOS/Linux:
```bash
cd /path/to/gorunners
python3 -m http.server 5173
```

Open in browser:
`http://localhost:5173/`

### 3) Backend startup (FastAPI)
Run from `gorunners/server`:

Windows PowerShell:
```powershell
cd D:\PythonCode1\Gorunner\gorunners\server
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

macOS/Linux:
```bash
cd /path/to/gorunners/server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend API URL:
`http://localhost:8000`

Swagger docs:
`http://localhost:8000/docs`

Default admin:
- Email: `admin@gorunners.com`
- Password: `gorunners123`

### 4) Run frontend + backend together
Use two terminals:

Terminal A (frontend):
```powershell
cd D:\PythonCode1\Gorunner\gorunners
python -m http.server 5173
```

Terminal B (backend):
```powershell
cd D:\PythonCode1\Gorunner\gorunners\server
.\.venv\Scripts\Activate.ps1
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Then open:
- Frontend: `http://localhost:5173/`
- Backend docs: `http://localhost:8000/docs`

### 5) API endpoint configuration in frontend
The frontend defaults to `http://localhost:8000`.

If you need to switch backend URL temporarily, run in browser console:
```js
localStorage.gorunners_api = "http://localhost:8000";
location.reload();
```

To clear the override:
```js
localStorage.removeItem("gorunners_api");
location.reload();
```

### 6) Common startup issues
1. `python` command not found:
- Check Python installation and PATH.
- Try `py -m http.server 5173` on Windows.

2. Port already in use:
- Change frontend port: `python -m http.server 5174`
- Change backend port: `uvicorn main:app --port 8001 --reload`
- If backend port changes, update `localStorage.gorunners_api`.

3. PowerShell script execution policy blocks venv activation:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

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
