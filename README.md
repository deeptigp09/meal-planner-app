# Weekly meal planner

A weekly vegetarian meal planner built for a household of 3 adults and an
11-month-old baby. Open it Friday morning to see the week ahead, Saturday
to Friday.

**What it does:**
- Plans breakfast, lunch, and dinner for all 7 days, mixing Indian (~80%)
  and continental (~20%) meals
- Includes a baby-friendly version of every meal — softened, lightly
  salted, low spice
- Flags a no-yogurt swap (protein shake or smoothie) on any meal built
  around curd
- Features idli/dosa batter 3–4 times a week for dinner
- No eggs, no mushroom, anywhere
- Every dish cooks in under an hour
- Builds a grocery list automatically, grouped into vegetables, dairy,
  and pantry, with tap-to-check-off
- Regenerate the whole week, or just one day, with one tap

No sign-up, no account, no data leaves your phone — everything runs
locally in the browser.

---

## For developers

The rest of this is about running, deploying, and editing the app.

### Run it locally

```bash
npm install
npm run dev
```

### Deploy it free

Push to GitHub, then connect the repo at [vercel.com](https://vercel.com)
or [netlify.com](https://netlify.com) — both auto-detect Vite, no config
needed, and redeploy on every push. GitHub Pages also works; see
`vite.config.js` if using that route (set `base` to your repo name).

### Install on a phone like a native app

Once deployed, open the live URL and use "Add to Home Screen" (iOS Safari)
or "Install app" (Android Chrome). The manifest and service worker in this
project make it launch full-screen with its own icon — no app store needed.

### Project structure

```
src/MealPlanner.jsx     all app logic: dish/vegetable data, the
                        generator, grocery list builder, and UI
src/main.jsx            mounts the app
public/manifest.webmanifest, public/sw.js, public/icons/   PWA setup
```

To add or change meals, edit the `DISHES` and `VEGETABLES` constants near
the top of `src/MealPlanner.jsx`.
