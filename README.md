# Entrepreneur Performance Diagnostic — AEGIS V3

Mobile-first static quiz funnel (`index.html`) + Vercel serverless function
(`api/subscribe.js`) that adds/updates each completed diagnostic lead in
Mailchimp.

## What changed in V3

- Phone-first layout with no horizontal scrolling.
- 44–56px touch targets for quiz answers, navigation, inputs, and CTAs.
- iOS-safe 16px form inputs to prevent unwanted browser zoom.
- Safe-area support for phones with a home indicator/notch.
- Sticky, thumb-friendly quiz navigation on small screens.
- One-column pillar/result cards on phones.
- Reduced decorative density so the diagnostic feels fast and focused on mobile.
- The existing AEGIS live fingerprint + analysis reveal are preserved.
- Mailchimp now uses an upsert flow, so repeat submissions update the person's
  latest diagnostic tags instead of stopping at “Member Exists”.

## Deploy to Vercel

1. Push this folder to GitHub or import it directly into Vercel.
2. No build settings are required.
3. Add the environment variables below in Vercel → Project → Settings →
   Environment Variables.

| Variable | Where to find it |
|---|---|
| `MAILCHIMP_API_KEY` | Mailchimp → Account → Extras → API keys |
| `MAILCHIMP_SERVER_PREFIX` | The part after the dash in the API key, e.g. `us21` |
| `MAILCHIMP_LIST_ID` | Mailchimp → Audience → Settings → Audience name and defaults → Audience ID |

Add them to Production, Preview, and Development as needed, then redeploy.

## Mailchimp data collected

For each unlocked result, the backend sends:

- Email address
- First name (`FNAME`)
- Tag: `performance-diagnostic`
- Tag: `weak-<pillar>` such as `weak-sleep`
- Tag: score bucket such as `score-60-79`

The exact pillar percentages are still calculated in the browser for the
personalised result experience. This version does not require custom Mailchimp
merge fields, which keeps deployment simple and avoids breaking the form if
those fields have not been created in the audience.

If you want exact scores stored as Mailchimp merge fields later, create custom
fields such as `SCORE`, `ENERGY`, `SLEEP`, `STRESS`, `DECISIONS`, and `BODY`, then
wire those fields into `api/subscribe.js`.

## Opt-in mode

The current function uses `status_if_new: "subscribed"`. If you require
double opt-in, change that value to `"pending"`.

## Local testing

Run:

```bash
vercel env pull
vercel dev
```

Then open the local URL Vercel provides and complete the diagnostic on a phone
or a narrow browser viewport.

## Mobile QA checklist

Test at minimum:

- iPhone-sized viewport around 375px wide
- Android-sized viewport around 360–412px wide
- Safari and Chrome mobile
- Keyboard open on the email gate
- Back/Continue navigation with one hand
- No horizontal scrolling
- Reduced Motion enabled
- Slow network while the analysis screen runs
