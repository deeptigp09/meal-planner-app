# Weekly meal planner

A self-contained vegetarian Indian/continental meal planner for a family of 3
adults + an 11-month-old baby. No backend, no database — everything runs in
the browser. Installable as a PWA (add to home screen) on any phone.

## Run it locally

```bash
npm install
npm run dev
```

Open the printed `localhost` URL on your computer, or on your phone if it's
on the same wifi network (use your computer's local IP instead of
`localhost`, e.g. `http://192.168.1.23:5173`).

## Put it on your own GitHub

```bash
git init
git add .
git commit -m "Initial commit: weekly meal planner"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

(Create the empty repo on GitHub first at github.com/new — don't initialize
it with a README there, since this folder already has one.)

## Deploy it live, free, in ~2 minutes

Any of these work great for a static React app like this one. All three
detect Vite automatically — you don't need to configure anything.

### Option 1: Vercel (recommended, easiest)
1. Go to vercel.com → sign in with GitHub
2. "Add new project" → pick this repo
3. Leave all defaults (it auto-detects Vite) → Deploy
4. You get a live URL like `your-app.vercel.app` instantly
5. Every future `git push` auto-redeploys

### Option 2: Netlify
1. Go to netlify.com → "Add new site" → "Import an existing project"
2. Connect GitHub, pick this repo
3. Build command: `npm run build`, publish directory: `dist`
4. Deploy → you get a URL like `your-app.netlify.app`

### Option 3: GitHub Pages (free, tied directly to your GitHub repo)
1. `npm install -D gh-pages` (add to devDependencies)
2. Add to `package.json` scripts: `"deploy": "npm run build && npx gh-pages -d dist"`
3. In `vite.config.js`, set `base: "/<your-repo-name>/"` instead of `"./"`
4. Run `npm run deploy`
5. In your repo's Settings → Pages, set source to the `gh-pages` branch
6. Live at `https://<your-username>.github.io/<your-repo-name>/`

## Installing it on your phone like an app

Once deployed to any URL above:
- **Android (Chrome):** open the URL → menu (⋮) → "Add to Home screen" / "Install app"
- **iPhone (Safari):** open the URL → Share button → "Add to Home Screen"

It will then open full-screen with its own icon, exactly like a native app,
using the manifest and service worker already included in this project — no
Play Store, no app review, no APK needed.

## Project structure

```
index.html              entry HTML, PWA meta tags
public/manifest.webmanifest   PWA install config
public/sw.js             offline caching service worker
public/icons/            app icons (192px, 512px)
src/main.jsx             mounts the React app
src/MealPlanner.jsx       the entire app: data, generator, UI
```

All app logic — the vegetable/dish pools, rotation generator, grocery list
builder, and UI — lives in `src/MealPlanner.jsx`. Edit the `DISHES` and
`VEGETABLES` constants near the top of that file to add more meals or
ingredients.
