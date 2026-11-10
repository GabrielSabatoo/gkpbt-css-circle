# Visual style and pacing rules

Applies to every video. The Producer builds scenes from the components below; the Reviewer checks the pacing rules.

## Pacing
- **Something new on screen every 8–15 s** (average ≤ 12 s). "New" = camera move, new element, text, number, chart, or a cut.
- **First 30 s: every 3–6 s.** The hook decides whether people stay.
- **Never hold a static frame longer than 6 s.** If nothing new appears, the camera drifts (slow push in, pan or rotation).
- **Visuals follow the words.** When the narrator says a number, the number appears; a place, the camera goes there; a year, a date card.
- **Pattern interrupts every ~60 s:** switch from map to neutral background (or back), change colour state, or a full-screen number/quote.
- **Open loops:** tease a later moment ("we'll come back to this island") and show a small preview of it.
- **Chapter markers:** a small recurring "circle size" badge (60 → 90 → 120 → 180 → 330 → 370 min) that ticks up as the story moves forward, so viewers feel progress.

## Look
- **Base:** dark navy night globe, faint graticule, landmasses in muted slate; oceans near-black.
- **Accent:** warm amber for circles, routes and the plane; red only for danger and gaps; cool white for text.
- **Neutral background:** deep navy with subtle grain and a soft vignette, used for text, numbers and explainers.
- **Type:** one bold display face for big words/numbers, one clean sans for labels. Kinetic text appears word by word, synced to the narration.
- **Motion:** eased camera moves (no linear), circles "breathe" in slightly, route lines draw on, numbers count up.
- **No real footage, logos or photos of real people.** Aircraft are flat silhouettes we draw. Small "illustrative" tag on any map with approximate circles.

## Reusable Remotion components
| Component | What it does |
|---|---|
| `Globe` / `FlatMap` | d3-geo world in our palette; camera with `zoomTo(place)`, `panTo`, `rotate`, `pullOut` |
| `AirportDots` | pulse-in dots for airports, optional labels |
| `RangeCircles` | geodesic circles around airports with animated radius (minutes → km); gap areas highlighted red |
| `RouteArc` | great-circle line that draws on, with plane icon travelling along it; dashed variant for "straight line not flown" |
| `PlaneIcon` | top-down plane; states: normal, one engine out (red engine), descending |
| `Callout` / `Arrow` | animated arrow or bracket pointing at a map spot with a short label |
| `KineticText` | phrase appears word by word on neutral background, key word highlighted amber |
| `BigNumber` | full-screen number that counts up, with a small caption |
| `DateCard` | year/date stamp sliding in, used as chapter change |
| `Silhouette` | aircraft side profiles (piston twin, DC-10, TriStar, 747, 767, 777, A330, A350, 787) |
| `Bars` / `Comparison` | simple animated bar or side-by-side comparison |
| `Timer` | stopwatch / countdown overlay (glide time, diversion time) |
| `Badge` | the recurring circle-size chapter badge |
| `Altimeter` | small altitude tape that drops (engine-out descent) |
| `SplitScreen` | two panels side by side (rule vs. reality, then vs. now) |
