# Omaha Events

Event feed and calendar for Omaha, Nebraska: the CHI Health Center, Baxter Arena, the Orpheum and the Holland Center, Steelhouse Omaha, the Astro, Liberty First Credit Union Arena, Slowdown and the Waiting Room, with Werner Park and Morrison Stadium as the Storm Chasers' and Union Omaha's grounds — with the home teams'
seasons (Creighton, Omaha hockey, the Storm Chasers, the Omaha Lancers, Union Omaha) in a Teams view.

Live at **https://omaha.here.events/** once the domain is wired (GitHub Pages,
built by the Actions workflow once a day at noon Central).

Split out of the state-wide nebraska-events site on 2026-10-14 (one site per
city, like every other town in the family). Everything that makes this
Omaha's is `site/city.js` (every team, venue, type, default, share-code
registry and string), `site/index.html`, `scripts/fetch-events.mjs` (the
sources), `site/embed.js`, `outlook.json`, `scripts/data/postseason.json`,
`channels.json`, the manifest and icons. Everything else — `app.js`,
`filter.js`, `styles.css` bar its `--v-*` hue lines, the shared `scripts/*.mjs`
and their tests — is lqa-events' own, byte for byte, copied in by
`sync-shared.sh` from the lqa-events project.

## Build

```
cp .env.example .env   # TICKETMASTER_API_KEY=… (a free Discovery key)
ALLOW_NO_ARCHIVE=1 node scripts/fetch-events.mjs   # writes site/events.json, the .ics feeds, teams.json
node --test scripts/*.test.mjs
python3 -m http.server 8000 --directory site
```

`ALLOW_NO_ARCHIVE=1` is only for the first build, before the `events-archive`
branch exists; in CI the workflow sets it as a repository variable until the
first run has pushed the archive, then it is deleted.

## Sister sites

lqa-events (Seattle Center) is the source of truth for the shared files. See
its README for the pipeline, the share codes and the Teams view.
