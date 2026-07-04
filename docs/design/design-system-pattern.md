# Accra Christmas Village Design Pattern

## Product Goal

Accra Christmas Village should feel like a real festival system designed by a local event studio: practical first, visually memorable, culturally respectful and easy to use on mobile during a busy visit. The public site behaves like a visitor field guide. The portal and admin inherit the same tokens, but stay calmer and more operational.

## Research Synthesis

- Contemporary web and brand design is moving away from over-polished AI sameness toward texture, craft, physical cues and human irregularity. The site uses a hand-built bitmap route artwork, tactile borders and signage rhythm instead of generic gradients or floating decorations.
- Mobile navigation must keep content primary while preserving discoverable routes. The header keeps public links visible and horizontally scrollable rather than hiding all navigation behind a menu.
- Event SEO needs crawlable public content, clear internal links and Event structured data. The home page includes server-rendered copy, public route links and JSON-LD for the main event.
- Accra and Ghanaian visual references should be handled as influence, not costume. The system borrows the logic of weaving, route markers and market signage without copying sacred symbols or turning heritage into decoration.

## Visual System

Name: Woven Signal

Core idea: every surface is a piece of wayfinding cloth. Bands, routes, stand codes, stage signals and map points create the identity. The site should feel mapped, edited and useful.

Color roles:

- Night palm `#071A15`: hero, header, footer, map ground.
- Ink `#111713`: main text.
- Forest route `#0B5D3F`: confirmations, market routes, access cues.
- Brass light `#D7A83E`: main actions and high-priority route signals.
- Ember clay `#C6532D`: stage energy, warnings, active marks.
- Hibiscus `#B82B5E`: sponsor activations and accent moments.
- Harmattan `#F5EFE2`: warm page surface.
- Porcelain `#FFFAF0`: readable panels and repeated items.
- Skywash `#A8DADC`: service and accessibility cues.

Typography:

- Display: Big Shoulders for event identity, page titles and large section headlines.
- Body: Instrument Sans for legibility.
- Utility: Geist Mono for dates, codes, statuses and route metadata.

## Component Pattern

Hero:

- Direction: Festival Gateway Carousel.
- Full photo field with rounded event-frame composition, using admin-managed hero slides and `public/design/hero-night-market.png` as the default fallback.
- H1 is the event name or slide title, centered over the human crowd moment rather than treated like a generic landing-page slogan.
- Primary visitor decisions sit in the overlapping white action bar: date, location, category and map CTA.
- The next section should remain visually implied below the fold.

Navigation:

- Direction: Arrival Gate.
- Sticky, compact and visible, shaped like a visitor pass rather than a generic app bar.
- Brand lockup includes icon, event name and date/location tag.
- Public visitor routes stay available on desktop and mobile, with zone-code cues on wide screens.
- A route-band strip anchors the header to the map and festival wayfinding system.

Cards:

- Use 8px radius or less.
- Prefer a top/side signal line, code badge or icon block over decorative shadows.
- Avoid cards inside cards.
- Public cards can be expressive; portal/admin cards stay quieter.

Map:

- Dark mapped ground, route texture, high-contrast zone blocks.
- Selected zone uses a gold ring.
- Side panel gives one visitor note and assigned stand context.

Popups and announcements:

- Use dismissible bars or small bottom panels only.
- No full-screen mobile interstitials.
- One message, one action, tied to a real visitor need.

SEO:

- Keep public pages server-rendered.
- Use one clear H1 per page.
- Link Map, Programme, Stands and Safety from the home page.
- Keep Event structured data on the home page.
- Keep visible text specific to the village, not generic SaaS copy.

## Human-Craft Checklist

- Does the page have one intentional visual idea instead of many decorations?
- Are colors used as signals, not as a broad rainbow?
- Does every repeated item include useful metadata, not filler labels?
- Would a visitor at the gate understand where to tap next?
- Does the surface avoid generic AI tells: glossy blobs, meaningless gradients, stock-like heroes, oversized template cards and vague copy?

## Tradeoffs

- The public site is more expressive than the admin surfaces. This keeps the visitor experience memorable without making operational workflows noisy.
- The custom bitmap artwork is generated locally and versioned, so it avoids stock imagery and remote asset fragility.
- The design favors strong type and layout rhythm over heavy animation. That keeps the PWA lighter and more reliable on mobile.
