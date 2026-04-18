# GoRunners Web App Prototype

A playful, human-centric web app for onsite running activities inspired by Wuming Run Crew. Built for CPT208 Active Lifestyles (C1 Go Runners).

## Features
- Discover and register for onsite runs with playful tags and pacing
- EN/ZH language toggle for key UI content
- Pace-based group matching with supportive recommendations
- Interactive route checkpoints and badge rewards
- 3D event route map with draggable route points and an animated runner marker
- Live run tracking that records the user's GPS route after Start Run
- Immersive full-screen Run Mode with Google Street View support, camera fallback, AR-style route cue, and a 2D tactical minimap
- Suzhou live map with location-based check-ins
- Community spot threads with camera-enabled posts
- Organizer dashboard for lightweight event management
- Separate admin console for user management, event oversight, and post moderation
- Responsive UI for mobile and desktop

## Tech
- HTML5 + CSS3
- Vanilla JavaScript
- MapLibre GL + OpenStreetMap tiles for the 3D event route map, with Leaflet fallback when WebGL is unavailable
- Leaflet + OpenStreetMap tiles for community and planner maps
- Optional Google Maps JavaScript API Street View scene for Run Mode
- Browser Geolocation API for live run tracking and route recording
- LocalStorage for frontend session/cache data such as points, badges, and route drafts

## Local startup and run configuration
This project has two parts:
- Frontend static pages (`index.html`, `admin.html`, `app.js`, `admin.js`, `styles.css`, ...)
- Backend API (`server/main.py`, FastAPI + SQLModel, MySQL-first configuration)

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

Quick start script:
```bash
cd /Users/fake/gorunners
./start-frontend.sh
```

### 3) Backend startup (FastAPI)
Before the first backend run, copy the example env file and edit it:

macOS/Linux:
```bash
cd /path/to/gorunners
cp .env.example .env
```

Windows PowerShell:
```powershell
cd D:\PythonCode1\Gorunner\gorunners
Copy-Item .env.example .env
```

Recommended database setup:
- Preferred: MySQL via `.env`
- Fallback for quick local preview: SQLite if no MySQL env vars are provided

The backend auto-loads `.env` and `.env.local` from the repository root.

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

Recommended `.env` examples:

MySQL via a full connection URL:
```bash
GORUNNERS_DB="mysql+pymysql://root:password@127.0.0.1:3306/gorunners?charset=utf8mb4"
```

MySQL via separate env vars:
```bash
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=gorunners
```

SQLite for quick local preview:
```bash
GORUNNERS_SECRET=change-this-in-production
```

Then start the backend normally:
```bash
cd /path/to/gorunners/server
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Quick start script on macOS/Linux:
```bash
cd /Users/fake/gorunners
./start-backend.sh
```

`start-backend.sh` now reads the root `.env` / `.env.local` file instead of hardcoding one machine's MySQL credentials. If `MYSQL_HOST` is set and the `mysql` CLI is installed, it will also create the database automatically before starting FastAPI.

Backend API URL:
`http://localhost:8000`

Swagger docs:
`http://localhost:8000/docs`

Default admin:
- Email: `admin@gorunners.com`
- Password: `gorunners123`

Admin console:
- `http://localhost:5173/admin.html`
- Admin login redirects to the dedicated console instead of keeping the same user-facing page

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
- Admin console: `http://localhost:5173/admin.html`
- Backend docs: `http://localhost:8000/docs`

Quick start on macOS/Linux:
```bash
cd /Users/fake/gorunners
./start-frontend.sh
```

Open another terminal:
```bash
cd /Users/fake/gorunners
./start-backend.sh
```

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

### 6) Optional Google Street View for Run Mode
Run Mode works without Google Maps by using the device camera plus the 2D route map. To enable Google Street View as the main real-world scene, set a Maps JavaScript API key in `config.js`:

```js
window.GORUNNERS_GOOGLE_MAPS_KEY = "YOUR_GOOGLE_MAPS_API_KEY";
```

The browser still needs geolocation permission, and camera fallback needs camera permission.

### 7) Common startup issues
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
   - `admin.html`
   - `app.js`
   - `admin.js`
   - `data.js`
   - `styles.css`
   - `config.js`

### Backend (Render)
1. Create a Render **Web Service** from this repo.
2. It will auto-detect `render.yaml` (root).
3. In Render environment variables, configure MySQL using either:
   - `GORUNNERS_DB=mysql+pymysql://user:password@host:3306/gorunners?charset=utf8mb4`
   - or `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
4. After deploy, set the API URL in `config.js`:
   ```js
   window.GORUNNERS_API = "https://your-service-name.onrender.com";
   ```
5. Commit and push again to update GitHub Pages.

## Data handling
- Seed events are stored in `data.js`.
- User interactions and UI cache are stored in `localStorage` (`gorunners_state_v2`, `gorunners_events_v2`, `gorunners_token`).
- Server state is stored in MySQL when configured.
- If no MySQL configuration is provided, the backend falls back to `gorunners/server/gorunners.db` for local compatibility.

## Notes
- Geolocation and camera capture require HTTPS or localhost in modern browsers.
- OpenStreetMap tiles require attribution (already included in the map).

## AI logs
- See `ai-logs/prompt-log.md` for the primary prompts used to scaffold the prototype.
