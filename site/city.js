// The city — every fact that makes this calendar Omaha's rather than
// another town's, in one place (2026-10-14: split out of the state-wide
// nebraska-events site, which carried Omaha and Lincoln as its two groups,
// when Steve asked for one site per city; Lincoln got its own the same night).
// The browser (filter.js, app.js) and the build (scripts/*.mjs) both read it;
// nothing else names a venue or a team. The shared files (app.js, filter.js,
// styles.css bar its --v-* hues, scripts/*.mjs bar fetch-events.mjs and
// sources.mjs) are lqa-events' own, byte for byte — see README "Sister sites".
//
// Loaded before filter.js (a plain script, so the tests can share it): it
// sets globalThis.LQACity (the name is the shared code's, not the city's).
(function (global) {
  'use strict';

  // The home teams, matched on the event title whatever the venue. Order =
  // the Teams strip, left to right; the first match wins (app.js teamFor),
  // so the Lancers' anchored pattern never claims a Stars home title.
  // Per team:
  //   re        the title match (Ticketmaster's titles — "Nebraska
  //             Cornhuskers Football vs. …", "Omaha Hockey vs …", "Lincoln
  //             Stars vs. …" — and the injected ones, "<inject.name> vs …")
  //   venue     the home building; schedule = the club's own schedule page
  //   sport     keys the strip icon (app.js SPORT_ICONS), the game clock,
  //             the leader categories. Volleyball has no icon in the shared
  //             table yet (the strip shows the crest alone)
  //   colors    [primary, accent] — the season calendar's home cells and
  //             card frames
  //   espn      ESPN's sport/league/team id — the three Husker programs,
  //             Creighton, Omaha's hockey and Union Omaha (USL League One)
  //             are on ESPN (season, form, news); the Storm Chasers' season
  //             comes from MLB's stats API (Triple-A is on it, sportId 11)
  //             and the Stars' and Lancers' from the USHL's HockeyTech feed
  //   inject    a club whose home dates no ticket feed lists in full: the
  //             league's schedule puts them on the calendar under this
  //             ticket link (name = the injected title's first half)
  //   club      the club's name on Ticketmaster; news the outlets' feeds;
  //             wiki the article (teamPage: college seasons are titled
  //             "2026 Nebraska Cornhuskers football team"); opens when the
  //             season usually starts
  var USHL = { league: 'ushl', key: 'e828f89b243dc43f' }; // HockeyTech's USHL feed (client_code ushl), as Green Bay's Gamblers read it
  var TEAMS = [
    // Creighton Bluejays men's basketball, Big East, CHI Health Center Omaha.
    // The arena's Ticketmaster listing carries none of the home games (the
    // school sells them itself), so the schedule is injected
    { slug: 'bluejays', label: 'Bluejays', name: 'Creighton Bluejays', abbr: 'CREI', re: /creighton(?!.*women)/i, sport: 'basketball', venue: 'CHI Health Center Omaha', colors: ['#005ca9', '#6cadde'],
      espn: { sport: 'basketball', league: 'mens-college-basketball', id: '156' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      inject: { name: 'Creighton Bluejays', url: 'https://gocreighton.com/sports/mens-basketball/schedule' },
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/156.png', schedule: 'https://gocreighton.com/sports/mens-basketball/schedule',
      club: 'Creighton Bluejays Basketball', opens: 'early November', wiki: { title: "Creighton Bluejays men's basketball", teamPage: true } },
    // Omaha Mavericks hockey, NCHC, Baxter Arena — Ticketmaster lists the home games ("Omaha Hockey vs …")
    { slug: 'mavericks', label: 'Mavericks', name: 'Omaha Mavericks', abbr: 'OMA', re: /omaha (mavericks )?hockey|mavericks hockey/i, sport: 'hockey', venue: 'Baxter Arena', colors: ['#d71920', '#000000'],
      espn: { sport: 'hockey', league: 'mens-college-hockey', id: '2437' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2437.png', schedule: 'https://omavs.com/sports/mens-ice-hockey/schedule',
      club: 'Omaha Mavericks Hockey', opens: 'early October', wiki: { title: 'Omaha Mavericks men\'s ice hockey', teamPage: true } },
    // Omaha Storm Chasers, Triple-A International League (Royals affiliate),
    // Werner Park in Papillion — no ticket feed lists the home stands, so
    // the league's schedule supplies them (the Aviators pattern)
    { slug: 'stormchasers', label: 'Storm Chasers', name: 'Omaha Storm Chasers', abbr: 'OMA', re: /storm chasers/i, sport: 'baseball', venue: 'Werner Park', colors: ['#1c2b5a', '#8ab7e0'],
      season: { kind: 'mlb', id: 541, sportId: 11 }, form: { kind: 'milb', id: 541, league: 117, leagueName: 'International League' },
      inject: { url: 'https://www.milb.com/omaha/tickets' },
      logo: 'https://www.mlbstatic.com/team-logos/541.svg', schedule: 'https://www.milb.com/omaha/schedule',
      club: 'Omaha Storm Chasers', opens: 'late March', wiki: { title: 'Omaha Storm Chasers', club: true },
      news: [['https://www.milb.com/omaha/feeds/news/rss.xml', 'MiLB.com']] },
    // Omaha Lancers, USHL, Liberty First Credit Union Arena in Ralston — Ticketmaster lists the home games
    { slug: 'lancers', label: 'Lancers', name: 'Omaha Lancers', abbr: 'OMA', re: /^omaha lancers/i, sport: 'hockey', venue: 'Liberty First Credit Union Arena', colors: ['#c8102e', '#041e42'],
      season: { kind: 'hockeytech', league: USHL.league, key: USHL.key, id: 19, leagueName: 'USHL' }, form: { kind: 'hockeytech', league: USHL.league, key: USHL.key, id: 19 },
      logo: 'https://assets.leaguestat.com/ushl/logos/19.png', schedule: 'https://lancers.com/calendar',
      club: 'Omaha Lancers', opens: 'late September', wiki: { title: 'Omaha Lancers' } },
    // Union Omaha, USL League One, Morrison Stadium on Creighton's campus —
    // no ticket feed lists the matches, so the schedule is injected
    { slug: 'unionomaha', label: 'Union Omaha', name: 'Union Omaha', abbr: 'OMA', re: /union omaha/i, sport: 'soccer', venue: 'Morrison Stadium', colors: ['#000000', '#c4d600'],
      espn: { sport: 'soccer', league: 'usa.usl.l1', id: '20684' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      inject: { url: 'https://www.unionomaha.com/events/' },
      logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/20684.png', schedule: 'https://www.unionomaha.com/schedule',
      club: 'Union Omaha', opens: 'March', wiki: { title: 'Union Omaha' } },
  ];

  // The venues, one record each, by size. Per venue:
  //   capacity how many people the place holds
  //   area     absent on every room — one group, Omaha (the metro: Omaha, La Vista, Ralston, Papillion); 'town' would
  //            put a room in the panel's second group (the sister sites' pattern)
  //   type     the event type when the title decides nothing
  //   cssVar   the hue styles.css sets for it (dark block --v-*); color
  //            the same hue as a value, for the series graph
  //   url      the venue's own events listing — not a ticket vendor
  //   icon     a mark for listings without a team crest
  //   tm       its Ticketmaster Discovery listing (fetch-events.mjs reads
  //            the venue by id — every page). No city sweep: the metro
  //            would mix with every Iowa and Kansas room the API files under
  //            the same market (and with Lincoln's, its own site now). exclude drops the season bundles and the
  //            all-session passes the arenas list beside their events,
  //            parking, suites, tours and the pre-show happy hours
  //   alias    the other spellings the feeds use for it, folded to this name
  // Werner Park and Morrison Stadium have nothing on Ticketmaster; they are
  // here as the Storm Chasers' and Union Omaha's injected grounds.
  // No festivals yet, so the panel's Festivals group folds away (app.js).
  var VENUES = {
    // --- the downtown arena, the campus rinks and halls, the clubs; the two grounds ---
    'CHI Health Center Omaha': {
      geo: [41.26375, -95.92841],
      capacity: 18000,
      type: 'sports',
      cssVar: '--v-chi',
      color: '#ea8686',
      url: 'https://www.chihealthcenteromaha.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.chihealthcenteromaha.com&sz=128',
      tm: { id: 'KovZpakWUe', match: 'chi health', fallbackUrl: 'https://www.chihealthcenteromaha.com/events', exclude: /full season|all[- ]session|season tickets?|parking|suite|\btours?\b/i },
      // the venue's own calendar (The Events Calendar, the arena and the convention center: the expos, the boutique's later days, galas, shows Ticketmaster lacks),
      // secondary behind Ticketmaster: it lists every Ticketmaster date with its clock, but its categories (Arena / Convention Center) name no type, so leading
      // would type every concert and Disney On Ice as the venue's 'sports' (the rows it adds still carry 'sports' until the shared tribe kind can take a type);
      // the NCAA sessions dropped — Ticketmaster lists them under titles dropClashes can't match, neither with a clock (2026-10-30)
      feed: { kind: 'tribe', secondary: true, url: 'https://chihealthcenteromaha.com/wp-json/tribe/events/v1/events', drop: /NCAA Division I/i },
      alias: /chi health center|centurylink center omaha|qwest center/i,
    },
    'Baxter Arena': {
      geo: [41.23882, -96.01459],
      capacity: 7898,
      type: 'sports',
      cssVar: '--v-baxter',
      color: '#86eaa3',
      url: 'https://www.baxterarena.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.baxterarena.com&sz=128',
      tm: { id: 'KovZpZAE7edA', match: 'baxter', fallbackUrl: 'https://www.baxterarena.com/events', exclude: /season tickets?|parking|suite/i },
      feed: { kind: 'tribe', secondary: true, url: 'https://www.baxterarena.com/wp-json/tribe/events/v1/events' }, // the arena's own calendar (The Events Calendar: the Mavericks' games, boxing, the Globetrotters), secondary behind Ticketmaster — 14 of its basketball dates print no clock yet (2026-10-30)
      alias: /baxter arena/i,
    },
    'Orpheum Theater': {
      geo: [41.2561, -95.93717],
      capacity: 2600,
      type: 'arts',
      cssVar: '--v-orpheum',
      color: '#c086ea',
      url: 'https://o-pa.org/events',
      icon: 'https://www.google.com/s2/favicons?domain=o-pa.org&sz=128',
      tm: { id: 'KovZpZAdlAkA', match: 'orpheum', fallbackUrl: 'https://o-pa.org/events', exclude: /parking|\btours?\b|season (tickets?|package)/i },
      alias: /orpheum theat(er|re)/i,
    },
    'Holland Performing Arts Center': {
      geo: [41.25885, -95.93201],
      capacity: 2000,
      type: 'arts',
      cssVar: '--v-holland',
      color: '#eadd86',
      url: 'https://o-pa.org/events',
      icon: 'https://www.google.com/s2/favicons?domain=o-pa.org&sz=128',
      tm: { id: 'KovZpZAaatEA', match: 'holland', fallbackUrl: 'https://o-pa.org/events', exclude: /parking|\btours?\b|season (tickets?|package)/i },
      alias: /holland (performing arts )?center|kiewit concert hall/i,
    },
    'Steelhouse Omaha': {
      geo: [41.26014, -95.93122],
      capacity: 3000,
      type: 'concert',
      cssVar: '--v-steelhouse',
      color: '#86d9ea',
      url: 'https://www.steelhouseomaha.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.steelhouseomaha.com&sz=128',
      tm: { id: 'KovZ917At_0', match: 'steelhouse', fallbackUrl: 'https://www.steelhouseomaha.com/events', exclude: /pre-show happy hour|not a (concert )?ticket|parking/i },
      // the venue's own listing (one WordPress page, every upcoming show: "Oct 31, 2026 @ 9:00 PM" is the show clock, the doors sit apart), secondary behind
      // Ticketmaster — the site keeps its titles in lower case ("thundercat"), so Ticketmaster's titles lead; it adds The Reset's sound mornings (2026-10-30)
      feed: { kind: 'cards', secondary: true, url: 'https://steelhouseomaha.com/events/',
        item: /<div class="bg-gray-800 rounded-lg overflow-hidden shadow-lg relative group">/, title: /<a href="([^"]+)" class="absolute inset-0 z-10" aria-label="([^"]*)"/, when: /<p class="text-gray-300 mb-3">\s*([^<]+?)\s*<\/p>/ },
      alias: /steelhouse/i,
    },
    'The Astro Theater': {
      geo: [41.18287, -96.04084],
      capacity: 2500,
      type: 'concert',
      cssVar: '--v-astro',
      color: '#ea86bc',
      url: 'https://theastrotheater.com/', // the venue's site (astrotheater.com, the old address, is a parked domain for sale)
      icon: 'https://www.google.com/s2/favicons?domain=theastrotheater.com&sz=128',
      tm: { id: 'KovZ917AiUn', match: 'astro', fallbackUrl: 'https://theastrotheater.com/', exclude: /parking|vip (upgrade|package)/i },
      // the venue's own show grid (its home page: "Nov 07 @ 7:00 pm", no year — the nearest forward; the Astro Amphitheater's summer cards kept out by the
      // location line), secondary behind Ticketmaster: it lists the same shows, but leading would type the comedy and drag nights as the venue's 'concert' (2026-10-30)
      feed: { kind: 'cards', secondary: true, url: 'https://theastrotheater.com/', venues: /astro theater/i,
        item: /<div class="grid-item">/, title: /<a href="([^"]+)" class="grid-item-headline"><h2>([^<]+)<\/h2>/, when: /grid-item-date">([^<]+)</, place: /grid-item-location">([^<]*)</ },
      alias: /astro theat(er|re)|^the astro\b/i,
    },
    'Liberty First Credit Union Arena': {
      geo: [41.20672, -96.02673],
      capacity: 3500,
      type: 'sports',
      cssVar: '--v-libertyfirst',
      color: '#9fea86',
      url: 'https://www.libertyfirstcuarena.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.libertyfirstcuarena.com&sz=128',
      tm: { id: 'KovZ917Am5n', match: 'liberty first', fallbackUrl: 'https://www.libertyfirstcuarena.com/events', exclude: /season tickets?|flex pack|parking|suite/i },
      alias: /liberty first (credit union )?arena|ralston arena/i,
    },
    'Slowdown': {
      geo: [41.26651, -95.9342],
      capacity: 800,
      type: 'concert',
      cssVar: '--v-slowdown',
      color: '#8a86ea',
      url: 'https://theslowdown.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=theslowdown.com&sz=128',
      tm: { id: 'KovZpZAJEvlA', match: 'slowdown', fallbackUrl: 'https://theslowdown.com/events', exclude: /parking/i },
      alias: /^(the )?slowdown\b/i,
    },
    'The Waiting Room': {
      geo: [41.28509, -96.00857],
      capacity: 400,
      type: 'concert',
      cssVar: '--v-waitingroom',
      color: '#eaa786',
      url: 'https://waitingroomlounge.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=waitingroomlounge.com&sz=128',
      tm: { id: 'KovZpZA1Ie1A', match: 'waiting room', fallbackUrl: 'https://waitingroomlounge.com/events', exclude: /parking/i },
      alias: /waiting room( lounge)?/i,
    },
    'Werner Park': { // the Storm Chasers' ballpark in Papillion; nothing on Ticketmaster, the league schedule is injected
      geo: [41.15179, -96.10642],
      capacity: 9023,
      type: 'sports',
      cssVar: '--v-werner',
      color: '#86eac4',
      url: 'https://www.milb.com/omaha/schedule',
      icon: 'https://www.google.com/s2/favicons?domain=www.milb.com&sz=128',
      alias: /werner park/i,
    },
    'Morrison Stadium': { // Union Omaha's ground on Creighton's campus; nothing on Ticketmaster, the league schedule is injected
      geo: [41.26488, -95.93932],
      capacity: 6000,
      type: 'sports',
      cssVar: '--v-morrison',
      color: '#e186ea',
      url: 'https://www.unionomaha.com/schedule',
      icon: 'https://www.google.com/s2/favicons?domain=www.unionomaha.com&sz=128',
      alias: /morrison stadium/i,
    },
  };

  // The usual view: every room on — nothing here lists nightly bar programs
  var DEFAULT_ON = ['CHI Health Center Omaha', 'Baxter Arena', 'Orpheum Theater', 'Holland Performing Arts Center', 'Steelhouse Omaha', 'The Astro Theater', 'Liberty First Credit Union Arena', 'Slowdown', 'The Waiting Room', 'Werner Park', 'Morrison Stadium'];
  var DEFAULT_OFF = [];
  var PREFS_KNOWN_FROM = null; // no default-off venue yet, so nothing for saved prefs to be told about

  // Event types: every event lands in exactly one, from its flags, title,
  // then venue. The rows the panel shows, in order.
  var TYPES = [
    { key: 'concert', label: 'Concerts', title: 'Live music — the arena tours, Steelhouse and the Astro, the Benson clubs' },
    { key: 'sports', label: 'Sports', title: 'Creighton, Omaha hockey, the Storm Chasers, the Lancers, Union Omaha, rodeo and monster trucks' },
    { key: 'arts', label: 'Arts & Theater', title: 'Omaha Performing Arts — Broadway tours, comedy, dance, the symphony' },
    { key: 'community', label: 'Community', title: 'Festivals, expos, family days' },
  ];
  var MOVIE_VENUE = null; // no cinema here

  // Share codes (?f=CODE): REGISTRY is every filterable key in a fixed
  // order and a code is a bitmask over it, so the list is APPEND-ONLY —
  // adding an entry adds a bit and every existing code keeps meaning what
  // it meant; removing or reordering one changes every link out there.
  // 24 slots from the first build: 5 base-36 digits (a new site, so new codes —
  // nebraska.here.events' codes never meant anything here).
  var CODE_LENGTH = 5;
  var REGISTRY = [
    ['venue', 'CHI Health Center Omaha'], ['venue', 'Baxter Arena'], ['venue', 'Orpheum Theater'], ['venue', 'Holland Performing Arts Center'], ['venue', 'Steelhouse Omaha'], ['venue', 'The Astro Theater'], ['venue', 'Liberty First Credit Union Arena'], ['venue', 'Slowdown'], ['venue', 'The Waiting Room'], ['venue', 'Werner Park'], ['venue', 'Morrison Stadium'],
    ['badge', 'concert'], ['badge', 'sports'], ['badge', 'arts'], ['badge', 'community'],
    ['team', 'bluejays'], ['team', 'mavericks'], ['team', 'stormchasers'], ['team', 'lancers'], ['team', 'unionomaha'],
    ['cap', 'stadium'], ['cap', 'arena'], ['cap', 'hall'], ['cap', 'room'],
  ];

  // The words the page uses for the place
  var WORDS = {
    teamCity: 'Omaha', // the board drops it from the clubs' names ("Omaha Mavericks" → Mavericks)
    presetDefault: 'Every venue — the CHI Health Center, Baxter Arena, Liberty First, the ballpark, the halls and the clubs — every team and type',
    presetNeighborhood: 'Omaha proper only',
    presetBig: 'Only the places that hold 2,000 or more — the arenas, the ballpark, Morrison Stadium and the big halls',
    phrases: { all: 'Showing everything.', none: 'Showing nothing yet — open Filter and pick some venues.', neighborhood: 'Showing Omaha proper only.', big: 'Showing the big venues only — the arenas, the ballpark, Morrison Stadium and the big halls.' },
  };

  global.LQACity = {
    key: 'omaha',
    name: 'Omaha',
    site: 'https://omaha.here.events/',
    userAgent: 'Mozilla/5.0 (compatible; omaha-events/1.0; +https://omaha.here.events/)',
    tz: 'America/Chicago', tzName: 'Central', // the city's time zone: the ICS feed's TZID, the game clocks, the poster's footer
    state: "Nebraska", stateOutline: 'M6.6 16.6L6.6 16.2L6.6 15.8L6.6 15.4L6.6 15.1L6.6 14.7L6.6 14.3L6.6 13.9L6.6 13.5L6.0 13.5L5.5 13.5L4.9 13.5L4.3 13.5L3.7 13.5L3.2 13.5L2.6 13.5L2.0 13.5L2.0 12.8L2.0 12.0L2.0 11.2L2.0 10.5L2.0 9.7L2.0 8.9L2.0 8.2L2.0 7.4L2.8 7.4L3.6 7.4L4.4 7.4L5.2 7.4L6.0 7.4L6.8 7.4L7.6 7.4L8.4 7.4L9.2 7.4L10.0 7.4L10.8 7.4L11.6 7.4L12.4 7.4L13.2 7.4L14.0 7.4L14.9 7.4L15.6 7.9L16.0 8.0L16.2 7.9L16.6 7.8L17.2 7.8L17.6 7.8L17.8 8.0L18.1 8.1L18.6 8.3L18.9 8.5L19.0 8.7L19.2 8.9L19.4 8.9L19.5 8.9L19.6 9.2L19.7 9.7L19.8 10.1L20.0 10.4L20.1 10.6L20.1 10.7L20.2 10.9L20.3 11.0L20.3 11.3L20.3 11.7L20.4 11.9L20.5 11.9L20.5 11.9L20.5 12.0L20.5 12.1L20.6 12.1L20.6 12.2L20.6 12.4L20.6 12.5L20.7 12.6L20.8 12.7L20.7 12.8L20.7 12.9L20.8 13.0L20.8 13.3L20.9 13.9L20.9 14.2L20.8 14.3L20.9 14.5L21.0 14.8L21.1 14.9L21.2 15.2L21.3 15.5L21.4 15.7L21.6 15.8L21.7 16.0L21.8 16.3L22.0 16.6L22.0 16.6L21.6 16.6L21.1 16.6L20.6 16.6L20.1 16.6L19.7 16.6L19.2 16.6L18.7 16.6L18.2 16.6L17.7 16.6L17.2 16.6L16.8 16.6L16.3 16.6L15.8 16.6L15.3 16.6L14.8 16.6L14.3 16.6L13.9 16.6L13.4 16.6L12.9 16.6L12.4 16.6L11.9 16.6L11.4 16.6L11.0 16.6L10.5 16.6L10.0 16.6L9.5 16.6L9.0 16.6L8.5 16.6L8.1 16.6L7.6 16.6L7.1 16.6L6.6 16.6Z', // the masthead's small state, linking to here.events (scripts/state-outline.mjs, Natural Earth 1:50m)
    // the calendar feed's header; the UID domain never changes (changing it
    // re-creates every event in subscribers' calendars)
    ics: { name: 'Omaha Events', short: 'Omaha Events', teams: 'Omaha home teams — every season', prodid: '-//here.events//omaha-events//EN', uidDomain: 'fosdal.net', // the UID domain the whole family issues (the shared ics test pins it)
      desc: 'Upcoming events in Omaha\, NE — CHI Health Center\, Baxter Arena\, the Orpheum and the Holland Center\, Steelhouse\, the Astro and the clubs' },
    teams: TEAMS,
    map: { // the Map view (local-map.js; the ground drawn once by scripts/build-local-map.mjs from OpenStreetMap, committed as site/local-map.json) — every city gets one, Steve, 2026-10-26
      kind: 'urban',
      bbox: [41.132, -96.137, 41.305, -95.898], // south, west, north, east — every room, with a margin
      home: [41.157, -96.069, 41.311, -95.9], // the view at first: the city's own rooms; the fit button shows the whole frame
      roads: ['motorway', 'trunk', 'primary'],
      tolerance: 0.6,
      labels: [
        { name: 'Omaha', lat: 41.257, lon: -95.934, anchor: 'middle' },
        { name: 'La Vista', lat: 41.18327, lon: -96.0324, anchor: 'middle' },
        { name: 'Ralston', lat: 41.20167, lon: -96.03238, anchor: 'middle' },
      ],
    },
    venues: VENUES,
    defaultOn: DEFAULT_ON,
    defaultOff: DEFAULT_OFF,
    prefsKnownFrom: PREFS_KNOWN_FROM,
    types: TYPES,
    movieVenue: MOVIE_VENUE,
    groundsVenue: null, // every listing is read by room, so nothing arrives under a name city.js lacks
    codeLength: CODE_LENGTH,
    registry: REGISTRY,
    words: WORDS,
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
