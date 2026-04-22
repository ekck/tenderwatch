# TenderWatch Frontend — Next.js 14

AdSense-ready Next.js frontend for TenderWatch Kenya.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS — navy/amber editorial theme
- **Charts:** Recharts
- **Fonts:** Playfair Display (display) + DM Sans (body) + DM Mono (numbers)
- **Deploy:** Vercel

## Pages
| Route | Description |
|---|---|
| `/` | Homepage — hero, live stats, latest tenders, alert signup |
| `/tenders` | Searchable, filterable tender listings |
| `/tenders/[id]` | Tender detail — value, entity, award, supplier |
| `/entities` | Procuring entities list |
| `/entities/[id]` | Entity profile with full tender history |
| `/analytics` | Spending charts — county, category, method, suppliers |
| `/about` | Editorial about page (required for AdSense) |
| `/contact` | Contact page (required for AdSense) |
| `/privacy` | Privacy Policy with AdSense cookie disclosure |
| `/terms` | Terms of Service |

## Local Development

```bash
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev
# → http://localhost:3000
```

Make sure the Flask backend is running on port 5000.

## Deploy to Vercel

1. Push to GitHub
2. Import repo at vercel.com/new
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL` → your Railway Flask API URL
   - `NEXT_PUBLIC_ADSENSE_ID` → your AdSense publisher ID (after approval)
4. Set custom domain: `tenderwatch.zanah.co.ke` in Vercel → Domains

## Activating Google AdSense

### Step 1 — Apply
1. Go to [google.com/adsense](https://google.com/adsense)
2. Sign up with your Google account
3. Enter site URL: `tenderwatch.zanah.co.ke`
4. Select Kenya as your country

### Step 2 — Add verification code
Before approval, Google gives you a script tag to verify site ownership.
Add your publisher ID to `.env.local`:
```
NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX
```
The AdSense script loads automatically from `app/layout.tsx`.

### Step 3 — Replace slot IDs
After approval, create ad units in the AdSense dashboard and replace
the placeholder slot IDs in these components:

| Component | File | Current slot |
|---|---|---|
| Homepage leaderboard | `app/page.tsx` | `1234567890` |
| Homepage in-content | `app/page.tsx` | `0987654321` |
| Tenders leaderboard | `app/tenders/page.tsx` | `1111111111` |
| Tenders sidebar | `app/tenders/page.tsx` | `2222222222` |
| Tender detail leaderboard | `app/tenders/[id]/page.tsx` | `3333333333` |
| Tender detail in-content | `app/tenders/[id]/page.tsx` | `4444444444` |
| Analytics leaderboard | `app/analytics/page.tsx` | `5555555555` |
| Analytics in-content | `app/analytics/page.tsx` | `6666666666` |
| About leaderboard | `app/about/page.tsx` | `7777777777` |
| Entities leaderboard | `app/entities/page.tsx` | `8888888888` |
| Entities sidebar | `app/entities/page.tsx` | `9999999999` |
| Entity detail leaderboard | `app/entities/[id]/page.tsx` | `1010101010` |
| Entity detail in-content | `app/entities/[id]/page.tsx` | `1122334455` |

### AdSense Policy Compliance Built-In
- ✅ All ads labelled "Advertisement" (not "Sponsored Links", "Top Picks", etc.)
- ✅ No ads in pop-ups, floating boxes, or emails
- ✅ Ads not placed adjacent to navigation buttons
- ✅ Privacy Policy includes full cookie/AdSense disclosure
- ✅ Terms of Service prohibit artificial ad clicks
- ✅ Users never encouraged to click ads
- ✅ Sitemap.xml for Google crawling
- ✅ Robots.txt configured
- ✅ Required pages: About, Contact, Privacy, Terms
