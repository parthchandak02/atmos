# Atmos — Creative Brief

## Concept
A living 3D sky that shows San Francisco's current weather. Clouds drift at real wind speed, sun/moon position follows time of day, rain falls when it's raining. You feel like you're standing in today's weather.

**Metaphor family:** atmosphere
**Narrative Pattern:** Feature-action — API poll detects weather code changes and transitions the scene (clear → cloudy → rain → storm → night)
**Tier 2 Patterns (pick 2):** Hero Number (temperature at top-left) + Quiet Zone Detail Panel (tap reveals wind, cloud cover, weather description)

## Data Source
- API: `https://api.open-meteo.com/v1/forecast?latitude=37.77&longitude=-122.42&current=temperature_2m,wind_speed_10m,relative_humidity_2m,cloud_cover,is_day,weather_code,precipitation,rain&timezone=auto`
- Response: `current` object with all fields above
- Fallback: is_day=1, temperature_2m=18, cloud_cover=40, wind_speed_10m=12, weather_code=0, relative_humidity_2m=65, rain=0
- Poll interval: 60s

### WMO Weather Codes
0=Clear sky, 1-3=Mainly clear/partly cloudy, 45-48=Foggy, 51-55=Drizzle, 61-65=Rain, 71-77=Snow, 80-82=Rain showers, 95-99=Thunderstorm
Use code ranges to determine state: clear (0-3), foggy (45-48), rainy (51-65, 80-82), thundery (95-99)

## Visual Style
- Preset: Light — Breeze (pastel sky, soft blue/pink/lavender, gentle particles)
- Palette:
```ts
const PALETTE = {
  bg: '#e8f4f8',         // pale sky blue
  layer: '#d4ecf0',      // slightly deeper for depth
  accent1: '#81d4fa',    // soft blue — primary data
  accent2: '#ce93d8',    // soft lavender — secondary
  accent3: '#f48fb1',    // soft pink — accent
  accent4: '#fff176',    // pale yellow — highlight
  text: 'rgba(0,0,0,0.5)',
};
```
- Coherence tokens:
  - strokeWeightScale: fine only (1px) for chrome elements
  - alphaHierarchy: {bg: 0.08, field: 0.25, active: 0.7, label: 0.45}
  - shapeLanguage: organic curves (clouds are naturally organic)
  - glowBudget: 1 glow color (accent4 pale yellow), blur ≤20px, ≤5 entities/frame
  - accent color: accent1 (soft blue #81d4fa) — one accent + semantic colors only

## Encoding Contract
| Data Field | Visual Channel | Range | Inverse Function | "Bigger means..." | Legend? |
|---|---|---|---|---|---|
| temperature_2m | Hero number value + sky turbidity tint | 0-40°C | invertScale(pixel,0,180,0,40) | hotter day | no (number is direct) |
| cloud_cover | Cloud count + opacity in scene | 0-100% | invertScale(pixel,0,W,0,100) | cloudier sky | no (visible) |
| wind_speed_10m | Cloud drift speed + particle drift | 0-50 km/h | invertScale(pixel,0,100,0,50) | windier | yes (legend icon) |
| is_day | Day/night scene switch | 0 or 1 | direct boolean | sun vs moon/midnight | yes (legend icon) |
| weather_code | Rain particles + fog + storm effects | 0-99 range groups | invertScale(pixel,0,200,0,99) | more severe weather | yes (legend text) |
| relative_humidity_2m | Fog density, ambient haze | 0-100% | invertScale(pixel,0,100,0,100) | more humid | no (visible haze) |

## Creative Scene (R3F)
- Primary metaphor: Living sky — the user sees clouds, sun/moon, and weather effects that match SF's real-time conditions
- drei components: Sky, Stars, Clouds, Cloud, Html
- Default camera: Looking slightly upward into the sky, fixed position — no orbit required for comprehension
- Interaction: Tap anywhere → Quiet Zone detail panel shows wind speed, humidity, weather description, cloud cover
- Ambient light: varies by is_day (day: 0.35, night: 0.12)
- Directional light: follows sun position during day, off at night

### Scene States
- **Day clear** (is_day=1, code 0-3): Blue Sky, drifting clouds, sun visible
- **Day cloudy** (is_day=1, code >3, <45): More clouds, lower opacity sun
- **Foggy** (is_day=1, code 45-48): Lower visibility, fog particles
- **Rain** (is_day=1, code 51-65, 80-82): Gray sky, rain particle system, darker ambient
- **Thunderstorm** (is_day=1, code 95-99): Dark sky, rain, lightning flashes
- **Night clear** (is_day=0, code 0-3): Stars, moon glow, no sky dome, dark blue bg
- **Night cloudy** (is_day=0, code >3): Partial stars, cloud silhouettes against dark sky

### Rain Implementation
- InstancedMesh or Points for rain particles
- 2000-5000 particles, falling at steady speed
- Slight wind drift based on wind_speed
- Blue-white tint, small size (0.03-0.08 units)
- Only active when weather_code is in rain range (51-65, 80-82)

### Cloud Drift
- Use drei <Clouds> + <Cloud> components
- Cloud count = cloud_cover / 20 (0-5 clouds)
- Cloud speed = wind_speed_10m * 0.02 (scaled)
- Clouds move in one direction (eastward, matching typical SF wind)
- Wrap clouds: when they pass out of view, reposition behind camera

## UX Chrome

### Hero Number
- Top-left of screen: temperature in °C at 48px bold
- Below it: weather description text at 12px ("Clear Sky" or "Light Rain" etc.)
- Styled with Breeze palette text color and opacity

### Data Stamp
- Bottom-left: "Open-Meteo · SF · {state} · Xs ago"
- 10px system-ui, sans-serif, opacity 0.4

### #desc
- Bottom-center: "SF weather as a living sky — clouds, sun, and rain from real data"
- 11px, opacity 0.45, centered

### Quiet Zone (Pattern A)
- Tap anywhere on the canvas to show a DOM detail panel
- Shows: wind speed, humidity, cloud cover %, weather code description
- Fades after 3s idle
- Styled to match Breeze palette

### Legend (Pattern B - Mini)
- Small icon+label at bottom-right showing:
  - Sun/moon icon + "day/night"
  - Wind icon + speed
- 9px, opacity 0.35

### Reduced Motion
- `prefers-reduced-motion: reduce` → static scene
- One frame render, no animation loop
- Data values still update from API
- Hero number + quiet zone still work

## Render tier
r3f — Vite + React Three Fiber + drei, deploy dist/ to Cloudflare Pages

## Deploy
- Slug: atmos
- URL: https://atmos.parthchandak.info

## Build Requirements (MANDATORY)
1. Vite + React + TypeScript project scaffold
2. three, @react-three/fiber, @react-three/drei installed
3. Single-page app, no routing
4. DPR handled by Three.js WebGLRenderer setPixelRatio
5. Hero number as HTML overlay (not canvas text)
6. Data stamp, #desc, quiet zone as HTML overlays
7. No em-dashes in any user-visible string — use hyphens
8. .nojekyll file at project root
9. Explicit package.json with all dependencies
10. tsconfig.json with strict:false to avoid TS errors during build
11. vite.config.ts with basic React plugin setup

## Interaction Affordances
- First visit: brief subtle glow animation at scene center (0.5s pulse)
- Elements with interactivity (tap to reveal detail) do NOT need per-element visual cue — the whole scene is tappable
- After 3s of user inactivity, detail panel fades back to clean sky view

### CRITICAL: No em-dashes
All user-visible strings must use hyphens or spaces. Do not use em-dashes (—) anywhere in the HTML or text content.
