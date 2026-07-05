# Atmos — Living Sky

SF weather as a living 3D sky. Clouds drift at real wind speed, the sun rises and sets with the time of day, rain falls when it's raining — you feel like you're standing in today's weather.

**Visual Style:** Light — Breeze (pastel sky, soft blue/pink/lavender, gentle particles)

**Data Source:** Open-Meteo — San Francisco live weather (temperature, cloud cover, wind speed, humidity, weather code)

**How it works:**
- Temperature drives the hero number and sky turbidity
- Cloud cover controls how many 3D clouds drift across the scene
- Wind speed controls how fast clouds drift
- WMO weather code triggers scene state: clear → cloudy → rainy → foggy → storm
- is_day switches between day (Sky dome) and night (Stars + Moon)
- Tap anywhere to reveal a detail panel with wind, humidity, cloud cover

**GitHub:** https://github.com/parthchandak02/atmos

**Live:** https://atmos.parthchandak.info

**Tech:** React Three Fiber + drei. Built by Cursor Agent from Hermes brief. Hosted on Cloudflare Pages.
